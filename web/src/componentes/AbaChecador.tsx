import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  PlayCircle,
  Share2,
} from 'lucide-react';
import {
  TEXTO_COMPARTILHAR_DESAFIO,
  montarPromptAuditorUniversal,
  montarPromptCriadorConteudo,
} from '../dados/dadosIniciais';
import { copiarParaAreaDeTransferencia } from '../utilitarios/formatadores';

type ProvedorIaGratis = 'chatgpt' | 'gemini' | 'perplexity' | 'claude';
type ModoOperacao = 'fiscalizar' | 'gerar-conteudo';

const OPCOES_IA_GRATIS: Array<{ id: ProvedorIaGratis; nome: string; url: string }> = [
  { id: 'chatgpt', nome: 'ChatGPT Grátis', url: 'https://chatgpt.com/' },
  { id: 'perplexity', nome: 'Perplexity (Busca Web)', url: 'https://www.perplexity.ai/' },
  { id: 'gemini', nome: 'Gemini Grátis', url: 'https://gemini.google.com/' },
  { id: 'claude', nome: 'Claude Grátis', url: 'https://claude.ai/' },
];

const EXEMPLO_BOATO =
  'URGENTE: Disseram no grupo da família que a partir de segunda-feira vão cobrar 27% de imposto automático sobre qualquer transferência acima de R$ 200.';

const EXEMPLO_POLITICO = 'Arthur Lira';

const EXEMPLO_GERAR_POST =
  'Compare o que foi prometido hoje sobre corte de gastos públicos com os dados reais do Tesouro Nacional e gere um post imparcial para WhatsApp e Instagram.';

interface PropriedadesAbaChecador {
  aoIrParaDesafio?: () => void;
}

