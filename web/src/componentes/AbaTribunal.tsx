import React, { useState } from 'react';
import { Check, Copy, ExternalLink, ThumbsDown, ThumbsUp } from 'lucide-react';
import configuracaoLinks from '../dados/configuracaoLinks.json';
import type {
  CategoriaFalhaAuditoria,
  ItemTribunalAuditoria,
  PerfilUsuarioConectado,
} from '../tipos';
import { copiarParaAreaDeTransferencia, nomeRedeSocial } from '../utilitarios/formatadores';

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

export const AbaTribunal: React.FC<PropriedadesAbaTribunal> = ({
  itens,
  votosRealizados,
  aoVotarItem,
  aoRecompensarComentarioDesclassificatorio,
}) => {
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  const emAuditoria = itens.filter((i) => i.status !== 'desclassificado');
  const desclassificados = itens.filter((i) => i.status === 'desclassificado');

  const copiarComentarioDesclassificacao = async (item: ItemTribunalAuditoria) => {
    const motivo =
      item.categoriaFalha || 'Edição de comentário ou corte fora de contexto';
    const texto = `⚠️ POSTAGEM DESCLASSIFICADA NO ${configuracaoLinks.hashtagOficial} (${item.protocolo})\nMotivo constatado: ${motivo}.\nNo Desafio Prova Real não vale editar comentário nem cortar frase pela metade. Confira a auditoria pública em: ${configuracaoLinks.siteOficial}/#tribunal`;

    const ok = await copiarParaAreaDeTransferencia(texto);
    if (ok) {
      setCopiadoId(item.id);
      aoRecompensarComentarioDesclassificatorio(item.id);
      window.setTimeout(() => setCopiadoId(null), 3000);
    }
  };

  return (
    <section aria-labelledby="titulo-tribunal" className="space-y-6">
      {/* Cabeçalho Direto */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 id="titulo-tribunal" className="text-xl font-bold text-slate-900 sm:text-2xl">
          Fiscalização Comunitária & Mural de Desclassificados
        </h2>
        <p className="mt-1.5 text-base text-slate-600">
          Confira se as postagens respeitaram o vídeo original. Se alguém editou o comentário ou
          manipulou o prompt, copie o aviso oficial abaixo e cole nos comentários da postagem.
        </p>
      </div>

      {/* Mural de Desclassificados */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-lg font-bold text-slate-900">
          Mural de Desclassificados ({desclassificados.length})
        </h3>
        <div className="mt-4 space-y-4">
          {desclassificados.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-900">
                  {item.autorApelido} • {nomeRedeSocial(item.redeSocial)}
                </span>
                <span className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                  Desclassificado
                </span>
              </div>
              <p className="mt-1.5 text-base font-medium text-slate-800">{item.tituloCorte}</p>
              <p className="mt-1 text-sm text-slate-600">
                <strong>Falha:</strong> {item.categoriaFalha || 'Manipulação constatada'} —{' '}
                {item.motivoFalha}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    void copiarComentarioDesclassificacao(item);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {copiadoId === item.id ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Comentário Copiado! Cole lá na postagem</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copiar Comentário de Desclassificação</span>
                    </>
                  )}
                </button>

                <a
                  href={item.urlPostagem}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 underline hover:text-slate-950"
                >
                  <span>Abrir postagem</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Postagens em Conferência */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-lg font-bold text-slate-900">
          Postagens em Conferência ({emAuditoria.length})
        </h3>
        <div className="mt-4 space-y-4">
          {emAuditoria.map((item) => {
            const voto = votosRealizados[item.id];
            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
                  <span className="font-semibold text-slate-900">
                    {item.autorApelido} ({nomeRedeSocial(item.redeSocial)})
                  </span>
                  <span>IA declarada: {item.modeloDeclarado}</span>
                </div>

                <p className="mt-1 text-base font-semibold text-slate-900">{item.tituloCorte}</p>

                <div className="mt-2 flex flex-wrap gap-4 text-sm">
                  <a
                    href={item.urlPostagem}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-slate-700 underline hover:text-slate-950"
                  >
                    <span>1. Ver corte publicado</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href={item.urlVideoOriginal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-slate-700 underline hover:text-slate-950"
                  >
                    <span>2. Conferir vídeo original completo</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    disabled={Boolean(voto)}
                    onClick={() => aoVotarItem(item.id, 'aprovar')}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-semibold transition ${
                      voto === 'aprovar'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100 disabled:opacity-50'
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>Está Fiel ao Original</span>
                  </button>

                  <button
                    type="button"
                    disabled={Boolean(voto)}
                    onClick={() =>
                      aoVotarItem(item.id, 'reprovar', 'Corte fora de contexto sem fonte bruta')
                    }
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-semibold transition ${
                      voto === 'reprovar'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100 disabled:opacity-50'
                    }`}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span>Sinalizar Manipulação</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
