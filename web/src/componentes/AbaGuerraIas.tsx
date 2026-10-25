import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Calculator,
  Cpu,
  Filter,
  Layers,
  LockOpen,
  TrendingUp,
} from 'lucide-react';
import type { ModeloIaPlacar, RedeSocialChave, RedeSocialFiltro } from '../tipos';
import {
  formatarInteiro,
  formatarMoedaReais,
  formatarPercentual,
} from '../utilitarios/formatadores';

interface PropriedadesAbaGuerraIas {
  modelos: ModeloIaPlacar[];
}

type CriterioOrdenacao = 'fidelidade' | 'cortes' | 'custo_medio';

const OPCOES_FILTRO_REDE: Array<{ valor: RedeSocialFiltro; rotulo: string }> = [
  { valor: 'todas', rotulo: 'Todas as Redes' },
  { valor: 'tiktok', rotulo: 'TikTok' },
  { valor: 'instagram', rotulo: 'Instagram' },
  { valor: 'youtube', rotulo: 'YouTube' },
  { valor: 'x', rotulo: 'X' },
  { valor: 'facebook', rotulo: 'Facebook' },
];

const TODAS_CHAVES_REDE: RedeSocialChave[] = [
  'tiktok',
  'instagram',
  'youtube',
  'x',
  'facebook',
];

