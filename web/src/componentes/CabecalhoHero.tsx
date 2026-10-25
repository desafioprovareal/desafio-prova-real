import React, { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  GitBranch,
  HeartHandshake,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserPlus,
  Wifi,
  WifiOff,
} from 'lucide-react';
import configuracaoLinks from '../dados/configuracaoLinks.json';
import type {
  ChaveAba,
  EstadoSincronizacao,
  PerfilUsuarioConectado,
  RedeSocialChave,
} from '../tipos';
import {
  copiarParaAreaDeTransferencia,
  formatarInteiro,
  formatarPercentual,
} from '../utilitarios/formatadores';

interface PropriedadesCabecalhoHero {
  sincronizacao: EstadoSincronizacao;
  aoRessincronizar: () => void;
  perfil: PerfilUsuarioConectado;
  pesoVotoUsuario: number;
  aoAbrirModalPerfil: () => void;
  aoAbrirModalApoio: () => void;
  aoNavegarAba: (aba: ChaveAba) => void;
  metricasGlobais: {
    totalCortesAuditados: number;
    fidelidadeMediaGlobal: number;
    fraudesInterceptadas: number;
    participantesCenso: number;
  };
}

export const CabecalhoHero: React.FC<PropriedadesCabecalhoHero> = ({
  sincronizacao,
  aoRessincronizar,
  perfil,
  pesoVotoUsuario,
  aoAbrirModalPerfil,
  aoAbrirModalApoio,
  aoNavegarAba,
  metricasGlobais,
}) => {
  const [hashtagCopiada, setHashtagCopiada] = useState(false);

  const listaRedesOficiais: Array<{
    chave: RedeSocialChave;
    nome: string;
    arroba: string;
    urlPerfil: string;
  }> = [
    { chave: 'tiktok', ...configuracaoLinks.redesSociais.tiktok },
    { chave: 'instagram', ...configuracaoLinks.redesSociais.instagram },
    { chave: 'youtube', ...configuracaoLinks.redesSociais.youtube },
    { chave: 'x', ...configuracaoLinks.redesSociais.x },
    { chave: 'facebook', ...configuracaoLinks.redesSociais.facebook },
  ];

  const lidarCopiarHashtag = async () => {
    const sucesso = await copiarParaAreaDeTransferencia(configuracaoLinks.hashtagOficial);
    if (sucesso) {
      setHashtagCopiada(true);
      window.setTimeout(() => setHashtagCopiada(false), 2200);
    }
  };

  return (
    <header className="border-b border-grafite-borda bg-grafite-fundo/95 backdrop-blur-md">
      {/* Barra Superior de Comando (Caixa-Preta HUD) */}
      <div className="border-b border-grafite-sutil bg-grafite-cartao/70">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <a
              href="#guerra-ias"
              onClick={() => aoNavegarAba('guerra-ias')}
              className="group flex items-center gap-2.5 focus:outline-none"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-ciano-borda bg-ciano-suave text-ciano-tecnico shadow-ciano transition group-hover:scale-105">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold tracking-widest text-ciano-tecnico">
                    CAIXA-PRETA PÚBLICA
                  </span>
                  <span className="inline-flex h-2 w-2 rounded-full bg-ciano-tecnico animate-pulse" />
                </div>
                <span className="block text-sm font-bold text-gelo-principal sm:text-base">
                  {configuracaoLinks.nomeDesafio}
                </span>
              </div>
            </a>
          </div>

          {/* Status de Sincronização + Botões de Apoio e Perfil */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={aoRessincronizar}
              title="Verificar conexão com o servidor de auditoria e sincronizar registros locais"
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs transition ${
                sincronizacao.modo === 'api_conectada'
                  ? 'border-ciano-borda bg-ciano-suave text-ciano-tecnico'
                  : 'border-ambar-borda bg-ambar-suave text-ambar-alerta hover:border-ambar-alerta'
              }`}
            >
              {sincronizacao.modo === 'api_conectada' ? (
                <>
                  <Wifi className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">API Sincronizada</span>
                  <span className="md:hidden">Online</span>
                </>
              ) : sincronizacao.modo === 'sincronizando' ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Sincronizando...</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">
                    Modo Local Resiliente
                    {sincronizacao.pendenciasLocais > 0
                      ? ` (${sincronizacao.pendenciasLocais} na fila)`
                      : ' • Ativo'}
                  </span>
                  <span className="md:hidden">Modo Local Ativo</span>
                  <RefreshCw className="ml-0.5 h-3 w-3 opacity-80" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={aoAbrirModalApoio}
              className="inline-flex items-center gap-1.5 rounded-lg border border-grafite-borda bg-grafite-elevado px-3 py-1.5 text-xs font-semibold text-gelo-principal transition hover:border-ciano-borda hover:text-ciano-tecnico sm:text-sm"
            >
              <HeartHandshake className="h-4 w-4 text-ciano-tecnico" />
              <span>Apoio Transparente</span>
            </button>

            <button
              type="button"
              onClick={aoAbrirModalPerfil}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                perfil.conectado
                  ? 'border-ciano-borda bg-ciano-suave text-ciano-tecnico shadow-ciano'
                  : 'border-ciano-tecnico bg-ciano-tecnico text-grafite-fundo hover:opacity-90'
              }`}
            >
              {perfil.conectado ? (
                <>
                  <UserCheck className="h-4 w-4" />
                  <span>{perfil.apelido}</span>
                  <span className="rounded bg-grafite-fundo/80 px-1.5 py-0.5 font-mono text-[11px] text-ciano-tecnico">
                    {perfil.codigoVerificacao} • {pesoVotoUsuario.toFixed(1)}x
                  </span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Conectar Perfil</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hero Magnético — Explicação de 15 Segundos */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <div className="mb-3 inline-flex flex-wrap items-center gap-2 rounded-full border border-ciano-borda bg-ciano-suave px-3 py-1 font-mono text-xs text-ciano-tecnico">
              <Sparkles className="h-3.5 w-3.5" />
              <span>PROTOCOLO ANTITRIBAL • 100% CÓDIGO ABERTO • AUDITORIA PÚBLICA</span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-gelo-principal sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
              Acha que o seu lado fala a verdade?{' '}
              <span className="text-ciano-tecnico">
                Prove com código aberto ou seja auditado ao vivo.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gelo-secundario sm:text-base">
              No <strong className="font-mono text-ciano-tecnico">{configuracaoLinks.hashtagOficial}</strong>,
              narrativa sem fonte não sobrevive. Qualquer pessoa audita vídeos políticos com prompts públicos,
              compara quais modelos de IA são mais fiéis e desmascara quem edita comentários ou corta frases
              fora de contexto.
            </p>

            {/* 3 Passos em 15 segundos */}
            <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
              <div className="rounded-lg border border-grafite-borda bg-grafite-cartao/90 p-3">
                <span className="font-mono text-xs font-bold text-ciano-tecnico">01 // PUBLIQUE</span>
                <p className="mt-1 text-xs text-gelo-secundario">
                  Poste um corte com <strong className="text-gelo-principal">{configuracaoLinks.hashtagOficial}</strong> e
                  link da gravação bruta sem edição.
                </p>
              </div>
              <div className="rounded-lg border border-grafite-borda bg-grafite-cartao/90 p-3">
                <span className="font-mono text-xs font-bold text-ambar-alerta">02 // PROVE NA HORA</span>
                <p className="mt-1 text-xs text-gelo-secundario">
                  Cole nos comentários o relatório da IA declarando modelo, prompt e tokens gastos.
                </p>
              </div>
              <div className="rounded-lg border border-grafite-borda bg-grafite-cartao/90 p-3">
                <span className="font-mono text-xs font-bold text-coral-reprovado">03 // TRIBUNAL ABERTO</span>
                <p className="mt-1 text-xs text-gelo-secundario">
                  Manipulou prompt ou apagou alerta? Vai para o Mural de Desclassificados.
                </p>
              </div>
            </div>

            {/* Botões de Ação Rápida */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#checador"
                onClick={() => aoNavegarAba('checador')}
                className="inline-flex items-center gap-2 rounded-lg bg-ciano-tecnico px-4 py-2.5 text-sm font-bold text-grafite-fundo shadow-ciano transition hover:opacity-90"
              >
                <span>Checar Mensagem ou Vídeo Agora</span>
              </a>
              <a
                href="#arena"
                onClick={() => aoNavegarAba('arena')}
                className="inline-flex items-center gap-2 rounded-lg border border-grafite-borda bg-grafite-cartao px-4 py-2.5 text-sm font-semibold text-gelo-principal transition hover:border-ciano-borda hover:text-ciano-tecnico"
              >
                <span>Submeter Minha Postagem</span>
              </a>
              <a
                href="#censo"
                onClick={() => aoNavegarAba('censo')}
                className="inline-flex items-center gap-2 rounded-lg border border-ambar-borda bg-ambar-suave px-4 py-2.5 text-sm font-semibold text-ambar-alerta transition hover:border-ambar-alerta"
              >
                <span>Censo Cívico Anônimo</span>
              </a>
            </div>
          </div>

          {/* Painel de Telemetria da Caixa-Preta */}
          <div className="lg:col-span-5">
            <div className="rounded-xl border border-grafite-borda bg-grafite-cartao p-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-grafite-sutil pb-3">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-gelo-mutado">
                  Telemetria Pública em Tempo Real
                </span>
                <button
                  type="button"
                  onClick={lidarCopiarHashtag}
                  className="inline-flex items-center gap-1.5 rounded border border-grafite-borda bg-grafite-fundo px-2.5 py-1 font-mono text-xs text-ciano-tecnico transition hover:border-ciano-borda"
                >
                  {hashtagCopiada ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>{configuracaoLinks.hashtagOficial}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-grafite-sutil bg-grafite-fundo/80 p-3.5">
                  <span className="block font-mono text-[11px] uppercase text-gelo-mutado">
                    Cortes Auditados
                  </span>
                  <span className="mt-1 block font-mono text-2xl font-bold text-ciano-tecnico">
                    {formatarInteiro(metricasGlobais.totalCortesAuditados)}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-gelo-mutado">
                    5 redes monitoradas
                  </span>
                </div>

                <div className="rounded-lg border border-grafite-sutil bg-grafite-fundo/80 p-3.5">
                  <span className="block font-mono text-[11px] uppercase text-gelo-mutado">
                    Fidelidade Média
                  </span>
                  <span className="mt-1 block font-mono text-2xl font-bold text-gelo-principal">
                    {formatarPercentual(metricasGlobais.fidelidadeMediaGlobal)}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-ciano-tecnico">
                    Prompts verificáveis
                  </span>
                </div>

                <div className="rounded-lg border border-grafite-sutil bg-grafite-fundo/80 p-3.5">
                  <span className="block font-mono text-[11px] uppercase text-gelo-mutado">
                    Fraudes Barradas
                  </span>
                  <span className="mt-1 block font-mono text-2xl font-bold text-coral-reprovado">
                    {formatarInteiro(metricasGlobais.fraudesInterceptadas)}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-gelo-mutado">
                    Mural público ativo
                  </span>
                </div>

                <div className="rounded-lg border border-grafite-sutil bg-grafite-fundo/80 p-3.5">
                  <span className="block font-mono text-[11px] uppercase text-gelo-mutado">
                    Censo Anônimo
                  </span>
                  <span className="mt-1 block font-mono text-2xl font-bold text-ambar-alerta">
                    {formatarInteiro(metricasGlobais.participantesCenso)}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-gelo-mutado">
                    Hash SHA-256 local
                  </span>
                </div>
              </div>

              {/* Barra Direta de Redes Oficiais + Repositório GitHub */}
              <div className="mt-4 border-t border-grafite-sutil pt-3.5">
                <span className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-gelo-mutado">
                  Canais Oficiais & Código-Fonte Auditável
                </span>
                <div className="flex flex-wrap gap-2">
                  {listaRedesOficiais.map((rede) => (
                    <a
                      key={rede.chave}
                      href={rede.urlPerfil}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-grafite-borda bg-grafite-elevado px-2.5 py-1.5 text-xs font-medium text-gelo-secundario transition hover:border-ciano-borda hover:text-ciano-tecnico"
                    >
                      <span>{rede.nome}</span>
                      <ExternalLink className="h-3 w-3 opacity-70" />
                    </a>
                  ))}
                  <a
                    href={configuracaoLinks.repositorioGithub}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-ciano-borda bg-ciano-suave px-2.5 py-1.5 font-mono text-xs font-semibold text-ciano-tecnico transition hover:bg-ciano-tecnico hover:text-grafite-fundo"
                  >
                    <GitBranch className="h-3.5 w-3.5" />
                    <span>GitHub Oficial</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
