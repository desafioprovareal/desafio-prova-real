import React from 'react';
import { ExternalLink, HeartHandshake, ShieldCheck, UserCheck, UserPlus } from 'lucide-react';
import configuracaoLinks from '../dados/configuracaoLinks.json';
import type { ChaveAba, PerfilUsuarioConectado } from '../tipos';

interface PropriedadesCabecalhoHero {
  perfil: PerfilUsuarioConectado;
  aoAbrirModalPerfil: () => void;
  aoAbrirModalApoio: () => void;
  aoNavegarAba: (aba: ChaveAba) => void;
}

export const CabecalhoHero: React.FC<PropriedadesCabecalhoHero> = ({
  perfil,
  aoAbrirModalPerfil,
  aoAbrirModalApoio,
  aoNavegarAba,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <a
          href="#checador"
          onClick={(e) => {
            e.preventDefault();
            aoNavegarAba('checador');
          }}
          className="flex items-center gap-2.5 focus:outline-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-base font-bold tracking-tight text-slate-900 sm:text-lg">
              {configuracaoLinks.nomeDesafio}
            </span>
            <span className="block text-xs text-slate-500">
              Verificação aberta e apartidária • {configuracaoLinks.hashtagOficial}
            </span>
          </div>
        </a>

        <div className="flex items-center gap-2">
          <a
            href={configuracaoLinks.repositorioGithub}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:inline-flex"
          >
            <span>Código Aberto</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </a>

          <button
            type="button"
            onClick={aoAbrirModalApoio}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <HeartHandshake className="h-4 w-4 text-slate-600" />
            <span>Apoiar</span>
          </button>

          <button
            type="button"
            onClick={aoAbrirModalPerfil}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {perfil.conectado ? (
              <>
                <UserCheck className="h-4 w-4" />
                <span>{perfil.apelido}</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Meu Perfil</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
