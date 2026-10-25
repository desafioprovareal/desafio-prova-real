import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const TABELA_TARIFAS_USD_MILHAO = {
  'claude-opus': { entrada: 15.0, saida: 75.0 },
  'claude-sonnet': { entrada: 3.0, saida: 15.0 },
  'claude-haiku': { entrada: 0.8, saida: 4.0 },
  'gpt-4.1': { entrada: 2.0, saida: 8.0 },
  'gpt-4o-mini': { entrada: 0.15, saida: 0.6 },
  'gpt-4o': { entrada: 2.5, saida: 10.0 },
  'gemini-2.5-pro': { entrada: 1.25, saida: 10.0 },
  'gemini-2.5-flash': { entrada: 0.15, saida: 0.6 },
  'deepseek-r1': { entrada: 0.55, saida: 2.19 },
  'deepseek': { entrada: 0.27, saida: 1.1 },
  'llama': { entrada: 0.0, saida: 0.0 }
};

export function calcularCustoTokensReais({ modeloIa, tokensEntrada = 0, tokensSaida = 0, cotacaoBrl = 5.8 }) {
  const chave = String(modeloIa || '').toLowerCase();
  let tarifa = { entrada: 1.25, saida: 5.0 };
  for (const [prefixo, valores] of Object.entries(TABELA_TARIFAS_USD_MILHAO)) {
    if (chave.includes(prefixo)) {
      tarifa = valores;
      break;
    }
  }
  const usd = (Math.max(0, Number(tokensEntrada)) / 1_000_000) * tarifa.entrada +
              (Math.max(0, Number(tokensSaida)) / 1_000_000) * tarifa.saida;
  return Number((usd * cotacaoBrl).toFixed(4));
}

export async function ingerirETranscreverMidia({ origem, caminhoTranscricaoJson }) {
  if (caminhoTranscricaoJson && fs.existsSync(caminhoTranscricaoJson)) {
    const dados = JSON.parse(fs.readFileSync(caminhoTranscricaoJson, 'utf-8'));
    return {
      ok: true,
      origem,
      dataOriginal: dados.dataOriginal || new Date().toISOString().slice(0, 10),
      segmentos: dados.segmentos || []
    };
  }

  if (fs.existsSync(origem)) {
    const stat = fs.statSync(origem);
    return {
      ok: true,
      origem,
      tamanhoBytes: stat.size,
      dataOriginal: stat.mtime.toISOString().slice(0, 10),
      instrucao: 'Arquivo local validado. Utilize faster-whisper para gerar segmentos detalhados se ainda não transcrito.'
    };
  }

  // Metadados via yt-dlp caso seja URL pública e o binário esteja disponível
  const ytdlp = process.env.YTDLP_BIN || 'yt-dlp';
  try {
    const saida = execFileSync(ytdlp, ['--dump-single-json', '--no-warnings', '--skip-download', origem], {
      encoding: 'utf-8',
      timeout: 20000
    });
    const meta = JSON.parse(saida);
    const d = String(meta.upload_date || '');
    const dataFormatada = d.length === 8 ? `${d.slice(6, 8)}/${d.slice(4, 6)}/${d.slice(0, 4)}` : 'Data não informada';
    return {
      ok: true,
      origem,
      tituloOriginal: meta.title,
      canal: meta.uploader,
      duracaoSegundos: meta.duration,
      dataOriginal: dataFormatada
    };
  } catch {
    return {
      ok: true,
      origem,
      aviso: 'yt-dlp indisponível ou URL offline; prossiga informando a transcrição e data verificada.'
    };
  }
}

