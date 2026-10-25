import React, { useState } from 'react';
import { Check, Copy, ExternalLink, X } from 'lucide-react';
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

  const mostrarCripto = !configuracaoLinks.carteiraCripto.includes('DEFINIR');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-apoio"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 id="titulo-apoio" className="text-xl font-bold text-slate-900">
          Apoiar o {configuracaoLinks.nomeDesafio}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Este projeto é 100% gratuito, apartidário e em código aberto. Se a ferramenta foi útil
          para você ou sua família, qualquer contribuição voluntária ajuda a manter o projeto no ar.
        </p>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-900">Apoio rápido em Reais (LivePix)</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={configuracaoLinks.apoioLivePix}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <span>Abrir LivePix</span>
              <ExternalLink className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={async () => {
                if (await copiarParaAreaDeTransferencia(configuracaoLinks.apoioLivePix)) {
                  setCopiadoPix(true);
                  window.setTimeout(() => setCopiadoPix(false), 2000);
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              {copiadoPix ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copiadoPix ? 'Copiado!' : 'Copiar link'}</span>
            </button>
          </div>
        </div>

        {mostrarCripto && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-900">Carteira Cripto Auditável</p>
            <code className="mt-2 block break-all rounded border border-slate-200 bg-white p-2 text-xs text-slate-800">
              {configuracaoLinks.carteiraCripto}
            </code>
            <button
              type="button"
              onClick={async () => {
                if (await copiarParaAreaDeTransferencia(configuracaoLinks.carteiraCripto)) {
                  setCopiadoCripto(true);
                  window.setTimeout(() => setCopiadoCripto(false), 2000);
                }
              }}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 underline"
            >
              {copiadoCripto ? 'Endereço copiado!' : 'Copiar carteira'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