export const AbaGuerraIas: React.FC<PropriedadesAbaGuerraIas> = ({ modelos }) => {
  const [filtroRede, setFiltroRede] = useState<RedeSocialFiltro>('todas');
  const [ordenacao, setOrdenacao] = useState<CriterioOrdenacao>('fidelidade');

  // Estados da Calculadora Interativa de Custo de Tokens em R$
  const [idModeloCalc, setIdModeloCalc] = useState<string>(modelos[0]?.id || 'claude-sonnet');
  const [minutosPorCorte, setMinutosPorCorte] = useState<number>(3);
  const [quantidadeCortes, setQuantidadeCortes] = useState<number>(15);
  const [cotacaoDolar, setCotacaoDolar] = useState<number>(5.8);

  const modelosConsolidados = useMemo(() => {
    const calculados = modelos.map((modelo) => {
      if (filtroRede !== 'todas') {
        const dadosRede = modelo.porRede[filtroRede];
        const custoMedio =
          dadosRede.cortesAuditados > 0
            ? dadosRede.custoTotalReais / dadosRede.cortesAuditados
            : 0;
        return {
          ...modelo,
          cortesAuditados: dadosRede.cortesAuditados,
          taxaFidelidade: dadosRede.taxaFidelidade,
          tokensTotais: dadosRede.tokensTotais,
          custoTotalReais: dadosRede.custoTotalReais,
          custoMedioPorCorte: custoMedio,
        };
      }

      let somaCortes = 0;
      let somaFidelidadePonderada = 0;
      let somaTokens = 0;
      let somaCusto = 0;

      for (const chave of TODAS_CHAVES_REDE) {
        const r = modelo.porRede[chave];
        somaCortes += r.cortesAuditados;
        somaFidelidadePonderada += r.taxaFidelidade * r.cortesAuditados;
        somaTokens += r.tokensTotais;
        somaCusto += r.custoTotalReais;
      }

      const fidelidadeMedia = somaCortes > 0 ? somaFidelidadePonderada / somaCortes : 0;
      const custoMedio = somaCortes > 0 ? somaCusto / somaCortes : 0;

      return {
        ...modelo,
        cortesAuditados: somaCortes,
        taxaFidelidade: fidelidadeMedia,
        tokensTotais: somaTokens,
        custoTotalReais: somaCusto,
        custoMedioPorCorte: custoMedio,
      };
    });

    return calculados.sort((a, b) => {
      if (ordenacao === 'fidelidade') return b.taxaFidelidade - a.taxaFidelidade;
      if (ordenacao === 'cortes') return b.cortesAuditados - a.cortesAuditados;
      return a.custoMedioPorCorte - b.custoMedioPorCorte;
    });
  }, [modelos, filtroRede, ordenacao]);

  const maiorVolumeCortes = useMemo(
    () => Math.max(...modelosConsolidados.map((m) => m.cortesAuditados), 1),
    [modelosConsolidados]
  );

  // Cálculo estimado realista: ~2.600 tokens de entrada por minuto de transcrição + contexto oficial e ~1.100 tokens de relatório auditado na saída
  const estimativaCalculadora = useMemo(() => {
    const tokensEntradaPorCorte = Math.round(minutosPorCorte * 2600 + 1400);
    const tokensSaidaPorCorte = 1150;
    const tokensTotaisPorCorte = tokensEntradaPorCorte + tokensSaidaPorCorte;

    const comparativoTodos = modelos.map((m) => {
      const custoUsdUnitario =
        (tokensEntradaPorCorte / 1_000_000) * m.custoEntradaPorMilhaoUsd +
        (tokensSaidaPorCorte / 1_000_000) * m.custoSaidaPorMilhaoUsd;
      const custoReaisUnitario = custoUsdUnitario * cotacaoDolar;
      const custoReaisTotal = custoReaisUnitario * quantidadeCortes;
      return {
        id: m.id,
        nome: m.nome,
        pesosAbertos: m.pesosAbertos,
        custoReaisUnitario,
        custoReaisTotal,
      };
    });

    const selecionado =
      comparativoTodos.find((item) => item.id === idModeloCalc) || comparativoTodos[0];

    return {
      tokensEntradaPorCorte,
      tokensSaidaPorCorte,
      tokensTotaisPorCorte,
      tokensTotaisCampanha: tokensTotaisPorCorte * quantidadeCortes,
      selecionado,
      comparativoTodos,
    };
  }, [modelos, idModeloCalc, minutosPorCorte, quantidadeCortes, cotacaoDolar]);

  return (
    <section aria-labelledby="titulo-guerra-ias" className="space-y-8">
      {/* Cabeçalho da Aba e Filtros */}
      <div className="rounded-2xl border border-grafite-borda bg-grafite-cartao p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase text-ciano-tecnico">
              <Cpu className="h-4 w-4" />
              <span>BENCHMARK PÚBLICO DE AUDITORIA CÍVICA</span>
            </div>
            <h2 id="titulo-guerra-ias" className="mt-1 text-xl font-bold text-gelo-principal sm:text-2xl">
              Guerra das IAs — Qual Modelo Não Cai em Narrativa?
            </h2>
            <p className="mt-1 text-sm text-gelo-secundario">
              Comparativo real auditado pela comunidade medindo precisão contextual, consumo de tokens
              e custo em reais por checagem.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 font-mono text-xs text-gelo-mutado">
              <ArrowUpDown className="h-3.5 w-3.5" />
              Ordenar por:
            </span>
            <button
              type="button"
              onClick={() => setOrdenacao('fidelidade')}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                ordenacao === 'fidelidade'
                  ? 'border-ciano-tecnico bg-ciano-suave text-ciano-tecnico'
                  : 'border-grafite-borda bg-grafite-elevado text-gelo-secundario hover:text-gelo-principal'
              }`}
            >
              Maior Fidelidade (%)
            </button>
            <button
              type="button"
              onClick={() => setOrdenacao('cortes')}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                ordenacao === 'cortes'
                  ? 'border-ciano-tecnico bg-ciano-suave text-ciano-tecnico'
                  : 'border-grafite-borda bg-grafite-elevado text-gelo-secundario hover:text-gelo-principal'
              }`}
            >
              Cortes Auditados
            </button>
            <button
              type="button"
              onClick={() => setOrdenacao('custo_medio')}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                ordenacao === 'custo_medio'
                  ? 'border-ciano-tecnico bg-ciano-suave text-ciano-tecnico'
                  : 'border-grafite-borda bg-grafite-elevado text-gelo-secundario hover:text-gelo-principal'
              }`}
            >
              Menor Custo/Corte
            </button>
          </div>
        </div>

        {/* Filtro por Rede Social */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-grafite-sutil pt-4">
          <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase text-gelo-mutado">
            <Filter className="h-3.5 w-3.5 text-ciano-tecnico" />
            Filtrar Rede:
          </span>
          {OPCOES_FILTRO_REDE.map((opcao) => {
            const ativo = filtroRede === opcao.valor;
            return (
              <button
                key={opcao.valor}
                type="button"
                onClick={() => setFiltroRede(opcao.valor)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                  ativo
                    ? 'border-ciano-tecnico bg-ciano-tecnico text-grafite-fundo shadow-ciano'
                    : 'border-grafite-borda bg-grafite-fundo text-gelo-secundario hover:border-ciano-borda hover:text-gelo-principal'
                }`}
              >
                {opcao.rotulo}
              </button>
            );
          })}
        </div>
      </div>

      {/* Barras Comparativas Visuais */}
      <div className="grid gap-4 lg:grid-cols-2">
        {modelosConsolidados.map((modelo, indice) => {
          const larguraVolume = Math.max((modelo.cortesAuditados / maiorVolumeCortes) * 100, 8);
          const corBarraFidelidade =
            modelo.taxaFidelidade >= 94
              ? 'bg-ciano-tecnico'
              : modelo.taxaFidelidade >= 91
                ? 'bg-ambar-alerta'
                : 'bg-coral-reprovado';

          return (
            <div
              key={modelo.id}
              className="rounded-xl border border-grafite-borda bg-grafite-cartao p-5 transition hover:border-ciano-borda"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-grafite-elevado px-2 py-0.5 font-mono text-xs font-bold text-ciano-tecnico">
                      #{indice + 1}
                    </span>
                    <h3 className="text-lg font-bold text-gelo-principal">{modelo.nome}</h3>
                    {modelo.pesosAbertos && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-ciano-borda bg-ciano-suave px-2 py-0.5 font-mono text-[10px] font-semibold text-ciano-tecnico">
                        <LockOpen className="h-3 w-3" />
                        Pesos Abertos
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-gelo-mutado">
                    {modelo.fornecedor} • <span className="text-gelo-secundario">{modelo.destaque}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="block font-mono text-xl font-extrabold text-ciano-tecnico">
                    {formatarPercentual(modelo.taxaFidelidade)}
                  </span>
                  <span className="font-mono text-[11px] text-gelo-mutado">Taxa de Fidelidade</span>
                </div>
              </div>

              {/* Barra 1: Fidelidade */}
              <div className="mt-4 space-y-2">
                <div>
                  <div className="mb-1 flex justify-between font-mono text-[11px] text-gelo-secundario">
                    <span>Precisão sem distorção de contexto</span>
                    <span>{formatarPercentual(modelo.taxaFidelidade)}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-grafite-fundo">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${corBarraFidelidade}`}
                      style={{ width: `${Math.min(modelo.taxaFidelidade, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Barra 2: Volume Auditado */}
                <div>
                  <div className="mb-1 flex justify-between font-mono text-[11px] text-gelo-mutado">
                    <span>Volume de cortes auditados</span>
                    <span>{formatarInteiro(modelo.cortesAuditados)} cortes</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-grafite-fundo">
                    <div
                      className="h-full rounded-full bg-gelo-secundario/60 transition-all duration-500"
                      style={{ width: `${larguraVolume}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-grafite-sutil pt-3 font-mono text-xs">
                <div>
                  <span className="block text-[10px] uppercase text-gelo-mutado">Tokens Gastos</span>
                  <span className="font-bold text-gelo-principal">
                    {formatarInteiro(modelo.tokensTotais)}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-gelo-mutado">Custo Total</span>
                  <span className="font-bold text-gelo-principal">
                    {formatarMoedaReais(modelo.custoTotalReais)}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-gelo-mutado">Custo / Corte</span>
                  <span className="font-bold text-ambar-alerta">
                    {formatarMoedaReais(modelo.custoMedioPorCorte)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabela Consolidada Auditável */}
      <div className="overflow-hidden rounded-2xl border border-grafite-borda bg-grafite-cartao">
        <div className="flex items-center justify-between border-b border-grafite-sutil px-5 py-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-ciano-tecnico" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gelo-principal">
              Tabela Consolidada de Auditoria por Modelo
            </h3>
          </div>
          <span className="font-mono text-xs text-gelo-mutado">
            Escopo: {OPCOES_FILTRO_REDE.find((o) => o.valor === filtroRede)?.rotulo}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-grafite-sutil bg-grafite-fundo/70 font-mono text-xs uppercase text-gelo-mutado">
              <tr>
                <th className="px-5 py-3.5">Modelo de IA</th>
                <th className="px-4 py-3.5 text-right">Cortes Auditados</th>
                <th className="px-4 py-3.5 text-right">Taxa de Fidelidade</th>
                <th className="px-4 py-3.5 text-right">Total de Tokens</th>
                <th className="px-4 py-3.5 text-right">Custo Total (R$)</th>
                <th className="px-5 py-3.5 text-right">Custo Médio / Corte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grafite-sutil">
              {modelosConsolidados.map((m) => (
                <tr key={m.id} className="transition hover:bg-grafite-elevado/60">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-gelo-principal">{m.nome}</div>
                    <div className="text-xs text-gelo-mutado">{m.fornecedor}</div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-gelo-principal">
                    {formatarInteiro(m.cortesAuditados)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-ciano-tecnico">
                    {formatarPercentual(m.taxaFidelidade)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-gelo-secundario">
                    {formatarInteiro(m.tokensTotais)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-gelo-principal">
                    {formatarMoedaReais(m.custoTotalReais)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-bold text-ambar-alerta">
                    {formatarMoedaReais(m.custoMedioPorCorte)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calculadora Interativa de Custo de Tokens em Reais */}
      <div className="rounded-2xl border border-ciano-borda bg-grafite-cartao p-5 shadow-ciano sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-grafite-sutil pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ciano-suave text-ciano-tecnico">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gelo-principal">
                Calculadora Interativa de Custo de Auditoria (em R$)
              </h3>
              <p className="text-xs text-gelo-secundario">
                Descubra na hora quanto custa auditar seus próprios cortes usando API oficial — centavos por vídeo!
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-grafite-borda bg-grafite-fundo px-3 py-1 font-mono text-xs text-ciano-tecnico">
            <TrendingUp className="h-3.5 w-3.5" />
            Simulador em Tempo Real
          </span>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-12">
          {/* Controles */}
          <div className="space-y-4 lg:col-span-7">
            <div>
              <label
                htmlFor="seletor-modelo-calc"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gelo-secundario"
              >
                Escolha o Modelo para Simular
              </label>
              <select
                id="seletor-modelo-calc"
                value={idModeloCalc}
                onChange={(e) => setIdModeloCalc(e.target.value)}
                className="w-full rounded-xl border border-grafite-borda bg-grafite-fundo px-3.5 py-2.5 text-sm font-semibold text-gelo-principal focus:border-ciano-tecnico focus:outline-none"
              >
                {modelos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome} ({m.fornecedor}) — US$ {m.custoEntradaPorMilhaoUsd}/1M entrada
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-grafite-borda bg-grafite-fundo/70 p-3.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-gelo-secundario">Duração média do corte</span>
                  <span className="font-mono font-bold text-ciano-tecnico">{minutosPorCorte} min</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={1}
                  value={minutosPorCorte}
                  onChange={(e) => setMinutosPorCorte(Number(e.target.value))}
                  aria-label="Duração média do corte em minutos"
                  className="mt-2.5 w-full accent-[#00E5FF]"
                />
                <div className="mt-1 flex justify-between font-mono text-[10px] text-gelo-mutado">
                  <span>1 min (curto)</span>
                  <span>20 min (entrevista)</span>
                </div>
              </div>

              <div className="rounded-xl border border-grafite-borda bg-grafite-fundo/70 p-3.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-gelo-secundario">Quantidade de cortes</span>
                  <span className="font-mono font-bold text-ciano-tecnico">{quantidadeCortes} vídeos</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  step={1}
                  value={quantidadeCortes}
                  onChange={(e) => setQuantidadeCortes(Number(e.target.value))}
                  aria-label="Quantidade de cortes para auditar"
                  className="mt-2.5 w-full accent-[#00E5FF]"
                />
                <div className="mt-1 flex justify-between font-mono text-[10px] text-gelo-mutado">
                  <span>1 vídeo</span>
                  <span>100 vídeos</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-grafite-borda bg-grafite-fundo/70 px-4 py-3">
              <div>
                <span className="block text-xs font-semibold text-gelo-secundario">
                  Cotação Referencial do Dólar (R$)
                </span>
                <span className="text-[11px] text-gelo-mutado">
                  Estimativa inclui transcrição + prompt oficial + saída estruturada (~
                  {formatarInteiro(estimativaCalculadora.tokensTotaisPorCorte)} tokens/corte)
                </span>
              </div>
              <input
                type="number"
                step="0.05"
                min="3.5"
                max="10"
                value={cotacaoDolar}
                onChange={(e) => setCotacaoDolar(Math.max(1, Number(e.target.value) || 5.8))}
                aria-label="Cotação do dólar em reais"
                className="w-24 rounded-lg border border-grafite-borda bg-grafite-cartao px-3 py-1.5 text-right font-mono text-sm font-bold text-gelo-principal focus:border-ciano-tecnico focus:outline-none"
              />
            </div>
          </div>

          {/* Resultado Estimado + Comparativo */}
          <div className="flex flex-col justify-between rounded-xl border border-grafite-borda bg-grafite-fundo p-4 lg:col-span-5">
            <div>
              <span className="font-mono text-xs uppercase text-gelo-mutado">
                Investimento Estimado ({estimativaCalculadora.selecionado.nome})
              </span>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <span className="font-mono text-3xl font-extrabold text-ciano-tecnico">
                  {formatarMoedaReais(estimativaCalculadora.selecionado.custoReaisTotal)}
                </span>
                <span className="font-mono text-xs text-ambar-alerta">
                  {formatarMoedaReais(estimativaCalculadora.selecionado.custoReaisUnitario)} / corte
                </span>
              </div>
              <p className="mt-1 font-mono text-xs text-gelo-mutado">
                Volume total estimado: {formatarInteiro(estimativaCalculadora.tokensTotaisCampanha)} tokens
              </p>

              <div className="mt-4 space-y-2 border-t border-grafite-sutil pt-3">
                <span className="block font-mono text-[11px] uppercase text-gelo-mutado">
                  Mesma Carga nos Outros Modelos:
                </span>
                {estimativaCalculadora.comparativoTodos.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs ${
                      item.id === idModeloCalc
                        ? 'border border-ciano-borda bg-ciano-suave font-bold text-ciano-tecnico'
                        : 'bg-grafite-cartao/70 text-gelo-secundario'
                    }`}
                  >
                    <span>{item.nome}</span>
                    <span className="font-mono">{formatarMoedaReais(item.custoReaisTotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
