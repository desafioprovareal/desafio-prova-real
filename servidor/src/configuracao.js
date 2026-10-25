import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pastaAtual = path.dirname(fileURLToPath(import.meta.url));
const pastaRaizServidor = path.resolve(pastaAtual, '..');

/**
 * Carrega e normaliza a configuração do servidor a partir das variáveis de ambiente.
 * Permite sobrescrita explícita para execução isolada em testes automatizados.
 */
export function carregarConfiguracao(sobrescritas = {}) {
  const origensCorsBruto =
    sobrescritas.origensCors ??
    process.env.ORIGENS_CORS ??
    'https://desafioprovareal.pages.dev,http://localhost:5173,http://127.0.0.1:5173';

  const origensCors =
    origensCorsBruto === '*'
      ? true
      : origensCorsBruto
          .split(',')
          .map((origem) => origem.trim())
          .filter(Boolean);

  return {
    porta: Number(sobrescritas.porta ?? process.env.PORTA_SERVIDOR ?? 8787),
    enderecoEscuta: sobrescritas.enderecoEscuta ?? process.env.ENDERECO_ESCUTA ?? '0.0.0.0',
    caminhoBanco:
      sobrescritas.caminhoBanco ??
      process.env.CAMINHO_BANCO ??
      path.join(pastaRaizServidor, 'dados', 'prova-real.db'),
    origensCors,
    confiarProxyCloudflare:
      sobrescritas.confiarProxyCloudflare ??
      process.env.CONFIAR_PROXY_CLOUDFLARE === 'true',
    limiteRequisicoesPorMinuto: Number(
      sobrescritas.limiteRequisicoesPorMinuto ??
        process.env.LIMITE_REQUISICOES_POR_MINUTO ??
        60
    ),
    turnstileSecret:
      sobrescritas.turnstileSecret ?? process.env.TURNSTILE_SECRET ?? '',
    chaveApiTelemetria:
      sobrescritas.chaveApiTelemetria ?? process.env.CHAVE_API_TELEMETRIA ?? '',
    segredoHmacCenso:
      sobrescritas.segredoHmacCenso ??
      process.env.SEGREDO_HMAC_CENSO ??
      'segredo-padrao-desenvolvimento-trocar-em-producao-prova-real',
    cotacaoDolarBrl: Number(
      sobrescritas.cotacaoDolarBrl ?? process.env.COTACAO_DOLAR_BRL ?? 5.8
    ),
    limiarPesoFraude: Number(
      sobrescritas.limiarPesoFraude ?? process.env.LIMIAR_PESO_FRAUDE ?? 3.0
    ),
    limiarPesoValidacao: Number(
      sobrescritas.limiarPesoValidacao ?? process.env.LIMIAR_PESO_VALIDACAO ?? 3.0
    ),
    kAnonimatoMinimo: Number(
      sobrescritas.kAnonimatoMinimo ?? process.env.K_ANONIMATO_MINIMO ?? 10
    ),
    intervaloBotMinutos: Number(
      sobrescritas.intervaloBotMinutos ?? process.env.INTERVALO_BOT_MINUTOS ?? 15
    ),
    ativarBotMonitor:
      sobrescritas.ativarBotMonitor ??
      (process.env.ATIVAR_BOT_MONITOR !== 'false'),
    githubRepositorio:
      sobrescritas.githubRepositorio ??
      process.env.GITHUB_REPOSITORIO ??
      'desafioprovareal/desafio-prova-real',
    githubToken: sobrescritas.githubToken ?? process.env.GITHUB_TOKEN ?? '',
    vcpusReferenciaVps: Number(
      sobrescritas.vcpusReferenciaVps ?? process.env.VCPUS_REFERENCIA_VPS ?? 1
    )
  };
}
