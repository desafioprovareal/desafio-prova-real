import type {
  FaixaRenda,
  ItemTribunalAuditoria,
  ModeloIaPlacar,
  NivelUsoIa,
  OcupacaoCenso,
  ParticipanteArena,
  PrioridadeUrgente,
  RegiaoBrasil,
  RespostaCensoAnonima,
} from '../tipos';

export const PROMPT_AUDITOR_PADRAO = `Você é um Auditor Cívico Independente, Permanente e Apartidário do protocolo #DesafioProvaReal (válido durante e após qualquer eleição, para fiscalizar qualquer governo, oposição ou autoridade).
Sua missão é investigar na web com neutralidade absoluta, usando exclusivamente fontes públicas oficiais e registros documentais verificáveis.`;

export function montarPromptAuditorUniversal(conteudo: string, alegacaoRecebida?: string): string {
  const textoLimpo = conteudo.trim();
  const palavras = textoLimpo.split(/\s+/).filter(Boolean);
  const pareceApenasNome =
    palavras.length >= 1 &&
    palavras.length <= 7 &&
    !textoLimpo.includes('http://') &&
    !textoLimpo.includes('https://') &&
    textoLimpo.length <= 70;

  if (pareceApenasNome) {
    return `${PROMPT_AUDITOR_PADRAO}

ALVO DO RAIO-X PÚBLICO: "${textoLimpo}"

Faça uma busca completa na web em fontes oficiais e públicas (TSE DivulgaCandContas, Câmara, Senado, Portal da Transparência, TCU/CGU, Tribunais/CNJ, Diários Oficiais, CNPJ/QSA e reportagens investigativas com documentos) sobre esta pessoa e responda em português simples e direto:

1. [QUEM É E PASSADO POLÍTICO]: Cargos que já ocupou, todos os partidos pelos quais passou e como votou ou agiu em temas importantes.
2. [JUSTIÇA E PROCESSOS — SEPARAÇÃO OBRIGATÓRIA]:
   - Condenações definitivas / contas reprovadas / inelegibilidades (se houver, cite órgão e ano);
   - Processos, inquéritos ou investigações EM ABERTO hoje (cite o tribunal/órgão e explique do que trata, deixando claro que ainda está em julgamento);
   - Acusações já arquivadas/absolvidas ou boatos falsos (se houver).
3. [CONTRATOS, EMENDAS E PATRIMÔNIO]: Evolução do patrimônio declarado oficialmente, uso de verbas/emendas públicas, contratos com o poder público e empresas ligadas em registros públicos.
4. [REDE DE CONVÍVIO E ALIANÇAS]: Principais padrinhos políticos, aliados próximos, grandes financiadores oficiais, assessores-chave nomeados e conexões empresariais documentadas.
5. [FONTES CONSULTADAS]: Liste de onde veio cada informação para conferência pública.`;
  }

  const blocoAlegacao =
    alegacaoRecebida && alegacaoRecebida.trim().length > 0
      ? `\nALEGAÇÃO DE QUEM COMPARTILHOU:\n"${alegacaoRecebida.trim()}"\n`
      : '';

  return `${PROMPT_AUDITOR_PADRAO}
${blocoAlegacao}
CONTEÚDO / MEDIDA DO GOVERNO / NOTÍCIA / LINK PARA VERIFICAR:
"""
${textoLimpo}
"""

Use busca na web em bases públicas oficiais (Portal da Transparência, IBGE, Tesouro Nacional, Câmara, Senado, STF, TCU, Banco Central, DataSUS) e responda em português claro e direto:
1. [RESUMO EM 3 LINHAS SIMPLES]: É verdade, mentira, exagero ou fora de contexto?
2. [DATA E ORIGEM REAL]: De quando é isso originalmente?
3. [O QUE É FATO COMPROVADO COM FONTE OFICIAL]
4. [O QUE ESTÁ DISTORCIDO, OMITIDO OU SEM PROVA]
5. [SE FOR PESSOA CITADA]: Se houver político/autoridade central no texto, resuma também contratos, emendas ou processos públicos relevantes ligados ao tema.`;
}

