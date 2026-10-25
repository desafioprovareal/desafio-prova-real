# 🔎 Desafio Prova Real (`#DesafioProvaReal`)

> **"Acha que o seu lado fala a verdade e o outro mente? Não peça confiança cega: prove com código aberto — ou seja desmascarado ao vivo pela comunidade."**

🌐 **Painel Oficial e Placar das IAs:** [https://desafioprovareal.pages.dev](https://desafioprovareal.pages.dev)  
📱 **Redes Oficiais do Desafio:** [TikTok](https://www.tiktok.com/@desafioprovareal) • [Instagram](https://www.instagram.com/desafioprovareal) • [YouTube](https://www.youtube.com/@desafioprovareal) • [X](https://x.com/provareal_br) • [Facebook](https://www.facebook.com/desafioprovareal)

---

## O que é o Desafio Prova Real?

Seja em época de eleição ou **durante todo o mandato de qualquer governo que vença**, a população é bombardeada por cortes fora de contexto, números maquiados e discursos tentando empurrar inverdades goela abaixo — **de todos os lados políticos**.

O **Desafio Prova Real** é uma ferramenta cidadã permanente, apartidária e 100% em código aberto com duas funções gratuitas para qualquer brasileiro:

1. **Fiscalização Permanente e Raio-X de Políticos (direto pelo celular e grátis):** Digite **apenas o nome de qualquer político ou autoridade** (para levantar na web passado, processos em aberto ou julgados na Justiça, contratos, emendas e rede de convívio/alianças) OU cole qualquer ato do governo, vídeo do WhatsApp ou notícia para ver na hora o que é **✅ Fato Comprovado**, **⚠️ Inconclusivo** e **❌ Mentira ou Fora de Contexto**.
2. **Para criadores, eleitores de Direita, Esquerda ou Centro e usuários de IA:** Um desafio competitivo com ranking unificado onde você gera cortes verificados de debates, sabatinas e notícias usando a sua IA favorita (Claude, Gemini, ChatGPT, DeepSeek, etc.), publica o prompt exato e o custo em reais dos tokens no comentário, e desafia qualquer pessoa a auditar seu vídeo!

---

## ⚡ Acesso Rápido (Escolha seu Perfil)

| Seu Perfil | Onde Clicar |
| :--- | :--- |
| 📱 **Não entendo de IA / Quero checar vídeo do WhatsApp pelo celular (Grátis)** | 👉 [**Guia Passo a Passo no Celular (3 Toques)**](./guias/PASSO_A_PASSO_CELULAR_SIMPLES.md) |
| 🔍 **Quero auditar um vídeo, notícia ou postagem agora** | 👉 [**Prompt 02 — Auditor e Checador Universal**](./prompts/02-auditor-checador-universal.md) |
| 🎬 **Quero gerar cortes auditáveis e entrar no Ranking** | 👉 [**Prompt 01 — Criador Auditável**](./prompts/01-criador-auditavel.md) |
| 🧰 **Tenho assinatura (Claude, Gemini, ChatGPT) ou quero usar sem pagar** | 👉 [**Cartilha Completa**](./cartilha/) • [**Abrir Cortador 1-Clique no Google Colab**](https://colab.research.google.com/github/desafioprovareal/desafio-prova-real/blob/main/colab/cortador_auditavel_prova_real.ipynb) |
| ⚙️ **Sou avançado e quero conectar o Servidor MCP (`mcp-prova-real`)** | 👉 [**Documentação e Instalador do MCP Local**](./mcp-prova-real/) |

---

## ⚖️ As 5 Regras de Ouro do Desafio

1. **Liberdade de Tema, Rigor nos Fatos:** Você pode editar o bloco de personalização do [Prompt 01](./prompts/01-criador-auditavel.md) à vontade (escolher candidato, pauta econômica, segurança, contradições), **desde que mantenha o Núcleo Ético intacto** (proibido corte fora de contexto, mentira, calúnia, câmera lenta na voz ou troca sintética de cenário) e publique o prompt real usado.
2. **Comentário Oficial de Auditoria Obrigatório:** Toda postagem participante da `#DesafioProvaReal` deve trazer no primeiro comentário (ou descrição) a **Ficha de Auditoria** gerada pela IA com:
   - Link do vídeo/notícia original + minutos/segundos exatos do corte + data real da fala;
   - O prompt completo usado;
   - **Qual modelo de IA foi utilizado, quantos tokens gastou e o custo estimado em R\$**.
3. **Comentário Editado = Desclassificação Automática:** Em plataformas que exibem selo de comentário editado, qualquer edição invalida a postagem na hora por rasura. Nas redes que não mostram histórico público de edição, vale o aviso obrigatório convidando qualquer espectador a rodar o [Prompt 02](./prompts/02-auditor-checador-universal.md) direto daqui.
4. **Tribunal Comunitário & Recompensa "Caça-Fraudes":** Quem publicar manualmente sem telemetria automática via MCP fica sujeito à auditoria aberta de todos os participantes. Se o Prompt 02 provar que o autor escondeu o prompt real ou cortou o vídeo de forma enganosa, os participantes votam a exclusão do ranking e ganham pontos ao colar o **Comentário Desclassificatório Oficial** na postagem fraudada!
5. **Guerra das IAs no Placar Público:** Toda submissão alimenta o placar comparativo no site mostrando qual modelo de IA entrega mais fidelidade contextual pelo menor custo em reais em cada rede social.

---

## 🗂️ Estrutura deste Repositório

- [`prompts/01-criador-auditavel.md`](./prompts/01-criador-auditavel.md) — Prompt oficial para gerar cortes de vídeos, análises de reportagens/postagens e a Ficha de Auditoria.
- [`prompts/02-auditor-checador-universal.md`](./prompts/02-auditor-checador-universal.md) — Prompt oficial para checar fatos de qualquer conteúdo ou auditar postagens do desafio.
- [`guias/PASSO_A_PASSO_CELULAR_SIMPLES.md`](./guias/PASSO_A_PASSO_CELULAR_SIMPLES.md) — Guia ilustrado em linguagem simples para quem nunca usou IA checar notícias pelo telefone.
- [`cartilha/`](./cartilha/) — Guias sob medida para IA Gratuita, Claude com MCP, Gemini com MCP e ChatGPT + Caderno de 1 clique no navegador (`colab/`).
- [`mcp-prova-real/`](./mcp-prova-real/) — Servidor MCP em português que baixa vídeos (`yt-dlp`), transcreve com precisão (`whisper`), audita janela de -60s/+60s, consulta dados abertos oficiais da Câmara/Senado e renderiza vídeos `9:16` em Tela Dividida (`FFmpeg`).
- [`web/`](./web/) — Código-fonte aberto do Painel em React (Guerra das IAs, Arena dos Participantes, Tribunal Caça-Fraudes, Checador Rápido e Censo Cívico compatível com a LGPD).
- [`servidor/`](./servidor/) — API leve, banco de dados e Bot Monitor da `#DesafioProvaReal`.

---

## 💚 Apoie este Projeto de Código Aberto

Este repositório é 100% gratuito, independente, sem vínculo partidário e sem anúncios eleitorais pagos. Se esta ferramenta ajudou você ou sua família a não cair em manipulação, considere apoiar voluntariamente a manutenção do código aberto:

- ⚡ **Apoio Rápido (LivePix):** [https://livepix.gg/desafioprovareal](https://livepix.gg/desafioprovareal)
- ₿ **Carteira Cripto (Bitcoin):** `bc1q_DEFINIR_CARTEIRA_PROVA_REAL`

---

## 🛡️ Conformidade Legal (TSE e LGPD)

- **Resolução TSE nº 23.610/2019:** O software `mcp-prova-real` bloqueia por código alterações na velocidade da fala humana (*cheapfakes*) e trocas sintéticas realistas de cenário (*deepfakes*), exigindo sempre citação da data real e das fontes primárias.
- **Lei Geral de Proteção de Dados (Lei nº 13.709/2018):** O módulo opcional do Censo Cívico não realiza pesquisa de intenção de voto eleitoral, nunca armazena CPF em texto puro (convertendo localmente em código criptográfico irreversível `SHA-256` apenas para evitar robôs repetidos) e só exibe estatísticas agregadas para grupos com no mínimo 10 participantes.