export function auditarContextoJanela({ segmentos = [], segundoInicio, segundoFim }) {
  const ini = Number(segundoInicio);
  const fim = Number(segundoFim);
  if (!(fim > ini)) {
    return { aprovado: false, motivo: 'O segundo final deve ser maior que o segundo inicial.' };
  }

  const janelaAntesInicio = Math.max(0, ini - 60);
  const janelaDepoisFim = fim + 60;

  const antes = segmentos.filter((s) => s.fim > janelaAntesInicio && s.inicio < ini).map((s) => s.texto).join(' ').trim();
  const corte = segmentos.filter((s) => s.fim > ini && s.inicio < fim).map((s) => s.texto).join(' ').trim();
  const depois = segmentos.filter((s) => s.fim > fim && s.inicio < janelaDepoisFim).map((s) => s.texto).join(' ').trim();

  const gatilhosRessalva = /^(mas|porém|entretanto|contudo|todavia|só que|isso é mentira|é falso)/i;
  const gatilhosCitacaoAlheia = /(dizem que|inventaram que|falam por aí que|mentem dizendo que)\s*$/i;

  const alertas = [];
  if (gatilhosRessalva.test(depois)) {
    alertas.push('O trecho imediatamente após o corte começa com conjunção adversativa/negação que pode inverter o sentido da fala.');
  }
  if (gatilhosCitacaoAlheia.test(antes)) {
    alertas.push('O trecho imediatamente anterior indica que o orador estava citando fala de terceiros, e não opinião própria.');
  }

  return {
    aprovado: alertas.length === 0,
    janelaAuditadaSegundos: { inicioExpandido: janelaAntesInicio, fimExpandido: janelaDepoisFim },
    contextoAnterior60s: antes,
    textoCorte: corte,
    contextoPosterior60s: depois,
    alertas
  };
}

export async function verificarFatosOficiais({ termoBusca, ano }) {
  const fontes = [];
  try {
    const params = new URLSearchParams({ keywords: termoBusca, itens: '5', ordem: 'DESC', ordenarPor: 'id' });
    if (ano) params.set('ano', String(ano));
    const urlCamara = `https://dadosabertos.camara.leg.br/api/v2/proposicoes?${params.toString()}`;
    const resp = await fetch(urlCamara, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(6000)
    });
    if (resp.ok) {
      const json = await resp.json();
      for (const item of json.dados || []) {
        fontes.push({
          orgao: 'Câmara dos Deputados (Dados Abertos)',
          referencia: `${item.siglaTipo} ${item.numero}/${item.ano}`,
          ementa: item.ementa,
          urlOficial: `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${item.id}`
        });
      }
    }
  } catch {
    // Em ambiente sem rede externa retorna instrução limpa de consulta oficial
  }

  return {
    ok: true,
    termoConsultado: termoBusca,
    fontesPrimariasEncontradas: fontes,
    portaisRecomendados: [
      'https://dadosabertos.camara.leg.br',
      'https://legis.senado.leg.br/dadosabertos',
      'https://censo2022.ibge.gov.br',
      'https://portaldatransparencia.gov.br'
    ]
  };
}

