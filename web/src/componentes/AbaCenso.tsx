import React, { useMemo, useState } from 'react';
import { Lock } from 'lucide-react';
import type {
  FaixaRenda,
  NivelUsoIa,
  OcupacaoCenso,
  PrioridadeUrgente,
  RegiaoBrasil,
  RespostaCensoAnonima,
} from '../tipos';
import {
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
  const [regiao, setRegiao] = useState<RegiaoBrasil>('Sudeste');
  const [faixaRenda, setFaixaRenda] = useState<FaixaRenda>('De 2 a 5 salários mínimos');
  const [ocupacao, setOcupacao] = useState<OcupacaoCenso>('Trabalhador CLT / Setor Privado');
  const [prioridades, setPrioridades] = useState<PrioridadeUrgente[]>([
    'Custo de Vida',
    'Saúde',
    'Segurança Pública',
  ]);
  const [nivelUsoIa, setNivelUsoIa] = useState<NivelUsoIa>(
    'Uso ocasionalmente para tirar dúvidas'
  );
  const [cpfVolatil, setCpfVolatil] = useState('');
  const [erro, setErro] = useState('');
  const [protocoloConfirmado, setProtocoloConfirmado] = useState('');
  const [enviando, setEnviando] = useState(false);

  const alternarPrioridade = (item: PrioridadeUrgente) => {
    setErro('');
    setPrioridades((atual) => {
      if (atual.includes(item)) return atual.filter((p) => p !== item);
      if (atual.length >= 3) return atual;
      return [...atual, item];
    });
  };

  const enviarCenso = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (prioridades.length === 0) {
      setErro('Escolha pelo menos 1 prioridade para o Brasil.');
      return;
    }

    if (!validarCpfMatematicamente(cpfVolatil)) {
      setErro('Digite um CPF válido (ele não é salvo: serve apenas para evitar respostas repetidas de robôs).');
      return;
    }

    setEnviando(true);
    try {
      const hashAnonimo = await gerarProtocoloAnonimoCpf(cpfVolatil);
      // Apaga imediatamente o CPF da memória do navegador
      setCpfVolatil('');

      if (respostas.some((r) => r.protocoloHash === hashAnonimo)) {
        setErro('Este protocolo já participou do Censo Cívico (1 participação por pessoa).');
        return;
      }

      await aoRegistrarRespostaAnonima({
        protocoloHash: hashAnonimo,
        regiao,
        faixaRenda,
        ocupacao,
        prioridades,
        nivelUsoIa,
        registradoEm: new Date().toISOString(),
      });
      setProtocoloConfirmado(hashAnonimo.slice(0, 16).toUpperCase());
    } finally {
      setEnviando(false);
    }
  };

  const rankingPrioridades = useMemo(() => {
    const total = respostas.length;
    if (total < MINIMO_PRIVACIDADE_LGPD) return [];
    return PRIORIDADES_URGENTES.map((p) => {
      const qtd = respostas.filter((r) => r.prioridades.includes(p)).length;
      return { nome: p, qtd, pct: (qtd / total) * 100 };
    }).sort((a, b) => b.qtd - a.qtd);
  }, [respostas]);

  return (
    <section aria-labelledby="titulo-censo" className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 id="titulo-censo" className="text-xl font-bold text-slate-900 sm:text-2xl">
          Censo Cívico Anônimo — O que realmente importa para você?
        </h2>
        <p className="mt-1.5 text-base text-slate-600">
          Sem nenhuma pergunta sobre voto em políticos. Mapeamos apenas as prioridades reais da
          população respeitando 100% a Lei Geral de Proteção de Dados (LGPD).
        </p>

        {protocoloConfirmado ? (
          <div className="mt-5 rounded-xl border-2 border-slate-900 bg-slate-50 p-5">
            <p className="text-lg font-bold text-slate-900">
              ✓ Participação registrada com privacidade total!
            </p>
            <p className="mt-1 text-sm text-slate-700">
              Seu CPF foi apagado no seu próprio aparelho e virou apenas o protocolo anônimo{' '}
              <code>{protocoloConfirmado}...</code>
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              void enviarCenso(e);
            }}
            className="mt-5 space-y-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-base font-semibold text-slate-900">
                  1. Sua região do Brasil:
                </label>
                <select
                  value={regiao}
                  onChange={(e) => setRegiao(e.target.value as RegiaoBrasil)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 focus:border-slate-900 focus:outline-none"
                >
                  {REGIOES_BRASIL.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-base font-semibold text-slate-900">
                  2. Faixa de renda familiar:
                </label>
                <select
                  value={faixaRenda}
                  onChange={(e) => setFaixaRenda(e.target.value as FaixaRenda)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 focus:border-slate-900 focus:outline-none"
                >
                  {FAIXAS_RENDA.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-base font-semibold text-slate-900">
                  3. Ocupação atual:
                </label>
                <select
                  value={ocupacao}
                  onChange={(e) => setOcupacao(e.target.value as OcupacaoCenso)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 focus:border-slate-900 focus:outline-none"
                >
                  {OCUPACOES.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-base font-semibold text-slate-900">
                  4. Contato com Inteligência Artificial:
                </label>
                <select
                  value={nivelUsoIa}
                  onChange={(e) => setNivelUsoIa(e.target.value as NivelUsoIa)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 focus:border-slate-900 focus:outline-none"
                >
                  {NIVEIS_USO_IA.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <span className="mb-2 block text-base font-semibold text-slate-900">
                5. Escolha até 3 prioridades mais urgentes hoje ({prioridades.length}/3):
              </span>
              <div className="flex flex-wrap gap-2">
                {PRIORIDADES_URGENTES.map((item) => {
                  const ativo = prioridades.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => alternarPrioridade(item)}
                      className={`rounded-xl border px-4 py-2.5 text-base font-medium transition ${
                        ativo
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label
                htmlFor="cpf-censo"
                className="flex items-center gap-2 text-base font-semibold text-slate-900"
              >
                <Lock className="h-4 w-4 text-slate-600" />
                <span>6. Validação anti-robôs (seu CPF nunca sai do seu aparelho):</span>
              </label>
              <p className="mt-1 text-sm text-slate-600">
                O número vira um código embaralhado irreversível aqui mesmo no navegador e é apagado
                na hora.
              </p>
              <input
                id="cpf-censo"
                type="text"
                inputMode="numeric"
                value={cpfVolatil}
                onChange={(e) => setCpfVolatil(formatarMascaraCpf(e.target.value))}
                placeholder="000.000.000-00"
                className="mt-2.5 w-full max-w-xs rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>

            {erro && (
              <p className="rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-xl bg-slate-900 px-6 py-4 text-lg font-bold text-white transition hover:bg-slate-800"
            >
              {enviando ? 'Registrando...' : 'Enviar Minha Resposta Anônima'}
            </button>
          </form>
        )}
      </div>

      {/* Resultados Agregados */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-slate-900">
            Resultado Público Agregado ({formatarInteiro(respostas.length)} participantes)
          </h3>
          <span className="text-xs text-slate-500">Exibido apenas para grupos com 10+ pessoas</span>
        </div>

        <div className="mt-4 space-y-3">
          {rankingPrioridades.map((item) => (
            <div key={item.nome}>
              <div className="flex justify-between text-sm font-medium text-slate-800">
                <span>{item.nome}</span>
                <span>{formatarPercentual(item.pct)}</span>
              </div>
              <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-900"
                  style={{ width: `${Math.min(100, item.pct)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
