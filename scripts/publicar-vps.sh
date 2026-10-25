#!/usr/bin/env bash
set -euo pipefail

# Publicação de 1 comando da API + Bot Monitor na VPS via SSH/Tailscale
# Uso: VPS_DESTINO=root@IP_OU_HOST_VPS ./scripts/publicar-vps.sh

VPS_DESTINO="${VPS_DESTINO:-}"
PASTA_REMOTA="${PASTA_REMOTA:-/opt/desafio-prova-real}"

if [ -z "$VPS_DESTINO" ]; then
  echo "❌ Defina VPS_DESTINO antes de executar. Exemplo:"
  echo "   VPS_DESTINO=root@seu-servidor ./scripts/publicar-vps.sh"
  exit 1
fi

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"

echo "📦 Sincronizando servidor blindado para ${VPS_DESTINO}:${PASTA_REMOTA}..."
ssh "$VPS_DESTINO" "mkdir -p '${PASTA_REMOTA}'"
rsync -avz --exclude 'node_modules' --exclude 'dados/*.db*' \
  "${RAIZ}/servidor/" "${VPS_DESTINO}:${PASTA_REMOTA}/"

echo "🚀 Subindo containers isolados (limite 512 MB RAM + Cloudflare Tunnel)..."
ssh "$VPS_DESTINO" "cd '${PASTA_REMOTA}' && \
  if [ ! -f .env ]; then cp .env.exemplo .env && echo '⚠️ Preencha ${PASTA_REMOTA}/.env e rode novamente.'; exit 0; fi && \
  docker compose -f docker-compose.vps.yml up -d --build && \
  docker compose -f docker-compose.vps.yml ps"

echo "✅ Publicação concluída! No Cloudflare Tunnel, aponte o subdomínio da API para http://api-prova-real:8787"
