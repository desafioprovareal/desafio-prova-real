import React, { useState } from 'react';
import { Check, Copy, LogOut, X } from 'lucide-react';
import type { PerfilUsuarioConectado } from '../tipos';
import { gerarCodigoVerificacaoBio } from '../utilitarios/criptografia';
import { copiarParaAreaDeTransferencia } from '../utilitarios/formatadores';

interface PropriedadesModalPerfil {
  aberto: boolean;
  perfilAtual: PerfilUsuarioConectado;
  pesoVotoAtual: number;
  aoSalvarPerfil: (novoPerfil: PerfilUsuarioConectado) => void;
  aoDesconectarPerfil: () => void;
  aoFechar: () => void;
}

export const ModalPerfil: React.FC<PropriedadesModalPerfil> = ({
  aberto,
  perfilAtual,
  aoSalvarPerfil,
  aoDesconectarPerfil,
  aoFechar,
}) => {
  const [provedor, setProvedor] = useState<'github' | 'google'>(
    perfilAtual.provedorIdentidade || 'github'
  );
  const [contaIdentidade, setContaIdentidade] = useState(perfilAtual.contaIdentidade || '');
  const [apelido, setApelido] = useState(perfilAtual.apelido || '');
  const [tiktok, setTiktok] = useState(perfilAtual.redes.tiktok || '');
  const [instagram, setInstagram] = useState(perfilAtual.redes.instagram || '');
  const [youtube, setYoutube] = useState(perfilAtual.redes.youtube || '');
  const [xRede, setXRede] = useState(perfilAtual.redes.x || '');
  const [bioVerificada, setBioVerificada] = useState(perfilAtual.bioVerificada);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [erro, setErro] = useState('');

  if (!aberto) return null;

  const codigoCalculado =
    apelido.trim().length >= 3
      ? gerarCodigoVerificacaoBio(`${provedor}:${apelido.trim()}`)
      : perfilAtual.codigoVerificacao;

  const normalizar = (v: string) => {
    const l = v.trim();
    if (!l) return '';
    return l.startsWith('@') ? l : `@${l}`;
  };

  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    const ap = normalizar(apelido);
    if (ap.length < 3 || contaIdentidade.trim().length < 3) {
      setErro('Preencha seu @apelido e seu usuário GitHub ou Google.');
      return;
    }
    aoSalvarPerfil({
      conectado: true,
      apelido: ap,
      provedorIdentidade: provedor,
      contaIdentidade: contaIdentidade.trim(),
      codigoVerificacao: codigoCalculado,
      bioVerificada,
      redes: {
        tiktok: normalizar(tiktok),
        instagram: normalizar(instagram),
        youtube: normalizar(youtube),
        x: normalizar(xRede),
        facebook: perfilAtual.redes.facebook || '',
      },
      pontosCacaFraudes: perfilAtual.pontosCacaFraudes,
      cortesSubmetidos: perfilAtual.cortesSubmetidos,
      conectadoEm: perfilAtual.conectadoEm || new Date().toISOString(),
    });
    aoFechar();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-perfil"
    >
      <div className="relative my-8 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 id="titulo-perfil" className="text-xl font-bold text-slate-900">
          Vincular Meu Perfil para o Ranking
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Opcional — apenas para quem quer somar pontos publicando cortes ou auditando fraudes.
        </p>

        <form onSubmit={salvar} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setProvedor('github')}
              className={`rounded-lg border py-2.5 text-sm font-semibold ${
                provedor === 'github'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white text-slate-700'
              }`}
            >
              Usar GitHub
            </button>
            <button
              type="button"
              onClick={() => setProvedor('google')}
              className={`rounded-lg border py-2.5 text-sm font-semibold ${
                provedor === 'google'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white text-slate-700'
              }`}
            >
              Usar Google
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Seu @apelido no Ranking *
              </label>
              <input
                type="text"
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                placeholder="@seu_nome"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                {provedor === 'github' ? 'Usuário GitHub *' : 'E-mail Google *'}
              </label>
              <input
                type="text"
                value={contaIdentidade}
                onChange={(e) => setContaIdentidade(e.target.value)}
                placeholder={provedor === 'github' ? 'seu-usuario' : 'voce@gmail.com'}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={xRede}
              onChange={(e) => setXRede(e.target.value)}
              placeholder="@ no X (opcional)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@ no Instagram (opcional)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
            <input
              type="text"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              placeholder="@ no TikTok (opcional)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
            <input
              type="text"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              placeholder="@ no YouTube (opcional)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-slate-900">
                Código para bio: <code>{codigoCalculado}</code>
              </span>
              <button
                type="button"
                onClick={async () => {
                  if (
                    await copiarParaAreaDeTransferencia(`${codigoCalculado} #DesafioProvaReal`)
                  ) {
                    setCodigoCopiado(true);
                    window.setTimeout(() => setCodigoCopiado(false), 2000);
                  }
                }}
                className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800"
              >
                {codigoCopiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{codigoCopiado ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={bioVerificada}
                onChange={(e) => setBioVerificada(e.target.checked)}
                className="h-4 w-4 accent-slate-900"
              />
              <span>Já coloquei este código na minha bio</span>
            </label>
          </div>

          {erro && <p className="text-sm font-medium text-slate-900">{erro}</p>}

          <div className="flex items-center justify-between gap-2 pt-2">
            {perfilAtual.conectado ? (
              <button
                type="button"
                onClick={() => {
                  aoDesconectarPerfil();
                  aoFechar();
                }}
                className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 underline"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </button>
            ) : (
              <span />
            )}

            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
            >
              Salvar Perfil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
