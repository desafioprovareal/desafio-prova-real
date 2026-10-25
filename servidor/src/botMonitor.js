import { calcularHashIntegridade, calcularCustoTokensReais, normalizarFamiliaIa } from './utilitarios.js';

/**
 * Bot Monitor Leve da #DesafioProvaReal.
 * Consome memória mínima (~10 MB): sincroniza submissões vindas das GitHub Issues
 * (label: telemetria-prova-real) e audita integridade básica das postagens em aberto.
 */
export function iniciarBotMonitor({ db, cfg, log = console }) {
  let temporizador = null;

  async function executarCiclo() {
    const resumo = { issuesImportadas: 0, submissoesVerificadas: 0 };

    // 1. Coleta opcional de telemetria pública via GitHub Issues (sem peso de browser headless)
    if (cfg.githubRepositorio && cfg.githubToken) {
      try {
        const url = `https://api.github.com/repos/${cfg.githubRepositorio}/issues?labels=telemetria-prova-real&state=open&per_page=20`;
        const resp = await fetch(url, {
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${cfg.githubToken}`,
            'User-Agent': 'DesafioProvaReal-BotMonitor/1.0'
          }
        });
        if (resp.ok) {
          const issues = await resp.json();
          const inserir = db.prepare(`
            INSERT OR IGNORE INTO submissoes (
              apelido_participante, rede_social, link_postagem, link_fonte,
              segundo_inicio, segundo_fim, prompt_declarado, hash_integridade,
              modelo_ia, familia_ia, tokens_entrada, tokens_saida, custo_reais, via_mcp, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'validado')
          `);
          for (const issue of issues) {
            try {
              const dados = JSON.parse(issue.body || '{}');
              if (!dados.linkPostagem || !dados.linkFonte || !dados.modeloIa) continue;
              const custo = calcularCustoTokensReais({
                modeloIa: dados.modeloIa,
                tokensEntrada: dados.tokensEntrada,
                tokensSaida: dados.tokensSaida,
                cotacaoDolarBrl: cfg.cotacaoDolarBrl
              });
              const hash = calcularHashIntegridade(dados);
              inserir.run(
                String(dados.apelido || issue.user?.login || 'anonimo'),
                String(dados.redeSocial || 'tiktok').toLowerCase(),
                String(dados.linkPostagem),
                String(dados.linkFonte),
                Number(dados.segundoInicio || 0),
                Number(dados.segundoFim || 0),
                String(dados.promptDeclarado || 'Prompt 01 Oficial'),
                hash,
                String(dados.modeloIa),
                normalizarFamiliaIa(dados.modeloIa),
                Number(dados.tokensEntrada || 0),
                Number(dados.tokensSaida || 0),
                custo
              );
              resumo.issuesImportadas += 1;
            } catch {
              // Ignora issue com formato inválido
            }
          }
        }
      } catch (erro) {
        log.warn?.('Aviso no ciclo GitHub do Bot Monitor:', erro.message);
      }
    }

    // 2. Audita consistência interna de submissões em aberto (ex.: comentário rasurado reportado)
    const pendentes = db
      .prepare("SELECT id, comentario_auditoria FROM submissoes WHERE status = 'em_auditoria' LIMIT 50")
      .all();

    const marcarSuspeita = db.prepare(
      "UPDATE submissoes SET motivo_desclassificacao = ? WHERE id = ? AND motivo_desclassificacao = ''"
    );

    for (const item of pendentes) {
      resumo.submissoesVerificadas += 1;
      const texto = String(item.comentario_auditoria || '').toLowerCase();
      if (texto.includes('(editado)') || texto.includes('(edited)')) {
        marcarSuspeita.run('Marcador de edição detectado no comentário oficial.', item.id);
      }
    }

    return resumo;
  }

  if (cfg.ativarBotMonitor) {
    const intervaloMs = Math.max(1, cfg.intervaloBotMinutos) * 60 * 1000;
    temporizador = setInterval(() => {
      executarCiclo().catch(() => {});
    }, intervaloMs);
    temporizador.unref?.();
  }

  return {
    executarCiclo,
    parar() {
      if (temporizador) clearInterval(temporizador);
    }
  };
}
