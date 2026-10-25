export const SAL_DOMINIO_CENSO = 'dominio:desafioprovareal.pages.dev:censo-civico-lgpd:v1';

export function extrairApenasDigitosCpf(entrada: string): string {
  return entrada.replace(/\D/g, '').slice(0, 11);
}

export function formatarMascaraCpf(entrada: string): string {
  const digitos = extrairApenasDigitosCpf(entrada);
  if (digitos.length <= 3) return digitos;
  if (digitos.length <= 6) return `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
  if (digitos.length <= 9) {
    return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
  }
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9, 11)}`;
}

/**
 * Validação matemática oficial módulo 11 dos dígitos verificadores do CPF.
 * Executada 100% em memória volátil no navegador do cidadão.
 */
export function validarCpfMatematicamente(entrada: string): boolean {
  const cpf = extrairApenasDigitosCpf(entrada);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let somaPrimeiro = 0;
  for (let i = 0; i < 9; i += 1) {
    somaPrimeiro += Number(cpf[i]) * (10 - i);
  }
  let restoPrimeiro = (somaPrimeiro * 10) % 11;
  if (restoPrimeiro === 10 || restoPrimeiro === 11) {
    restoPrimeiro = 0;
  }
  if (restoPrimeiro !== Number(cpf[9])) {
    return false;
  }

  let somaSegundo = 0;
  for (let i = 0; i < 10; i += 1) {
    somaSegundo += Number(cpf[i]) * (11 - i);
  }
  let restoSegundo = (somaSegundo * 10) % 11;
  if (restoSegundo === 10 || restoSegundo === 11) {
    restoSegundo = 0;
  }
  return restoSegundo === Number(cpf[10]);
}

/**
 * Gera um protocolo anônimo irreversível usando Web Crypto API (SHA-256)
 * com sal de domínio público e zera imediatamente o buffer intermediário em memória.
 */
export async function gerarProtocoloAnonimoCpf(cpfBruto: string): Promise<string> {
  const digitos = extrairApenasDigitosCpf(cpfBruto);
  if (!validarCpfMatematicamente(digitos)) {
    throw new Error('CPF inválido pelos dígitos verificadores.');
  }

  const codificador = new TextEncoder();
  const carga = codificador.encode(`${SAL_DOMINIO_CENSO}:${digitos}`);

  try {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      const resumo = await window.crypto.subtle.digest('SHA-256', carga);
      const vetorHash = Array.from(new Uint8Array(resumo));
      return vetorHash.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    throw new Error('Web Crypto API indisponível neste navegador.');
  } finally {
    // Limpa explicitamente os bytes codificados da memória RAM
    carga.fill(0);
  }
}

/**
 * Gera um código curto de verificação de perfil no formato PR-XXXX
 * para o participante colar na bio de suas redes sociais.
 */
export function gerarCodigoVerificacaoBio(semente?: string): string {
  const alfabeto = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  if (semente && semente.trim().length > 0) {
    let acumulador = 2166136261;
    const texto = semente.trim().toLowerCase();
    for (let i = 0; i < texto.length; i += 1) {
      acumulador ^= texto.charCodeAt(i);
      acumulador = Math.imul(acumulador, 16777619);
    }
    let codigo = '';
    let valor = acumulador >>> 0;
    for (let i = 0; i < 4; i += 1) {
      codigo += alfabeto[valor % alfabeto.length];
      valor = Math.floor(valor / alfabeto.length);
    }
    return `PR-${codigo}`;
  }

  const aleatorio = new Uint8Array(4);
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(aleatorio);
  } else {
    for (let i = 0; i < 4; i += 1) {
      aleatorio[i] = Math.floor(Math.random() * 256);
    }
  }
  const sufixo = Array.from(aleatorio)
    .map((n) => alfabeto[n % alfabeto.length])
    .join('');
  return `PR-${sufixo}`;
}
