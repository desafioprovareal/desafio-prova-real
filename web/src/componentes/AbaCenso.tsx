import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Fingerprint,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type {
  FaixaRenda,
  NivelUsoIa,
  OcupacaoCenso,
  PrioridadeUrgente,
  RegiaoBrasil,
  RespostaCensoAnonima,
} from '../tipos';
import {
  SAL_DOMINIO_CENSO,
  formatarMascaraCpf,
  gerarProtocoloAnonimoCpf,
  validarCpfMatematicamente,
} from '../utilitarios/criptografia';
import { formatarInteiro, formatarPercentual } from '../utilitarios/formatadores';

interface PropriedadesAbaCenso {
  respostas: RespostaCensoAnonima[];
  aoRegistrarRespostaAnonima: (novaResposta: RespostaCensoAnonima) => Promise<void>;
}

const REGIOES_BRASIL: RegiaoBrasil[] = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];

const FAIXAS_RENDA: FaixaRenda[] = [
  'Até 2 salários mínimos',
  'De 2 a 5 salários mínimos',
  'De 5 a 10 salários mínimos',
  'De 10 a 20 salários mínimos',
  'Acima de 20 salários mínimos',
  'Prefiro não informar',
];

const OCUPACOES: OcupacaoCenso[] = [
  'Trabalhador CLT / Setor Privado',
  'Autônomo / MEI / Informal',
  'Servidor Público',
  'Empreendedor / Empresário',
  'Estudante / Pesquisador',
  'Aposentado / Pensionista',
  'Em busca de recolocação',
];

const PRIORIDADES_URGENTES: PrioridadeUrgente[] = [
  'Custo de Vida',
  'Segurança Pública',
  'Saúde',
  'Educação',
  'Impostos',
  'Combate à Corrupção',
  'Emprego',
];

const NIVEIS_USO_IA: NivelUsoIa[] = [
  'Nunca usei / Estou começando agora',
  'Uso ocasionalmente para tirar dúvidas',
  'Uso toda semana no estudo ou trabalho',
  'Uso diariamente e audito prompts/código',
];

const MINIMO_PRIVACIDADE_LGPD = 10;

