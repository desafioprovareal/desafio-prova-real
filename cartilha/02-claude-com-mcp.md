# 🟣 Cartilha 02 — Assinantes Claude (Claude Desktop / Claude Code + MCP)

Se você assina o **Claude (Pro ou Max)** no computador, você tem o fluxo mais automatizado do **#DesafioProvaReal** através do nosso servidor oficial [`mcp-prova-real`](../mcp-prova-real/).

---

## Passo 1 — Instale o Servidor MCP Local em 1 Comando
No terminal do seu computador (Linux, macOS ou Windows WSL), rode dentro deste repositório:

```bash
cd mcp-prova-real && ./instalar.sh
```

O instalador verifica `Node.js`, `FFmpeg` e `yt-dlp` e imprime o trecho pronto para o seu arquivo `claude_desktop_config.json`:

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

Reinicie o aplicativo **Claude Desktop** (ou rode `claude mcp add prova-real ...` no Claude Code). Você verá as 5 ferramentas em português conectadas:
- `ingerir_e_transcrever_midia`
- `auditar_contexto_janela`
- `verificar_fatos_oficiais`
- `renderizar_corte_editorial`
- `gerar_comentario_e_registrar_metricas`

---

## Passo 2 — Rode Vários Vídeos de Uma Vez com o Prompt 01
Copie o [**Prompt 01 — Criador Auditável**](../prompts/01-criador-auditavel.md), cole sua lista de vídeos (debates, sessões parlamentares, entrevistas) e peça:

> *"Processe estes 3 vídeos separando os arquivos em pastas por vídeo de origem, valide a janela de -60s/+60s, consulte as proposições citadas na Câmara/Senado, renderize os cortes aprovados em Tela Dividida 9:16 e registre as métricas reais de tokens no ranking do #DesafioProvaReal."*

---

## Passo 3 — Agende com Cadência Segura (2 a 3 por dia)
Suba os vídeos gerados na pasta de cada projeto usando o agendador oficial do **YouTube Studio**, **TikTok Web** ou **Meta Business Suite**, colando imediatamente o **Comentário Oficial de Auditoria** gerado pela ferramenta `gerar_comentario_e_registrar_metricas`.
