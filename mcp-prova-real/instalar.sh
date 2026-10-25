#!/usr/bin/env bash
set -euo pipefail

PASTA_MCP="$(cd "$(dirname "$0")" && pwd)"

echo "🔎 Instalando Servidor MCP Prova Real (#DesafioProvaReal)..."
cd "$PASTA_MCP"
npm install --omit=dev

echo ""
echo "Verificando ferramentas opcionais de vídeo no sistema:"
if command -v ffmpeg >/dev/null 2>&1; then
  echo "  ✅ ffmpeg encontrado: $(command -v ffmpeg)"
else
  echo "  ⚠️ ffmpeg não encontrado no PATH global (instale via 'sudo apt install ffmpeg' ou defina FFMPEG_BIN)."
fi

if command -v yt-dlp >/dev/null 2>&1; then
  echo "  ✅ yt-dlp encontrado: $(command -v yt-dlp)"
else
  echo "  ⚠️ yt-dlp não encontrado no PATH global (instale via 'pipx install yt-dlp' ou defina YTDLP_BIN)."
fi

echo ""
echo "✅ Instalação concluída! Cole a configuração abaixo no seu Claude Desktop, Gemini CLI ou Cursor:"
cat <<EOF
{
  "mcpServers": {
    "prova-real": {
      "command": "node",
      "args": ["${PASTA_MCP}/src/index.js"]
    }
  }
}
EOF
