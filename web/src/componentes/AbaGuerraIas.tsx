import React, { useMemo, useState } from 'react';
import type { ModeloIaPlacar, RedeSocialChave, RedeSocialFiltro } from '../tipos';
import {
  formatarInteiro,
  formatarMoedaReais,
  formatarPercentual,
} from '../utilitarios/formatadores';

interface PropriedadesAbaGuerraIas {
  modelos: ModeloIaPlacar[];
}

const OPCOES_FILTRO_REDE: Array<{ valor: RedeSocialFiltro; rotulo: string }> = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'tiktok', rotulo: 'TikTok' },
  { valor: 'instagram', rotulo: 'Instagram' },
  { valor: 'youtube', rotulo: 'YouTube' },
  { valor: 'x', rotulo: 'X' },
  { valor: 'facebook', rotulo: 'Facebook' },
];

const TODAS_CHAVES_REDE: RedeSocialChave[] = ['tiktok', 'instagram', 'youtube', 'x', 'facebook'];

export const AbaGuerraIas: React.FC<PropriedadesAbaGuerraIas> = ({ modelos }) => {
  const [filtroRede, setFiltroRede] = useState<RedeSocialFiltro>('todas');

  const lista = useMemo(() => {
    return modelos
      .map((modelo) => {
        if (filtroRede !== 'todas') {
          const r = modelo.porRede[filtroRede];
          return {
            ...modelo,
            cortes: r.cortesAuditados,
            fidelidade: r.taxaFidelidade,
            custoMedio: r.cortesAuditados > 0 ? r.custoTotalReais / r.cortesAuditados : 0,
          };
        }
        let cortes = 0;
        let somaFid = 0;
        let somaCusto = 0;
        for (const c of TODAS_CHAVES_REDE) {
          const r = modelo.porRede[c];
          cortes += r.cortesAuditados;
          somaFid += r.taxaFidelidade * r.cortesAuditados;
          somaCusto += r.custoTotalReais;
        }
        return {
          ...modelo,
          cortes,
          fidelidade: cortes > 0 ? somaFid / cortes : 0,
          custoMedio: cortes > 0 ? somaCusto / cortes : 0,
        };
      })
      .sort((a, b) => b.fidelidade - a.fidelidade);
  }, [modelos, filtroRede]);

  return (
    <section aria-labelledby="titulo-comparativo-ias" className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 id="titulo-comparativo-ias" className="text-xl font-bold text-slate-900 sm:text-2xl">
          Qual Inteligência Artificial acerta mais gastando menos?
        </h2>
        <p className="mt-1.5 text-base text-slate-600">
          Comparativo público alimentado pelos cortes auditados na hashtag do desafio.
        </p>

        {/* Filtro Simples de Rede */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {OPCOES_FILTRO_REDE.map((op) => (
            <button
              key={op.valor}
              type="button"
              onClick={() => setFiltroRede(op.valor)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filtroRede === op.valor
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {op.rotulo}
            </button>
          ))}
        </div>

        {/* Tabela Limpa e Direta */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm sm:text-base">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3 pr-3">Modelo de IA</th>
                <th className="py-3 pr-3 text-right">Cortes Auditados</th>
                <th className="py-3 pr-3 text-right">Fidelidade aos Fatos</th>
                <th className="py-3 text-right">Custo Médio / Corte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lista.map((m, idx) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="py-4 pr-3">
                    <span className="font-bold text-slate-900">
                      {idx + 1}. {m.nome}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {m.fornecedor} • {m.destaque}
                    </span>
                  </td>
                  <td className="py-4 pr-3 text-right text-slate-700">
                    {formatarInteiro(m.cortes)}
                  </td>
                  <td className="py-4 pr-3 text-right font-bold text-slate-900">
                    {formatarPercentual(m.fidelidade)}
                  </td>
                  <td className="py-4 text-right text-slate-700">
                    {m.custoMedio === 0 ? 'Grátis (Aberto)' : formatarMoedaReais(m.custoMedio)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
