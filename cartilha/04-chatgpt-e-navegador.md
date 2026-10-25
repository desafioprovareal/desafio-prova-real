# 🟢 Cartilha 04 — ChatGPT (Plus / Pro) + Cortador de 1 Clique no Navegador

Como o ChatGPT no navegador não acessa diretamente o `FFmpeg` instalado na sua máquina local, preparamos o fluxo combinado mais simples para quem assina o **ChatGPT** (ou não quer instalar nada no PC):

---

## Passo 1 — Gere a Auditoria e os Segundos Exatos no ChatGPT
1. Ative a **Busca na Web** no ChatGPT (modelo `GPT-4o` ou `o3`/`GPT-5`).
2. Cole o [**Prompt 01 — Criador Auditável**](../prompts/01-criador-auditavel.md) junto com o link da reportagem/postagem ou a transcrição completa do vídeo.
3. O ChatGPT validará o contexto anterior e posterior, buscará os dados oficiais do governo e devolverá:
   - Os minutos e segundos exatos aprovados `[MM:SS -> MM:SS]`;
   - As fontes oficiais verificadas;
   - A **Ficha de Auditoria** pronta para o comentário.

---

## Passo 2 — Renderize o Vídeo `9:16` em Tela Dividida Grátis no Navegador
1. Abra o arquivo [`colab/cortador_auditavel_prova_real.ipynb`](../colab/cortador_auditavel_prova_real.ipynb) diretamente no **Google Colab**.
2. Preencha nos campos do formulário:
   - `URL_DO_VIDEO`
   - `INICIO_SEGUNDOS` e `FIM_SEGUNDOS`
   - `DATA_ORIGINAL_DA_FALA`
   - `RESUMO_DA_FONTE_OFICIAL`
3. Clique no botão **Play (Executar)**: em menos de 1 minuto o Google Colab baixa o trecho exato, mantém a voz em velocidade `1.0x` (trava anti-manipulação), monta a **Tela Dividida Editorial `1080x1920`** com a fonte oficial no topo e inicia o download do vídeo `.mp4` pronto para TikTok, Reels, Shorts e X!