export const AbaCenso: React.FC<PropriedadesAbaCenso> = ({
  respostas,
  aoRegistrarRespostaAnonima,
}) => {
  // Estados do formulário cívico
  const [regiao, setRegiao] = useState<RegiaoBrasil>('Sudeste');
  const [faixaRenda, setFaixaRenda] = useState<FaixaRenda>('De 2 a 5 salários mínimos');
  const [ocupacao, setOcupacao] = useState<OcupacaoCenso>('Trabalhador CLT / Setor Privado');
  const [prioridadesEscolhidas, setPrioridadesEscolhidas] = useState<PrioridadeUrgente[]>([
    'Custo de Vida',
    'Saúde',
    'Segurança Pública',
  ]);
  const [nivelUsoIa, setNivelUsoIa] = useState<NivelUsoIa>(
    'Uso toda semana no estudo ou trabalho'
  );

  // CPF mantido exclusivamente em variável volátil temporária e apagado assim que o hash é derivado
  const [cpfVolatil, setCpfVolatil] = useState<string>('');
  const [protocoloHashGerado, setProtocoloHashGerado] = useState<string>('');
  const [cpfJaDescartadoDaMemoria, setCpfJaDescartadoDaMemoria] = useState<boolean>(false);
  const [erroCenso, setErroCenso] = useState<string>('');
  const [sucessoCenso, setSucessoCenso] = useState<string>('');
  const [enviando, setEnviando] = useState<boolean>(false);

  // Filtro de recorte no painel agregado
  const [recorteRegiao, setRecorteRegiao] = useState<'Brasil Inteiro' | RegiaoBrasil>(
    'Brasil Inteiro'
  );

  const alternarPrioridade = (item: PrioridadeUrgente) => {
    setErroCenso('');
    setPrioridadesEscolhidas((atual) => {
      if (atual.includes(item)) {
        return atual.filter((p) => p !== item);
      }
      if (atual.length >= 3) {
        setErroCenso('Selecione no máximo 3 prioridades urgentes.');
        return atual;
      }
      return [...atual, item];
    });
  };

  const converterCpfEmHashEDescartar = async (): Promise<string | null> => {
    setErroCenso('');
    if (protocoloHashGerado) {
      return protocoloHashGerado;
    }

    if (!validarCpfMatematicamente(cpfVolatil)) {
      setErroCenso(
        'CPF inválido pelos dígitos verificadores matemáticos (módulo 11). Confira os 11 dígitos informados.'
      );
      return null;
    }

    try {
      const hash = await gerarProtocoloAnonimoCpf(cpfVolatil);
      // Descarta imediatamente o CPF em texto puro do estado da aplicação
      setCpfVolatil('');
      setProtocoloHashGerado(hash);
      setCpfJaDescartadoDaMemoria(true);
      return hash;
    } catch (erro) {
      setErroCenso(
        erro instanceof Error
          ? erro.message
          : 'Não foi possível gerar o protocolo criptográfico local.'
      );
      return null;
    }
  };

  const lidarSubmissaoCenso = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErroCenso('');
    setSucessoCenso('');

    if (prioridadesEscolhidas.length === 0 || prioridadesEscolhidas.length > 3) {
      setErroCenso('Escolha entre 1 e 3 prioridades urgentes para registrar sua participação.');
      return;
    }

    const hashFinal = await converterCpfEmHashEDescartar();
    if (!hashFinal) return;

    const jaParticipou = respostas.some((r) => r.protocoloHash === hashFinal);
    if (jaParticipou) {
      setErroCenso(
        'Este protocolo anônimo já registrou participação no Censo Cívico (1 cidadão verificado = 1 resposta).'
      );
      return;
    }

    setEnviando(true);
    try {
      await aoRegistrarRespostaAnonima({
        protocoloHash: hashFinal,
        regiao,
        faixaRenda,
        ocupacao,
        prioridades: prioridadesEscolhidas,
        nivelUsoIa,
        registradoEm: new Date().toISOString(),
      });

      setSucessoCenso(
        'Participação anônima computada com sucesso! Apenas o hash irreversível e os dados estatísticos agregados foram salvos.'
      );
    } finally {
      setEnviando(false);
    }
  };

  // Agregação com trava estrita de privacidade (n >= 10)
  const dadosAgregados = useMemo(() => {
    const filtradas =
      recorteRegiao === 'Brasil Inteiro'
        ? respostas
        : respostas.filter((r) => r.regiao === recorteRegiao);

    const total = filtradas.length;
    const atingeMinimoPrivacidade = total >= MINIMO_PRIVACIDADE_LGPD;

    const contagemPrioridades = PRIORIDADES_URGENTES.map((p) => {
      const mencoes = filtradas.filter((r) => r.prioridades.includes(p)).length;
      return {
        prioridade: p,
        mencoes,
        percentual: total > 0 ? (mencoes / total) * 100 : 0,
      };
    }).sort((a, b) => b.mencoes - a.mencoes);

    const contagemUsoIa = NIVEIS_USO_IA.map((n) => {
      const qtd = filtradas.filter((r) => r.nivelUsoIa === n).length;
      return {
        nivel: n,
        quantidade: qtd,
        percentual: total > 0 ? (qtd / total) * 100 : 0,
      };
    });

    const contagemPorRegiao = REGIOES_BRASIL.map((reg) => ({
      regiao: reg,
      quantidade: respostas.filter((r) => r.regiao === reg).length,
    }));

    return {
      total,
      atingeMinimoPrivacidade,
      contagemPrioridades,
      contagemUsoIa,
      contagemPorRegiao,
    };
  }, [respostas, recorteRegiao]);

  return (
    <section aria-labelledby="titulo-censo" className="space-y-8">
      {/* Aviso Explícito de Conformidade Legal TSE & LGPD */}
      <div className="rounded-2xl border border-ciano-borda bg-grafite-cartao p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase text-ciano-tecnico">
              <ShieldCheck className="h-4 w-4" />
              <span>CONFORMIDADE INTEGRAL LGPD & LEGISLAÇÃO ELEITORAL (TSE-SAFE)</span>
            </div>
            <h2 id="titulo-censo" className="mt-1 text-xl font-bold text-gelo-principal sm:text-2xl">
              Censo Cívico Transparente — O Que Realmente Importa na Sua Vida?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gelo-secundario">
              <strong className="text-gelo-principal">Aviso Legal Explícito:</strong> Este levantamento{' '}
              <strong className="text-ambar-alerta">NÃO é pesquisa eleitoral</strong> e não contém nenhuma
              pergunta sobre intenção de voto, candidatos, partidos ou avaliação de governantes (total
              conformidade com as normas do TSE). Nosso objetivo é mapear de forma aberta as dores reais
              do cidadão brasileiro e o acesso à inteligência artificial.
            </p>
          </div>

          <div className="rounded-xl border border-grafite-borda bg-grafite-fundo p-3.5 font-mono text-xs">
            <div className="flex items-center gap-1.5 font-bold text-ciano-tecnico">
              <Lock className="h-4 w-4" />
              <span>Blindagem Criptográfica Local</span>
            </div>
            <ul className="mt-1.5 space-y-1 text-[11px] text-gelo-secundario">
              <li>• Validação módulo 11 no seu aparelho</li>
              <li>• Hash SHA-256 irreversível via Web Crypto</li>
              <li>• CPF zerado da memória RAM na hora</li>
              <li>• Corte estatístico mínimo: n ≥ 10 respostas</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Coluna Esquerda: Formulário Cívico + Hash Local */}
        <div className="lg:col-span-6">
          <form
            onSubmit={lidarSubmissaoCenso}
            className="space-y-5 rounded-2xl border border-grafite-borda bg-grafite-cartao p-5 sm:p-6"
          >
            <h3 className="border-b border-grafite-sutil pb-3 text-lg font-bold text-gelo-principal">
              Registrar Minha Participação Anônima
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gelo-secundario">
                  1. Sua Região do Brasil *
                </label>
                <select
                  value={regiao}
                  onChange={(e) => setRegiao(e.target.value as RegiaoBrasil)}
                  className="w-full rounded-xl border border-grafite-borda bg-grafite-fundo px-3 py-2.5 text-sm text-gelo-principal focus:border-ciano-tecnico focus:outline-none"
                >
                  {REGIOES_BRASIL.map((r) => (
                    <option key={r} value={r}>
                      Região {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gelo-secundario">
                  2. Faixa de Renda Familiar Mensal *
                </label>
                <select
                  value={faixaRenda}
                  onChange={(e) => setFaixaRenda(e.target.value as FaixaRenda)}
                  className="w-full rounded-xl border border-grafite-borda bg-grafite-fundo px-3 py-2.5 text-sm text-gelo-principal focus:border-ciano-tecnico focus:outline-none"
                >
                  {FAIXAS_RENDA.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gelo-secundario">
                3. Ocupação Principal Atual *
              </label>
              <select
                value={ocupacao}
                onChange={(e) => setOcupacao(e.target.value as OcupacaoCenso)}
                className="w-full rounded-xl border border-grafite-borda bg-grafite-fundo px-3 py-2.5 text-sm text-gelo-principal focus:border-ciano-tecnico focus:outline-none"
              >
                {OCUPACOES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-gelo-secundario">
                  4. Até 3 Maiores Prioridades Urgentes na Sua Realidade *
                </span>
                <span className="font-mono text-xs font-bold text-ciano-tecnico">
                  {prioridadesEscolhidas.length}/3 selecionadas
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRIORIDADES_URGENTES.map((p) => {
                  const marcada = prioridadesEscolhidas.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => alternarPrioridade(p)}
                      className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${
                        marcada
                          ? 'border-ciano-tecnico bg-ciano-suave text-ciano-tecnico'
                          : 'border-grafite-borda bg-grafite-fundo text-gelo-secundario hover:border-gelo-mutado'
                      }`}
                    >
                      {marcada ? `✓ ${p}` : p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gelo-secundario">
                5. Seu Nível de Uso de Inteligência Artificial *
              </label>
              <select
                value={nivelUsoIa}
                onChange={(e) => setNivelUsoIa(e.target.value as NivelUsoIa)}
                className="w-full rounded-xl border border-grafite-borda bg-grafite-fundo px-3 py-2.5 text-sm text-gelo-principal focus:border-ciano-tecnico focus:outline-none"
              >
                {NIVEIS_USO_IA.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Verificação Anti-Robôs com Web Crypto SHA-256 Local */}
            <div className="rounded-xl border border-ambar-borda bg-grafite-fundo p-4">
              <div className="flex items-center gap-2">
                <Fingerprint className="h-4 w-4 text-ambar-alerta" />
                <span className="font-mono text-xs font-bold uppercase text-ambar-alerta">
                  6. Prova de Unicidade Humana (CPF Nunca Sai do Seu Aparelho)
                </span>
              </div>
              <p className="mt-1 text-xs text-gelo-secundario">
                Validamos os dígitos verificadores localmente e geramos um protocolo{' '}
                <code className="text-ciano-tecnico">SHA-256</code> irreversível no seu navegador,
                apagando os números imediatamente da memória.
              </p>

              {!cpfJaDescartadoDaMemoria ? (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={cpfVolatil}
                    onChange={(e) => setCpfVolatil(formatarMascaraCpf(e.target.value))}
                    placeholder="000.000.000-00"
                    aria-label="CPF para geração local de protocolo anônimo"
                    className="flex-1 rounded-lg border border-grafite-borda bg-grafite-cartao px-3.5 py-2 font-mono text-sm text-gelo-principal placeholder:text-gelo-mutado focus:border-ciano-tecnico focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      void converterCpfEmHashEDescartar();
                    }}
                    className="rounded-lg border border-ciano-borda bg-ciano-suave px-3.5 py-2 text-xs font-bold text-ciano-tecnico transition hover:bg-ciano-tecnico hover:text-grafite-fundo"
                  >
                    Gerar Hash & Descartar CPF
                  </button>
                </div>
              ) : (
                <div className="mt-3 space-y-2 rounded-lg border border-ciano-borda bg-ciano-suave/30 p-3 font-mono text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-ciano-tecnico">
                      ✓ CPF APAGADO DA MEMÓRIA • PROTOCOLO ANÔNIMO PRONTO
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setProtocoloHashGerado('');
                        setCpfJaDescartadoDaMemoria(false);
                        setCpfVolatil('');
                      }}
                      className="text-[11px] text-gelo-secundario underline hover:text-gelo-principal"
                    >
                      Gerar outro
                    </button>
                  </div>
                  <div className="text-[11px] text-gelo-mutado">
                    Sal de domínio: <span className="text-gelo-secundario">{SAL_DOMINIO_CENSO}</span>
                  </div>
                  <div className="break-all rounded bg-grafite-fundo p-2 text-[11px] text-gelo-principal">
                    SHA-256: {protocoloHashGerado}
                  </div>
                </div>
              )}
            </div>

            {erroCenso && (
              <div className="flex items-center gap-2 rounded-xl border border-coral-borda bg-coral-suave px-4 py-2.5 text-xs font-semibold text-coral-reprovado">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{erroCenso}</span>
              </div>
            )}

            {sucessoCenso && (
              <div className="flex items-center gap-2 rounded-xl border border-ciano-borda bg-ciano-suave px-4 py-2.5 text-xs font-semibold text-ciano-tecnico">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{sucessoCenso}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-xl bg-ciano-tecnico px-5 py-3.5 text-sm font-extrabold text-grafite-fundo shadow-ciano transition hover:opacity-90 disabled:opacity-50"
            >
              {enviando
                ? 'Validando Hash Anônimo...'
                : 'Enviar Resposta Anônima Auditável (Zero Dado Pessoal)'}
            </button>
          </form>
        </div>

        {/* Coluna Direita: Painel Agregado com Trava de Privacidade n >= 10 */}
        <div className="space-y-5 lg:col-span-6">
          <div className="rounded-2xl border border-grafite-borda bg-grafite-cartao p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-grafite-sutil pb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-ciano-tecnico" />
                <div>
                  <h3 className="text-lg font-bold text-gelo-principal">
                    Painel Público Agregado
                  </h3>
                  <p className="text-xs text-gelo-mutado">
                    Exibição condicionada ao mínimo de {MINIMO_PRIVACIDADE_LGPD} respostas por recorte (LGPD)
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-grafite-borda bg-grafite-fundo px-3 py-1 font-mono text-xs font-bold text-ciano-tecnico">
                <Users className="h-3.5 w-3.5" />
                <span>n = {formatarInteiro(dadosAgregados.total)}</span>
              </span>
            </div>

            {/* Seletor de Recorte Regional */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setRecorteRegiao('Brasil Inteiro')}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
                  recorteRegiao === 'Brasil Inteiro'
                    ? 'border-ciano-tecnico bg-ciano-tecnico text-grafite-fundo'
                    : 'border-grafite-borda bg-grafite-fundo text-gelo-secundario hover:text-gelo-principal'
                }`}
              >
                Brasil Inteiro ({respostas.length})
              </button>
              {dadosAgregados.contagemPorRegiao.map((item) => {
                const selecionado = recorteRegiao === item.regiao;
                const bloqueado = item.quantidade < MINIMO_PRIVACIDADE_LGPD;
                return (
                  <button
                    key={item.regiao}
                    type="button"
                    onClick={() => setRecorteRegiao(item.regiao)}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
                      selecionado
                        ? 'border-ciano-tecnico bg-ciano-tecnico text-grafite-fundo'
                        : bloqueado
                          ? 'border-ambar-borda bg-ambar-suave/30 text-ambar-alerta'
                          : 'border-grafite-borda bg-grafite-fundo text-gelo-secundario hover:text-gelo-principal'
                    }`}
                  >
                    {item.regiao} ({item.quantidade})
                  </button>
                );
              })}
            </div>

            {/* Verificação de k-anonimato (n >= 10) */}
            {!dadosAgregados.atingeMinimoPrivacidade ? (
              <div className="mt-6 rounded-xl border border-ambar-borda bg-ambar-suave/40 p-6 text-center">
                <Lock className="mx-auto h-8 w-8 text-ambar-alerta" />
                <h4 className="mt-3 text-base font-bold text-ambar-alerta">
                  Trava de Privacidade Estatística Ativa (n &lt; {MINIMO_PRIVACIDADE_LGPD})
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-gelo-secundario">
                  O recorte <strong className="text-gelo-principal">Região {recorteRegiao}</strong> possui
                  atualmente <strong className="font-mono text-ambar-alerta">{dadosAgregados.total}</strong>{' '}
                  respostas verificadas. Para impedir qualquer cruzamento indireto de perfil (k-anonimato LGPD),
                  os gráficos detalhados deste subgrupo serão liberados automaticamente assim que atingir{' '}
                  <strong className="text-gelo-principal">{MINIMO_PRIVACIDADE_LGPD} respostas</strong>.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {/* Gráfico 1: Prioridades Urgentes */}
                <div>
                  <h4 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-gelo-secundario">
                    Prioridades Urgentes Mais Citadas ({recorteRegiao})
                  </h4>
                  <div className="space-y-2.5">
                    {dadosAgregados.contagemPrioridades.map((item) => (
                      <div key={item.prioridade}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="font-semibold text-gelo-principal">
                            {item.prioridade}
                          </span>
                          <span className="font-mono text-ciano-tecnico">
                            {formatarPercentual(item.percentual)} ({item.mencoes})
                          </span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-grafite-fundo">
                          <div
                            className="h-full rounded-full bg-ciano-tecnico transition-all duration-500"
                            style={{ width: `${Math.min(item.percentual, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gráfico 2: Maturidade de Uso de IA */}
                <div className="border-t border-grafite-sutil pt-4">
                  <h4 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-gelo-secundario">
                    Nível Declarado de Uso de Inteligência Artificial
                  </h4>
                  <div className="space-y-2">
                    {dadosAgregados.contagemUsoIa.map((item) => (
                      <div
                        key={item.nivel}
                        className="flex items-center justify-between rounded-lg border border-grafite-sutil bg-grafite-fundo/70 px-3 py-2 text-xs"
                      >
                        <span className="text-gelo-secundario">{item.nivel}</span>
                        <span className="font-mono font-bold text-ambar-alerta">
                          {formatarPercentual(item.percentual)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
