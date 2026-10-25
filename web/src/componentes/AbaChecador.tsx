import React, { useMemo, useState } from 'react';
import { ArrowRight, Check, Copy, ExternalLink, HelpCircle } from 'lucide-react';
import { montarPromptAuditorUniversal } from '../dados/dadosIniciais';
import { copiarParaAreaDeTransferencia } from '../utilitarios/formatadores';

type ProvedorIaGratis = 'chatgpt' | 'gemini' | 'claude';

const OPCOES_IA_GRATIS: Array<{ id: ProvedorIaGratis; nome: string; url: string }> = [
  { id: 'chatgpt', nome: 'ChatGPT Grátis', url: 'https://chatgpt.com/' },
  { id: 'gemini', nome: 'Gemini Grátis', url: 'https://gemini.google.com/' },
  { id: 'claude', nome: 'Claude Grátis', url: 'https://claude.ai/' },
];

const EXEMPLO_TESTE =
  'URGENTE: Disseram no grupo da família que a partir de segunda-feira vão cobrar 27% de imposto automático sobre qualquer transferência acima de R$ 200.';

interface PropriedadesAbaChecador {
  aoIrParaDesafio?: () => void;
}

export const AbaChecador: React.FC<PropriedadesAbaChecador> = ({ aoIrParaDesafio }) => {
  const [conteudoColado, setConteudoColado] = useState('');
  const [statusAcao, setStatusAcao] = useState<'inativo' | 'aberto' | 'copiado'>('inativo');
  const [nomeIaAberta, setNomeIaAberta] = useState('ChatGPT Grátis');
  const [avisoVazio, setAvisoVazio] = useState('');

  const promptMontado = useMemo(() => {
    const base =
      conteudoColado.trim() ||
      '[COLE AQUI O TEXTO DA MENSAGEM, NOTÍCIA OU LINK DO VÍDEO QUE VOCÊ QUER VERIFICAR]';
    return montarPromptAuditorUniversal(base);
  }, [conteudoColado]);

  const verificarEmIa = async (provedor: ProvedorIaGratis) => {
    setAvisoVazio('');
    if (conteudoColado.trim().length < 5) {
      setAvisoVazio('Cole primeiro a mensagem, notícia ou link do vídeo na caixa acima.');
      return;
    }

    const alvo = OPCOES_IA_GRATIS.find((i) => i.id === provedor) || OPCOES_IA_GRATIS[0];
    await copiarParaAreaDeTransferencia(promptMontado);
    setNomeIaAberta(alvo.nome);
    setStatusAcao('aberto');
    window.open(alvo.url, '_blank', 'noopener,noreferrer');
  };

  const apenasCopiarTexto = async () => {
    setAvisoVazio('');
    if (conteudoColado.trim().length < 5) {
      setAvisoVazio('Cole primeiro a mensagem, notícia ou link do vídeo na caixa acima.');
      return;
    }
    await copiarParaAreaDeTransferencia(promptMontado);
    setStatusAcao('copiado');
    window.setTimeout(() => setStatusAcao('inativo'), 4000);
  };

  return (
    <section aria-labelledby="titulo-principal-checador" className="space-y-6">
      {/* Cartão Único Direto ao Ponto */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <h1
          id="titulo-principal-checador"
          className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
        >
          Recebeu um vídeo ou notícia política? Tire a Prova Real.
        </h1>
        <p className="mt-2 text-base leading-relaxed text-slate-600">
          Cole abaixo o texto ou o link que mandaram no seu WhatsApp. Em 1 clique, a verificação
          checa as fontes públicas oficiais — sem defender político nenhum.
        </p>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="caixa-verificacao"
              className="text-base font-semibold text-slate-900"
            >
              Mensagem, notícia ou link do vídeo:
            </label>
            {conteudoColado.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setConteudoColado('');
                  setStatusAcao('inativo');
                }}
                className="text-sm font-medium text-slate-500 underline hover:text-slate-900"
              >
                Limpar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setConteudoColado(EXEMPLO_TESTE);
                  setAvisoVazio('');
                }}
                className="text-sm font-medium text-slate-600 underline hover:text-slate-900"
              >
                Preencher com um exemplo
              </button>
            )}
          </div>

          <textarea
            id="caixa-verificacao"
            rows={4}
            value={conteudoColado}
            onChange={(e) => {
              setConteudoColado(e.target.value);
              if (avisoVazio) setAvisoVazio('');
            }}
            placeholder="Toque aqui, segure o dedo e aperte Colar..."
            className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 p-4 text-lg text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none"
          />
        </div>

        {avisoVazio && (
          <p className="mt-3 rounded-lg border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-800">
            {avisoVazio}
          </p>
        )}

        {/* Botão Principal Grande (1 Clique) */}
        <div className="mt-5">
          <button
            type="button"
            onClick={() => {
              void verificarEmIa('chatgpt');
            }}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-slate-900 px-6 py-4 text-lg font-bold text-white transition hover:bg-slate-800"
          >
            <span>Verificar Agora de Graça</span>
            <ExternalLink className="h-5 w-5" />
          </button>
        </div>

        {/* Instrução Clara Pós-Clique */}
        {statusAcao === 'aberto' && (
          <div className="mt-4 rounded-xl border-2 border-slate-900 bg-slate-50 p-4 text-base text-slate-900">
            <p className="font-bold">
              ✓ Pergunta de auditoria copiada automaticamente!
            </p>
            <p className="mt-1 text-slate-700">
              Na janela do <strong>{nomeIaAberta}</strong> que acabou de abrir, basta{' '}
              <strong>segurar o dedo e tocar em Colar</strong> (ou apertar <code>Ctrl + V</code> no
              computador) e enviar.
            </p>
          </div>
        )}

        {/* Alternativas Discretas em 1 Linha */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <div className="flex flex-wrap items-center gap-2">
            <span>Ou abrir direto em:</span>
            <button
              type="button"
              onClick={() => {
                void verificarEmIa('gemini');
              }}
              className="rounded-md border border-slate-200 px-2.5 py-1 font-medium text-slate-800 hover:bg-slate-100"
            >
              Gemini Grátis
            </button>
            <button
              type="button"
              onClick={() => {
                void verificarEmIa('claude');
              }}
              className="rounded-md border border-slate-200 px-2.5 py-1 font-medium text-slate-800 hover:bg-slate-100"
            >
              Claude Grátis
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              void apenasCopiarTexto();
            }}
            className="inline-flex items-center gap-1.5 font-medium text-slate-700 hover:text-slate-950 hover:underline"
          >
            {statusAcao === 'copiado' ? (
              <>
                <Check className="h-4 w-4" />
                <span>Texto copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Só copiar texto da pergunta</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Ajuda Simples sob Demanda (Sem poluir a tela) */}
      <details className="group rounded-2xl border border-slate-200 bg-white p-5">
        <summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold text-slate-900">
          <span className="inline-flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-slate-500" />
            <span>Primeira vez usando no celular? Veja como é fácil (3 passos)</span>
          </span>
          <span className="text-sm font-normal text-slate-500 group-open:hidden">Mostrar</span>
          <span className="hidden text-sm font-normal text-slate-500 group-open:inline">Fechar</span>
        </summary>
        <ol className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-base text-slate-700">
          <li>
            <strong>1. Copie no WhatsApp:</strong> Segure o dedo em cima da mensagem ou link
            suspeito que você recebeu e toque em <em>Copiar</em>.
          </li>
          <li>
            <strong>2. Cole na caixa acima:</strong> Toque dentro da caixa grande aqui do site,
            segure o dedo e toque em <em>Colar</em>.
          </li>
          <li>
            <strong>3. Aperte Verificar Agora:</strong> Uma inteligência artificial gratuita vai
            abrir. Lá dentro, segure o dedo de novo, toque em <em>Colar</em> e aperte a setinha de
            enviar!
          </li>
        </ol>
      </details>

      {/* Chamada discreta para quem veio pelo Desafio */}
      {aoIrParaDesafio && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <p className="text-sm text-slate-700 sm:text-base">
            <strong>Quer competir no #DesafioProvaReal?</strong> Gere cortes auditáveis com sua IA
            e entre no ranking aberto.
          </p>
          <button
            type="button"
            onClick={aoIrParaDesafio}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            <span>Ver Regras e Ranking</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
};