export const URL_COLAB_CORTADOR_GRATIS =
  'https://colab.research.google.com/github/desafioprovareal/desafio-prova-real/blob/main/colab/cortador_auditavel_prova_real.ipynb';

export function montarPromptGeradorCortes(entrada: string): string {
  const alvo =
    entrada.trim() ||
    '[COLE AQUI O LINK DO VÍDEO DO YOUTUBE / LIVE OU A TRANSCRIÇÃO DA FALA]';

  return `Você agora opera sob o Protocolo Aberto do #DesafioProvaReal (Modo: GERADOR DE CORTES DE VÍDEO AUDITÁVEIS PARA REDES SOCIAIS).

NÚCLEO ÉTICO IMUTÁVEL (PROIBIDO VIOLAR):
1. Proibido cortar conjunções adversativas ("mas", "porém", "entretanto"), ironias ou falas de terceiros para inverter o sentido do orador.
2. Para CADA corte sugerido, audite obrigatoriamente 60 segundos antes e 60 segundos depois do trecho.
3. Proibido ocultar a data real da gravação ou sugerir câmera lenta/rápida na voz (velocidade sempre 1.0x — Resolução TSE nº 23.610/2019).
4. Confronte números, leis, contratos ou promessas citadas com bases públicas oficiais (Câmara, Senado, TSE, Portal da Transparência, IBGE, TCU, STF).

VÍDEO / LIVE / TRANSCRIÇÃO PARA CORTAR:
"""
${alvo}
"""

Entregue até 3 sugestões de cortes verticais (30s a 55s) prontos para eu postar no Reels, TikTok, YouTube Shorts, X, Facebook e WhatsApp. Para CADA corte, informe exatamente:

1. [TEMPOS EXATOS DO CORTE]:
   - Início (MM:SS e total em segundos) -> Fim (MM:SS e total em segundos)
   - Data real da fala original (DD/MM/AAAA)
   - Confirmação da Janela (-60s / +60s): resumo do que foi dito antes e depois provando que não houve manipulação de contexto.

2. [ARTE DA TELA DIVIDIDA (9:16)]:
   - Selo no topo: [✅ FATO COMPROVADO | ⚠️ INCONCLUSIVO | ❌ CONTRADIZ DADOS OFICIAIS]
   - Manchete curta e dado oficial verificado para exibir na metade superior do vídeo.
   - (Dica: posso gerar o MP4 automático colando esses segundos em: ${URL_COLAB_CORTADOR_GRATIS} ou editar no CapCut/celular mantendo velocidade 1.0x).

3. [LEGENDA PRONTA PARA AS REDES SOCIAIS]:
   Texto direto, imparcial e chamativo convidando qualquer pessoa a auditar em https://desafioprovareal.pages.dev #DesafioProvaReal

4. [FICHA DE AUDITORIA OBRIGATÓRIA — COPIAR E FIXAR NO 1º COMENTÁRIO SEM EDITAR]:
🔎 FICHA DE AUDITORIA — #DesafioProvaReal
📌 Fonte Original: [Link do vídeo original]
⏱️ Trecho Exato Extraído: [MM:SS até MM:SS] | Data Original: [DD/MM/AAAA]
📊 Veredito das Fontes: [Resumo + órgãos públicos consultados]
🤖 Modelo de IA Utilizado: [Preencha o nome do seu modelo] | Custo aprox.: R$ 0,00 (Plano Gratuito) ou estimativa de tokens
📝 Prompt Usado: "Gerador de Cortes Auditáveis #DesafioProvaReal — https://desafioprovareal.pages.dev"
⚠️ AVISO ANTI-RASURA: Comentário editado = desclassificado! Audite gratuitamente em: https://desafioprovareal.pages.dev`;
}

