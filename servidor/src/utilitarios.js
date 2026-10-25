import crypto from 'node:crypto';

const ALFABETO_CODIGO = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Tabela de referência de preços em USD por 1 milhão de tokens (entrada / saída).
 */
export const TABELA_PRECOS_USD_POR_MILHAO = {
  'claude-opus-4-6': { entrada: 15.0, saida: 75.0, familia: 'Claude' },
  'claude-opus': { entrada: 15.0, saida: 75.0, familia: 'Claude' },
  'claude-sonnet-4-6': { entrada: 3.0, saida: 15.0, familia: 'Claude' },
  'claude-sonnet-4-5': { entrada: 3.0, saida: 15.0, familia: 'Claude' },
  'claude-3-5-sonnet': { entrada: 3.0, saida: 15.0, familia: 'Claude' },
  claude: { entrada: 3.0, saida: 15.0, familia: 'Claude' },
  'claude-haiku-4-5': { entrada: 0.8, saida: 4.0, familia: 'Claude' },
  'claude-haiku': { entrada: 0.8, saida: 4.0, familia: 'Claude' },
  'gpt-4.1': { entrada: 2.0, saida: 8.0, familia: 'GPT' },
  'gpt-4o': { entrada: 2.5, saida: 10.0, familia: 'GPT' },
  gpt: { entrada: 2.5, saida: 10.0, familia: 'GPT' },
  'gpt-4o-mini': { entrada: 0.15, saida: 0.6, familia: 'GPT' },
  'gpt-4.1-mini': { entrada: 0.4, saida: 1.6, familia: 'GPT' },
  'o3-mini': { entrada: 1.1, saida: 4.4, familia: 'GPT' },
  'gemini-2.5-pro': { entrada: 1.25, saida: 10.0, familia: 'Gemini' },
  'gemini-1.5-pro': { entrada: 1.25, saida: 5.0, familia: 'Gemini' },
  'gemini-2.5-flash': { entrada: 0.15, saida: 0.6, familia: 'Gemini' },
  'gemini-2.0-flash': { entrada: 0.1, saida: 0.4, familia: 'Gemini' },
  gemini: { entrada: 0.15, saida: 0.6, familia: 'Gemini' },
  'deepseek-r1': { entrada: 0.55, saida: 2.19, familia: 'DeepSeek' },
  'deepseek-v3': { entrada: 0.27, saida: 1.1, familia: 'DeepSeek' },
  'deepseek-chat': { entrada: 0.27, saida: 1.1, familia: 'DeepSeek' },
  deepseek: { entrada: 0.27, saida: 1.1, familia: 'DeepSeek' },
  'llama-3.3-70b': { entrada: 0.0, saida: 0.0, familia: 'Llama' },
  llama: { entrada: 0.0, saida: 0.0, familia: 'Llama' },
  ollama: { entrada: 0.0, saida: 0.0, familia: 'Local Aberto' }
};

/**
 * Gera um código único no padrão PR-XXXX para validação de posse de redes sociais.
 */
export function gerarCodigoVerificacao() {
  const bytes = crypto.randomBytes(4);
  let sufixo = '';
  for (let i = 0; i < 4; i += 1) {
    sufixo += ALFABETO_CODIGO[bytes[i] % ALFABETO_CODIGO.length];
  }
  return `PR-${sufixo}`;
}

/**
 * Identifica a família de IA a partir do identificador do modelo.
 */
export function normalizarFamiliaIa(modeloIa = '') {
  const chave = String(modeloIa).trim().toLowerCase();
  if (TABELA_PRECOS_USD_POR_MILHAO[chave]) {
    return TABELA_PRECOS_USD_POR_MILHAO[chave].familia;
  }
  if (chave.includes('claude')) return 'Claude';
  if (chave.includes('gpt') || chave.startsWith('o1') || chave.startsWith('o3')) return 'GPT';
  if (chave.includes('gemini')) return 'Gemini';
  if (chave.includes('deepseek')) return 'DeepSeek';
  if (chave.includes('llama')) return 'Llama';
  if (chave.includes('qwen')) return 'Qwen';
  if (chave.includes('mistral')) return 'Mistral';
  return 'Outro';
}

/**
 * Obtém a tarifa estimada em USD por milhão de tokens para o modelo informado.
 */
export function obterTarifaModelo(modeloIa = '') {
  const chave = String(modeloIa).trim().toLowerCase();
  if (TABELA_PRECOS_USD_POR_MILHAO[chave]) {
    return TABELA_PRECOS_USD_POR_MILHAO[chave];
  }
  for (const [prefixo, dados] of Object.entries(TABELA_PRECOS_USD_POR_MILHAO)) {
    if (chave.includes(prefixo)) {
      return dados;
    }
  }
  return { entrada: 1.0, saida: 4.0, familia: normalizarFamiliaIa(modeloIa) };
}

/**
 * Calcula o custo estimado em Reais (R$) com base nos tokens consumidos e na cotação configurada.
 */
export function calcularCustoTokensReais({
  modeloIa,
  tokensEntrada = 0,
  tokensSaida = 0,
  cotacaoDolarBrl = 5.8
}) {
  const tarifa = obterTarifaModelo(modeloIa);
  const entrada = Math.max(0, Number(tokensEntrada) || 0);
  const saida = Math.max(0, Number(tokensSaida) || 0);
  const custoUsd = (entrada / 1_000_000) * tarifa.entrada + (saida / 1_000_000) * tarifa.saida;
  const custoReais = custoUsd * (Number(cotacaoDolarBrl) || 5.8);
  return Number(custoReais.toFixed(6));
}

