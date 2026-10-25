import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  KeyRound,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
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
  pesoVotoAtual,
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
  const [facebook, setFacebook] = useState(perfilAtual.redes.facebook || '');
  const [bioVerificada, setBioVerificada] = useState(perfilAtual.bioVerificada);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [erroValidacao, setErroValidacao] = useState('');

  if (!aberto) return null;

  const codigoCalculado =
    apelido.trim().length >= 3
      ? gerarCodigoVerificacaoBio(`${provedor}:${apelido.trim()}`)
      : perfilAtual.codigoVerificacao;

  const normalizarArroba = (valor: string): string => {
    const limpo = valor.trim();
    if (!limpo) return '';
    return limpo.startsWith('@') ? limpo : `@${limpo}`;
  };

  const copiarCodigoBio = async () => {
    const textoBio = `${codigoCalculado} #DesafioProvaReal`;
    const copiado = await copiarParaAreaDeTransferencia(textoBio);
    if (copiado) {
      setCodigoCopiado(true);
      window.setTimeout(() => setCodigoCopiado(false), 2400);
    }
  };

  const lidarSubmissao = (evento: React.FormEvent) => {
    evento.preventDefault();
    setErroValidacao('');

    const apelidoLimpo = normalizarArroba(apelido);
    if (apelidoLimpo.length < 3) {
      setErroValidacao('Informe seu @apelido público com pelo menos 3 caracteres.');
      return;
    }

    if (contaIdentidade.trim().length < 3) {
      setErroValidacao(
        provedor === 'github'
          ? 'Informe seu usuário do GitHub para vínculo público de auditoria.'
          : 'Informe seu identificador Google (e-mail público ou apelido verificado).'
      );
      return;
    }

    const novoPerfil: PerfilUsuarioConectado = {
      conectado: true,
      apelido: apelidoLimpo,
      provedorIdentidade: provedor,
      contaIdentidade: contaIdentidade.trim(),
      codigoVerificacao: codigoCalculado,
      bioVerificada,
      redes: {
        tiktok: normalizarArroba(tiktok),
        instagram: normalizarArroba(instagram),
        youtube: normalizarArroba(youtube),
        x: normalizarArroba(xRede),
        facebook: normalizarArroba(facebook),
      },
      pontosCacaFraudes: perfilAtual.pontosCacaFraudes,
      cortesSubmetidos: perfilAtual.cortesSubmetidos,
      conectadoEm: perfilAtual.conectadoEm || new Date().toISOString(),
    };

    aoSalvarPerfil(novoPerfil);
    aoFechar();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-perfil"
    >
      <div className="relative my-8 w-full max-w-2xl rounded-2xl border border-grafite-borda bg-grafite-cartao p-6 shadow-2xl">
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar janela de perfil unificado"
          className="absolute right-4 top-4 rounded-lg border border-grafite-borda bg-grafite-elevado p-1.5 text-gelo-mutado transition hover:text-gelo-principal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-ciano-borda bg-ciano-suave text-ciano-tecnico">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-ciano-tecnico">
              IDENTIDADE CÍVICA ANTI-ROBÔS
            </span>
            <h2 id="titulo-modal-perfil" className="text-xl font-bold text-gelo-principal">
              Conectar Perfil & Vincular Redes Sociais
            </h2>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-gelo-secundario sm:text-sm">
          Vincule sua conta <strong className="text-gelo-principal">GitHub</strong> ou{' '}
          <strong className="text-gelo-principal">Google</strong> e cadastre os seus <code className="text-ciano-tecnico">@</code>{' '}
          para somar pontos unificados na Arena e aumentar seu peso de voto no Tribunal Comunitário.
        </p>

        <form onSubmit={lidarSubmissao} className="mt-5 space-y-4">
          {/* Passo 1: Provedor de Identidade */}
          <div>
            <span className="mb-2 block font-mono text-xs font-semibold uppercase text-gelo-mutado">
              1. Escolha o Provedor Principal de Vínculo
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProvedor('github')}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                  provedor === 'github'
                    ? 'border-ciano-tecnico bg-ciano-suave text-ciano-tecnico'
                    : 'border-grafite-borda bg-grafite-elevado text-gelo-secundario hover:border-gelo-mutado'
                }`}
              >
                <span>Vincular com GitHub</span>
                <span className="rounded bg-grafite-fundo px-1.5 py-0.5 font-mono text-[10px] text-ciano-tecnico">
                  +Reputação Técnica
                </span>
              </button>

              <button
                type="button"
                onClick={() => setProvedor('google')}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                  provedor === 'google'
                    ? 'border-ciano-tecnico bg-ciano-suave text-ciano-tecnico'
                    : 'border-grafite-borda bg-grafite-elevado text-gelo-secundario hover:border-gelo-mutado'
                }`}
              >
                <span>Vincular com Google</span>
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="campo-apelido-arena"
                className="mb-1 block text-xs font-semibold text-gelo-secundario"
              >
                Seu @Apelido Unificado na Arena *
              </label>
              <input
                id="campo-apelido-arena"
                type="text"
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                placeholder="@seu.nome.auditor"
                className="w-full rounded-lg border border-grafite-borda bg-grafite-fundo px-3 py-2 text-sm text-gelo-principal placeholder:text-gelo-mutado focus:border-ciano-tecnico focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="campo-identidade-provedor"
                className="mb-1 block text-xs font-semibold text-gelo-secundario"
              >
                {provedor === 'github' ? 'Usuário do GitHub *' : 'Conta Google Verificada *'}
              </label>
              <input
                id="campo-identidade-provedor"
                type="text"
                value={contaIdentidade}
                onChange={(e) => setContaIdentidade(e.target.value)}
                placeholder={provedor === 'github' ? 'ex: dev-transparencia-br' : 'ex: cidadao.auditor@gmail.com'}
                className="w-full rounded-lg border border-grafite-borda bg-grafite-fundo px-3 py-2 text-sm text-gelo-principal placeholder:text-gelo-mutado focus:border-ciano-tecnico focus:outline-none"
              />
            </div>
          </div>

          {/* Passo 2: Arrobas nas Redes */}
          <div>
            <span className="mb-2 block font-mono text-xs font-semibold uppercase text-gelo-mutado">
              2. Seus @ nas Redes Sociais (Para Rastrear Seus Cortes da #DesafioProvaReal)
            </span>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-gelo-mutado">TikTok</label>
                <input
                  type="text"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="@seu.tiktok"
                  className="w-full rounded-lg border border-grafite-borda bg-grafite-fundo px-3 py-2 text-sm text-gelo-principal placeholder:text-gelo-mutado focus:border-ciano-tecnico focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gelo-mutado">Instagram</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@seu.instagram"
                  className="w-full rounded-lg border border-grafite-borda bg-grafite-fundo px-3 py-2 text-sm text-gelo-principal placeholder:text-gelo-mutado focus:border-ciano-tecnico focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gelo-mutado">YouTube</label>
                <input
                  type="text"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="@seu.canal"
                  className="w-full rounded-lg border border-grafite-borda bg-grafite-fundo px-3 py-2 text-sm text-gelo-principal placeholder:text-gelo-mutado focus:border-ciano-tecnico focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gelo-mutado">X (antigo Twitter)</label>
                <input
                  type="text"
                  value={xRede}
                  onChange={(e) => setXRede(e.target.value)}
                  placeholder="@seu.x"
                  className="w-full rounded-lg border border-grafite-borda bg-grafite-fundo px-3 py-2 text-sm text-gelo-principal placeholder:text-gelo-mutado focus:border-ciano-tecnico focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-2.5">
              <label className="mb-1 block text-xs text-gelo-mutado">Facebook (opcional)</label>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="@sua.pagina.facebook"
                className="w-full rounded-lg border border-grafite-borda bg-grafite-fundo px-3 py-2 text-sm text-gelo-principal placeholder:text-gelo-mutado focus:border-ciano-tecnico focus:outline-none"
              />
            </div>
          </div>

          {/* Passo 3: Código de Verificação PR-XXXX para Bio */}
          <div className="rounded-xl border border-ambar-borda bg-ambar-suave/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-ambar-alerta" />
                <span className="font-mono text-xs font-bold uppercase text-ambar-alerta">
                  3. Código Único de Posse de Conta (Cole na Bio)
                </span>
              </div>
              <span className="font-mono text-xs text-gelo-secundario">
                Peso atual de voto: <strong className="text-ciano-tecnico">{pesoVotoAtual.toFixed(1)}x</strong>
              </span>
            </div>

            <p className="mt-1.5 text-xs text-gelo-secundario">
              Para provar que os perfis informados pertencem a você (e impedir falsidade ideológica),
              cole este código curto na descrição/bio das suas redes sociais:
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <div className="rounded-lg border border-ciano-borda bg-grafite-fundo px-4 py-2 font-mono text-lg font-extrabold tracking-widest text-ciano-tecnico">
                {codigoCalculado}
              </div>

              <button
                type="button"
                onClick={copiarCodigoBio}
                className="inline-flex items-center gap-1.5 rounded-lg border border-grafite-borda bg-grafite-cartao px-3.5 py-2 text-xs font-bold text-gelo-principal transition hover:border-ciano-tecnico hover:text-ciano-tecnico"
              >
                {codigoCopiado ? (
                  <>
                    <Check className="h-4 w-4 text-ciano-tecnico" />
                    <span>Código Copiado p/ Bio!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copiar Código {codigoCalculado}</span>
                  </>
                )}
              </button>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-grafite-borda bg-grafite-fundo px-3 py-2 text-xs text-gelo-secundario">
                <input
                  type="checkbox"
                  checked={bioVerificada}
                  onChange={(e) => setBioVerificada(e.target.checked)}
                  className="h-4 w-4 accent-[#00E5FF]"
                />
                <span>Já inseri o código {codigoCalculado} na minha bio pública</span>
              </label>
            </div>
          </div>

          {erroValidacao && (
            <div className="flex items-center gap-2 rounded-lg border border-coral-borda bg-coral-suave px-3 py-2 text-xs font-medium text-coral-reprovado">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{erroValidacao}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-grafite-sutil pt-4">
            {perfilAtual.conectado ? (
              <button
                type="button"
                onClick={() => {
                  aoDesconectarPerfil();
                  aoFechar();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-coral-borda bg-coral-suave px-3 py-2 text-xs font-semibold text-coral-reprovado transition hover:opacity-90"
              >
                <LogOut className="h-4 w-4" />
                <span>Desconectar Perfil Neste Aparelho</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-gelo-mutado">
                <ShieldCheck className="h-4 w-4 text-ciano-tecnico" />
                <span>Armazenado localmente e sincronizado sob seu código {codigoCalculado}.</span>
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={aoFechar}
                className="rounded-lg border border-grafite-borda bg-grafite-elevado px-4 py-2 text-xs font-semibold text-gelo-secundario hover:text-gelo-principal"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-ciano-tecnico px-4 py-2 text-xs font-bold text-grafite-fundo shadow-ciano transition hover:opacity-90 sm:text-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Salvar & Ativar Perfil Auditor</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
