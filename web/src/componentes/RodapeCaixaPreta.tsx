import React from 'react';
import { ExternalLink } from 'lucide-react';
import configuracaoLinks from '../dados/configuracaoLinks.json';
import type { ChaveAba } from '../tipos';

interface PropriedadesRodape {
  aoNavegarAba: (aba: ChaveAba) => void;
  aoAbrirModalApoio: () => void;
}

export const RodapeCaixaPreta: React.FC<PropriedadesRodape> = ({
  aoNavegarAba,
  aoAbrirModalApoio,
}) => {
  const redes = [
    configuracaoLinks.redesSociais.x,
    configuracaoLinks.redesSociais.instagram,
    configuracaoLinks.redesSociais.youtube,
    configuracaoLinks.redesSociais.tiktok,
    configuracaoLinks.redesSociais.facebook,
  ];

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white py-8 text-sm text-slate-600">
      <div className="mx-auto max-w-4xl space-y-5 px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-bold text-slate-900">{configuracaoLinks.nomeDesafio}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Projeto cidadão 100% gratuito, apartidário e em código aberto (em conformidade com TSE e LGPD).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
            <button
              type="button"
              onClick={() => aoNavegarAba('checador')}
              className="text-slate-700 hover:text-slate-950 hover:underline"
            >
              Verificar Agora
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={aoAbrirModalApoio}
              className="text-slate-700 hover:text-slate-950 hover:underline"
            >
              Apoiar o Projeto
            </button>
            <span className="text-slate-300">•</span>
            <a
              href={configuracaoLinks.repositorioGithub}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-950 hover:underline"
            >
              <span>GitHub</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-xs">
          <span className="font-semibold text-slate-500">Redes oficiais:</span>
          {redes.map((rede) => (
            <a
              key={rede.nome}
              href={rede.urlPerfil}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {rede.nome} ({rede.arroba})
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};