export function montarPromptCriadorConteudo(entrada: string): string {
  const alvo =
    entrada.trim() ||
    '[COLE AQUI O LINK DE UMA LIVE/VÍDEO, NOTÍCIA OU O NOME DE UM POLÍTICO]';

  return `Você agora opera sob o Protocolo Aberto do #DesafioProvaReal (Modo: GERADOR DE CONTEÚDO E CORTES AUDITÁVEIS PARA REDES SOCIAIS).

REGRAS ÉTICAS INEGOCIÁVEIS:
- Proibido tirar frases de contexto, cortar ressalvas ("mas", "porém"), inventar dados ou esconder a data original da fala/notícia.
- Verifique tudo na web em fontes oficiais brasileiras (TSE, Câmara, Senado, Portal da Transparência, IBGE, TCU, STF).

TEMA / VÍDEO / LIVE / POLÍTICO DE ENTRADA:
"""
${alvo}
"""

Entregue em português direto 3 blocos prontos para eu copiar e publicar agora:

1. [POST CURTO PRONTO PARA WHATSAPP E X (ATÉ 270 CARACTERES)]:
   Texto impactante, imparcial, cravando o fato oficial + convite: "Tire a prova real grátis: https://desafioprovareal.pages.dev #DesafioProvaReal"

2. [ROTEIRO E LEGENDA PARA INSTAGRAM REELS, TIKTOK, SHORTS E FACEBOOK]:
   - Se for vídeo/live: indique o trecho íntegro recomendado (respeitando 60s antes e 60s depois, velocidade real 1.0x) e o que colocar no topo da tela dividida;
   - Legenda completa pronta para engajar comentários sem partidarismo.

3. [FICHA DE AUDITORIA OBRIGATÓRIA (PARA FIXAR NO 1º COMENTÁRIO SEM EDITAR)]:
🔎 FICHA DE AUDITORIA — #DesafioProvaReal
📌 Fonte Original e Data Real: [Preencha com link e DD/MM/AAAA]
📊 Veredito das Fontes Oficiais: [Resumo objetivo + órgãos consultados]
🤖 IA Utilizada: [Nome do modelo] | Custo aprox.: R$ 0,00 (Plano Gratuito) ou estimativa de tokens
📝 Prompt Usado: "Protocolo Aberto #DesafioProvaReal — https://desafioprovareal.pages.dev"
⚠️ Comentário editado = desclassificado! Audite você mesmo em: https://desafioprovareal.pages.dev`;
}

export const TEXTO_COMPARTILHAR_DESAFIO = `Ganhe quem ganhar a eleição, ninguém vai empurrar mentira goela abaixo! 🔎

Teste de graça o #DesafioProvaReal: digite SÓ O NOME de qualquer político (para ver passado, processos em aberto, contratos e alianças em fontes públicas) ou cheque qualquer vídeo do WhatsApp em segundos:
https://desafioprovareal.pages.dev`;

