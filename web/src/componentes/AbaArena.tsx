import React, { useMemo, useState } from 'react';
import { Check, Copy, ExternalLink, Plus, Scissors, Search } from 'lucide-react';
import configuracaoLinks from '../dados/configuracaoLinks.json';
import {
  PROMPT_AUDITOR_PADRAO,
  URL_COLAB_CORTADOR_GRATIS,
  montarPromptGeradorCortes,
} from '../dados/dadosIniciais';
import type {
  ModeloIaPlacar,
  NovaSubmissaoArena,
  ParticipanteArena,
  PerfilUsuarioConectado,
  RedeSocialChave,
} from '../tipos';
import {
  copiarParaAreaDeTransferencia,
  detectarRedePorUrl,
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
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [promptCopiado, setPromptCopiado] = useState(false);

  const [apelidoAutor, setApelidoAutor] = useState(perfil.apelido || '');
  const [urlPostagem, setUrlPostagem] = useState('');
  const [urlVideoOriginal, setUrlVideoOriginal] = useState('');
  const [redeSocial, setRedeSocial] = useState<RedeSocialChave>('x');
  const [tituloCorte, setTituloCorte] = useState('');
  const [modeloUsado, setModeloUsado] = useState(modelos[0]?.nome || 'Claude Sonnet');
  const [tokensGastos, setTokensGastos] = useState<string>('8500');
  const [promptUsado, setPromptUsado] = useState(PROMPT_AUDITOR_PADRAO);
  const [erroFormulario, setErroFormulario] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [enviando, setEnviando] = useState(false);

  const participantesOrdenados = useMemo(() => {
    const busca = termoBusca.trim().toLowerCase();
    return [...participantes]
      .filter((p) => !busca || p.apelido.toLowerCase().includes(busca))
      .sort((a, b) => b.pontuacaoGeral - a.pontuacaoGeral);
  }, [participantes, termoBusca]);

  const copiarPromptCriador = async () => {
    const ok = await copiarParaAreaDeTransferencia(montarPromptGeradorCortes(''));
    if (ok) {
      setPromptCopiado(true);
      window.setTimeout(() => setPromptCopiado(false), 3000);
    }
  };

  const lidarEnvioPostagem = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErroFormulario('');
    setMensagemSucesso('');

    const autorEfetivo = (perfil.conectado ? perfil.apelido : apelidoAutor).trim();
    if (autorEfetivo.length < 3) {
      setErroFormulario('Informe seu @apelido público.');
      return;
    }
    if (!urlPostagem.trim().startsWith('http') || !urlVideoOriginal.trim().startsWith('http')) {
      setErroFormulario('Informe os links completos (https://...) da postagem e do vídeo original.');
      return;
    }
    if (tituloCorte.trim().length < 5) {
      setErroFormulario('Informe um título curto para o corte.');
      return;
    }

    setEnviando(true);
    try {
      await aoSubmeterPostagem({
        apelidoAutor: autorEfetivo.startsWith('@') ? autorEfetivo : `@${autorEfetivo}`,
        urlPostagem: urlPostagem.trim(),
        urlVideoOriginal: urlVideoOriginal.trim(),
        redeSocial,
        tituloCorte: tituloCorte.trim(),
        modeloUsado,
        tokensGastos: Math.max(100, Number(tokensGastos) || 5000),
        promptUsado: promptUsado.trim(),
      });
      setUrlPostagem('');
      setUrlVideoOriginal('');
      setTituloCorte('');
      setMensagemSucesso('Postagem enviada para o ranking e para auditoria pública!');
      setMostrarFormulario(false);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section aria-labelledby="titulo-arena" className="space-y-6">
      {/* Regras Claras em 3 Pontos + Botão de Copiar Prompt */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 id="titulo-arena" className="text-xl font-bold text-slate-900 sm:text-2xl">
          Como funciona o {configuracaoLinks.hashtagOficial}
        </h2>
        <ol className="mt-3 space-y-2 text-base text-slate-700">
          <li>
            <strong>1. Gere um corte honesto:</strong> Use sua IA favorita com o nosso Prompt Aberto
            (sem cortar frase pela metade).
          </li>
          <li>
            <strong>2. Prove no 1º comentário:</strong> Cole o link original, os segundos exatos, a
            IA usada, os tokens gastos e o prompt completo.
          </li>
          <li>
            <strong>3. Editou = Eliminado:</strong> Comentário editado ou prompt manipulado leva à
            desclassificação imediata pela comunidade.
          </li>
        </ol>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              void copiarPromptCriador();
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 sm:text-base"
          >
            {promptCopiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>
              {promptCopiado
                ? 'Prompt Copiado! Cole na sua IA'
                : 'Copiar Prompt para Criar Corte'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMostrarFormulario((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 sm:text-base"
          >
            <Plus className="h-4 w-4" />
            <span>{mostrarFormulario ? 'Fechar Formulário' : 'Enviar Minha Postagem'}</span>
          </button>

          <a
            href={URL_COLAB_CORTADOR_GRATIS}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 sm:text-base"
          >
            <Scissors className="h-4 w-4" />
            <span>Cortador MP4 Grátis (Google Colab)</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {mensagemSucesso && (
          <p className="mt-4 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900">
            ✓ {mensagemSucesso}
          </p>
        )}
      </div>

      {/* Formulário sob Demanda */}
      {mostrarFormulario && (
        <form
          onSubmit={(e) => {
            void lidarEnvioPostagem(e);
          }}
          className="space-y-4 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-slate-900">Cadastrar Postagem no Ranking</h3>
            {!perfil.conectado && (
              <button
                type="button"
                onClick={aoAbrirModalPerfil}
                className="text-sm font-medium text-slate-700 underline hover:text-slate-950"
              >
                Vincular minhas redes primeiro
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Seu @apelido</label>
              <input
                type="text"
                value={perfil.conectado ? perfil.apelido : apelidoAutor}
                disabled={perfil.conectado}
                onChange={(e) => setApelidoAutor(e.target.value)}
                placeholder="@seu_usuario"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base text-slate-900 focus:border-slate-900 focus:outline-none disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Tema resumido do vídeo
              </label>
              <input
                type="text"
                value={tituloCorte}
                onChange={(e) => setTituloCorte(e.target.value)}
                placeholder="Ex: Checagem de dados sobre saneamento"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Link da sua postagem publicada
              </label>
              <input
                type="url"
                value={urlPostagem}
                onChange={(e) => {
                  setUrlPostagem(e.target.value);
                  const det = detectarRedePorUrl(e.target.value);
                  if (det) setRedeSocial(det);
                }}
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Link do vídeo completo original
              </label>
              <input
                type="url"
                value={urlVideoOriginal}
                onChange={(e) => setUrlVideoOriginal(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">IA utilizada</label>
              <select
                value={modeloUsado}
                onChange={(e) => setModeloUsado(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                {modelos.map((m) => (
                  <option key={m.id} value={m.nome}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Tokens gastos (aproximado)
              </label>
              <input
                type="number"
                value={tokensGastos}
                onChange={(e) => setTokensGastos(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Prompt completo usado
            </label>
            <textarea
              rows={3}
              value={promptUsado}
              onChange={(e) => setPromptUsado(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>

          {erroFormulario && (
            <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900">
              {erroFormulario}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-xl bg-slate-900 px-5 py-3.5 text-base font-bold text-white transition hover:bg-slate-800"
          >
            {enviando ? 'Enviando...' : 'Confirmar e Entrar no Ranking'}
          </button>
        </form>
      )}

      {/* Tabela Limpa do Ranking */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-900">Ranking Geral dos Participantes</h3>
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Buscar participante..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm sm:text-base">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3 pr-3">#</th>
                <th className="py-3 pr-3">Participante</th>
                <th className="py-3 pr-3">Redes</th>
                <th className="py-3 pr-3 text-right">Cortes</th>
                <th className="py-3 pr-3 text-right">Auditorias</th>
                <th className="py-3 text-right">Pontos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {participantesOrdenados.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3.5 pr-3 font-bold text-slate-500">{idx + 1}º</td>
                  <td className="py-3.5 pr-3">
                    <span className="font-semibold text-slate-900">{p.apelido}</span>
                    {p.verificado && (
                      <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700">
                        Verificado
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 pr-3 text-xs text-slate-600">
                    {p.redesVinculadas.map((r) => nomeRedeSocial(r)).join(', ')}
                  </td>
                  <td className="py-3.5 pr-3 text-right text-slate-700">
                    {formatarInteiro(p.cortesValidados)}
                  </td>
                  <td className="py-3.5 pr-3 text-right text-slate-700">
                    {formatarInteiro(p.auditoriasCacaFraudes)}
                  </td>
                  <td className="py-3.5 text-right font-bold text-slate-900">
                    {formatarInteiro(p.pontuacaoGeral)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
