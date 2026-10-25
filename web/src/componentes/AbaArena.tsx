import React, { useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  FileCode2,
  GitBranch,
  PlusCircle,
  Search,
  Send,
  ShieldAlert,
  Trophy,
} from 'lucide-react';
import configuracaoLinks from '../dados/configuracaoLinks.json';
import { PROMPT_AUDITOR_PADRAO } from '../dados/dadosIniciais';
import type {
  ModeloIaPlacar,
  NovaSubmissaoArena,
  ParticipanteArena,
  PerfilUsuarioConectado,
  RedeSocialChave,
} from '../tipos';
import {
  detectarRedePorUrl,
  formatarCompacto,
  formatarInteiro,
  nomeRedeSocial,
} from '../utilitarios/formatadores';

interface PropriedadesAbaArena {
  participantes: ParticipanteArena[];
  modelos: ModeloIaPlacar[];
  perfil: PerfilUsuarioConectado;
  aoAbrirModalPerfil: () => void;
  aoSubmeterPostagem: (submissao: NovaSubmissaoArena) => Promise<void>;
}

export const AbaArena: React.FC<PropriedadesAbaArena> = ({
  participantes,
  modelos,
  perfil,
  aoAbrirModalPerfil,
  aoSubmeterPostagem,
}) => {
  const [termoBusca, setTermoBusca] = useState('');

  // Campos do Formulário Rápido de Submissão
  const [apelidoAutor, setApelidoAutor] = useState(perfil.apelido || '');
  const [urlPostagem, setUrlPostagem] = useState('');
  const [urlVideoOriginal, setUrlVideoOriginal] = useState('');
  const [redeSocial, setRedeSocial] = useState<RedeSocialChave>('tiktok');
  const [tituloCorte, setTituloCorte] = useState('');
  const [modeloUsado, setModeloUsado] = useState(modelos[0]?.nome || 'Claude Sonnet');
  const [tokensGastos, setTokensGastos] = useState<string>('12500');
  const [promptUsado, setPromptUsado] = useState(PROMPT_AUDITOR_PADRAO);
  const [erroFormulario, setErroFormulario] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [enviando, setEnviando] = useState(false);

  const participantesOrdenados = useMemo(() => {
    const busca = termoBusca.trim().toLowerCase();
    return [...participantes]
      .filter((p) => {
        if (!busca) return true;
        return (
          p.apelido.toLowerCase().includes(busca) ||
          p.codigoVerificacao.toLowerCase().includes(busca)
        );
      })
      .sort((a, b) => b.pontuacaoGeral - a.pontuacaoGeral);
  }, [participantes, termoBusca]);

  const aoAlterarUrlPostagem = (valor: string) => {
    setUrlPostagem(valor);
    const detectada = detectarRedePorUrl(valor);
    if (detectada) {
      setRedeSocial(detectada);
    }
  };

  const lidarEnvioPostagem = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErroFormulario('');
    setMensagemSucesso('');

    const autorEfetivo = (perfil.conectado ? perfil.apelido : apelidoAutor).trim();
    if (autorEfetivo.length < 3) {
      setErroFormulario('Informe seu @apelido público ou conecte seu perfil antes de submeter.');
      return;
    }

    if (!urlPostagem.trim().startsWith('http')) {
      setErroFormulario('Insira o link completo (https://...) da sua postagem publicada.');
      return;
    }

    if (!urlVideoOriginal.trim().startsWith('http')) {
      setErroFormulario(
        'O link do vídeo/fonte original completo é obrigatório para provar que não houve edição fora de contexto.'
      );
      return;
    }

    if (tituloCorte.trim().length < 8) {
      setErroFormulario('Descreva brevemente o tema ou fala auditada no corte (mínimo 8 caracteres).');
      return;
    }

    const numeroTokens = Number(tokensGastos);
    if (!Number.isFinite(numeroTokens) || numeroTokens < 100) {
      setErroFormulario('Informe uma quantidade real de tokens consumidos (mínimo 100 tokens).');
      return;
    }

    if (promptUsado.trim().length < 25) {
      setErroFormulario('Cole o prompt completo utilizado para permitir reprodução aberta da auditoria.');
      return;
    }

    setEnviando(true);
    try {
      const formatado = autorEfetivo.startsWith('@') ? autorEfetivo : `@${autorEfetivo}`;
      await aoSubmeterPostagem({
        apelidoAutor: formatado,
        redeSocial,
        tituloCorte: tituloCorte.trim(),
        urlPostagem: urlPostagem.trim(),
        urlVideoOriginal: urlVideoOriginal.trim(),
        modeloUsado,
        tokensGastos: Math.round(numeroTokens),
        promptUsado: promptUsado.trim(),
      });

      setTituloCorte('');
      setUrlPostagem('');
      setUrlVideoOriginal('');
      setMensagemSucesso(
        'Postagem protocolada com sucesso! Seus pontos entraram na Arena e o corte já está aberto para verificação no Tribunal Comunitário.'
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section aria-labelledby="titulo-arena" className="space-y-8">
      {/* Cabeçalho e Regra Transparente de Pontuação */}
      <div className="rounded-2xl border border-grafite-borda bg-grafite-cartao p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase text-ciano-tecnico">
              <Trophy className="h-4 w-4" />
              <span>RANKING UNIFICADO MULTIRREDE</span>
            </div>
            <h2 id="titulo-arena" className="mt-1 text-xl font-bold text-gelo-principal sm:text-2xl">
              Arena dos Participantes — Quem Prova Mais com Fatos?
            </h2>
            <p className="mt-1 text-sm text-gelo-secundario">
               Some pontos publicando cortes auditados com{' '}
              <strong className="font-mono text-ciano-tecnico">{configuracaoLinks.hashtagOficial}</strong> ou
              caçando fraudes de contexto no Tribunal.
            </p>
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gelo-mutado" />
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Buscar @participante ou PR-XXXX"
              aria-label="Buscar participante na Arena"
              className="w-full rounded-xl border border-grafite-borda bg-grafite-fundo py-2 pl-9 pr-3 text-sm text-gelo-principal placeholder:text-gelo-mutado focus:border-ciano-tecnico focus:outline-none"
            />
          </div>
        </div>

        {/* Fórmula Aberta */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-grafite-sutil pt-4 font-mono text-xs text-gelo-mutado">
          <span className="font-bold text-gelo-secundario">Fórmula Aberta:</span>
          <span className="rounded bg-grafite-fundo px-2 py-1 text-ciano-tecnico">
            +75 pts por Corte Validado
          </span>
          <span className="rounded bg-grafite-fundo px-2 py-1 text-ambar-alerta">
            +50 pts por Caça-Fraude Comprovada
          </span>
          <span className="rounded bg-grafite-fundo px-2 py-1 text-gelo-secundario">
            + Bônus proporcional de alcance e debate auditado
          </span>
        </div>
      </div>

      {/* Placar Geral */}
      <div className="overflow-hidden rounded-2xl border border-grafite-borda bg-grafite-cartao">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-grafite-sutil bg-grafite-fundo/80 font-mono text-xs uppercase text-gelo-mutado">
              <tr>
                <th className="px-4 py-3.5">Pos.</th>
                <th className="px-4 py-3.5">Participante & Redes</th>
                <th className="px-4 py-3.5 text-right">Cortes Validados</th>
                <th className="px-4 py-3.5 text-right">Visualizações Auditadas</th>
                <th className="px-4 py-3.5 text-right">Comentários</th>
                <th className="px-4 py-3.5 text-right">Caça-Fraudes</th>
                <th className="px-5 py-3.5 text-right">Pontuação Geral</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grafite-sutil">
              {participantesOrdenados.map((p, idx) => {
                const destaqueUsuario =
                  perfil.conectado &&
                  p.apelido.toLowerCase() === perfil.apelido.toLowerCase();

                return (
                  <tr
                    key={p.id}
                    className={`transition ${
                      destaqueUsuario
                        ? 'bg-ciano-suave/50'
                        : 'hover:bg-grafite-elevado/60'
                    }`}
                  >
                    <td className="px-4 py-4 font-mono font-bold">
                      {idx === 0 ? (
                        <span className="inline-flex items-center gap-1 rounded bg-ciano-suave px-2 py-0.5 text-ciano-tecnico">
                          <Award className="h-3.5 w-3.5" /> #1
                        </span>
                      ) : (
                        <span className="text-gelo-mutado">#{idx + 1}</span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-gelo-principal">{p.apelido}</span>
                        <span className="rounded border border-grafite-borda bg-grafite-fundo px-1.5 py-0.5 font-mono text-[10px] text-ciano-tecnico">
                          {p.codigoVerificacao}
                        </span>
                        {p.verificado && (
                          <span
                            title="Bio verificada pelo código PR"
                            className="inline-flex items-center gap-0.5 text-[11px] font-medium text-ciano-tecnico"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Verificado
                          </span>
                        )}
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {p.redesVinculadas.map((rede) => (
                          <span
                            key={rede}
                            className="rounded bg-grafite-elevado px-2 py-0.5 font-mono text-[10px] text-gelo-secundario"
                          >
                            {nomeRedeSocial(rede)}
                          </span>
                        ))}
                        {p.possuiGithub && (
                          <span className="inline-flex items-center gap-1 rounded border border-ciano-borda bg-ciano-suave px-1.5 py-0.5 font-mono text-[10px] text-ciano-tecnico">
                            <GitBranch className="h-2.5 w-2.5" />
                            GitHub
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-right font-mono font-semibold text-gelo-principal">
                      {formatarInteiro(p.cortesValidados)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-gelo-secundario">
                      {formatarCompacto(p.visualizacoesAuditadas)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-gelo-secundario">
                      {formatarInteiro(p.comentariosGerados)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-semibold text-ambar-alerta">
                      {formatarInteiro(p.auditoriasCacaFraudes)}
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-base font-extrabold text-ciano-tecnico">
                      {formatarInteiro(p.pontuacaoGeral)} pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formulário Rápido: Submeter Minha Postagem */}
      <div className="rounded-2xl border border-ciano-borda bg-grafite-cartao p-5 shadow-ciano sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-grafite-sutil pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ciano-suave text-ciano-tecnico">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gelo-principal">
                Submeter Minha Postagem da {configuracaoLinks.hashtagOficial}
              </h3>
              <p className="text-xs text-gelo-secundario">
                Registre o corte que você publicou para pontuar no ranking e abrir auditoria pública.
              </p>
            </div>
          </div>

          {!perfil.conectado && (
            <button
              type="button"
              onClick={aoAbrirModalPerfil}
              className="rounded-lg border border-ambar-borda bg-ambar-suave px-3 py-1.5 text-xs font-bold text-ambar-alerta transition hover:border-ambar-alerta"
            >
              Dica: Conecte seu Perfil p/ Vincular Código PR-XXXX
            </button>
          )}
        </div>

        <form onSubmit={lidarEnvioPostagem} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gelo-secundario">
                Seu @Apelido de Participante *
              </label>
              <input
                type="text"
                value={perfil.conectado ? perfil.apelido : apelidoAutor}
                disabled={perfil.conectado}
                onChange={(e) => setApelidoAutor(e.target.value)}
                placeholder="@seu.perfil"
                className="w-full rounded-lg border border-grafite-borda bg-grafite-fundo px-3 py-2.5 text-sm text-gelo-principal placeholder:text-gelo-mutado focus:border-ciano-tecnico focus:outline-none disabled:opacity-75"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gelo-secundario">
                Rede Social da Postagem *
              </label>
              <select
                value={redeSocial}
                onChange={(e) => setRedeSocial(e.target.value as RedeSocialChave)}
                className="w-full rounded-lg border border-grafite-borda bg-grafite-fundo px-3 py-2.5 text-sm text-gelo-principal focus:border-ciano-tecnico focus:outline-none"
              >
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram (Reels)</option>
                <option value="youtube">YouTube (Shorts / Vídeo)</option>
                <option value="x">X</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gelo-secundario">
                Resumo / Tema do Corte Auditado *
              </label>
              <input
                type="text"
                value={tituloCorte}
                onChange={(e) => setTituloCorte(e.target.value)}
                placeholder="Ex: Checagem de dados sobre obras federais"
                className="w-full rounded-lg border border-grafite-borda bg-grafite-fundo px-3 py-2.5 text-sm text-gelo-principal placeholder:text-gelo-mutado focus:border-ciano-tecnico focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gelo-secundario">
                Link da Sua Postagem com {configuracaoLinks.hashtagOficial} *
              </label>
              <input
                type="url"
                value={urlPostagem}
                onChange={(e) => aoAlterarUrlPostagem(e.target.value)}
                placeholder="https://www.tiktok.com/@seu_usuario/video/..."
                className="w-full rounded-lg border border-grafite-borda bg-grafite-fundo px-3 py-2.5 text-sm text-gelo-principal placeholder:text-gelo-mutado focus:border-ciano-tecnico focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gelo-secundario">
                Link do Vídeo/Fonte Original Completa (Sem Edição) *
              </label>
              <input
                type="url"
                value={urlVideoOriginal}
                onChange={(e) => setUrlVideoOriginal(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... (íntegra bruta)"
                className="w-full rounded-lg border border-grafite-borda bg-grafite-fundo px-3 py-2.5 text-sm text-gelo-principal placeholder:text-gelo-mutado focus:border-ciano-tecnico focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gelo-secundario">
                Modelo de IA Usado na Auditoria *
              </label>
              <select
                value={modeloUsado}
                onChange={(e) => setModeloUsado(e.target.value)}
                className="w-full rounded-lg border border-grafite-borda bg-grafite-fundo px-3 py-2.5 text-sm text-gelo-principal focus:border-ciano-tecnico focus:outline-none"
              >
                {modelos.map((m) => (
                  <option key={m.id} value={m.nome}>
                    {m.nome} ({m.fornecedor})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gelo-secundario">
                Total de Tokens Consumidos (Entrada + Saída) *
              </label>
              <input
                type="number"
                min={100}
                step={50}
                value={tokensGastos}
                onChange={(e) => setTokensGastos(e.target.value)}
                placeholder="Ex: 12500"
                className="w-full rounded-lg border border-grafite-borda bg-grafite-fundo px-3 py-2.5 font-mono text-sm text-gelo-principal focus:border-ciano-tecnico focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold text-gelo-secundario">
                Prompt Exato Utilizado na Auditoria (Transparência Total) *
              </label>
              <button
                type="button"
                onClick={() => setPromptUsado(PROMPT_AUDITOR_PADRAO)}
                className="inline-flex items-center gap-1 font-mono text-xs text-ciano-tecnico hover:underline"
              >
                <FileCode2 className="h-3.5 w-3.5" />
                <span>Restaurar Prompt Oficial Padrão</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={promptUsado}
              onChange={(e) => setPromptUsado(e.target.value)}
              className="w-full rounded-lg border border-grafite-borda bg-grafite-fundo p-3 font-mono text-xs text-gelo-principal focus:border-ciano-tecnico focus:outline-none"
            />
          </div>

          {erroFormulario && (
            <div className="flex items-center gap-2 rounded-lg border border-coral-borda bg-coral-suave px-4 py-2.5 text-xs font-semibold text-coral-reprovado">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{erroFormulario}</span>
            </div>
          )}

          {mensagemSucesso && (
            <div className="flex items-center gap-2 rounded-lg border border-ciano-borda bg-ciano-suave px-4 py-2.5 text-xs font-semibold text-ciano-tecnico">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{mensagemSucesso}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={enviando}
              className="inline-flex items-center gap-2 rounded-xl bg-ciano-tecnico px-6 py-3 text-sm font-bold text-grafite-fundo shadow-ciano transition hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{enviando ? 'Protocolando Auditoria...' : 'Protocolar Postagem na Arena'}</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
