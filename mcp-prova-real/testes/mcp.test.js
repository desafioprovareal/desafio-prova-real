import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  auditarContextoJanela,
  gerarComentarioERegistrarMetricas,
  renderizarCorteEditorial
} from '../src/ferramentas.js';
import { criarServidorMcp } from '../src/index.js';

test('MCP Prova Real: trava anti-cheapfake, janela -60s/+60s e comentário oficial com custo em R$', async () => {
  const srv = criarServidorMcp();
  assert.ok(srv);

  // 1. Detecta corte malicioso que decepa conjunção adversativa logo depois ("Mas isso é mentira...")
  const segmentos = [
    { inicio: 10, fim: 20, texto: 'Dizem por aí que' },
    { inicio: 20, fim: 30, texto: 'eu quero aumentar todos os impostos.' },
    { inicio: 30, fim: 42, texto: 'Mas isso é mentira absoluta, votamos contra.' }
  ];
  const reprovado = auditarContextoJanela({ segmentos, segundoInicio: 20, segundoFim: 30 });
  assert.equal(reprovado.aprovado, false);
  assert.ok(reprovado.alertas.length >= 1);

  const aprovado = auditarContextoJanela({ segmentos, segundoInicio: 10, segundoFim: 42 });
  assert.equal(aprovado.aprovado, true);

  // 2. Bloqueia câmera lenta em fala humana e fundo sintético realista (Resolução TSE 23.610)
  const bloqVelocidade = renderizarCorteEditorial({
    caminhoVideoOrigem: 'entrada.mp4',
    identificadorVideo: 'teste',
    segundoInicio: 0,
    segundoFim: 30,
    velocidadeVoz: 0.75,
    dataOriginalFala: '24/10/2026',
    resumoFonteOficial: 'IBGE',
    apenasSimularComando: true
  });
  assert.equal(bloqVelocidade.aprovado, false);

  const bloqFundo = renderizarCorteEditorial({
    caminhoVideoOrigem: 'entrada.mp4',
    identificadorVideo: 'teste',
    segundoInicio: 0,
    segundoFim: 30,
    trocarFundoRealistaIa: true,
    dataOriginalFala: '24/10/2026',
    resumoFonteOficial: 'IBGE',
    apenasSimularComando: true
  });
  assert.equal(bloqFundo.aprovado, false);

  const pastaTemp = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-prova-real-'));
  const okCorte = renderizarCorteEditorial({
    caminhoVideoOrigem: 'entrada.mp4',
    pastaSaidaBase: pastaTemp,
    identificadorVideo: 'debate-economia',
    segundoInicio: 10,
    segundoFim: 45,
    dataOriginalFala: '24/10/2026',
    resumoFonteOficial: 'IBGE Censo 2022',
    apenasSimularComando: true
  });
  assert.equal(okCorte.aprovado, true);
  assert.equal(okCorte.velocidadeTravada, '1.0x');

  // 3. Gera comentário oficial em português com custo em R$ e aviso anti-rasura
  const ficha = await gerarComentarioERegistrarMetricas({
    linkFonteOriginal: 'https://www.youtube.com/watch?v=abc',
    segundoInicio: 10,
    segundoFim: 45,
    dataOriginal: '24/10/2026',
    vereditoFontes: 'FATO COMPROVADO — IBGE',
    modeloIa: 'claude-sonnet-4-6',
    tokensEntrada: 6000,
    tokensSaida: 1200,
    promptUsado: 'Checar dados de saneamento básico.'
  });
  assert.equal(ficha.ok, true);
  assert.ok(ficha.custoReais > 0);
  assert.match(ficha.comentarioOficial, /AVISO ANTI-RASURA/);
  assert.match(ficha.comentarioOficial, /#DesafioProvaReal/);
});