export const MODELOS_INICIAIS: ModeloIaPlacar[] = [
  {
    id: 'claude-sonnet',
    nome: 'Claude Sonnet',
    fornecedor: 'Anthropic',
    destaque: 'Líder em Fidelidade Contextual',
    pesosAbertos: false,
    custoEntradaPorMilhaoUsd: 3.0,
    custoSaidaPorMilhaoUsd: 15.0,
    porRede: {
      tiktok: { cortesAuditados: 412, taxaFidelidade: 97.2, tokensTotais: 6180000, custoTotalReais: 274.8 },
      instagram: { cortesAuditados: 368, taxaFidelidade: 96.8, tokensTotais: 5520000, custoTotalReais: 245.4 },
      youtube: { cortesAuditados: 295, taxaFidelidade: 97.6, tokensTotais: 5310000, custoTotalReais: 236.1 },
      x: { cortesAuditados: 264, taxaFidelidade: 96.1, tokensTotais: 3696000, custoTotalReais: 164.3 },
      facebook: { cortesAuditados: 141, taxaFidelidade: 95.9, tokensTotais: 2115000, custoTotalReais: 94.0 },
    },
  },
  {
    id: 'gemini-pro',
    nome: 'Gemini Pro',
    fornecedor: 'Google',
    destaque: 'Maior Janela p/ Vídeos Longos',
    pesosAbertos: false,
    custoEntradaPorMilhaoUsd: 1.25,
    custoSaidaPorMilhaoUsd: 5.0,
    porRede: {
      tiktok: { cortesAuditados: 486, taxaFidelidade: 95.4, tokensTotais: 8262000, custoTotalReais: 143.7 },
      instagram: { cortesAuditados: 410, taxaFidelidade: 94.9, tokensTotais: 6970000, custoTotalReais: 121.3 },
      youtube: { cortesAuditados: 520, taxaFidelidade: 96.3, tokensTotais: 11440000, custoTotalReais: 199.1 },
      x: { cortesAuditados: 238, taxaFidelidade: 94.5, tokensTotais: 3570000, custoTotalReais: 62.1 },
      facebook: { cortesAuditados: 162, taxaFidelidade: 94.2, tokensTotais: 2592000, custoTotalReais: 45.1 },
    },
  },
  {
    id: 'gpt-4o',
    nome: 'GPT-4o',
    fornecedor: 'OpenAI',
    destaque: 'Alta Precisão em Tabelas e Orçamento',
    pesosAbertos: false,
    custoEntradaPorMilhaoUsd: 2.5,
    custoSaidaPorMilhaoUsd: 10.0,
    porRede: {
      tiktok: { cortesAuditados: 394, taxaFidelidade: 95.1, tokensTotais: 5910000, custoTotalReais: 188.5 },
      instagram: { cortesAuditados: 352, taxaFidelidade: 94.7, tokensTotais: 5280000, custoTotalReais: 168.4 },
      youtube: { cortesAuditados: 278, taxaFidelidade: 95.6, tokensTotais: 4726000, custoTotalReais: 150.8 },
      x: { cortesAuditados: 312, taxaFidelidade: 94.8, tokensTotais: 4368000, custoTotalReais: 139.3 },
      facebook: { cortesAuditados: 128, taxaFidelidade: 93.9, tokensTotais: 1920000, custoTotalReais: 61.2 },
    },
  },
  {
    id: 'deepseek',
    nome: 'DeepSeek',
    fornecedor: 'DeepSeek R1/V3',
    destaque: 'Menor Custo por Auditoria',
    pesosAbertos: true,
    custoEntradaPorMilhaoUsd: 0.27,
    custoSaidaPorMilhaoUsd: 1.1,
    porRede: {
      tiktok: { cortesAuditados: 530, taxaFidelidade: 93.8, tokensTotais: 8480000, custoTotalReais: 31.4 },
      instagram: { cortesAuditados: 445, taxaFidelidade: 93.2, tokensTotais: 7120000, custoTotalReais: 26.3 },
      youtube: { cortesAuditados: 318, taxaFidelidade: 94.1, tokensTotais: 5724000, custoTotalReais: 21.2 },
      x: { cortesAuditados: 389, taxaFidelidade: 93.5, tokensTotais: 5835000, custoTotalReais: 21.6 },
      facebook: { cortesAuditados: 174, taxaFidelidade: 92.7, tokensTotais: 2784000, custoTotalReais: 10.3 },
    },
  },
  {
    id: 'llama-aberto',
    nome: 'Llama Aberto',
    fornecedor: 'Meta / Pesos Abertos (70B)',
    destaque: 'Auditável Localmente Sem Nuvem',
    pesosAbertos: true,
    custoEntradaPorMilhaoUsd: 0.59,
    custoSaidaPorMilhaoUsd: 0.79,
    porRede: {
      tiktok: { cortesAuditados: 288, taxaFidelidade: 91.6, tokensTotais: 4608000, custoTotalReais: 19.8 },
      instagram: { cortesAuditados: 244, taxaFidelidade: 91.2, tokensTotais: 3904000, custoTotalReais: 16.8 },
      youtube: { cortesAuditados: 219, taxaFidelidade: 92.4, tokensTotais: 3942000, custoTotalReais: 16.9 },
      x: { cortesAuditados: 205, taxaFidelidade: 91.0, tokensTotais: 3075000, custoTotalReais: 13.2 },
      facebook: { cortesAuditados: 109, taxaFidelidade: 90.4, tokensTotais: 1744000, custoTotalReais: 7.5 },
    },
  },
];

