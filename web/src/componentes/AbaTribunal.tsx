import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileWarning,
  Scale,
  ShieldAlert,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import configuracaoLinks from '../dados/configuracaoLinks.json';
import type {
  CategoriaFalhaAuditoria,
  ItemTribunalAuditoria,
  PerfilUsuarioConectado,
} from '../tipos';
import {
  copiarParaAreaDeTransferencia,
  formatarInteiro,
  nomeRedeSocial,
} from '../utilitarios/formatadores';

interface PropriedadesAbaTribunal {
  itens: ItemTribunalAuditoria[];
  perfil: PerfilUsuarioConectado;
  pesoVotoUsuario: number;
  votosRealizados: Record<string, 'aprovar' | 'reprovar'>;
  comentariosCopiados: Record<string, boolean>;
  aoAbrirModalPerfil: () => void;
  aoVotarItem: (
    idItem: string,
    decisao: 'aprovar' | 'reprovar',
    categoriaFalha?: CategoriaFalhaAuditoria
  ) => void;
  aoRecompensarComentarioDesclassificatorio: (idItem: string) => void;
}

const OPCOES_FALHA: CategoriaFalhaAuditoria[] = [
  'Comentário editado após auditoria',
  'Prompt manipulado ou enviesado',
  'Corte fora de contexto sem fonte bruta',
  'Dados de tokens/modelo adulterados',
  'Omissão deliberada de contraditório factual',
];