export function renderizarCorteEditorial({
  caminhoVideoOrigem,
  pastaSaidaBase,
  identificadorVideo,
  segundoInicio,
  segundoFim,
  velocidadeVoz = 1.0,
  trocarFundoRealistaIa = false,
  dataOriginalFala,
  resumoFonteOficial,
  apenasSimularComando = false
}) {
  if (Number(velocidadeVoz) !== 1.0) {
    return {
      aprovado: false,
      erro: 'BLOQUEADO PELA TRAVA ÉTICA (#DesafioProvaReal): Alterar a velocidade da fala humana (câmera lenta/rápida) configura cheapfake enganoso e é proibido.'
    };
  }
  if (trocarFundoRealistaIa) {
    return {
      aprovado: false,
      erro: 'BLOQUEADO PELA CONFORMIDADE TSE (Resolução nº 23.610/2019): Substituição sintética realista de cenário é vedada. Utilize a Tela Dividida Editorial padrão.'
    };
  }

  const slug = String(identificadorVideo || 'projeto-corte').replace(/[^a-zA-Z0-9_-]/g, '-');
  const pastaProjeto = path.join(pastaSaidaBase || './cortes-auditados', slug);
  fs.mkdirSync(pastaProjeto, { recursive: true });

  const duracao = Number(segundoFim) - Number(segundoInicio);
  const arquivoSaida = path.join(pastaProjeto, `${slug}-${Math.round(segundoInicio)}s-${Math.round(segundoFim)}s.mp4`);
  const textoTopo = `PROVA REAL | Data Real: ${dataOriginalFala} | Fonte: ${String(resumoFonteOficial).slice(0, 48)}`.replace(/[:']/g, ' ');

  const argsFfmpeg = [
    '-y',
    '-ss', String(segundoInicio),
    '-t', String(duracao),
    '-i', caminhoVideoOrigem,
    '-vf',
    `scale=1080:1260:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:660:#0D1117,drawtext=text='${textoTopo}':fontcolor=#00E5FF:fontsize=30:x=48:y=120`,
    '-map_metadata', '-1',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    arquivoSaida
  ];

  const planoCadencia = {
    recomendacaoAntiBloqueio: 'Agende no máximo 2 a 3 cortes únicos por dia por rede social nos estúdios oficiais (YouTube Studio, TikTok Web, Meta Business Suite).',
    janelasHorariasSugeridas: ['08:15', '12:30', '20:00']
  };

  if (!apenasSimularComando) {
    const binFfmpeg = process.env.FFMPEG_BIN || 'ffmpeg';
    execFileSync(binFfmpeg, argsFfmpeg, { stdio: 'ignore' });
  }

  return {
    aprovado: true,
    pastaProjeto,
    arquivoSaida,
    velocidadeTravada: '1.0x',
    comandoFfmpeg: ['ffmpeg', ...argsFfmpeg],
    planoCadencia
  };
}

export async function gerarComentarioERegistrarMetricas({
  linkFonteOriginal,
  segundoInicio,
  segundoFim,
  dataOriginal,
  vereditoFontes,
  modeloIa,
  tokensEntrada,
  tokensSaida,
  promptUsado,
  urlApiDesafio,
  apelidoParticipante,
  redeSocial,
  linkPostagemPublicada
}) {
  const custoReais = calcularCustoTokensReais({ modeloIa, tokensEntrada, tokensSaida });
  const hashVerificacao = crypto
    .createHash('sha256')
    .update(`${linkFonteOriginal}|${Number(segundoInicio).toFixed(2)}|${Number(segundoFim).toFixed(2)}|${modeloIa}|${promptUsado}`)
    .digest('hex')
    .slice(0, 16);

  const comentarioOficial = [
    '🔎 FICHA DE AUDITORIA — #DesafioProvaReal',
    `📌 Fonte Original: ${linkFonteOriginal}`,
    `⏱️ Trecho Exato Extraído: ${Number(segundoInicio).toFixed(2)}s até ${Number(segundoFim).toFixed(2)}s | Data Original: ${dataOriginal}`,
    `📊 Veredito das Fontes: ${vereditoFontes}`,
    `🤖 Modelo de IA Utilizado: ${modeloIa}`,
    `🧮 Consumo Estimado: ${tokensEntrada} tokens de entrada + ${tokensSaida} tokens de saída | Custo aprox.: R$ ${custoReais.toFixed(4).replace('.', ',')}`,
    `🔐 Código de Integridade: ${hashVerificacao}`,
    '📝 Prompt Integral Usado pelo Autor:',
    `"${promptUsado}"`,
    '',
    '⚖️ REGRAS DO DESAFIO: Qualquer pessoa (de direita, esquerda ou centro) pode auditar este conteúdo gratuitamente!',
    '⚠️ AVISO ANTI-RASURA: Se este comentário aparecer marcado como "editado", esta postagem perde automaticamente a validade e o autor é desclassificado do ranking. Caso esta rede social não exiba histórico público de edição nos comentários, NÃO CONFIE CEGAMENTE: copie este comentário e o link da fonte original e valide agora no Prompt Auditor gratuito no repositório oficial do #DesafioProvaReal!'
  ].join('\n');

  let sincronizadoServidor = false;
  if (urlApiDesafio && linkPostagemPublicada) {
    try {
      const resp = await fetch(`${urlApiDesafio.replace(/\/+$/, '')}/api/submissoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apelido: apelidoParticipante || 'participante-mcp',
          redeSocial: redeSocial || 'tiktok',
          linkPostagem: linkPostagemPublicada,
          linkFonte: linkFonteOriginal,
          segundoInicio,
          segundoFim,
          modeloIa,
          tokensEntrada,
          tokensSaida,
          promptDeclarado: promptUsado,
          comentarioAuditoria: comentarioOficial,
          viaMcp: true
        }),
        signal: AbortSignal.timeout(4000)
      });
      sincronizadoServidor = resp.ok;
    } catch {
      sincronizadoServidor = false;
    }
  }

  return {
    ok: true,
    custoReais,
    hashVerificacao,
    sincronizadoServidor,
    comentarioOficial
  };
}