export const PARTICIPANTES_INICIAIS: ParticipanteArena[] = [
  {
    id: 'part-01',
    apelido: '@marina.audita',
    codigoVerificacao: 'PR-8K2M',
    verificado: true,
    redesVinculadas: ['tiktok', 'instagram', 'youtube', 'x'],
    possuiGithub: true,
    cortesValidados: 48,
    visualizacoesAuditadas: 642800,
    comentariosGerados: 9140,
    auditoriasCacaFraudes: 19,
    pontuacaoGeral: 4890,
  },
  {
    id: 'part-02',
    apelido: '@rafael.dadosabertos',
    codigoVerificacao: 'PR-4N9P',
    verificado: true,
    redesVinculadas: ['youtube', 'x', 'instagram'],
    possuiGithub: true,
    cortesValidados: 41,
    visualizacoesAuditadas: 518400,
    comentariosGerados: 7430,
    auditoriasCacaFraudes: 22,
    pontuacaoGeral: 4510,
  },
  {
    id: 'part-03',
    apelido: '@camila.semfiltro',
    codigoVerificacao: 'PR-7T3V',
    verificado: true,
    redesVinculadas: ['tiktok', 'instagram', 'facebook'],
    possuiGithub: false,
    cortesValidados: 39,
    visualizacoesAuditadas: 489100,
    comentariosGerados: 6820,
    auditoriasCacaFraudes: 14,
    pontuacaoGeral: 3985,
  },
  {
    id: 'part-04',
    apelido: '@lucas.verificador',
    codigoVerificacao: 'PR-2H6R',
    verificado: true,
    redesVinculadas: ['tiktok', 'youtube', 'x'],
    possuiGithub: true,
    cortesValidados: 33,
    visualizacoesAuditadas: 374500,
    comentariosGerados: 5190,
    auditoriasCacaFraudes: 17,
    pontuacaoGeral: 3540,
  },
  {
    id: 'part-05',
    apelido: '@bianca.transparencia',
    codigoVerificacao: 'PR-9C5L',
    verificado: true,
    redesVinculadas: ['instagram', 'x', 'facebook'],
    possuiGithub: true,
    cortesValidados: 29,
    visualizacoesAuditadas: 312900,
    comentariosGerados: 4380,
    auditoriasCacaFraudes: 15,
    pontuacaoGeral: 3125,
  },
  {
    id: 'part-06',
    apelido: '@thiago.lupacivica',
    codigoVerificacao: 'PR-5W8D',
    verificado: false,
    redesVinculadas: ['tiktok', 'youtube'],
    possuiGithub: false,
    cortesValidados: 21,
    visualizacoesAuditadas: 198400,
    comentariosGerados: 2610,
    auditoriasCacaFraudes: 8,
    pontuacaoGeral: 2190,
  },
];