/**
 * Calcula o hash SHA-256 canônico de integridade da submissão e do comentário declaratório.
 */
export function calcularHashIntegridade({
  linkFonte = '',
  segundoInicio = 0,
  segundoFim = 0,
  modeloIa = '',
  promptDeclarado = '',
  comentarioAuditoria = ''
}) {
  const textoBase = comentarioAuditoria && String(comentarioAuditoria).trim().length > 0
    ? String(comentarioAuditoria).trim()
    : [
        String(linkFonte).trim(),
        Number(segundoInicio).toFixed(2),
        Number(segundoFim).toFixed(2),
        String(modeloIa).trim().toLowerCase(),
        String(promptDeclarado).trim()
      ].join('|');

  return crypto.createHash('sha256').update(textoBase, 'utf8').digest('hex');
}

/**
 * Gera o identificador irreversível HMAC-SHA256 para o Censo Cívico (LGPD).
 */
export function gerarHmacUnicoCenso(identificadorAnonimo, segredoHmac) {
  return crypto
    .createHmac('sha256', String(segredoHmac))
    .update(String(identificadorAnonimo).trim(), 'utf8')
    .digest('hex');
}

const CAMPOS_PROIBIDOS_LGPD = new Set([
  'cpf',
  'documento',
  'numero_cpf',
  'numerocpf',
  'rg',
  'titulo_eleitor',
  'tituloeleitor',
  'nome_completo',
  'nomecompleto',
  'email',
  'telefone',
  'celular'
]);

const REGEX_CPF_EXPLICITO = /(?:^|\D)\d{3}\.\d{3}\.\d{3}-\d{2}(?:\D|$)/;
const REGEX_ONZE_DIGITOS_PUROS = /^\d{11}$/;

/**
 * Trava estrita de conformidade LGPD: rejeita payloads que contenham CPF em texto puro
 * ou campos de identificação pessoal direta.
 */
export function detectarViolacaoDadosPessoaisCenso(corpo) {
  if (!corpo || typeof corpo !== 'object') {
    return { violado: false };
  }

  for (const [chave, valor] of Object.entries(corpo)) {
    const chaveNormalizada = chave.trim().toLowerCase();
    if (CAMPOS_PROIBIDOS_LGPD.has(chaveNormalizada)) {
      return {
        violado: true,
        motivo: `Violação LGPD: o campo pessoal '${chave}' é estritamente proibido. O servidor jamais aceita ou grava CPF ou documentos pessoais em texto puro.`
      };
    }

    const textoValor = String(valor ?? '').trim();
    if (
      REGEX_CPF_EXPLICITO.test(textoValor) ||
      REGEX_ONZE_DIGITOS_PUROS.test(textoValor)
    ) {
      return {
        violado: true,
        motivo:
          'Violação LGPD: padrão compatível com CPF em texto puro detectado. Envie exclusivamente um token/hash anônimo gerado no cliente.'
      };
    }
  }

  return { violado: false };
}

export const DESCRICOES_MOTIVOS_FRAUDE = {
  fraude_edicao:
    'Manipulação técnica de áudio/vídeo, alteração de velocidade de fala (cheapfake) ou adulteração posterior do comentário auditável.',
  fora_de_contexto:
    'Supressão maliciosa de contexto imediato (-60s/+60s) que inverte ou distorce o sentido real da declaração original.',
  ia_ocultada:
    'Uso de conteúdo sintético ou edição automatizada sem declaração transparente ou com omissão de parâmetros obrigatórios.',
  fonte_invalida:
    'Fonte primária inexistente, adulterada ou incompatível com o trecho publicado.'
};

/**
 * Gera o texto oficial padronizado em português quando uma submissão é desclassificada pelo Tribunal Comunitário.
 */
export function gerarTextoDesclassificacaoOficial({
  submissao,
  motivoCodigo,
  pesoFraude,
  totalAuditores
}) {
  const descricaoMotivo =
    DESCRICOES_MOTIVOS_FRAUDE[motivoCodigo] ??
    DESCRICOES_MOTIVOS_FRAUDE.fora_de_contexto;

  return [
    `⚠️ SUBMISSÃO DESCLASSIFICADA PELO TRIBUNAL COMUNITÁRIO — DESAFIO PROVA REAL (#DesafioProvaReal)`,
    `Submissão #${submissao.id} | Participante: ${submissao.apelido_participante} | IA Declarada: ${submissao.modelo_ia}`,
    `Motivo Comprovado: ${descricaoMotivo}`,
    `Peso de Auditoria Ponderada: ${Number(pesoFraude).toFixed(2)} (${totalAuditores} auditor(es) independente(s))`,
    `Fonte Original Verificável: ${submissao.link_fonte} (Trecho: ${submissao.segundo_inicio}s até ${submissao.segundo_fim}s)`,
    `Conformidade Legal: Publicação reprovada conforme diretrizes de integridade informacional e transparência eleitoral (Resolução TSE nº 23.610/2019). Pontuação anulada no placar oficial.`
  ].join('\n');
}

/**
 * Valida se uma string representa uma URL HTTP/HTTPS bem formada.
 */
export function validarUrlHttp(valor) {
  try {
    const url = new URL(String(valor));
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
