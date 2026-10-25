import type { RedeSocialChave } from '../tipos';

export function formatarInteiro(valor: number): string {
  return new Intl.NumberFormat('pt-BR').format(Math.round(valor));
}

export function formatarCompacto(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(valor);
}

export function formatarMoedaReais(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

export function formatarPercentual(valor: number): string {
  return `${valor.toFixed(1).replace('.', ',')}%`;
}

export function nomeRedeSocial(rede: RedeSocialChave): string {
  const mapa: Record<RedeSocialChave, string> = {
    tiktok: 'TikTok',
    instagram: 'Instagram',
    youtube: 'YouTube',
    x: 'X',
    facebook: 'Facebook',
  };
  return mapa[rede];
}

export function detectarRedePorUrl(url: string): RedeSocialChave | null {
  const limpa = url.toLowerCase();
  if (limpa.includes('tiktok.com')) return 'tiktok';
  if (limpa.includes('instagram.com')) return 'instagram';
  if (limpa.includes('youtube.com') || limpa.includes('youtu.be')) return 'youtube';
  if (limpa.includes('x.com') || limpa.includes('twitter.com')) return 'x';
  if (limpa.includes('facebook.com') || limpa.includes('fb.watch')) return 'facebook';
  return null;
}

export async function copiarParaAreaDeTransferencia(texto: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch {
    // Continua para o método alternativo compatível com navegadores móveis restritos
  }

  try {
    const elemento = document.createElement('textarea');
    elemento.value = texto;
    elemento.setAttribute('readonly', 'true');
    elemento.style.position = 'fixed';
    elemento.style.left = '-9999px';
    document.body.appendChild(elemento);
    elemento.select();
    const copiado = document.execCommand('copy');
    document.body.removeChild(elemento);
    return copiado;
  } catch {
    return false;
  }
}