export const ITENS_TRIBUNAL_INICIAIS: ItemTribunalAuditoria[] = [
  {
    id: 'trib-01',
    protocolo: 'AUD-2026-0841',
    autorApelido: '@marina.audita',
    redeSocial: 'tiktok',
    tituloCorte: 'Checagem de execução orçamentária em saneamento básico (2020–2025)',
    urlPostagem: 'https://www.tiktok.com/@desafioprovareal',
    urlVideoOriginal: 'https://www.youtube.com/@desafioprovareal',
    modeloDeclarado: 'Claude Sonnet',
    tokensDeclarados: 14820,
    promptDeclarado: PROMPT_AUDITOR_PADRAO,
    criadoEm: 'Há 42 min',
    status: 'em_auditoria',
    pesoAprovacao: 28.5,
    pesoReprovacao: 2.0,
    totalVotos: 14,
  },
  {
    id: 'trib-02',
    protocolo: 'AUD-2026-0839',
    autorApelido: '@canal.corte.urgente',
    redeSocial: 'instagram',
    tituloCorte: 'Trecho de entrevista sobre arrecadação e isenção de cesta básica',
    urlPostagem: 'https://www.instagram.com/desafioprovareal',
    urlVideoOriginal: 'https://www.youtube.com/@desafioprovareal',
    modeloDeclarado: 'GPT-4o',
    tokensDeclarados: 9410,
    promptDeclarado:
      'Analise a fala do entrevistado focando apenas nas contradições fiscais do último trimestre.',
    criadoEm: 'Há 1h 15min',
    status: 'em_auditoria',
    pesoAprovacao: 9.5,
    pesoReprovacao: 18.0,
    totalVotos: 11,
    categoriaFalha: 'Prompt manipulado ou enviesado',
    motivoFalha:
      'Alerta comunitário: o prompt enviado pede para focar apenas em um recorte negativo, omitindo os 40 segundos seguintes do vídeo original.',
  },
  {
    id: 'trib-03',
    protocolo: 'AUD-2026-0835',
    autorApelido: '@rafael.dadosabertos',
    redeSocial: 'youtube',
    tituloCorte: 'Comparativo histórico da dívida bruta vs. investimento público (Tesouro)',
    urlPostagem: 'https://www.youtube.com/@desafioprovareal',
    urlVideoOriginal: 'https://www.youtube.com/@desafioprovareal',
    modeloDeclarado: 'Gemini Pro',
    tokensDeclarados: 22650,
    promptDeclarado: PROMPT_AUDITOR_PADRAO,
    criadoEm: 'Há 3h',
    status: 'em_auditoria',
    pesoAprovacao: 34.0,
    pesoReprovacao: 1.5,
    totalVotos: 16,
  },
  {
    id: 'trib-desc-01',
    protocolo: 'AUD-2026-0812',
    autorApelido: '@cortes.relampago.br',
    redeSocial: 'tiktok',
    tituloCorte: 'Alegação de corte de verba escolar sem mostrar emenda complementar',
    urlPostagem: 'https://www.tiktok.com/@desafioprovareal',
    urlVideoOriginal: 'https://www.youtube.com/@desafioprovareal',
    modeloDeclarado: 'GPT-4o',
    tokensDeclarados: 6200,
    promptDeclarado: 'Confirme que houve redução nominal ignorando transferência fundo a fundo.',
    criadoEm: 'Ontem',
    status: 'desclassificado',
    pesoAprovacao: 3.0,
    pesoReprovacao: 46.5,
    totalVotos: 23,
    categoriaFalha: 'Comentário editado após auditoria',
    motivoFalha:
      'Editou o comentário da auditoria 19 minutos após publicar para apagar o parágrafo onde a IA alertava que a verba foi transferida via FUNDEB.',
    detalheProvaTecnica:
      'Hash SHA-256 original (9f3a...c812) divergiu da captura reauditada (41b0...e904). Trecho de 284 caracteres suprimido.',
  },
  {
    id: 'trib-desc-02',
    protocolo: 'AUD-2026-0798',
    autorApelido: '@radar.polarizado',
    redeSocial: 'x',
    tituloCorte: 'Frase interrompida aos 02m14s antes da conjunção adversativa "porém"',
    urlPostagem: 'https://x.com/desafioprovareal',
    urlVideoOriginal: 'https://www.youtube.com/@desafioprovareal',
    modeloDeclarado: 'DeepSeek',
    tokensDeclarados: 4100,
    promptDeclarado: 'Resuma o trecho transcrito sem exigir link do vídeo integral.',
    criadoEm: 'Há 2 dias',
    status: 'desclassificado',
    pesoAprovacao: 1.5,
    pesoReprovacao: 52.0,
    totalVotos: 27,
    categoriaFalha: 'Corte fora de contexto sem fonte bruta',
    motivoFalha:
      'Corte cirúrgico interrompendo a frase no meio para inverter a conclusão do orador e recusa de fornecer link da gravação integral.',
    detalheProvaTecnica:
      'Comparação de minutagem na íntegra pública (02:14 a 02:39) comprovou inversão semântica deliberada.',
  },
  {
    id: 'trib-desc-03',
    protocolo: 'AUD-2026-0774',
    autorApelido: '@fator.viral.clips',
    redeSocial: 'instagram',
    tituloCorte: 'Relatório de auditoria falsificado com contagem irreal de tokens',
    urlPostagem: 'https://www.instagram.com/desafioprovareal',
    urlVideoOriginal: 'https://www.youtube.com/@desafioprovareal',
    modeloDeclarado: 'Claude Sonnet',
    tokensDeclarados: 420,
    promptDeclarado: 'Texto escrito manualmente fingindo saída automática de modelo.',
    criadoEm: 'Há 3 dias',
    status: 'desclassificado',
    pesoAprovacao: 0.5,
    pesoReprovacao: 39.0,
    totalVotos: 19,
    categoriaFalha: 'Dados de tokens/modelo adulterados',
    motivoFalha:
      'Declarou auditoria completa de vídeo de 18 minutos usando apenas 420 tokens e texto incompatível com a saída verificável do modelo.',
    detalheProvaTecnica:
      'Reexecução determinística no protocolo aberto exigiu 16.340 tokens e produziu conclusão oposta à publicada.',
  },
];

