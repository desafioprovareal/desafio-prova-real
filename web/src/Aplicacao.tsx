import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, Cpu, Scale, Smartphone, Trophy } from 'lucide-react';
import { AbaArena } from './componentes/AbaArena';
import { AbaCenso } from './componentes/AbaCenso';
import { AbaChecador } from './componentes/AbaChecador';
import { AbaGuerraIas } from './componentes/AbaGuerraIas';
import { AbaTribunal } from './componentes/AbaTribunal';
import { CabecalhoHero } from './componentes/CabecalhoHero';
import { ModalApoio } from './componentes/ModalApoio';
import { ModalPerfil } from './componentes/ModalPerfil';
import { RodapeCaixaPreta } from './componentes/RodapeCaixaPreta';
import {
  URL_BASE_API,
  carregarDadosLocaisIniciais,
  contarPendenciasLocais,
  enviarRespostaCensoServidorOuFila,
  enviarSubmissaoServidorOuFila,
  enviarVotoTribunalServidorOuFila,
  obterPerfilInicial,
  persistirColecoesLocais,
  salvarPerfilLocal,
  verificarESincronizarApi,
  vincularPerfilServidorOuFila,
} from './servicos/clienteApi';
import type {
  CategoriaFalhaAuditoria,
  ChaveAba,
  EstadoSincronizacao,
  ItemTribunalAuditoria,
  ModeloIaPlacar,
  NovaSubmissaoArena,
  ParticipanteArena,
  PerfilUsuarioConectado,
  RedeSocialChave,
  RespostaCensoAnonima,
} from './tipos';
import { gerarCodigoVerificacaoBio } from './utilitarios/criptografia';

const ABAS_DISPONIVEIS: Array<{
  chave: ChaveAba;
  rotulo: string;
  resumoMobile: string;
  icone: React.ComponentType<{ className?: string }>;
}> = [
  {
    chave: 'guerra-ias',
    rotulo: 'Guerra das IAs',
    resumoMobile: 'Guerra IAs',
    icone: Cpu,
  },
  {
    chave: 'arena',
    rotulo: 'Arena dos Participantes',
    resumoMobile: 'Arena',
    icone: Trophy,
  },
  {
    chave: 'tribunal',
    rotulo: 'Tribunal & Caça-Fraudes',
    resumoMobile: 'Tribunal',
    icone: Scale,
  },
  {
    chave: 'checador',
    rotulo: 'Checar Agora (1 Clique)',
    resumoMobile: 'Checar',
    icone: Smartphone,
  },
  {
    chave: 'censo',
    rotulo: 'Censo Cívico (LGPD)',
    resumoMobile: 'Censo',
    icone: BarChart3,
  },
];

function lerAbaPeloHash(): ChaveAba {
  const hashLimpo = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  const valida = ABAS_DISPONIVEIS.find((a) => a.chave === hashLimpo);
  return valida ? valida.chave : 'guerra-ias';
}

