# ⚙️ Servidor MCP `mcp-prova-real` (`#DesafioProvaReal`)

Servidor **Model Context Protocol (MCP)** 100% em português que conecta o **Claude Desktop**, **Claude Code**, **Gemini CLI** ou **Cursor** diretamente ao pipeline forense de cortes e checagem do **Desafio Prova Real**.

---

## Instalação em 1 Comando

```bash
cd mcp-prova-real && ./instalar.sh
```

---

## As 5 Ferramentas Expostas à Sua IA

1. **`ingerir_e_transcrever_midia`**: Extrai metadados e a **data original de publicação** de vídeos (`yt-dlp` ou arquivo local) e carrega transcrição com timestamps precisos.
2. **`auditar_contexto_janela`**: Lê obrigatoriamente **-60 segundos antes e +60 segundos depois** do corte proposto e bloqueia automaticamente recortes que decepam conjunções adversativas (*"mas"*, *"porém"*, *"é mentira que"*) ou frases pela metade.
3. **`verificar_fatos_oficiais`**: Consulta em tempo real as APIs abertas da **Câmara dos Deputados** (`dadosabertos.camara.leg.br`) e do **Senado Federal** (`legis.senado.leg.br`) para retornar proposições, votações e fontes primárias oficiais.
4. **`renderizar_corte_editorial`**: Monta e executa o `FFmpeg` gerando vídeo vertical `9:16` (`1080x1920`) em **Tela Dividida Editorial** com:
   - **Trava anti-*cheapfake* por código:** rejeita qualquer velocidade diferente de `1.0x` em fala humana;
   - **Conformidade Resolução TSE nº 23.610/2019:** bloqueia troca sintética realista de fundo por IA;
   - **Fila cadenciada anti-bloqueio:** separa saídas em pastas por vídeo de origem e sugere agenda de 2 a 3 cortes/dia por rede social.
5. **`gerar_comentario_e_registrar_metricas`**: Calcula o custo exato dos tokens em **Reais (R\$)**, gera o **Comentário Oficial de Auditoria** em português (com código hash `SHA-256` e aviso anti-edição) e envia opcionalmente a telemetria para o placar público!
