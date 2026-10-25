import {
  ITENS_TRIBUNAL_INICIAIS,
  MODELOS_INICIAIS,
  PARTICIPANTES_INICIAIS,
  RESPOSTAS_CENSO_INICIAIS,
} from '../dados/dadosIniciais';
import type {
  CategoriaFalhaAuditoria,
  EstadoSincronizacao,
  ItemTribunalAuditoria,
  ModeloIaPlacar,
  NovaSubmissaoArena,
  ParticipanteArena,
  PerfilUsuarioConectado,
  RespostaCensoAnonima,
} from '../tipos';
import { gerarCodigoVerificacaoBio } from '../utilitarios/criptografia';

export const URL_BASE_API = (import.meta.env.VITE_URL_API || 'http://localhost:8787').replace(
  /\/+$/,
  ''
);

const CHAVES_ARMAZENAMENTO = {
  modelos: 'prova_real_modelos_v1',
  participantes: 'prova_real_participantes_v1',
  tribunal: 'prova_real_tribunal_v1',
  censo: 'prova_real_censo_v1',
  perfil: 'prova_real_perfil_v1',
  votosTribunal: 'prova_real_votos_tribunal_v1',
  comentariosRecompensados: 'prova_real_comentarios_recompensados_v1',
  filaSincronizacao: 'prova_real_fila_sincronizacao_v1',
} as const;

interface AcaoPendenteSincronizacao {
  id: string;
  rota: string;
  corpo: unknown;
  criadoEm: string;
}

function lerJsonLocal<T>(chave: string, padrao: T): T {
  try {
    const bruto = window.localStorage.getItem(chave);
    if (!bruto) return padrao;
    return JSON.parse(bruto) as T;
  } catch {
    return padrao;
  }
}

function gravarJsonLocal<T>(chave: string, valor: T): void {
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // Ignora falha caso armazenamento privado esteja cheio
  }
}

async function requisitarApiComTempoLimite<T>(
  rota: string,
  opcoes?: RequestInit,
  tempoLimiteMs = 2400
): Promise<T> {
  const controlador = new AbortController();
  const temporizador = window.setTimeout(() => controlador.abort(), tempoLimiteMs);
  try {
    const resposta = await fetch(`${URL_BASE_API}${rota}`, {
      ...opcoes,
      headers: {
        'Content-Type': 'application/json',
        ...(opcoes?.headers || {}),
      },
      signal: controlador.signal,
    });
    if (!resposta.ok) {
      throw new Error(`Código HTTP ${resposta.status}`);
    }
    return (await resposta.json()) as T;
  } finally {
    window.clearTimeout(temporizador);
  }
}

export function obterPerfilInicial(): PerfilUsuarioConectado {
  const padrao: PerfilUsuarioConectado = {
    conectado: false,
    apelido: '',
    provedorIdentidade: null,
    contaIdentidade: '',
    codigoVerificacao: gerarCodigoVerificacaoBio(),
    bioVerificada: false,
    redes: {
      tiktok: '',
      instagram: '',
      youtube: '',
      x: '',
      facebook: '',
    },
    pontosCacaFraudes: 0,
    cortesSubmetidos: 0,
    conectadoEm: '',
  };
  return lerJsonLocal<PerfilUsuarioConectado>(CHAVES_ARMAZENAMENTO.perfil, padrao);
}

export function salvarPerfilLocal(perfil: PerfilUsuarioConectado): void {
  gravarJsonLocal(CHAVES_ARMAZENAMENTO.perfil, perfil);
}

export function carregarDadosLocaisIniciais(): {
  modelos: ModeloIaPlacar[];
  participantes: ParticipanteArena[];
  tribunal: ItemTribunalAuditoria[];
  censo: RespostaCensoAnonima[];
  votosRealizados: Record<string, 'aprovar' | 'reprovar'>;
  comentariosCopiados: Record<string, boolean>;
} {
  return {
    modelos: lerJsonLocal(CHAVES_ARMAZENAMENTO.modelos, MODELOS_INICIAIS),
    participantes: lerJsonLocal(CHAVES_ARMAZENAMENTO.participantes, PARTICIPANTES_INICIAIS),
    tribunal: lerJsonLocal(CHAVES_ARMAZENAMENTO.tribunal, ITENS_TRIBUNAL_INICIAIS),
    censo: lerJsonLocal(CHAVES_ARMAZENAMENTO.censo, RESPOSTAS_CENSO_INICIAIS),
    votosRealizados: lerJsonLocal(CHAVES_ARMAZENAMENTO.votosTribunal, {}),
    comentariosCopiados: lerJsonLocal(CHAVES_ARMAZENAMENTO.comentariosRecompensados, {}),
  };
}