export const Aplicacao: React.FC = () => {
  const dadosIniciais = useMemo(() => carregarDadosLocaisIniciais(), []);

  const [abaAtiva, setAbaAtiva] = useState<ChaveAba>(() => lerAbaPeloHash());
  const [modelos, setModelos] = useState<ModeloIaPlacar[]>(dadosIniciais.modelos);
  const [participantes, setParticipantes] = useState<ParticipanteArena[]>(
    dadosIniciais.participantes
  );
  const [tribunal, setTribunal] = useState<ItemTribunalAuditoria[]>(dadosIniciais.tribunal);
  const [censo, setCenso] = useState<RespostaCensoAnonima[]>(dadosIniciais.censo);
  const [votosRealizados, setVotosRealizados] = useState<Record<string, 'aprovar' | 'reprovar'>>(
    dadosIniciais.votosRealizados
  );
  const [comentariosCopiados, setComentariosCopiados] = useState<Record<string, boolean>>(
    dadosIniciais.comentariosCopiados
  );
  const [perfil, setPerfil] = useState<PerfilUsuarioConectado>(() => obterPerfilInicial());

  const [modalApoioAberto, setModalApoioAberto] = useState(false);
  const [modalPerfilAberto, setModalPerfilAberto] = useState(false);

  const [sincronizacao, setSincronizacao] = useState<EstadoSincronizacao>({
    modo: 'sincronizando',
    urlBase: URL_BASE_API,
    ultimaVerificacao: '--:--',
    pendenciasLocais: contarPendenciasLocais(),
  });

  const executarSincronizacao = useCallback(async () => {
    setSincronizacao((atual) => ({ ...atual, modo: 'sincronizando' }));
    const novoEstado = await verificarESincronizarApi();
    setSincronizacao(novoEstado);
  }, []);

  useEffect(() => {
    void executarSincronizacao();
  }, [executarSincronizacao]);

  useEffect(() => {
    const aoMudarHash = () => {
      setAbaAtiva(lerAbaPeloHash());
    };
    window.addEventListener('hashchange', aoMudarHash);
    if (!window.location.hash) {
      window.history.replaceState(null, '', '#guerra-ias');
    }
    return () => window.removeEventListener('hashchange', aoMudarHash);
  }, []);

  const navegarParaAba = useCallback((aba: ChaveAba) => {
    setAbaAtiva(aba);
    if (window.location.hash !== `#${aba}`) {
      window.history.pushState(null, '', `#${aba}`);
    }
  }, []);

  // Peso de reputação do usuário no Tribunal Comunitário
  const pesoVotoUsuario = useMemo(() => {
    if (!perfil.conectado) return 0.5;
    let peso = 2.0;
    if (perfil.provedorIdentidade === 'github') peso += 1.0;
    if (perfil.bioVerificada) peso += 1.2;
    const bonusHistorico = Math.min(
      0.8,
      perfil.cortesSubmetidos * 0.2 + (perfil.pontosCacaFraudes / 50) * 0.15
    );
    return Math.min(5.0, Number((peso + bonusHistorico).toFixed(1)));
  }, [perfil]);

  // Métricas agregadas para o painel de telemetria do Hero
  const metricasGlobais = useMemo(() => {
    const chavesRedes: RedeSocialChave[] = ['tiktok', 'instagram', 'youtube', 'x', 'facebook'];
    let somaCortes = 0;
    let somaFidelidadePonderada = 0;

    for (const m of modelos) {
      for (const r of chavesRedes) {
        somaCortes += m.porRede[r].cortesAuditados;
        somaFidelidadePonderada += m.porRede[r].taxaFidelidade * m.porRede[r].cortesAuditados;
      }
    }

    const fidelidadeMediaGlobal = somaCortes > 0 ? somaFidelidadePonderada / somaCortes : 0;
    const fraudesInterceptadas = tribunal.filter((t) => t.status === 'desclassificado').length;

    return {
      totalCortesAuditados: somaCortes,
      fidelidadeMediaGlobal,
      fraudesInterceptadas,
      participantesCenso: censo.length,
    };
  }, [modelos, tribunal, censo]);

  // Salvar e sincronizar perfil conectado
  const lidarSalvarPerfil = async (novoPerfil: PerfilUsuarioConectado) => {
    setPerfil(novoPerfil);
    salvarPerfilLocal(novoPerfil);

    const redesPreenchidas = (
      Object.keys(novoPerfil.redes) as RedeSocialChave[]
    ).filter((chave) => novoPerfil.redes[chave].trim().length > 1);

    const listaRedes: RedeSocialChave[] =
      redesPreenchidas.length > 0 ? redesPreenchidas : ['tiktok'];

    setParticipantes((listaAtual) => {
      const indiceExistente = listaAtual.findIndex(
        (p) => p.apelido.toLowerCase() === novoPerfil.apelido.toLowerCase()
      );
      let atualizada: ParticipanteArena[];
      if (indiceExistente >= 0) {
        atualizada = listaAtual.map((p, idx) =>
          idx === indiceExistente
            ? {
                ...p,
                codigoVerificacao: novoPerfil.codigoVerificacao,
                verificado: novoPerfil.bioVerificada,
                possuiGithub: novoPerfil.provedorIdentidade === 'github',
                redesVinculadas: listaRedes,
              }
            : p
        );
      } else {
        const novoParticipante: ParticipanteArena = {
          id: `part-${Date.now()}`,
          apelido: novoPerfil.apelido,
          codigoVerificacao: novoPerfil.codigoVerificacao,
          verificado: novoPerfil.bioVerificada,
          redesVinculadas: listaRedes,
          possuiGithub: novoPerfil.provedorIdentidade === 'github',
          cortesValidados: novoPerfil.cortesSubmetidos,
          visualizacoesAuditadas: 0,
          comentariosGerados: 0,
          auditoriasCacaFraudes: Math.round(novoPerfil.pontosCacaFraudes / 50),
          pontuacaoGeral:
            100 + novoPerfil.cortesSubmetidos * 75 + novoPerfil.pontosCacaFraudes,
        };
        atualizada = [...listaAtual, novoParticipante];
      }
      persistirColecoesLocais({ participantes: atualizada });
      return atualizada;
    });

    await vincularPerfilServidorOuFila(novoPerfil);
    setSincronizacao((atual) => ({ ...atual, pendenciasLocais: contarPendenciasLocais() }));
  };

  const lidarDesconectarPerfil = () => {
    const limpo: PerfilUsuarioConectado = {
      conectado: false,
      apelido: '',
      provedorIdentidade: null,
      contaIdentidade: '',
      codigoVerificacao: gerarCodigoVerificacaoBio(),
      bioVerificada: false,
      redes: { tiktok: '', instagram: '', youtube: '', x: '', facebook: '' },
      pontosCacaFraudes: 0,
      cortesSubmetidos: 0,
      conectadoEm: '',
    };
    setPerfil(limpo);
    salvarPerfilLocal(limpo);
  };

  // Submissão de nova postagem na Arena
  const lidarSubmeterPostagem = async (submissao: NovaSubmissaoArena) => {
    // 1. Atualiza estatística do modelo utilizado
    const novosModelos = modelos.map((m) => {
      if (m.nome !== submissao.modeloUsado) return m;
      const atualRede = m.porRede[submissao.redeSocial];
      const custoEstimadoReais =
        ((submissao.tokensGastos / 1_000_000) *
          ((m.custoEntradaPorMilhaoUsd + m.custoSaidaPorMilhaoUsd) / 2)) *
        5.8;
      return {
        ...m,
        porRede: {
          ...m.porRede,
          [submissao.redeSocial]: {
            ...atualRede,
            cortesAuditados: atualRede.cortesAuditados + 1,
            tokensTotais: atualRede.tokensTotais + submissao.tokensGastos,
            custoTotalReais: Number(
              (atualRede.custoTotalReais + Math.max(0.05, custoEstimadoReais)).toFixed(2)
            ),
          },
        },
      };
    });
    setModelos(novosModelos);

    // 2. Atualiza ranking de participantes
    const codigoAutor = perfil.conectado
      ? perfil.codigoVerificacao
      : gerarCodigoVerificacaoBio(submissao.apelidoAutor);

    const novosParticipantes = [...participantes];
    const idxPart = novosParticipantes.findIndex(
      (p) => p.apelido.toLowerCase() === submissao.apelidoAutor.toLowerCase()
    );
    if (idxPart >= 0) {
      const existente = novosParticipantes[idxPart];
      const redesUnicas = Array.from(
        new Set([...existente.redesVinculadas, submissao.redeSocial])
      );
      novosParticipantes[idxPart] = {
        ...existente,
        redesVinculadas: redesUnicas,
        cortesValidados: existente.cortesValidados + 1,
        pontuacaoGeral: existente.pontuacaoGeral + 75,
      };
    } else {
      novosParticipantes.push({
        id: `part-${Date.now()}`,
        apelido: submissao.apelidoAutor,
        codigoVerificacao: codigoAutor,
        verificado: perfil.conectado && perfil.bioVerificada,
        redesVinculadas: [submissao.redeSocial],
        possuiGithub: perfil.provedorIdentidade === 'github',
        cortesValidados: 1,
        visualizacoesAuditadas: 120,
        comentariosGerados: 8,
        auditoriasCacaFraudes: 0,
        pontuacaoGeral: 175,
      });
    }
    setParticipantes(novosParticipantes);

    // 3. Adiciona à fila pública do Tribunal Comunitário
    const numeroProtocolo = 842 + tribunal.length;
    const novoItemTribunal: ItemTribunalAuditoria = {
      id: `trib-${Date.now()}`,
      protocolo: `AUD-2026-0${numeroProtocolo}`,
      autorApelido: submissao.apelidoAutor,
      redeSocial: submissao.redeSocial,
      tituloCorte: submissao.tituloCorte,
      urlPostagem: submissao.urlPostagem,
      urlVideoOriginal: submissao.urlVideoOriginal,
      modeloDeclarado: submissao.modeloUsado,
      tokensDeclarados: submissao.tokensGastos,
      promptDeclarado: submissao.promptUsado,
      criadoEm: 'Agora mesmo',
      status: 'em_auditoria',
      pesoAprovacao: pesoVotoUsuario,
      pesoReprovacao: 0,
      totalVotos: 1,
    };
    const novoTribunal = [novoItemTribunal, ...tribunal];
    setTribunal(novoTribunal);

    if (perfil.conectado) {
      const perfilAtualizado = {
        ...perfil,
        cortesSubmetidos: perfil.cortesSubmetidos + 1,
      };
      setPerfil(perfilAtualizado);
      salvarPerfilLocal(perfilAtualizado);
    }

    persistirColecoesLocais({
      modelos: novosModelos,
      participantes: novosParticipantes,
      tribunal: novoTribunal,
    });

    await enviarSubmissaoServidorOuFila(submissao);
    setSincronizacao((atual) => ({ ...atual, pendenciasLocais: contarPendenciasLocais() }));
  };

  // Votação ponderada no Tribunal Comunitário
  const lidarVotarTribunal = (
    idItem: string,
    decisao: 'aprovar' | 'reprovar',
    categoriaFalha?: CategoriaFalhaAuditoria
  ) => {
    if (votosRealizados[idItem]) return;

    const novosVotos = { ...votosRealizados, [idItem]: decisao };
    setVotosRealizados(novosVotos);

    const novoTribunal = tribunal.map((item): ItemTribunalAuditoria => {
      if (item.id !== idItem) return item;
      const novoPesoAprovacao =
        decisao === 'aprovar' ? item.pesoAprovacao + pesoVotoUsuario : item.pesoAprovacao;
      const novoPesoReprovacao =
        decisao === 'reprovar' ? item.pesoReprovacao + pesoVotoUsuario : item.pesoReprovacao;

      // Desclassifica automaticamente quando reprovação ponderada ultrapassa o limiar de segurança
      const virouDesclassificado =
        novoPesoReprovacao >= 22 && novoPesoReprovacao > novoPesoAprovacao * 1.8;

      return {
        ...item,
        pesoAprovacao: Number(novoPesoAprovacao.toFixed(1)),
        pesoReprovacao: Number(novoPesoReprovacao.toFixed(1)),
        totalVotos: item.totalVotos + 1,
        status: virouDesclassificado ? 'desclassificado' : item.status,
        categoriaFalha: categoriaFalha || item.categoriaFalha,
        motivoFalha:
          decisao === 'reprovar' && !item.motivoFalha
            ? `Sinalização ponderada registrada na auditoria comunitária (${categoriaFalha || 'Divergência técnica'}).`
            : item.motivoFalha,
      };
    });

    setTribunal(novoTribunal);
    persistirColecoesLocais({
      tribunal: novoTribunal,
      votosRealizados: novosVotos,
    });

    void enviarVotoTribunalServidorOuFila({
      idItem,
      decisao,
      pesoAplicado: pesoVotoUsuario,
      categoriaFalha,
      codigoAutor: perfil.conectado ? perfil.codigoVerificacao : undefined,
    }).then(() => {
      setSincronizacao((atual) => ({ ...atual, pendenciasLocais: contarPendenciasLocais() }));
    });
  };

  // Bônus +50 pts Caça-Fraudes ao copiar Comentário Desclassificatório Oficial
  const lidarRecompensarComentario = (idItem: string) => {
    if (comentariosCopiados[idItem]) return;

    const novosCopiados = { ...comentariosCopiados, [idItem]: true };
    setComentariosCopiados(novosCopiados);

    const perfilAtualizado: PerfilUsuarioConectado = {
      ...perfil,
      pontosCacaFraudes: perfil.pontosCacaFraudes + 50,
    };
    setPerfil(perfilAtualizado);
    salvarPerfilLocal(perfilAtualizado);

    if (perfil.conectado) {
      const novosParticipantes = participantes.map((p) =>
        p.apelido.toLowerCase() === perfil.apelido.toLowerCase()
          ? {
              ...p,
              auditoriasCacaFraudes: p.auditoriasCacaFraudes + 1,
              pontuacaoGeral: p.pontuacaoGeral + 50,
            }
          : p
      );
      setParticipantes(novosParticipantes);
      persistirColecoesLocais({
        participantes: novosParticipantes,
        comentariosCopiados: novosCopiados,
      });
    } else {
      persistirColecoesLocais({ comentariosCopiados: novosCopiados });
    }
  };

  // Registro de resposta anônima no Censo Cívico
  const lidarRegistrarRespostaCenso = async (novaResposta: RespostaCensoAnonima) => {
    const atualizado = [...censo, novaResposta];
    setCenso(atualizado);
    persistirColecoesLocais({ censo: atualizado });

    await enviarRespostaCensoServidorOuFila(novaResposta);
    setSincronizacao((atual) => ({ ...atual, pendenciasLocais: contarPendenciasLocais() }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <CabecalhoHero
        sincronizacao={sincronizacao}
        aoRessincronizar={() => {
          void executarSincronizacao();
        }}
        perfil={perfil}
        pesoVotoUsuario={pesoVotoUsuario}
        aoAbrirModalPerfil={() => setModalPerfilAberto(true)}
        aoAbrirModalApoio={() => setModalApoioAberto(true)}
        aoNavegarAba={navegarParaAba}
        metricasGlobais={metricasGlobais}
      />

      {/* Barra Fixa de Abas (Responsiva Mobile + Desktop) */}
      <nav
        aria-label="Módulos principais do Desafio Prova Real"
        className="sticky top-0 z-40 border-b border-grafite-borda bg-grafite-fundo/95 backdrop-blur-md"
      >
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div role="tablist" className="flex items-center gap-1 overflow-x-auto py-2">
            {ABAS_DISPONIVEIS.map((aba) => {
              const Icone = aba.icone;
              const selecionada = abaAtiva === aba.chave;
              return (
                <a
                  key={aba.chave}
                  role="tab"
                  aria-selected={selecionada}
                  href={`#${aba.chave}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navegarParaAba(aba.chave);
                  }}
                  className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition sm:px-4 sm:text-sm ${
                    selecionada
                      ? 'border-ciano-tecnico bg-ciano-suave text-ciano-tecnico shadow-ciano'
                      : 'border-transparent text-gelo-secundario hover:border-grafite-borda hover:bg-grafite-cartao hover:text-gelo-principal'
                  }`}
                >
                  <Icone className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{aba.rotulo}</span>
                  <span className="sm:hidden">{aba.resumoMobile}</span>
                </a>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Conteúdo Principal da Aba Ativa */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {abaAtiva === 'guerra-ias' && <AbaGuerraIas modelos={modelos} />}

        {abaAtiva === 'arena' && (
          <AbaArena
            participantes={participantes}
            modelos={modelos}
            perfil={perfil}
            aoAbrirModalPerfil={() => setModalPerfilAberto(true)}
            aoSubmeterPostagem={lidarSubmeterPostagem}
          />
        )}

        {abaAtiva === 'tribunal' && (
          <AbaTribunal
            itens={tribunal}
            perfil={perfil}
            pesoVotoUsuario={pesoVotoUsuario}
            votosRealizados={votosRealizados}
            comentariosCopiados={comentariosCopiados}
            aoAbrirModalPerfil={() => setModalPerfilAberto(true)}
            aoVotarItem={lidarVotarTribunal}
            aoRecompensarComentarioDesclassificatorio={lidarRecompensarComentario}
          />
        )}

        {abaAtiva === 'checador' && <AbaChecador />}

        {abaAtiva === 'censo' && (
          <AbaCenso
            respostas={censo}
            aoRegistrarRespostaAnonima={lidarRegistrarRespostaCenso}
          />
        )}
      </main>

      <RodapeCaixaPreta
        aoNavegarAba={navegarParaAba}
        aoAbrirModalApoio={() => setModalApoioAberto(true)}
      />

      <ModalApoio aberto={modalApoioAberto} aoFechar={() => setModalApoioAberto(false)} />

      <ModalPerfil
        aberto={modalPerfilAberto}
        perfilAtual={perfil}
        pesoVotoAtual={pesoVotoUsuario}
        aoSalvarPerfil={(novo) => {
          void lidarSalvarPerfil(novo);
        }}
        aoDesconectarPerfil={lidarDesconectarPerfil}
        aoFechar={() => setModalPerfilAberto(false)}
      />
    </div>
  );
};