export const AbaChecador: React.FC<PropriedadesAbaChecador> = ({ aoIrParaDesafio }) => {
  const [modo, setModo] = useState<ModoOperacao>('fiscalizar');
  const [conteudoColado, setConteudoColado] = useState('');
  const [statusAcao, setStatusAcao] = useState<'inativo' | 'aberto' | 'copiado'>('inativo');
  const [conviteCopiado, setConviteCopiado] = useState(false);
  const [nomeIaAberta, setNomeIaAberta] = useState('ChatGPT Grátis');
  const [avisoVazio, setAvisoVazio] = useState('');

  const ehModoNomePolitico = useMemo(() => {
    if (modo !== 'fiscalizar') return false;
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
  }, [conteudoColado, modo]);

  const promptMontado = useMemo(() => {
    if (modo === 'gerar-conteudo') {
      return montarPromptCriadorConteudo(conteudoColado);
    }
    const base =
      conteudoColado.trim() ||
      '[DIGITE O NOME DE UM POLÍTICO OU COLE O TEXTO/LINK QUE VOCÊ QUER VERIFICAR]';
    return montarPromptAuditorUniversal(base);
  }, [conteudoColado, modo]);

  const executarEmIa = async (provedor: ProvedorIaGratis) => {
    setAvisoVazio('');
    if (conteudoColado.trim().length < 3) {
      setAvisoVazio(
        modo === 'gerar-conteudo'
          ? 'Digite um tema, nome de político ou cole o link de uma live/vídeo para gerar seu post.'
          : 'Digite o nome de um político (ex.: nome e sobrenome) ou cole uma notícia/vídeo na caixa acima.'
      );
      return;
    }

    const alvo = OPCOES_IA_GRATIS.find((i) => i.id === provedor) || OPCOES_IA_GRATIS[0];
    await copiarParaAreaDeTransferencia(promptMontado);
    setNomeIaAberta(alvo.nome);
    setStatusAcao('aberto');
    window.open(alvo.url, '_blank', 'noopener,noreferrer');
  };

  const copiarPromptPronto = async () => {
    setAvisoVazio('');
    await copiarParaAreaDeTransferencia(promptMontado);
    setStatusAcao('copiado');
    window.setTimeout(() => setStatusAcao('inativo'), 4000);
  };

  const copiarConviteRedes = async () => {
    const ok = await copiarParaAreaDeTransferencia(TEXTO_COMPARTILHAR_DESAFIO);
    if (ok) {
      setConviteCopiado(true);
      window.setTimeout(() => setConviteCopiado(false), 3500);
    }
  };

  const urlWhatsapp = `https://wa.me/?text=${encodeURIComponent(TEXTO_COMPARTILHAR_DESAFIO)}`;
  const textoCurtoX =
    'Ganhe quem ganhar a eleição, ninguém vai empurrar mentira goela abaixo! Digite SÓ O NOME de qualquer político ou cheque vídeos grátis no #DesafioProvaReal: https://desafioprovareal.pages.dev @provareal_br';
  const urlX = `https://x.com/intent/tweet?text=${encodeURIComponent(textoCurtoX)}`;

  return (
    <section aria-labelledby="titulo-principal-checador" className="space-y-5">
      {/* Cartão Principal Direto ao Ponto */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        {/* Seletor Simples de 2 Funções: Fiscalizar vs. Gerar Conteúdo */}
        <div
          role="tablist"
          aria-label="Escolha o que deseja fazer"
          className="mb-5 grid grid-cols-1 gap-2 rounded-xl bg-slate-100 p-1.5 sm:grid-cols-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={modo === 'fiscalizar'}
            onClick={() => {
              setModo('fiscalizar');
              setStatusAcao('inativo');
              setAvisoVazio('');
            }}
            className={`rounded-lg px-4 py-2.5 text-sm font-bold transition sm:text-base ${
              modo === 'fiscalizar'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            1. Checar Fatos ou Raio-X de Político
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={modo === 'gerar-conteudo'}
            onClick={() => {
              setModo('gerar-conteudo');
              setStatusAcao('inativo');
              setAvisoVazio('');
            }}
            className={`rounded-lg px-4 py-2.5 text-sm font-bold transition sm:text-base ${
              modo === 'gerar-conteudo'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            2. Gerar Post / Corte p/ Redes Sociais
          </button>
        </div>

        <h1
          id="titulo-principal-checador"
          className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
        >
          {modo === 'fiscalizar'
            ? 'Fiscalize qualquer político, governo, vídeo ou notícia.'
            : 'Crie posts e cortes auditáveis prontos para compartilhar.'}
        </h1>

        <p className="mt-2 text-base leading-relaxed text-slate-600">
          {modo === 'fiscalizar' ? (
            <>
              Vale hoje e durante todo o mandato — ganhe quem ganhar. Digite apenas o{' '}
              <strong className="text-slate-900">nome de um político</strong> (para levantar
              passado, processos em aberto, contratos e alianças) ou cole um{' '}
              <strong className="text-slate-900">vídeo/mensagem</strong> recebida.
            </>
          ) : (
            <>
              Cole o link de uma <strong className="text-slate-900">live, vídeo, notícia</strong> ou
              tema político e gere na hora textos prontos para{' '}
              <strong className="text-slate-900">WhatsApp, Instagram, X, TikTok e Facebook</strong>{' '}
              com a Ficha de Auditoria oficial do <strong>#DesafioProvaReal</strong>.
            </>
          )}
        </p>

        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="caixa-verificacao"
              className="text-base font-semibold text-slate-900"
            >
              {modo === 'fiscalizar'
                ? 'Nome do político, medida do governo ou notícia:'
                : 'Link da live/vídeo, notícia ou tema para virar post:'}
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
            ) : modo === 'fiscalizar' ? (
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
            ) : (
              <button
                type="button"
                onClick={() => {
                  setConteudoColado(EXEMPLO_GERAR_POST);
                  setAvisoVazio('');
                }}
                className="text-sm font-medium text-slate-600 underline hover:text-slate-900"
              >
                Preencher exemplo de post
              </button>
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
            placeholder={
              modo === 'fiscalizar'
                ? 'Digite o nome de qualquer político OU cole um link/mensagem aqui...'
                : 'Cole o link de uma live/vídeo do YouTube, notícia ou escreva o tema do post...'
            }
            className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 p-4 text-lg text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none"
          />

          {ehModoNomePolitico && (
            <p className="mt-2 text-sm text-slate-600">
              ✓ <strong>Modo Raio-X de Figura Pública ativado:</strong> vai buscar na web passado,
              processos em aberto vs. condenações, contratos/emendas e rede de alianças.
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
              void executarEmIa('chatgpt');
            }}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-slate-900 px-6 py-4 text-lg font-bold text-white transition hover:bg-slate-800"
          >
            <span>
              {modo === 'gerar-conteudo'
                ? 'Gerar Post e Ficha p/ Redes Sociais (Grátis)'
                : ehModoNomePolitico
                  ? 'Levantar Passado, Processos e Contratos (Grátis)'
                  : 'Verificar Agora de Graça'}
            </span>
            <ExternalLink className="h-5 w-5" />
          </button>
        </div>

        {/* Instrução Clara Pós-Clique */}
        {statusAcao === 'aberto' && (
          <div className="mt-4 rounded-xl border-2 border-slate-900 bg-slate-50 p-4 text-base text-slate-900">
            <p className="font-bold">✓ Prompt copiado automaticamente!</p>
            <p className="mt-1 text-slate-700">
              Na janela do <strong>{nomeIaAberta}</strong> que acabou de abrir, basta{' '}
              <strong>segurar o dedo e tocar em Colar</strong> (ou apertar <code>Ctrl + V</code> no
              computador) e enviar.
            </p>
          </div>
        )}

        {/* Alternativas de IA + Copiar Prompt Direto */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <div className="flex flex-wrap items-center gap-2">
            <span>Ou abrir em:</span>
            <button
              type="button"
              onClick={() => {
                void executarEmIa('perplexity');
              }}
              className="rounded-md border border-slate-200 px-2.5 py-1 font-medium text-slate-800 hover:bg-slate-100"
            >
              Perplexity (Busca Web)
            </button>
            <button
              type="button"
              onClick={() => {
                void executarEmIa('gemini');
              }}
              className="rounded-md border border-slate-200 px-2.5 py-1 font-medium text-slate-800 hover:bg-slate-100"
            >
              Gemini Grátis
            </button>
            <button
              type="button"
              onClick={() => {
                void executarEmIa('claude');
              }}
              className="rounded-md border border-slate-200 px-2.5 py-1 font-medium text-slate-800 hover:bg-slate-100"
            >
              Claude Grátis
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              void copiarPromptPronto();
            }}
            className="inline-flex items-center gap-1.5 font-semibold text-slate-900 hover:underline"
          >
            {statusAcao === 'copiado' ? (
              <>
                <Check className="h-4 w-4" />
                <span>Prompt copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copiar Prompt</span>
              </>
            )}
          </button>
        </div>

        {/* Caixa Expansível para Ver e Copiar o Prompt Inteiro na Tela */}
        <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-700">
            <span className="inline-flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-500" />
              <span>
                {modo === 'gerar-conteudo'
                  ? 'Ver / Copiar o Prompt Completo de Gerar Conteúdo'
                  : 'Ver / Copiar o Prompt Completo de Fiscalização'}
              </span>
            </span>
            <span className="text-xs font-normal underline">Abrir</span>
          </summary>
          <div className="mt-3 space-y-2">
            <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-800">
              {promptMontado}
            </pre>
            <button
              type="button"
              onClick={() => {
                void copiarPromptPronto();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copiar Este Prompt Agora</span>
            </button>
          </div>
        </details>
      </div>

      {/* Barra Simples Estilo Linktree + Vídeos Diretos p/ Baixar no WhatsApp (Sem Depender de Redes) */}
      <div id="videos" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="inline-flex items-center gap-2 text-lg font-bold text-slate-900 sm:text-xl">
            <PlayCircle className="h-5 w-5 text-slate-900" />
            <span>Vídeos Curtos e Links Rápidos (Baixe e Mande nos Grupos)</span>
          </h2>
          <p className="mt-1 text-sm text-slate-600 sm:text-base">
            Assista aqui mesmo sem precisar de cadastro. Toque em <strong>Baixar Vídeo</strong> para
            postar no seu Status do WhatsApp, grupos da família, Instagram Stories ou Facebook!
          </p>
        </div>

        {/* 2 Vídeos Principais Direto na Tela (Leves: ~340 KB cada) */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <div>
              <p className="text-sm font-bold text-slate-900">
                1. Raio-X: Digite Só o Nome do Político (18s)
              </p>
              <p className="mt-0.5 text-xs text-slate-600">
                Vale hoje e nos próximos 4 anos de governo.
              </p>
              <video
                controls
                playsInline
                preload="metadata"
                className="mt-2.5 aspect-[9/16] max-h-72 w-full rounded-lg bg-slate-950 object-contain"
                src="/videos/raio-x-politico.mp4"
              />
            </div>
            <a
              href="/videos/raio-x-politico.mp4"
              download="DesafioProvaReal-RaioX-Politico.mp4"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />
              <span>Baixar Vídeo p/ WhatsApp</span>
            </a>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <div>
              <p className="text-sm font-bold text-slate-900">
                2. Como Checar Fake News pelo Celular (18s)
              </p>
              <p className="mt-0.5 text-xs text-slate-600">
                Ideal para mandar no grupo da família.
              </p>
              <video
                controls
                playsInline
                preload="metadata"
                className="mt-2.5 aspect-[9/16] max-h-72 w-full rounded-lg bg-slate-950 object-contain"
                src="/videos/checar-whatsapp-celular.mp4"
              />
            </div>
            <a
              href="/videos/checar-whatsapp-celular.mp4"
              download="DesafioProvaReal-Checar-Celular.mp4"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />
              <span>Baixar Vídeo p/ Família</span>
            </a>
          </div>
        </div>

        {/* Botões Grandes Estilo Linktree Limpo */}
        <div className="border-t border-slate-100 pt-4">
          <p className="mb-2.5 inline-flex items-center gap-1.5 text-sm font-bold text-slate-900">
            <Share2 className="h-4 w-4" />
            <span>Links Rápidos Oficiais (1 Toque):</span>
          </p>
          <div className="grid gap-2.5 sm:grid-cols-3">
            <a
              href={urlWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <span>Enviar no WhatsApp</span>
              <ExternalLink className="h-4 w-4" />
            </a>

            <a
              href="https://x.com/provareal_br"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <span>Canal Oficial no X (@provareal_br)</span>
              <ExternalLink className="h-4 w-4" />
            </a>

            <button
              type="button"
              onClick={() => {
                void copiarConviteRedes();
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              {conviteCopiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{conviteCopiado ? 'Copiado!' : 'Copiar Convite p/ Lives'}</span>
            </button>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-3 text-xs text-slate-600">
            <a href={urlX} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-900">
              Publicar direto no meu X
            </a>
            <span>•</span>
            <a
              href="/videos/regras-desafio-oficial.mp4"
              download="DesafioProvaReal-Regras.mp4"
              className="underline hover:text-slate-900"
            >
              Baixar Vídeo 3: Regras do Desafio (24s)
            </a>
            <span>•</span>
            <a
              href="/videos/guerra-das-ias.mp4"
              download="DesafioProvaReal-Guerra-IAs.mp4"
              className="underline hover:text-slate-900"
            >
              Baixar Vídeo 4: Guerra das IAs (18s)
            </a>
          </div>
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
            <strong>1. Escolha lá em cima:</strong> Toque em <em>Checar Fatos / Raio-X</em> ou em{' '}
            <em>Gerar Post p/ Redes Sociais</em>.
          </li>
          <li>
            <strong>2. Digite ou cole:</strong> Escreva só o nome de um político OU cole o link de
            uma live/vídeo/notícia e aperte o botão preto.
          </li>
          <li>
            <strong>3. Cole e envie:</strong> Na IA gratuita que abrir, segure o dedo no campo de
            texto, toque em <em>Colar</em> e envie!
          </li>
        </ol>
      </details>

      {aoIrParaDesafio && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <p className="text-sm text-slate-700 sm:text-base">
            <strong>Já publicou seu post com #DesafioProvaReal?</strong> Cadastre no Ranking ou
            audite postagens.
          </p>
          <button
            type="button"
            onClick={aoIrParaDesafio}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            <span>Ver Ranking</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
};
