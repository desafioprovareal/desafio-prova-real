import React, { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  GitBranch,
  HeartHandshake,
  ShieldCheck,
  Wallet,
  X,
} from 'lucide-react';
import configuracaoLinks from '../dados/configuracaoLinks.json';
import { copiarParaAreaDeTransferencia } from '../utilitarios/formatadores';

interface PropriedadesModalApoio {
  aberto: boolean;
  aoFechar: () => void;
}

export const ModalApoio: React.FC<PropriedadesModalApoio> = ({ aberto, aoFechar }) => {
  const [copiadoPix, setCopiadoPix] = useState(false);
  const [copiadoCripto, setCopiadoCripto] = useState(false);

  if (!aberto) return null;

  const copiarLinkPix = async () => {
    const ok = await copiarParaAreaDeTransferencia(configuracaoLinks.apoioLivePix);
    if (ok) {
      setCopiadoPix(true);
      window.setTimeout(() => setCopiadoPix(false), 2200);
    }
  };

  const copiarCarteira = async () => {
    const ok = await copiarParaAreaDeTransferencia(configuracaoLinks.carteiraCripto);
    if (ok) {
      setCopiadoCripto(true);
      window.setTimeout(() => setCopiadoCripto(false), 2200);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-apoio"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-grafite-borda bg-grafite-cartao p-6 shadow-2xl">
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar janela de apoio transparente"
          className="absolute right-4 top-4 rounded-lg border border-grafite-borda bg-grafite-elevado p-1.5 text-gelo-mutado transition hover:text-gelo-principal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-ciano-borda bg-ciano-suave text-ciano-tecnico">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-ciano-tecnico">
              FINANCIAMENTO CÍVICO INDEPENDENTE
            </span>
            <h2 id="titulo-modal-apoio" className="text-xl font-bold text-gelo-principal">
              Apoio Transparente ao {configuracaoLinks.nomeDesafio}
            </h2>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-grafite-borda bg-grafite-fundo/80 p-4 text-sm text-gelo-secundario">
          <p className="leading-relaxed">
            Esta plataforma é <strong className="text-gelo-principal">100% apartidária e de código aberto</strong>.
            Não aceitamos verba partidária, fundo eleitoral nem patrocínio oculto. Cada centavo doado mantém
            servidores de verificação, créditos públicos de API para auditoria aberta e armazenamento imutável de provas.
          </p>
        </div>

        {/* Opção 1: LivePix */}
        <div className="mt-5 rounded-xl border border-ciano-borda bg-ciano-suave/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-mono text-xs font-bold uppercase text-ciano-tecnico">
                1. Apoio Instantâneo em Reais (LivePix)
              </span>
              <p className="mt-0.5 text-xs text-gelo-secundario">
                Contribuição rápida via PIX com recibo público na plataforma oficial.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={configuracaoLinks.apoioLivePix}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-ciano-tecnico px-3.5 py-2 text-xs font-bold text-grafite-fundo transition hover:opacity-90"
              >
                <span>Abrir LivePix</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                type="button"
                onClick={copiarLinkPix}
                className="inline-flex items-center gap-1 rounded-lg border border-grafite-borda bg-grafite-cartao px-3 py-2 text-xs font-semibold text-gelo-principal hover:border-ciano-borda"
              >
                {copiadoPix ? <Check className="h-3.5 w-3.5 text-ciano-tecnico" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiadoPix ? 'Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>
          </div>
          <div className="mt-2 truncate rounded bg-grafite-fundo px-3 py-1.5 font-mono text-xs text-gelo-mutado">
            {configuracaoLinks.apoioLivePix}
          </div>
        </div>

        {/* Opção 2: Carteira Cripto Auditável On-Chain */}
        <div className="mt-4 rounded-xl border border-grafite-borda bg-grafite-elevado/70 p-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-ambar-alerta" />
            <span className="font-mono text-xs font-bold uppercase text-ambar-alerta">
              2. Carteira Cripto Pública (Auditoria On-Chain)
            </span>
          </div>
          <p className="mt-1 text-xs text-gelo-secundario">
            Qualquer cidadão pode auditar entradas e saídas diretamente no explorador público da rede.
          </p>
          <div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="flex-1 break-all rounded-lg border border-grafite-borda bg-grafite-fundo px-3 py-2 font-mono text-xs text-gelo-principal">
              {configuracaoLinks.carteiraCripto}
            </code>
            <button
              type="button"
              onClick={copiarCarteira}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-ambar-borda bg-ambar-suave px-3.5 py-2 text-xs font-bold text-ambar-alerta transition hover:border-ambar-alerta"
            >
              {copiadoCripto ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copiadoCripto ? 'Endereço Copiado!' : 'Copiar Carteira'}</span>
            </button>
          </div>
        </div>

        {/* Rodapé de Código Aberto */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-grafite-sutil pt-4">
          <div className="flex items-center gap-2 text-xs text-gelo-mutado">
            <ShieldCheck className="h-4 w-4 text-ciano-tecnico" />
            <span>Todo o código, prompts e regras de pontuação são abertos.</span>
          </div>
          <a
            href={configuracaoLinks.repositorioGithub}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-ciano-tecnico hover:underline"
          >
            <GitBranch className="h-4 w-4" />
            <span>Auditar Repositório no GitHub</span>
          </a>
        </div>
      </div>
    </div>
  );
};
