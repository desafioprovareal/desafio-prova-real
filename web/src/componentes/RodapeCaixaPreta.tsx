import React from 'react';
import { ExternalLink, GitBranch, HeartHandshake, ShieldCheck } from 'lucide-react';
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
  return (
    <footer className="mt-16 border-t border-grafite-borda bg-grafite-cartao/90 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-ciano-tecnico" />
              <span className="font-mono text-sm font-bold text-gelo-principal">
                {configuracaoLinks.nomeDesafio}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-gelo-mutado">
              Infraestrutura cidadã de código aberto para checagem auditável de discursos públicos,
              benchmark de modelos de IA e recenseamento cívico anônimo. Zero filiação partidária.
            </p>
          </div>

          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-gelo-secundario">
              Módulos de Auditoria
            </span>
            <ul className="mt-2.5 space-y-1.5 text-xs text-gelo-mutado">
              <li>
                <a
                  href="#guerra-ias"
                  onClick={() => aoNavegarAba('guerra-ias')}
                  className="hover:text-ciano-tecnico"
                >
                  #guerra-ias — Placar & Calculadora de Modelos
                </a>
              </li>
              <li>
                <a
                  href="#arena"
                  onClick={() => aoNavegarAba('arena')}
                  className="hover:text-ciano-tecnico"
                >
                  #arena — Ranking Geral de Participantes
                </a>
              </li>
              <li>
                <a
                  href="#tribunal"
                  onClick={() => aoNavegarAba('tribunal')}
                  className="hover:text-ciano-tecnico"
                >
                  #tribunal — Tribunal Ponderado & Mural de Desclassificados
                </a>
              </li>
              <li>
                <a
                  href="#checador"
                  onClick={() => aoNavegarAba('checador')}
                  className="hover:text-ciano-tecnico"
                >
                  #checador — Checar Agora em 1 Clique (Celular)
                </a>
              </li>
              <li>
                <a
                  href="#censo"
                  onClick={() => aoNavegarAba('censo')}
                  className="hover:text-ciano-tecnico"
                >
                  #censo — Censo Cívico Anônimo (LGPD & TSE-Safe)
                </a>
              </li>
            </ul>
          </div>

          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-gelo-secundario">
              Código Aberto & Sustentabilidade
            </span>
            <div className="mt-2.5 flex flex-col items-start gap-2.5 text-xs">
              <a
                href={configuracaoLinks.repositorioGithub}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-ciano-tecnico hover:underline"
              >
                <GitBranch className="h-3.5 w-3.5" />
                <span>Repositório Público no GitHub</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <button
                type="button"
                onClick={aoAbrirModalApoio}
                className="inline-flex items-center gap-1.5 font-semibold text-ambar-alerta hover:underline"
              >
                <HeartHandshake className="h-3.5 w-3.5" />
                <span>Apoiar via LivePix ou Cripto Auditável</span>
              </button>

              <span className="font-mono text-[11px] text-gelo-mutado">
                Domínio oficial: {configuracaoLinks.siteOficial}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