export const AbaTribunal: React.FC<PropriedadesAbaTribunal> = ({
  itens,
  perfil,
  pesoVotoUsuario,
  votosRealizados,
  comentariosCopiados,
  aoAbrirModalPerfil,
  aoVotarItem,
  aoRecompensarComentarioDesclassificatorio,
}) => {
  const [falhaSelecionadaPorItem, setFalhaSelecionadaPorItem] = useState<
    Record<string, CategoriaFalhaAuditoria>
  >({});
  const [itemAbertoDenuncia, setItemAbertoDenuncia] = useState<string | null>(null);
  const [ultimoComentarioCopiado, setUltimoComentarioCopiado] = useState<{
    idItem: string;
    texto: string;
  } | null>(null);

  const itensEmAuditoria = itens.filter((i) => i.status !== 'desclassificado');
  const muralDesclassificados = itens.filter((i) => i.status === 'desclassificado');

  const gerarTextoComentarioDesclassificatorio = (item: ItemTribunalAuditoria): string => {
    const falha =
      item.categoriaFalha ||
      falhaSelecionadaPorItem[item.id] ||
      'Manipulação de contexto ou violação de auditoria aberta';
    const detalhe =
      item.motivoFalha ||
      'Divergência detectada entre o corte publicado, o prompt declarado e a fonte bruta original.';

    return `⚠️ AUDITORIA REPROVADA NO ${configuracaoLinks.hashtagOficial.toUpperCase()} [Protocolo ${item.protocolo}]
Falha técnica constatada: ${falha}.
Evidência registrada: ${detalhe}
No Desafio Prova Real não existe edição escondida nem prompt viciado. Confira o registro completo e audite você mesmo em: ${configuracaoLinks.siteOficial}/#tribunal`;
  };

  const lidarCopiarComentarioOficial = async (item: ItemTribunalAuditoria) => {
    const texto = gerarTextoComentarioDesclassificatorio(item);
    const sucesso = await copiarParaAreaDeTransferencia(texto);
    if (sucesso) {
      setUltimoComentarioCopiado({ idItem: item.id, texto });
      aoRecompensarComentarioDesclassificatorio(item.id);
    }
  };

  return (
    <section aria-labelledby="titulo-tribunal" className="space-y-8">
      {/* Painel Explicativo de Votação Ponderada Anti-Manada */}
      <div className="rounded-2xl border border-grafite-borda bg-grafite-cartao p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase text-ambar-alerta">
              <Scale className="h-4 w-4" />
              <span>TRIBUNAL COMUNITÁRIO & CAÇA-FRAUDES</span>
            </div>
            <h2 id="titulo-tribunal" className="mt-1 text-xl font-bold text-gelo-principal sm:text-2xl">
              Auditoria Ponderada por Reputação (Imune a Ataques Combinados)
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-gelo-secundario">
              Mutirões de militância e contas recém-criadas não conseguem derrubar postagens íntegras.
              No Tribunal da Caixa-Preta, o peso de cada voto depende do vínculo público de código e histórico
              comprovado de auditorias.
            </p>
          </div>

          <div className="shrink-0 rounded-xl border border-ciano-borda bg-grafite-fundo p-4 text-right">
            <span className="block font-mono text-[11px] uppercase text-gelo-mutado">
              Peso Atual do Seu Voto
            </span>
            <span className="font-mono text-2xl font-extrabold text-ciano-tecnico">
              {pesoVotoUsuario.toFixed(1)}x
            </span>
            {!perfil.conectado ? (
              <button
                type="button"
                onClick={aoAbrirModalPerfil}
                className="mt-1 block text-xs font-semibold text-ambar-alerta hover:underline"
              >
                Conectar Perfil p/ subir até 5.0x →
              </button>
            ) : (
              <span className="mt-0.5 block font-mono text-[11px] text-gelo-secundario">
                {perfil.bioVerificada ? 'Bio PR Verificada Ativa' : 'Valide sua Bio p/ bônus máximo'}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-3 border-t border-grafite-sutil pt-4 sm:grid-cols-3">
          <div className="rounded-lg border border-grafite-sutil bg-grafite-fundo/70 p-3 text-xs">
            <span className="font-mono font-bold text-gelo-mutado">NÍVEL 1 • VISITANTE (0.5x)</span>
            <p className="mt-1 text-gelo-secundario">
              Sem conta vinculada. Voto consultivo com trava anti-spam para impedir manadas coordenadas.
            </p>
          </div>
          <div className="rounded-lg border border-grafite-sutil bg-grafite-fundo/70 p-3 text-xs">
            <span className="font-mono font-bold text-ambar-alerta">
              NÍVEL 2 • IDENTIDADE VINCULADA (2.0x–3.0x)
            </span>
            <p className="mt-1 text-gelo-secundario">
              Conta Google/GitHub autenticada e arrobas vinculadas com código público <code className="text-ciano-tecnico">PR-XXXX</code>.
            </p>
          </div>
          <div className="rounded-lg border border-grafite-sutil bg-grafite-fundo/70 p-3 text-xs">
            <span className="font-mono font-bold text-ciano-tecnico">
              NÍVEL 3 • AUDITOR VETERANO (Até 5.0x)
            </span>
            <p className="mt-1 text-gelo-secundario">
              Bio verificada + GitHub ativo + histórico de cortes íntegros e caça-fraudes confirmadas.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback de Comentário Desclassificatório Copiado */}
      {ultimoComentarioCopiado && (
        <div className="rounded-xl border border-ciano-borda bg-ciano-suave/70 p-4 shadow-ciano">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-ciano-tecnico">
              <CheckCircle2 className="h-5 w-5" />
              <span>
                Comentário Desclassificatório Oficial copiado! Cole nos comentários da postagem auditada (+50 pts Caça-Fraudes creditados).
              </span>
            </div>
            <button
              type="button"
              onClick={() => setUltimoComentarioCopiado(null)}
              className="font-mono text-xs text-gelo-secundario hover:text-gelo-principal"
            >
              Fechar prévia
            </button>
          </div>
          <pre className="mt-2.5 whitespace-pre-wrap rounded-lg border border-grafite-borda bg-grafite-fundo p-3 font-mono text-xs text-gelo-principal">
            {ultimoComentarioCopiado.texto}
          </pre>
        </div>
      )}

      {/* Seção 1: Postagens em Auditoria Comunitária */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gelo-principal">
            <ShieldCheck className="h-5 w-5 text-ciano-tecnico" />
            <span>Postagens em Auditoria Comunitária ({itensEmAuditoria.length})</span>
          </h3>
          <span className="font-mono text-xs text-gelo-mutado">
            Conferência cruzada de vídeo bruto + prompt + tokens
          </span>
        </div>

        <div className="grid gap-4">
          {itensEmAuditoria.map((item) => {
            const somaPesos = Math.max(item.pesoAprovacao + item.pesoReprovacao, 0.1);
            const pctIntegro = (item.pesoAprovacao / somaPesos) * 100;
            const votoDoUsuario = votosRealizados[item.id];
            const sobSuspeita = item.pesoReprovacao > item.pesoAprovacao;

            return (
              <article
                key={item.id}
                className={`rounded-xl border bg-grafite-cartao p-5 transition ${
                  sobSuspeita ? 'border-ambar-borda' : 'border-grafite-borda'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-grafite-fundo px-2 py-0.5 font-mono text-xs font-bold text-ciano-tecnico">
                        {item.protocolo}
                      </span>
                      <span className="rounded bg-grafite-elevado px-2 py-0.5 font-mono text-xs text-gelo-secundario">
                        {nomeRedeSocial(item.redeSocial)}
                      </span>
                      <span className="font-mono text-xs text-gelo-mutado">
                        por <strong className="text-gelo-principal">{item.autorApelido}</strong> •{' '}
                        {item.criadoEm}
                      </span>
                    </div>
                    <h4 className="mt-2 text-base font-bold text-gelo-principal">
                      {item.tituloCorte}
                    </h4>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 font-mono text-xs font-bold ${
                      sobSuspeita
                        ? 'border-ambar-borda bg-ambar-suave text-ambar-alerta'
                        : 'border-ciano-borda bg-ciano-suave text-ciano-tecnico'
                    }`}
                  >
                    {sobSuspeita ? 'EM ALERTA DE AUDITORIA' : 'CONSENSO ÍNTEGRO'}
                  </span>
                </div>

                {/* Metadados Técnicos Declarados */}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gelo-secundario">
                  <span className="rounded border border-grafite-sutil bg-grafite-fundo px-2.5 py-1 font-mono">
                    Modelo: <strong className="text-gelo-principal">{item.modeloDeclarado}</strong>
                  </span>
                  <span className="rounded border border-grafite-sutil bg-grafite-fundo px-2.5 py-1 font-mono">
                    Tokens: <strong className="text-gelo-principal">{formatarInteiro(item.tokensDeclarados)}</strong>
                  </span>
                  <a
                    href={item.urlPostagem}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-ciano-tecnico hover:underline"
                  >
                    <span>Abrir Postagem</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href={item.urlVideoOriginal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-ambar-alerta hover:underline"
                  >
                    <span>Conferir Vídeo Bruto Original</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="mt-3 rounded-lg border border-grafite-sutil bg-grafite-fundo/80 p-3 font-mono text-xs text-gelo-mutado">
                  <span className="font-bold text-gelo-secundario">Prompt declarado: </span>
                  {item.promptDeclarado.length > 210
                    ? `${item.promptDeclarado.slice(0, 210)}...`
                    : item.promptDeclarado}
                </div>

                {item.motivoFalha && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-ambar-borda bg-ambar-suave/50 p-3 text-xs text-ambar-alerta">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <strong>{item.categoriaFalha || 'Sinalização Comunitária'}:</strong>{' '}
                      {item.motivoFalha}
                    </div>
                  </div>
                )}

                {/* Barra Ponderada de Consenso */}
                <div className="mt-4">
                  <div className="mb-1 flex justify-between font-mono text-xs">
                    <span className="text-ciano-tecnico">
                      Íntegro: {item.pesoAprovacao.toFixed(1)} pts de reputação ({pctIntegro.toFixed(0)}%)
                    </span>
                    <span className="text-coral-reprovado">
                      Suspeita/Falha: {item.pesoReprovacao.toFixed(1)} pts ({(100 - pctIntegro).toFixed(0)}%)
                    </span>
                  </div>
                  <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-coral-reprovado/40">
                    <div
                      className="h-full bg-ciano-tecnico transition-all duration-500"
                      style={{ width: `${pctIntegro}%` }}
                    />
                  </div>
                </div>

                {/* Ações de Votação + Botão Caça-Fraudes */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-grafite-sutil pt-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={Boolean(votoDoUsuario)}
                      onClick={() => aoVotarItem(item.id, 'aprovar')}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                        votoDoUsuario === 'aprovar'
                          ? 'border-ciano-tecnico bg-ciano-suave text-ciano-tecnico'
                          : 'border-grafite-borda bg-grafite-elevado text-gelo-principal hover:border-ciano-borda hover:text-ciano-tecnico disabled:opacity-50'
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>
                        {votoDoUsuario === 'aprovar'
                          ? 'Validado por Você'
                          : `Validar Integridade (+${pesoVotoUsuario.toFixed(1)}x)`}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={Boolean(votoDoUsuario)}
                      onClick={() =>
                        setItemAbertoDenuncia(itemAbertoDenuncia === item.id ? null : item.id)
                      }
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                        votoDoUsuario === 'reprovar'
                          ? 'border-coral-reprovado bg-coral-suave text-coral-reprovado'
                          : 'border-grafite-borda bg-grafite-elevado text-gelo-principal hover:border-coral-borda hover:text-coral-reprovado disabled:opacity-50'
                      }`}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                      <span>
                        {votoDoUsuario === 'reprovar'
                          ? 'Falha Sinalizada por Você'
                          : 'Apontar Adulteração / Fraude'}
                      </span>
                    </button>
                  </div>

                  {sobSuspeita && (
                    <button
                      type="button"
                      onClick={() => lidarCopiarComentarioOficial(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-ambar-borda bg-ambar-suave px-3.5 py-1.5 text-xs font-bold text-ambar-alerta transition hover:border-ambar-alerta"
                    >
                      {comentariosCopiados[item.id] ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {comentariosCopiados[item.id]
                          ? 'Comentário Copiado (+50 pts Recebidos)'
                          : 'Copiar Comentário Desclassificatório Oficial (+50 pts Caça-Fraudes)'}
                      </span>
                    </button>
                  )}
                </div>

                {/* Seletor de Categoria de Falha ao denunciar */}
                {itemAbertoDenuncia === item.id && !votoDoUsuario && (
                  <div className="mt-3 flex flex-col gap-2 rounded-xl border border-coral-borda bg-coral-suave/30 p-3 sm:flex-row sm:items-center">
                    <select
                      value={falhaSelecionadaPorItem[item.id] || OPCOES_FALHA[0]}
                      onChange={(e) =>
                        setFalhaSelecionadaPorItem((atual) => ({
                          ...atual,
                          [item.id]: e.target.value as CategoriaFalhaAuditoria,
                        }))
                      }
                      aria-label="Selecionar tipo exato de adulteração"
                      className="flex-1 rounded-lg border border-grafite-borda bg-grafite-fundo px-3 py-2 text-xs text-gelo-principal focus:border-coral-reprovado focus:outline-none"
                    >
                      {OPCOES_FALHA.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const cat = falhaSelecionadaPorItem[item.id] || OPCOES_FALHA[0];
                        aoVotarItem(item.id, 'reprovar', cat);
                        setItemAbertoDenuncia(null);
                      }}
                      className="rounded-lg bg-coral-reprovado px-4 py-2 text-xs font-bold text-grafite-fundo transition hover:opacity-90"
                    >
                      Confirmar Voto Reprovador ({pesoVotoUsuario.toFixed(1)}x)
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      {/* Seção 2: Mural de Desclassificados (Caixa-Preta de Fraudes Comprovadas) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-coral-reprovado">
              <FileWarning className="h-5 w-5" />
              <span>
                Mural Público de Desclassificados ({muralDesclassificados.length} fraudes comprovadas)
              </span>
            </h3>
            <p className="text-xs text-gelo-secundario">
              Contas que editaram comentário pós-checagem, adulteraram tokens ou manipularam contexto. Copie o laudo oficial em 1 clique e cole na postagem fraudada!
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {muralDesclassificados.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-coral-borda bg-grafite-cartao p-5 shadow-coral"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-coral-suave px-2.5 py-0.5 font-mono text-xs font-extrabold text-coral-reprovado">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      DESCLASSIFICADO • {item.protocolo}
                    </span>
                    <span className="rounded bg-grafite-elevado px-2 py-0.5 font-mono text-xs text-gelo-secundario">
                      {nomeRedeSocial(item.redeSocial)}
                    </span>
                    <span className="font-mono text-xs text-gelo-mutado">
                      Conta: <strong className="text-gelo-principal">{item.autorApelido}</strong> •{' '}
                      {item.criadoEm}
                    </span>
                  </div>
                  <h4 className="mt-2 text-base font-bold text-gelo-principal">
                    {item.tituloCorte}
                  </h4>
                </div>

                <span className="font-mono text-xs text-coral-reprovado">
                  Reprovação ponderada: {item.pesoReprovacao.toFixed(1)} pts ({item.totalVotos} auditores)
                </span>
              </div>

              <div className="mt-3 rounded-xl border border-coral-borda bg-coral-suave/30 p-3.5 text-xs">
                <div className="font-mono font-bold uppercase text-coral-reprovado">
                  Falha Exata Constatada: {item.categoriaFalha}
                </div>
                <p className="mt-1 text-sm text-gelo-principal">{item.motivoFalha}</p>
                {item.detalheProvaTecnica && (
                  <p className="mt-2 border-t border-coral-borda/40 pt-2 font-mono text-[11px] text-gelo-secundario">
                    Prova Técnica: {item.detalheProvaTecnica}
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs">
                  <a
                    href={item.urlPostagem}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-gelo-secundario hover:text-ciano-tecnico"
                  >
                    <span>Ver Postagem Auditada</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href={item.urlVideoOriginal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-ciano-tecnico hover:underline"
                  >
                    <span>Conferir Fonte Original</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => lidarCopiarComentarioOficial(item)}
                  className="inline-flex items-center gap-2 rounded-xl bg-coral-reprovado px-4 py-2.5 text-xs font-extrabold text-grafite-fundo transition hover:opacity-90 sm:text-sm"
                >
                  {comentariosCopiados[item.id] ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Comentário Copiado! (+50 pts Caça-Fraudes Creditados)</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copiar Comentário Desclassificatório Oficial (+50 pts Caça-Fraudes)</span>
                    </>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