function construirRespostasIniciaisCenso(): RespostaCensoAnonima[] {
  const distribuicaoRegional: Array<{ regiao: RegiaoBrasil; quantidade: number }> = [
    { regiao: 'Sudeste', quantidade: 64 },
    { regiao: 'Nordeste', quantidade: 46 },
    { regiao: 'Sul', quantidade: 32 },
    { regiao: 'Centro-Oeste', quantidade: 23 },
    // Norte inicia com 9 respostas para demonstrar de forma transparente a trava matemática LGPD (n >= 10)
    { regiao: 'Norte', quantidade: 9 },
  ];

  const faixas: FaixaRenda[] = [
    'Até 2 salários mínimos',
    'De 2 a 5 salários mínimos',
    'De 5 a 10 salários mínimos',
    'De 2 a 5 salários mínimos',
    'Até 2 salários mínimos',
    'De 10 a 20 salários mínimos',
    'Prefiro não informar',
    'Acima de 20 salários mínimos',
  ];

  const ocupacoes: OcupacaoCenso[] = [
    'Trabalhador CLT / Setor Privado',
    'Autônomo / MEI / Informal',
    'Estudante / Pesquisador',
    'Servidor Público',
    'Empreendedor / Empresário',
    'Trabalhador CLT / Setor Privado',
    'Em busca de recolocação',
    'Aposentado / Pensionista',
  ];

  const combinacoesPrioridades: PrioridadeUrgente[][] = [
    ['Custo de Vida', 'Saúde', 'Segurança Pública'],
    ['Segurança Pública', 'Combate à Corrupção', 'Impostos'],
    ['Custo de Vida', 'Emprego', 'Educação'],
    ['Saúde', 'Educação', 'Custo de Vida'],
    ['Impostos', 'Custo de Vida', 'Combate à Corrupção'],
    ['Segurança Pública', 'Saúde', 'Emprego'],
    ['Educação', 'Emprego', 'Combate à Corrupção'],
  ];

  const niveisIa: NivelUsoIa[] = [
    'Uso ocasionalmente para tirar dúvidas',
    'Uso toda semana no estudo ou trabalho',
    'Nunca usei / Estou começando agora',
    'Uso diariamente e audito prompts/código',
    'Uso toda semana no estudo ou trabalho',
  ];

  const lista: RespostaCensoAnonima[] = [];
  let indiceGlobal = 1;

  for (const bloco of distribuicaoRegional) {
    for (let i = 0; i < bloco.quantidade; i += 1) {
      const sementeHex = (indiceGlobal * 2654435761 >>> 0).toString(16).padStart(8, '0');
      const protocoloSimulado = `${sementeHex}e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b`.slice(
        0,
        64
      );
      lista.push({
        protocoloHash: protocoloSimulado,
        regiao: bloco.regiao,
        faixaRenda: faixas[(indiceGlobal + i) % faixas.length],
        ocupacao: ocupacoes[(indiceGlobal * 3 + i) % ocupacoes.length],
        prioridades: combinacoesPrioridades[(indiceGlobal + i * 2) % combinacoesPrioridades.length],
        nivelUsoIa: niveisIa[(indiceGlobal + i) % niveisIa.length],
        registradoEm: '2026-10-24T12:00:00Z',
      });
      indiceGlobal += 1;
    }
  }

  return lista;
}

export const RESPOSTAS_CENSO_INICIAIS: RespostaCensoAnonima[] = construirRespostasIniciaisCenso();
