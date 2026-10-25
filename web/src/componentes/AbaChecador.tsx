import React, { useMemo, useState } from 'react';
import { ArrowRight, Check, Copy, ExternalLink, HelpCircle } from 'lucide-react';
import { montarPromptAuditorUniversal } from '../dados/dadosIniciais';
import { copiarParaAreaDeTransferencia } from '../utilitarios/formatadores';

type ProvedorIaGratis = 'chatgpt' | 'gemini' | 'perplexity' | 'claude';

const OPCOES_IA_GRATIS: Array<{ id: ProvedorIaGratis; nome: string; url: string }> = [
  { id: 'chatgpt', nome: 'ChatGPT Grátis', url: 'https://chatgpt.com/' },
  { id: 'perplexity', nome: 'Perplexity (Busca Web)', url: 'https://www.perplexity.ai/' },
  { id: 'gemini', nome: 'Gemini Grátis', url: 'https://gemini.google.com/' },
  { id: 'claude', nome: 'Claude Grátis', url: 'https://claude.ai/' },
];

const EXEMPLO_BOATO =
  'URGENTE: Disseram no grupo da família que a partir de segunda-feira vão cobrar 27% de imposto automático sobre qualquer transferência acima de R$ 200.';

const EXEMPLO_POLITICO = 'Arthur Lira';

interface PropriedadesAbaChecador {
  aoIrParaDesafio?: () => void;
}

export const AbaChecador: React.FC<PropriedadesAbaChecador> = ({ aoIrParaDesafio }) => {
  const [conteudoColado, setConteudoColado] = useState('');
  const [statusAcao, setStatusAcao] = useState<'inativo' | 'aberto' | 'copiado'>('inativo');
  const [nomeIaAberta, setNomeIaAberta] = useState('ChatGPT Grátis');
  const [avisoVazio, setAvisoVazio] = useState('');

  const ehModoNomePolitico = useMemo(() => {
    const t = conteudoColado.trim();
    const palavras = t.split(/\s+/).filter(Boolean);
    return (
      t.length >= 3 &&
      palavras.length >= 1 &&
      palavras.length <= 7 &&
      !t.includes('http://') &&
      !t.includes('https://') &&
      t.length <= 70
    );
  }, [conteudoColado]);

  const promptMontado = useMemo(() => {
    const base =
      conteudoColado.trim() ||
      '[DIGITE O NOME DE UM POLÍTICO OU COLE O TEXTO/LINK QUE VOCÊ QUER VERIFICAR]';
    return montarPromptAuditorUniversal(base);
  }, [conteudoColado]);

  const verificarEmIa = async (provedor: ProvedorIaGratis) => {
    setAvisoVazio('');
    if (conteudoColado.trim().length < 3) {
      setAvisoVazio(
        'Digite o nome de um político (ex.: nome e sobrenome) ou cole uma notícia/vídeo na caixa acima.'
      );
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
    if (conteudoColado.trim().length < 3) {
      setAvisoVazio(
        'Digite o nome de um político ou cole uma notícia/vídeo na caixa acima.'
      );
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
          Fiscalize qualquer político, governo, vídeo ou notícia.
        </h1>
        <p className="mt-2 text-base leading-relaxed text-slate-600">
          Vale hoje e durante todo o mandato — ganhe quem ganhar. Digite apenas o{' '}
          <strong className="text-slate-900">nome de um político</strong> (para levantar passado,
          processos na Justiça, contratos e alianças) ou cole um{' '}
          <strong className="text-slate-900">vídeo/mensagem</strong> recebida.
        </p>

        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="caixa-verificacao"
              className="text-base font-semibold text-slate-900"
            >
              Nome do político, medida do governo ou notícia:
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
              <div className="flex flex-wrap gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setConteudoColado(EXEMPLO_POLITICO);
                    setAvisoVazio('');
                  }}
                  className="font-medium text-slate-600 underline hover:text-slate-900"
                >
                  Exemplo: Nome de político
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConteudoColado(EXEMPLO_BOATO);
                    setAvisoVazio('');
                  }}
                  className="font-medium text-slate-600 underline hover:text-slate-900"
                >
                  Exemplo: Corrente de WhatsApp
                </button>
              </div>
            )}
          </div>

          <textarea
            id="caixa-verificacao"
            rows={3}
            value={conteudoColado}
            onChange={(e) => {
              setConteudoColado(e.target.value);
              if (avisoVazio) setAvisoVazio('');
            }}
            placeholder="Digite o nome de qualquer político OU cole um link/mensagem aqui..."
            className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 p-4 text-lg text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none"
          />

          {ehModoNomePolitico && (
            <p className="mt-2 text-sm text-slate-600">
              ✓ <strong>Modo Raio-X de Figura Pública ativado:</strong> vai buscar na web passado,
              processos em aberto ou julgados, contratos/emendas e rede de alianças.
            </p>
          )}
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
            <span>
              {ehModoNomePolitico
                ? 'Levantar Passado, Processos e Contratos (Grátis)'
                : 'Verificar Agora de Graça'}
            </span>
            <ExternalLink className="h-5 w-5" />
          </button>
        </div>

        {/* Instrução Clara Pós-Clique */}
        {statusAcao === 'aberto' && (
          <div className="mt-4 rounded-xl border-2 border-slate-900 bg-slate-50 p-4 text-base text-slate-900">
            <p className="font-bold">✓ Pedido de investigação copiado automaticamente!</p>
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
            <span>Ou pesquisar direto em:</span>
            <button
              type="button"
              onClick={() => {
                void verificarEmIa('perplexity');
              }}
              className="rounded-md border border-slate-200 px-2.5 py-1 font-medium text-slate-800 hover:bg-slate-100"
            >
              Perplexity (Busca Web)
            </button>
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
                <span>Só copiar pergunta</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Ajuda Simples sob Demanda */}
      <details className="group rounded-2xl border border-slate-200 bg-white p-5">
        <summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold text-slate-900">
          <span className="inline-flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-slate-500" />
            <span>Como usar pelo celular em 3 passos simples</span>
          </span>
          <span className="text-sm font-normal text-slate-500 group-open:hidden">Mostrar</span>
          <span className="hidden text-sm font-normal text-slate-500 group-open:inline">Fechar</span>
        </summary>
        <ol className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-base text-slate-700">
          <li>
            <strong>1. Digite ou cole:</strong> Escreva só o nome de um político (para ver ficha,
            processos, emendas e alianças) OU cole uma mensagem/link do WhatsApp.
          </li>
          <li>
            <strong>2. Aperte o botão preto:</strong> O site monta a pesquisa imparcial sozinho e
            abre a IA gratuita.
          </li>
          <li>
            <strong>3. Cole e envie:</strong> Na tela que abriu, segure o dedo no campo de texto,
            toque em <em>Colar</em> e envie!
          </li>
        </ol>
      </details>

      {aoIrParaDesafio && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <p className="text-sm text-slate-700 sm:text-base">
            <strong>Quer entrar no Ranking do #DesafioProvaReal?</strong> Gere cortes auditáveis ou
            desmascare manipulações.
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
