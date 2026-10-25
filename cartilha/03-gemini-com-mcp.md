# 🔵 Cartilha 03 — Google Gemini (Gemini CLI / AI Studio + MCP)

O **Google Gemini** tem uma vantagem enorme para o **#DesafioProvaReal**: janela de contexto gigantesca capaz de analisar debates inteiros de 2 a 3 horas de uma só vez!

---

## Modo 1 — Gemini CLI no Computador com `mcp-prova-real` (Automático)
1. Instale o servidor MCP local:
   ```bash
   cd mcp-prova-real && ./instalar.sh
   ```
2. Adicione ao seu `~/.gemini/settings.json`:
   ```json
   {
     "mcpServers": {
       "prova-real": {
         "command": "node",
         "args": ["/caminho/completo/para/desafio-prova-real/mcp-prova-real/src/index.js"]
       }
     }
   }
   ```
3. Abra o `gemini` na pasta de trabalho, cole o [**Prompt 01 — Criador Auditável**](../prompts/01-criador-auditavel.md) com os links dos vídeos e deixe o agente transcrever, validar o contexto de -60s/+60s, checar leis na Câmara/Senado, renderizar o corte `9:16` e emitir a Ficha de Auditoria com o gasto exato de tokens em R\$!

---

## Modo 2 — Gemini no Navegador / Google AI Studio (Sem Instalar Nada)
1. No **Gemini** (`gemini.google.com`) ou **Google AI Studio** (`aistudio.google.com` — que inclusive mostra na tela a contagem exata de tokens gastos!), anexe o link do YouTube ou suba o arquivo de vídeo completo.
2. Cole o [**Prompt 01**](../prompts/01-criador-auditavel.md) para extrair os minutos exatos auditados e abra o nosso [**Caderno Google Colab**](../colab/cortador_auditavel_prova_real.ipynb) para gerar o arquivo `.mp4` vertical pronto para postar!
