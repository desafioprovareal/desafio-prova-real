import os from 'node:os';
import { pathToFileURL } from 'node:url';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { carregarConfiguracao } from './configuracao.js';
import { abrirBancoDados } from './banco.js';
import { iniciarBotMonitor } from './botMonitor.js';
import {
  calcularCustoTokensReais,
  calcularHashIntegridade,
  detectarViolacaoDadosPessoaisCenso,
  gerarCodigoVerificacao,
  gerarHmacUnicoCenso,
  gerarTextoDesclassificacaoOficial,
  normalizarFamiliaIa,
  validarUrlHttp
} from './utilitarios.js';

async function validarTurnstileOpcional(token, segredo) {
  if (!segredo) return true;
  if (!token) return false;
  try {
    const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: segredo, response: token })
    });
    const dados = await resp.json();
    return Boolean(dados.success);
  } catch {
    return false;
  }
}

export async function criarServidor(sobrescritas = {}) {
  const cfg = carregarConfiguracao(sobrescritas);
  const db = abrirBancoDados(cfg.caminhoBanco);
  const app = Fastify({
    logger: sobrescritas.logger ?? false,
    trustProxy: cfg.confiarProxyCloudflare
  });

  await app.register(cors, { origin: cfg.origensCors });
  await app.register(rateLimit, {
    max: cfg.limiteRequisicoesPorMinuto,
    timeWindow: '1 minute'
  });

  const bot = iniciarBotMonitor({ db, cfg, log: app.log });
  app.addHook('onClose', async () => {
    bot.parar();
    db.close();
  });

  function registrarDuplo(metodo, rotaBase, handler) {
    app[metodo](rotaBase, handler);
    app[metodo](`/api${rotaBase}`, handler);
  }

  // 1. Saúde e Observabilidade da VPS (gatilho de upgrade >70% na 1 vCPU ou RAM < 400 MB)
  registrarDuplo('get', '/saude', async () => {
    const cargaMedia = os.loadavg();
    const cargaPorCpu = cargaMedia[0] / Math.max(1, cfg.vcpusReferenciaVps);
    const ramLivreMb = Math.round(os.freemem() / (1024 * 1024));
    const ramTotalMb = Math.round(os.totalmem() / (1024 * 1024));
    const memProcessoMb = Math.round(process.memoryUsage().rss / (1024 * 1024));
    const totalSubmissoes = db.prepare('SELECT COUNT(*) AS total FROM submissoes').get().total;
    const alertaUpgradeVps = cargaPorCpu > 0.7 || ramLivreMb < 400;

    return {
      ok: true,
      status: 'operacional',
      cargaCpuRelativa: Number(cargaPorCpu.toFixed(2)),
      ramLivreMb,
      ramTotalMb,
      memoriaProcessoMb: memProcessoMb,
      totalSubmissoes,
      alertaUpgradeVps,
      recomendacaoInfra: alertaUpgradeVps
        ? 'Carga acima do gatilho (>70% CPU ou <400 MB RAM livre). Recomendado subir para plano 2 vCPU / 8 GB RAM.'
        : 'VPS operando com folga dentro do limite seguro de 512 MB.'
    };
  });

  // 2. Placar Guerra das IAs
  registrarDuplo('get', '/placar-ias', async (req) => {
    const rede = String(req.query?.rede || '').trim().toLowerCase();
    const filtroSql = rede && rede !== 'todas' ? 'WHERE rede_social = ?' : '';
    const params = filtroSql ? [rede] : [];

    const modelos = db
      .prepare(`
        SELECT
          modelo_ia AS modelo,
          familia_ia AS familia,
          COUNT(*) AS totalSubmissoes,
          SUM(CASE WHEN status = 'validado' THEN 1 ELSE 0 END) AS cortesValidados,
          SUM(CASE WHEN status = 'desclassificado' THEN 1 ELSE 0 END) AS cortesReprovados,
          SUM(tokens_entrada + tokens_saida) AS totalTokens,
          ROUND(SUM(custo_reais), 4) AS custoTotalReais,
          ROUND(AVG(custo_reais), 4) AS custoMedioReais
        FROM submissoes
        ${filtroSql}
        GROUP BY modelo_ia, familia_ia
        ORDER BY cortesValidados DESC, custoMedioReais ASC
      `)
      .all(...params);

    return { ok: true, modelos };
  });

  // 3. Arena dos Participantes e Vínculo Multi-Redes
  registrarDuplo('get', '/participantes', async () => {
    const participantes = db
      .prepare(`
        SELECT
          apelido, provedor_identidade AS provedorIdentidade, codigo_verificacao AS codigoVerificacao,
          bio_verificada AS bioVerificada, arroba_tiktok AS tiktok, arroba_instagram AS instagram,
          arroba_youtube AS youtube, arroba_x AS x, arroba_facebook AS facebook,
          reputacao, pontos_totais AS pontosTotais,
          visualizacoes_acumuladas AS visualizacoes, comentarios_acumulados AS comentarios,
          auditorias_aprovadas AS auditoriasAprovadas
        FROM participantes
        ORDER BY pontos_totais DESC, reputacao DESC
        LIMIT 100
      `)
      .all();
    return { ok: true, participantes };
  });

  const handlerVincular = async (req, reply) => {
    const corpo = req.body || {};
    const apelido = String(corpo.apelido || '').trim();
    if (apelido.length < 2) {
      return reply.code(400).send({ ok: false, erro: 'Informe um apelido válido com pelo menos 2 caracteres.' });
    }
    const codigo = corpo.codigoVerificacao || gerarCodigoVerificacao();
    const redes = corpo.redes || {};

    db.prepare(`
      INSERT INTO participantes (
        apelido, provedor_identidade, conta_identidade, codigo_verificacao,
        arroba_tiktok, arroba_instagram, arroba_youtube, arroba_x, arroba_facebook
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(apelido) DO UPDATE SET
        provedor_identidade = excluded.provedor_identidade,
        arroba_tiktok = excluded.arroba_tiktok,
        arroba_instagram = excluded.arroba_instagram,
        arroba_youtube = excluded.arroba_youtube,
        arroba_x = excluded.arroba_x,
        arroba_facebook = excluded.arroba_facebook
    `).run(
      apelido,
      String(corpo.provedorIdentidade || 'github'),
      String(corpo.contaIdentidade || ''),
      codigo,
      String(redes.tiktok || corpo.tiktok || ''),
      String(redes.instagram || corpo.instagram || ''),
      String(redes.youtube || corpo.youtube || ''),
      String(redes.x || corpo.x || ''),
      String(redes.facebook || corpo.facebook || '')
    );

    const reg = db.prepare('SELECT codigo_verificacao, reputacao FROM participantes WHERE apelido = ?').get(apelido);
    return { ok: true, apelido, codigoVerificacao: reg.codigo_verificacao, reputacao: reg.reputacao };
  };
  registrarDuplo('post', '/participantes/vincular', handlerVincular);
  registrarDuplo('post', '/perfil/vincular', handlerVincular);

  // 4. Submissões de Cortes e Telemetria MCP
  registrarDuplo('post', '/submissoes', async (req, reply) => {
    const b = req.body || {};
    if (!(await validarTurnstileOpcional(b.turnstileToken, cfg.turnstileSecret))) {
      return reply.code(403).send({ ok: false, erro: 'Falha na verificação anti-robôs (Turnstile).' });
    }
    const linkPostagem = String(b.linkPostagem || b.urlPostagem || '').trim();
    const linkFonte = String(b.linkFonte || b.urlVideoOriginal || '').trim();
    const modeloIa = String(b.modeloIa || b.modelo || '').trim();
    const promptDeclarado = String(b.promptDeclarado || b.promptUsado || '').trim();

    if (!validarUrlHttp(linkPostagem) || !validarUrlHttp(linkFonte) || !modeloIa || !promptDeclarado) {
      return reply.code(400).send({
        ok: false,
        erro: 'Campos obrigatórios inválidos: informe URLs HTTP/HTTPS válidas, modelo de IA e o prompt utilizado.'
      });
    }

    const apelido = String(b.apelido || b.autor || 'participante-aberto').trim();
    const tokensEntrada = Math.max(0, Number(b.tokensEntrada ?? b.tokens ?? 0));
    const tokensSaida = Math.max(0, Number(b.tokensSaida ?? 0));
    const custoReais = calcularCustoTokensReais({
      modeloIa,
      tokensEntrada,
      tokensSaida,
      cotacaoDolarBrl: cfg.cotacaoDolarBrl
    });
    const hash = calcularHashIntegridade({
      linkFonte,
      segundoInicio: b.segundoInicio,
      segundoFim: b.segundoFim,
      modeloIa,
      promptDeclarado,
      comentarioAuditoria: b.comentarioAuditoria
    });

    const viaMcp = b.viaMcp ? 1 : 0;
    const statusInicial = viaMcp ? 'validado' : 'em_auditoria';

    db.prepare(`
      INSERT OR IGNORE INTO participantes (apelido, codigo_verificacao, pontos_totais)
      VALUES (?, ?, 100)
    `).run(apelido, gerarCodigoVerificacao());

    const info = db.prepare(`
      INSERT INTO submissoes (
        apelido_participante, rede_social, link_postagem, link_fonte,
        segundo_inicio, segundo_fim, prompt_declarado, comentario_auditoria,
        hash_integridade, modelo_ia, familia_ia, tokens_entrada, tokens_saida,
        custo_reais, via_mcp, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      apelido,
      String(b.redeSocial || b.rede || 'tiktok').toLowerCase(),
      linkPostagem,
      linkFonte,
      Number(b.segundoInicio || 0),
      Number(b.segundoFim || 0),
      promptDeclarado,
      String(b.comentarioAuditoria || ''),
      hash,
      modeloIa,
      normalizarFamiliaIa(modeloIa),
      tokensEntrada,
      tokensSaida,
      custoReais,
      viaMcp,
      statusInicial
    );

    if (viaMcp) {
      db.prepare('UPDATE participantes SET pontos_totais = pontos_totais + 120, reputacao = MIN(5.0, reputacao + 0.2) WHERE apelido = ?').run(apelido);
    }

    return reply.code(201).send({
      ok: true,
      id: Number(info.lastInsertRowid),
      hashIntegridade: hash,
      custoReais,
      status: statusInicial
    });
  });

  // 5. Tribunal Comunitário Ponderado & Caça-Fraudes
  registrarDuplo('get', '/tribunal', async () => {
    const itens = db
      .prepare(`
        SELECT id, apelido_participante AS autor, rede_social AS rede, link_postagem AS linkPostagem,
               link_fonte AS linkFonte, segundo_inicio AS segundoInicio, segundo_fim AS segundoFim,
               prompt_declarado AS promptDeclarado, modelo_ia AS modeloIa, status,
               motivo_desclassificacao AS motivoDesclassificacao,
               comentario_desclassificatorio AS comentarioDesclassificatorio
        FROM submissoes
        ORDER BY id DESC
        LIMIT 100
      `)
      .all();
    return { ok: true, itens };
  });

  registrarDuplo('post', '/tribunal/votar', async (req, reply) => {
    const b = req.body || {};
    const submissaoId = Number(b.submissaoId ?? b.idItem);
    const decisao = b.decisao === 'aprovar' ? 'aprovar' : b.decisao === 'reprovar' ? 'reprovar' : null;
    const auditor = String(b.auditor || b.codigoAutor || req.ip).trim();
    const motivoCodigo = String(b.motivoCodigo || b.categoriaFalha || 'fora_de_contexto');

    if (!submissaoId || !decisao) {
      return reply.code(400).send({ ok: false, erro: 'Informe submissaoId e decisao (aprovar ou reprovar).' });
    }

    const sub = db.prepare('SELECT * FROM submissoes WHERE id = ?').get(submissaoId);
    if (!sub) {
      return reply.code(404).send({ ok: false, erro: 'Submissão não encontrada.' });
    }

    const partAuditor = db.prepare('SELECT reputacao FROM participantes WHERE apelido = ? OR codigo_verificacao = ?').get(auditor, auditor);
    const peso = partAuditor ? Math.max(0.5, Math.min(5.0, Number(partAuditor.reputacao))) : Math.min(2.0, Math.max(0.5, Number(b.pesoAplicado || 1.0)));

    db.prepare(`
      INSERT INTO votos_tribunal (submissao_id, auditor_chave, decisao, peso, motivo_codigo)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(submissao_id, auditor_chave) DO UPDATE SET
        decisao = excluded.decisao,
        peso = excluded.peso,
        motivo_codigo = excluded.motivo_codigo
    `).run(submissaoId, auditor, decisao, peso, motivoCodigo);

    const totais = db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN decisao = 'reprovar' THEN peso ELSE 0 END), 0) AS pesoFraude,
        COALESCE(SUM(CASE WHEN decisao = 'aprovar' THEN peso ELSE 0 END), 0) AS pesoValido,
        COUNT(*) AS totalAuditores
      FROM votos_tribunal
      WHERE submissao_id = ?
    `).get(submissaoId);

    let novoStatus = sub.status;
    let comentarioDesclassificatorio = sub.comentario_desclassificatorio;

    if (totais.pesoFraude >= cfg.limiarPesoFraude) {
      novoStatus = 'desclassificado';
      comentarioDesclassificatorio = gerarTextoDesclassificacaoOficial({
        submissao: sub,
        motivoCodigo,
        pesoFraude: totais.pesoFraude,
        totalAuditores: totais.totalAuditores
      });
      db.prepare(`
        UPDATE submissoes
        SET status = 'desclassificado', motivo_desclassificacao = ?, comentario_desclassificatorio = ?
        WHERE id = ?
      `).run(motivoCodigo, comentarioDesclassificatorio, submissaoId);

      db.prepare('UPDATE participantes SET pontos_totais = MAX(0, pontos_totais - 200), reputacao = MAX(0.5, reputacao - 0.5) WHERE apelido = ?')
        .run(sub.apelido_participante);
    } else if (totais.pesoValido >= cfg.limiarPesoValidacao && sub.status === 'em_auditoria') {
      novoStatus = 'validado';
      db.prepare("UPDATE submissoes SET status = 'validado' WHERE id = ?").run(submissaoId);
    }

    return {
      ok: true,
      submissaoId,
      status: novoStatus,
      pesoFraude: Number(totais.pesoFraude.toFixed(2)),
      pesoValido: Number(totais.pesoValido.toFixed(2)),
      comentarioDesclassificatorio
    };
  });

  // 6. Censo Cívico Transparente (100% LGPD + k-anonimato >= 10)
  const handlerCensoResponder = async (req, reply) => {
    const corpo = req.body || {};
    const checagemLgpd = detectarViolacaoDadosPessoaisCenso(corpo);
    if (checagemLgpd.violado) {
      return reply.code(400).send({ ok: false, erro: checagemLgpd.motivo });
    }

    const tokenAnonimo = String(corpo.identificador_anonimo || corpo.protocoloHash || '').trim();
    const regiao = String(corpo.regiao || '').trim();
    const faixaRenda = String(corpo.faixaRenda || '').trim();
    const prioridade = String(
      corpo.prioridadePrincipal || (Array.isArray(corpo.prioridades) ? corpo.prioridades[0] : '') || ''
    ).trim();

    if (tokenAnonimo.length < 16 || !regiao || !faixaRenda || !prioridade) {
      return reply.code(400).send({
        ok: false,
        erro: 'Envie token anônimo (>=16 caracteres), região, faixa de renda e prioridade principal.'
      });
    }

    const hashUnico = gerarHmacUnicoCenso(tokenAnonimo, cfg.segredoHmacCenso);
    try {
      db.prepare(`
        INSERT INTO respostas_censo (hash_unico, regiao, faixa_renda, ocupacao, prioridade_principal, nivel_ia)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        hashUnico,
        regiao,
        faixaRenda,
        String(corpo.ocupacao || 'nao_informado'),
        prioridade,
        String(corpo.nivelIa || corpo.usoIa || 'iniciante')
      );
      return reply.code(201).send({ ok: true, protocoloServidor: hashUnico.slice(0, 16) });
    } catch {
      return reply.code(409).send({ ok: false, erro: 'Este protocolo anônimo já registrou resposta única no Censo.' });
    }
  };
  registrarDuplo('post', '/censo/responder', handlerCensoResponder);
  registrarDuplo('post', '/censo', handlerCensoResponder);

  registrarDuplo('get', '/censo/agregado', async () => {
    const totalRespostas = db.prepare('SELECT COUNT(*) AS total FROM respostas_censo').get().total;
    const porRegiao = db
      .prepare(`
        SELECT regiao, COUNT(*) AS total
        FROM respostas_censo
        GROUP BY regiao
        HAVING COUNT(*) >= ?
        ORDER BY total DESC
      `)
      .all(cfg.kAnonimatoMinimo);

    const porPrioridade = db
      .prepare(`
        SELECT prioridade_principal AS prioridade, COUNT(*) AS total
        FROM respostas_censo
        GROUP BY prioridade_principal
        HAVING COUNT(*) >= ?
        ORDER BY total DESC
      `)
      .all(cfg.kAnonimatoMinimo);

    return {
      ok: true,
      kAnonimatoMinimo: cfg.kAnonimatoMinimo,
      totalRespostas,
      porRegiao,
      porPrioridade
    };
  });

  return { app, db, cfg, bot };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const { app, cfg } = await criarServidor({ logger: true });
  await app.listen({ port: cfg.porta, host: cfg.enderecoEscuta });
}
