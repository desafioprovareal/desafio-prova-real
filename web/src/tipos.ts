export type ChaveAba = 'guerra-ias' | 'arena' | 'tribunal' | 'checador' | 'censo';

export type RedeSocialChave = 'tiktok' | 'instagram' | 'youtube' | 'x' | 'facebook';

export type RedeSocialFiltro = 'todas' | RedeSocialChave;

export interface EstatisticaModeloRede {
  cortesAuditados: number;
  taxaFidelidade: number;
  tokensTotais: number;
  custoTotalReais: number;
}

export interface ModeloIaPlacar {
  id: string;
  nome: string;
  fornecedor: string;
  destaque: string;
  pesosAbertos: boolean;
  custoEntradaPorMilhaoUsd: number;
  custoSaidaPorMilhaoUsd: number;
  porRede: Record<RedeSocialChave, EstatisticaModeloRede>;
}

export interface PerfilUsuarioConectado {
  conectado: boolean;
  apelido: string;
  provedorIdentidade: 'github' | 'google' | null;
  contaIdentidade: string;
  codigoVerificacao: string;
  bioVerificada: boolean;
  redes: Record<RedeSocialChave, string>;
  pontosCacaFraudes: number;
  cortesSubmetidos: number;
  conectadoEm: string;
}

export interface ParticipanteArena {
  id: string;
  apelido: string;
  codigoVerificacao: string;
  verificado: boolean;
  redesVinculadas: RedeSocialChave[];
  possuiGithub: boolean;
  cortesValidados: number;
  visualizacoesAuditadas: number;
  comentariosGerados: number;
  auditoriasCacaFraudes: number;
  pontuacaoGeral: number;
}

export type CategoriaFalhaAuditoria =
  | 'Comentário editado após auditoria'
  | 'Prompt manipulado ou enviesado'
  | 'Corte fora de contexto sem fonte bruta'
  | 'Dados de tokens/modelo adulterados'
  | 'Omissão deliberada de contraditório factual';

export interface ItemTribunalAuditoria {
  id: string;
  protocolo: string;
  autorApelido: string;
  redeSocial: RedeSocialChave;
  tituloCorte: string;
  urlPostagem: string;
  urlVideoOriginal: string;
  modeloDeclarado: string;
  tokensDeclarados: number;
  promptDeclarado: string;
  criadoEm: string;
  status: 'em_auditoria' | 'validado' | 'desclassificado';
  pesoAprovacao: number;
  pesoReprovacao: number;
  totalVotos: number;
  categoriaFalha?: CategoriaFalhaAuditoria;
  motivoFalha?: string;
  detalheProvaTecnica?: string;
}

export interface NovaSubmissaoArena {
  apelidoAutor: string;
  redeSocial: RedeSocialChave;
  tituloCorte: string;
  urlPostagem: string;
  urlVideoOriginal: string;
  modeloUsado: string;
  tokensGastos: number;
  promptUsado: string;
}

export type RegiaoBrasil = 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';

export type FaixaRenda =
  | 'Até 2 salários mínimos'
  | 'De 2 a 5 salários mínimos'
  | 'De 5 a 10 salários mínimos'
  | 'De 10 a 20 salários mínimos'
  | 'Acima de 20 salários mínimos'
  | 'Prefiro não informar';

export type OcupacaoCenso =
  | 'Trabalhador CLT / Setor Privado'
  | 'Autônomo / MEI / Informal'
  | 'Servidor Público'
  | 'Empreendedor / Empresário'
  | 'Estudante / Pesquisador'
  | 'Aposentado / Pensionista'
  | 'Em busca de recolocação';

export type PrioridadeUrgente =
  | 'Custo de Vida'
  | 'Segurança Pública'
  | 'Saúde'
  | 'Educação'
  | 'Impostos'
  | 'Combate à Corrupção'
  | 'Emprego';

export type NivelUsoIa =
  | 'Nunca usei / Estou começando agora'
  | 'Uso ocasionalmente para tirar dúvidas'
  | 'Uso toda semana no estudo ou trabalho'
  | 'Uso diariamente e audito prompts/código';

export interface RespostaCensoAnonima {
  protocoloHash: string;
  regiao: RegiaoBrasil;
  faixaRenda: FaixaRenda;
  ocupacao: OcupacaoCenso;
  prioridades: PrioridadeUrgente[];
  nivelUsoIa: NivelUsoIa;
  registradoEm: string;
}

export interface EstadoSincronizacao {
  modo: 'api_conectada' | 'modo_local_resiliente' | 'sincronizando';
  urlBase: string;
  ultimaVerificacao: string;
  pendenciasLocais: number;
}