export function persistirColecoesLocais(dados: {
  modelos?: ModeloIaPlacar[];
  participantes?: ParticipanteArena[];
  tribunal?: ItemTribunalAuditoria[];
  censo?: RespostaCensoAnonima[];
  votosRealizados?: Record<string, 'aprovar' | 'reprovar'>;
  comentariosCopiados?: Record<string, boolean>;
}): void {
  if (dados.modelos) gravarJsonLocal(CHAVES_ARMAZENAMENTO.modelos, dados.modelos);
  if (dados.participantes) gravarJsonLocal(CHAVES_ARMAZENAMENTO.participantes, dados.participantes);
  if (dados.tribunal) gravarJsonLocal(CHAVES_ARMAZENAMENTO.tribunal, dados.tribunal);
  if (dados.censo) gravarJsonLocal(CHAVES_ARMAZENAMENTO.censo, dados.censo);
  if (dados.votosRealizados) {
    gravarJsonLocal(CHAVES_ARMAZENAMENTO.votosTribunal, dados.votosRealizados);
  }
  if (dados.comentariosCopiados) {
    gravarJsonLocal(CHAVES_ARMAZENAMENTO.comentariosRecompensados, dados.comentariosCopiados);
  }
}

function enfileirarPendencia(rota: string, corpo: unknown): number {
  const fila = lerJsonLocal<AcaoPendenteSincronizacao[]>(
    CHAVES_ARMAZENAMENTO.filaSincronizacao,
    []
  );
  fila.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    rota,
    corpo,
    criadoEm: new Date().toISOString(),
  });
  gravarJsonLocal(CHAVES_ARMAZENAMENTO.filaSincronizacao, fila);
  return fila.length;
}

export function contarPendenciasLocais(): number {
  return lerJsonLocal<AcaoPendenteSincronizacao[]>(
    CHAVES_ARMAZENAMENTO.filaSincronizacao,
    []
  ).length;
}

export async function verificarESincronizarApi(): Promise<EstadoSincronizacao> {
  const agora = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  try {
    await requisitarApiComTempoLimite<{ ok?: boolean; status?: string }>('/api/saude');

    // Se conectou, tenta descarregar ações pendentes gravadas durante a Onda 0
    const fila = lerJsonLocal<AcaoPendenteSincronizacao[]>(
      CHAVES_ARMAZENAMENTO.filaSincronizacao,
      []
    );
    const restantes: AcaoPendenteSincronizacao[] = [];

    for (const item of fila) {
      try {
        await requisitarApiComTempoLimite(item.rota, {
          method: 'POST',
          body: JSON.stringify(item.corpo),
        });
      } catch {
        restantes.push(item);
      }
    }

    gravarJsonLocal(CHAVES_ARMAZENAMENTO.filaSincronizacao, restantes);

    return {
      modo: 'api_conectada',
      urlBase: URL_BASE_API,
      ultimaVerificacao: agora,
      pendenciasLocais: restantes.length,
    };
  } catch {
    return {
      modo: 'modo_local_resiliente',
      urlBase: URL_BASE_API,
      ultimaVerificacao: agora,
      pendenciasLocais: contarPendenciasLocais(),
    };
  }
}

export async function enviarSubmissaoServidorOuFila(submissao: NovaSubmissaoArena): Promise<boolean> {
  try {
    await requisitarApiComTempoLimite('/api/submissoes', {
      method: 'POST',
      body: JSON.stringify(submissao),
    });
    return true;
  } catch {
    enfileirarPendencia('/api/submissoes', submissao);
    return false;
  }
}

export async function enviarVotoTribunalServidorOuFila(carga: {
  idItem: string;
  decisao: 'aprovar' | 'reprovar';
  pesoAplicado: number;
  categoriaFalha?: CategoriaFalhaAuditoria;
  codigoAutor?: string;
}): Promise<boolean> {
  try {
    await requisitarApiComTempoLimite('/api/tribunal/votar', {
      method: 'POST',
      body: JSON.stringify(carga),
    });
    return true;
  } catch {
    enfileirarPendencia('/api/tribunal/votar', carga);
    return false;
  }
}

export async function enviarRespostaCensoServidorOuFila(
  respostaAnonima: RespostaCensoAnonima
): Promise<boolean> {
  const cargaAnonima = {
    ...respostaAnonima,
    identificador_anonimo: respostaAnonima.protocoloHash,
  };
  try {
    await requisitarApiComTempoLimite('/api/censo', {
      method: 'POST',
      body: JSON.stringify(cargaAnonima),
    });
    return true;
  } catch {
    enfileirarPendencia('/api/censo', cargaAnonima);
    return false;
  }
}

export async function vincularPerfilServidorOuFila(
  perfil: PerfilUsuarioConectado
): Promise<boolean> {
  try {
    await requisitarApiComTempoLimite('/api/perfil/vincular', {
      method: 'POST',
      body: JSON.stringify(perfil),
    });
    return true;
  } catch {
    enfileirarPendencia('/api/perfil/vincular', perfil);
    return false;
  }
}
