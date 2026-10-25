import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, CheckCircle2, Cpu, Scale, Trophy } from 'lucide-react';
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
  carregarDadosLocaisIniciais,
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
    chave: 'checador',
    rotulo: 'Raio-X de Político ou Notícia',
    resumoMobile: 'Fiscalizar',
    icone: CheckCircle2,
  },
  {
    chave: 'arena',
    rotulo: 'Desafio & Ranking',
    resumoMobile: 'Ranking',
    icone: Trophy,
  },
  {
    chave: 'tribunal',
    rotulo: 'Caça-Fraudes',
    resumoMobile: 'Fraudes',
    icone: Scale,
  },
  {
    chave: 'guerra-ias',
    rotulo: 'Comparar IAs',
    resumoMobile: 'IAs',
    icone: Cpu,
  },
  {
    chave: 'censo',
    rotulo: 'Censo Cívico',
    resumoMobile: 'Censo',
    icone: BarChart3,
  },
];

function lerAbaPeloHash(): ChaveAba {
  const hashLimpo = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  const valida = ABAS_DISPONIVEIS.find((a) => a.chave === hashLimpo);
  return valida ? valida.chave : 'checador';
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

  useEffect(() => {
    void verificarESincronizarApi();
  }, []);

  useEffect(() => {
    const aoMudarHash = () => {
      setAbaAtiva(lerAbaPeloHash());
    };
    window.addEventListener('hashchange', aoMudarHash);
    return () => window.removeEventListener('hashchange', aoMudarHash);
  }, []);

  const navegarParaAba = useCallback((aba: ChaveAba) => {
    setAbaAtiva(aba);
    if (window.location.hash !== `#${aba}`) {
      window.history.pushState(null, '', `#${aba}`);
    }
  }, []);

  const pesoVotoUsuario = useMemo(() => {
    if (!perfil.conectado) return 1.0;
    let peso = 2.0;
    if (perfil.provedorIdentidade === 'github') peso += 1.0;
    if (perfil.bioVerificada) peso += 1.0;
    return Math.min(5.0, Number(peso.toFixed(1)));
  }, [perfil]);

  const lidarSalvarPerfil = async (novoPerfil: PerfilUsuarioConectado) => {
    setPerfil(novoPerfil);
    salvarPerfilLocal(novoPerfil);

    const redesPreenchidas = (Object.keys(novoPerfil.redes) as RedeSocialChave[]).filter(
      (chave) => novoPerfil.redes[chave].trim().length > 1
    );
    const listaRedes: RedeSocialChave[] =
      redesPreenchidas.length > 0 ? redesPreenchidas : ['x'];

    setParticipantes((listaAtual) => {
      const idxExistente = listaAtual.findIndex(
        (p) => p.apelido.toLowerCase() === novoPerfil.apelido.toLowerCase()
      );
      const atualizada =
        idxExistente >= 0
          ? listaAtual.map((p, idx) =>
              idx === idxExistente
                ? {
                    ...p,
                    codigoVerificacao: novoPerfil.codigoVerificacao,
                    verificado: novoPerfil.bioVerificada,
                    possuiGithub: novoPerfil.provedorIdentidade === 'github',
                    redesVinculadas: listaRedes,
                  }
                : p
            )
          : [
              ...listaAtual,
              {
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
                pontuacaoGeral: 100 + novoPerfil.cortesSubmetidos * 75 + novoPerfil.pontosCacaFraudes,
              },
            ];
      persistirColecoesLocais({ participantes: atualizada });
      return atualizada;
    });

    await vincularPerfilServidorOuFila(novoPerfil);
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

  const lidarSubmeterPostagem = async (submissao: NovaSubmissaoArena) => {
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

    const codigoAutor = perfil.conectado
      ? perfil.codigoVerificacao
      : gerarCodigoVerificacaoBio(submissao.apelidoAutor);

    const novosParticipantes = [...participantes];
    const idxPart = novosParticipantes.findIndex(
      (p) => p.apelido.toLowerCase() === submissao.apelidoAutor.toLowerCase()
    );
    if (idxPart >= 0) {
      const existente = novosParticipantes[idxPart];
      novosParticipantes[idxPart] = {
        ...existente,
        redesVinculadas: Array.from(new Set([...existente.redesVinculadas, submissao.redeSocial])),
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

    persistirColecoesLocais({
      modelos: novosModelos,
      participantes: novosParticipantes,
      tribunal: novoTribunal,
    });

    await enviarSubmissaoServidorOuFila(submissao);
  };

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
            ? `Sinalização registrada (${categoriaFalha || 'Divergência técnica'}).`
            : item.motivoFalha,
      };
    });

    setTribunal(novoTribunal);
    persistirColecoesLocais({ tribunal: novoTribunal, votosRealizados: novosVotos });

    void enviarVotoTribunalServidorOuFila({
      idItem,
      decisao,
      pesoAplicado: pesoVotoUsuario,
      categoriaFalha,
      codigoAutor: perfil.conectado ? perfil.codigoVerificacao : undefined,
    });
  };

  const lidarRecompensarComentario = (idItem: string) => {
    if (comentariosCopiados[idItem]) return;
    const novosCopiados = { ...comentariosCopiados, [idItem]: true };
    setComentariosCopiados(novosCopiados);
    persistirColecoesLocais({ comentariosCopiados: novosCopiados });
  };

  const lidarRegistrarRespostaCenso = async (novaResposta: RespostaCensoAnonima) => {
    const atualizado = [...censo, novaResposta];
    setCenso(atualizado);
    persistirColecoesLocais({ censo: atualizado });
    await enviarRespostaCensoServidorOuFila(novaResposta);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <CabecalhoHero
        perfil={perfil}
        aoAbrirModalPerfil={() => setModalPerfilAberto(true)}
        aoAbrirModalApoio={() => setModalApoioAberto(true)}
        aoNavegarAba={navegarParaAba}
      />

      {/* Navegação Simples, Limpa e Legível */}
      <nav
        aria-label="Seções principais"
        className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur"
      >
        <div className="mx-auto max-w-4xl px-3 sm:px-6">
          <div role="tablist" className="flex items-center gap-1.5 overflow-x-auto py-2.5">
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
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition ${
                    selecionada
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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

      {/* Conteúdo Principal Direto ao Ponto */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {abaAtiva === 'checador' && <AbaChecador aoIrParaDesafio={() => navegarParaAba('arena')} />}

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

        {abaAtiva === 'guerra-ias' && <AbaGuerraIas modelos={modelos} />}

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
