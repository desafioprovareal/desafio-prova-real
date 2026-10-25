import React, { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  MessageSquareWarning,
  Smartphone,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { montarPromptAuditorUniversal } from '../dados/dadosIniciais';
import { copiarParaAreaDeTransferencia } from '../utilitarios/formatadores';

type ProvedorIaGratis = 'chatgpt' | 'gemini' | 'claude';

interface OpcaoIaGratis {
  id: ProvedorIaGratis;
  nome: string;
  subtitulo: string;
  url: string;
}

const OPCOES_IA_GRATIS: OpcaoIaGratis[] = [
  {
    id: 'chatgpt',
    nome: 'ChatGPT Grátis',
    subtitulo: 'Rápido e direto no navegador ou app',
    url: 'https://chatgpt.com/',
  },
  {
    id: 'gemini',
    nome: 'Gemini Grátis',
    subtitulo: 'Ótimo para vídeos do YouTube e buscas',
    url: 'https://gemini.google.com/',
  },
  {
    id: 'claude',
    nome: 'Claude Grátis',
    subtitulo: 'Excelente leitura crítica de textos longos',
    url: 'https://claude.ai/',
  },
];

const EXEMPLOS_RAPIDOS = [
  {
    rotulo: 'Exemplo 1: Corrente alarmista sem fonte',
    texto:
      'URGENTE!! Acabaram de aprovar na madrugada um novo imposto de 27% sobre transferências acima de R$ 200 a partir de segunda-feira! Repasse antes que apaguem!',
    alegacao: 'Estão dizendo no grupo da família que vão taxar qualquer transferência na segunda-feira.',
  },
  {
    rotulo: 'Exemplo 2: Número econômico fora de contexto',
    texto:
      'No vídeo de 30 segundos o candidato afirma que triplicou o orçamento da saúde sozinho em 12 meses sem aumentar nenhum gasto público.',
    alegacao: 'Vídeo curto recebido sem link do orçamento oficial.',
  },
];

export const AbaChecador: React.FC = () => {
  const [conteudoColado, setConteudoColado] = useState('');
  const [alegacaoOpcional, setAlegacaoOpcional] = useState('');
  const [iaEscolhida, setIaEscolhida] = useState<ProvedorIaGratis>('chatgpt');
  const [mostrarPreviaPrompt, setMostrarPreviaPrompt] = useState(false);
  const [statusCopiado, setStatusCopiado] = useState<'inativo' | 'copiado_e_aberto' | 'apenas_copiado'>('inativo');
  const [avisoCampoVazio, setAvisoCampoVazio] = useState('');

  const dadosIaAtual = useMemo(
    () => OPCOES_IA_GRATIS.find((o) => o.id === iaEscolhida) || OPCOES_IA_GRATIS[0],
    [iaEscolhida]
  );

  const promptMontado = useMemo(() => {
    const textoBase =
      conteudoColado.trim() ||
      '[COLE AQUI O TEXTO DA MENSAGEM, NOTÍCIA OU LINK DO VÍDEO QUE VOCÊ QUER CHECAR]';
    return montarPromptAuditorUniversal(textoBase, alegacaoOpcional);
  }, [conteudoColado, alegacaoOpcional]);

  const executarChecagemUmClique = async (abrirNovaAba: boolean) => {
    setAvisoCampoVazio('');
    if (conteudoColado.trim().length < 5) {
      setAvisoCampoVazio(
        'Cole primeiro a mensagem, manchete ou link do vídeo que você recebeu (ou toque em um dos exemplos abaixo para testar).'
      );
      return;
    }

    const copiado = await copiarParaAreaDeTransferencia(promptMontado);
    if (copiado) {
      setStatusCopiado(abrirNovaAba ? 'copiado_e_aberto' : 'apenas_copiado');
      window.setTimeout(() => setStatusCopiado('inativo'), 5000);
    }

    if (abrirNovaAba) {
      window.open(dadosIaAtual.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section aria-labelledby="titulo-checador" className="space-y-8">
      {/* Guia Visual Rápido de 3 Passos para Celular */}
      <div className="rounded-2xl border border-grafite-borda bg-grafite-cartao p-5 sm:p-6">
        <div className="inline-flex items-center gap-2 font-mono text-xs uppercase text-ciano-tecnico">
          <Smartphone className="h-4 w-4" />
          <span>MODO FÁCIL PARA CELULAR • ZERO CADASTRO • 100% GRATUITO</span>
        </div>
        <h2 id="titulo-checador" className="mt-1 text-xl font-bold text-gelo-principal sm:text-2xl">
          Checar Agora — Recebeu no Celular e Ficou na Dúvida?
        </h2>
        <p className="mt-1 text-sm text-gelo-secundario">
          Não acredite em print nem em corte de 30 segundos. Audite qualquer corrente, notícia ou vídeo
          em 15 segundos usando inteligência artificial gratuita com pergunta blindada contra viés político:
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-grafite-sutil bg-grafite-fundo/80 p-4">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ciano-tecnico font-mono text-xs font-extrabold text-grafite-fundo">
              1
            </span>
            <h3 className="mt-2 text-sm font-bold text-gelo-principal">Cole o que recebeu</h3>
            <p className="mt-1 text-xs text-gelo-secundario">
              Copie o texto da mensagem encaminhada, a manchete ou o link do vídeo suspeito e cole no quadro abaixo.
            </p>
          </div>

          <div className="rounded-xl border border-grafite-sutil bg-grafite-fundo/80 p-4">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ciano-tecnico font-mono text-xs font-extrabold text-grafite-fundo">
              2
            </span>
            <h3 className="mt-2 text-sm font-bold text-gelo-principal">Escolha a IA gratuita</h3>
            <p className="mt-1 text-xs text-gelo-secundario">
              Marque ChatGPT Grátis, Gemini Grátis ou Claude Grátis. Você não precisa pagar nada para checar.
            </p>
          </div>

          <div className="rounded-xl border border-grafite-sutil bg-grafite-fundo/80 p-4">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ciano-tecnico font-mono text-xs font-extrabold text-grafite-fundo">
              3
            </span>
            <h3 className="mt-2 text-sm font-bold text-gelo-principal">Toque no botão e cole lá</h3>
            <p className="mt-1 text-xs text-gelo-secundario">
              O sistema copia sozinho o Prompt Auditor Universal com seu texto e abre a IA. Lá dentro, é só colar e enviar!
            </p>
          </div>
        </div>
      </div>

      {/* Área Principal de Checagem em 1 Clique */}
      <div className="rounded-2xl border border-ciano-borda bg-grafite-cartao p-5 shadow-ciano sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="campo-conteudo-checador"
            className="text-base font-bold text-gelo-principal"
          >
            1. Cole aqui o link do vídeo, notícia ou mensagem que você recebeu:
          </label>
          {conteudoColado.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setConteudoColado('');
                setAlegacaoOpcional('');
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-gelo-mutado hover:text-coral-reprovado"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Limpar texto</span>
            </button>
          )}
        </div>

        <textarea
          id="campo-conteudo-checador"
          rows={5}
          value={conteudoColado}
          onChange={(e) => {
            setConteudoColado(e.target.value);
            if (avisoCampoVazio) setAvisoCampoVazio('');
          }}
          placeholder="Toque e segure aqui para colar o texto da mensagem recebida, transcrição ou link do vídeo..."
          className="mt-2.5 w-full rounded-xl border border-grafite-borda bg-grafite-fundo p-4 text-base text-gelo-principal placeholder:text-gelo-mutado focus:border-ciano-tecnico focus:outline-none"
        />

        {/* Botões Rápidos de Exemplo */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-gelo-mutado">Quer testar agora?</span>
          {EXEMPLOS_RAPIDOS.map((ex) => (
            <button
              key={ex.rotulo}
              type="button"
              onClick={() => {
                setConteudoColado(ex.texto);
                setAlegacaoOpcional(ex.alegacao);
                setAvisoCampoVazio('');
              }}
              className="rounded-lg border border-grafite-borda bg-grafite-elevado px-2.5 py-1 text-xs text-gelo-secundario transition hover:border-ciano-borda hover:text-ciano-tecnico"
            >
              {ex.rotulo}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label
            htmlFor="campo-alegacao-checador"
            className="mb-1 block text-xs font-semibold text-gelo-secundario"
          >
            O que a pessoa que te mandou afirma sobre isso? (Opcional — ajuda a IA a testar a alegação)
          </label>
          <input
            id="campo-alegacao-checador"
            type="text"
            value={alegacaoOpcional}
            onChange={(e) => setAlegacaoOpcional(e.target.value)}
            placeholder="Ex: Disseram que essa lei já começa a valer amanhã..."
            className="w-full rounded-xl border border-grafite-borda bg-grafite-fundo px-3.5 py-2.5 text-sm text-gelo-principal placeholder:text-gelo-mutado focus:border-ciano-tecnico focus:outline-none"
          />
        </div>

        {/* Seletor de IA Gratuita */}
        <div className="mt-6">
          <span className="mb-2.5 block text-base font-bold text-gelo-principal">
            2. Escolha em qual IA Gratuita você quer abrir a checagem:
          </span>
          <div className="grid gap-3 sm:grid-cols-3">
            {OPCOES_IA_GRATIS.map((opcao) => {
              const selecionada = iaEscolhida === opcao.id;
              return (
                <button
                  key={opcao.id}
                  type="button"
                  onClick={() => setIaEscolhida(opcao.id)}
                  className={`rounded-xl border p-4 text-left transition ${
                    selecionada
                      ? 'border-ciano-tecnico bg-ciano-suave shadow-ciano'
                      : 'border-grafite-borda bg-grafite-fundo hover:border-gelo-mutado'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-extrabold ${
                        selecionada ? 'text-ciano-tecnico' : 'text-gelo-principal'
                      }`}
                    >
                      {opcao.nome}
                    </span>
                    <Sparkles
                      className={`h-4 w-4 ${
                        selecionada ? 'text-ciano-tecnico' : 'text-gelo-mutado'
                      }`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gelo-secundario">{opcao.subtitulo}</p>
                </button>
              );
            })}
          </div>
        </div>

        {avisoCampoVazio && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-ambar-borda bg-ambar-suave px-4 py-3 text-xs font-semibold text-ambar-alerta">
            <MessageSquareWarning className="h-4 w-4 shrink-0" />
            <span>{avisoCampoVazio}</span>
          </div>
        )}

        {/* Botão Gigante 1 Clique */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => executarChecagemUmClique(true)}
            className="flex flex-1 items-center justify-center gap-2.5 rounded-xl bg-ciano-tecnico px-6 py-4 text-base font-extrabold text-grafite-fundo shadow-ciano transition hover:opacity-95"
          >
            {statusCopiado === 'copiado_e_aberto' ? (
              <>
                <Check className="h-5 w-5" />
                <span>Prompt Copiado! Agora é só COLAR lá no {dadosIaAtual.nome}</span>
              </>
            ) : (
              <>
                <ExternalLink className="h-5 w-5" />
                <span>Copiar Prompt Auditor + Abrir {dadosIaAtual.nome}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => executarChecagemUmClique(false)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-grafite-borda bg-grafite-elevado px-5 py-4 text-sm font-bold text-gelo-principal transition hover:border-ciano-borda hover:text-ciano-tecnico"
          >
            {statusCopiado === 'apenas_copiado' ? (
              <>
                <Check className="h-4 w-4 text-ciano-tecnico" />
                <span>Prompt Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Apenas Copiar Prompt</span>
              </>
            )}
          </button>
        </div>

        {/* Transparência do Prompt Auditor Universal */}
        <div className="mt-5 border-t border-grafite-sutil pt-4">
          <button
            type="button"
            onClick={() => setMostrarPreviaPrompt((v) => !v)}
            className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-ciano-tecnico hover:underline"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>
              {mostrarPreviaPrompt
                ? 'Ocultar código aberto do Prompt Auditor Universal'
                : 'Auditar o texto exato do Prompt Auditor Universal (Zero Caixa-Preta Secreta)'}
            </span>
          </button>

          {mostrarPreviaPrompt && (
            <pre className="mt-3 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl border border-grafite-borda bg-grafite-fundo p-4 font-mono text-xs text-gelo-secundario">
              {promptMontado}
            </pre>
          )}
        </div>
      </div>
    </section>
  );
};
