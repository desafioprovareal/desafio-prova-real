import test from 'node:test';
import assert from 'node:assert/strict';
import { criarServidor } from '../src/indice.js';

test('Fluxo completo da API: saúde, submissões, placar IAs, tribunal ponderado e Censo LGPD', async () => {
  const { app } = await criarServidor({
    caminhoBanco: ':memory:',
    ativarBotMonitor: false,
    limiarPesoFraude: 2.5,
    kAnonimatoMinimo: 10
  });

  try {
    // 1. Endpoint /saude e /api/saude
    const saude = await app.inject({ method: 'GET', url: '/api/saude' });
    assert.equal(saude.statusCode, 200);
    const corpoSaude = saude.json();
    assert.equal(corpoSaude.ok, true);
    assert.equal(typeof corpoSaude.alertaUpgradeVps, 'boolean');

    // 2. Vínculo de participante
    const vinc = await app.inject({
      method: 'POST',
      url: '/api/perfil/vincular',
      payload: {
        apelido: 'auditor_fiel',
        provedorIdentidade: 'github',
        redes: { tiktok: '@auditor_fiel' }
      }
    });
    assert.equal(vinc.statusCode, 200);
    assert.match(vinc.json().codigoVerificacao, /^PR-/);

    // 3. Submissão MCP e Submissão Manual
    const subMcp = await app.inject({
      method: 'POST',
      url: '/api/submissoes',
      payload: {
        apelido: 'auditor_fiel',
        redeSocial: 'tiktok',
        linkPostagem: 'https://www.tiktok.com/@auditor_fiel/video/123',
        linkFonte: 'https://www.youtube.com/watch?v=debate123',
        segundoInicio: 120,
        segundoFim: 165,
        modeloIa: 'claude-sonnet-4-6',
        tokensEntrada: 5000,
        tokensSaida: 1000,
        promptDeclarado: 'Analisar economia com fontes IBGE',
        viaMcp: true
      }
    });
    assert.equal(subMcp.statusCode, 201);
    assert.equal(subMcp.json().status, 'validado');
    assert.ok(subMcp.json().custoReais > 0);

    const subManual = await app.inject({
      method: 'POST',
      url: '/submissoes',
      payload: {
        apelido: 'manipulador_teste',
        redeSocial: 'instagram',
        linkPostagem: 'https://www.instagram.com/reel/999',
        linkFonte: 'https://www.youtube.com/watch?v=debate999',
        segundoInicio: 10,
        segundoFim: 20,
        modeloIa: 'gpt-4o',
        tokensEntrada: 2000,
        tokensSaida: 400,
        promptDeclarado: 'Prompt neutro falso',
        viaMcp: false
      }
    });
    assert.equal(subManual.statusCode, 201);
    const idSuspeito = subManual.json().id;

    // 4. Placar Guerra das IAs
    const placar = await app.inject({ method: 'GET', url: '/placar-ias' });
    assert.equal(placar.statusCode, 200);
    assert.equal(placar.json().modelos.length, 2);

    // 5. Tribunal Comunitário com peso de reputação e geração de Comentário Desclassificatório
    await app.inject({
      method: 'POST',
      url: '/api/tribunal/votar',
      payload: { idItem: idSuspeito, decisao: 'reprovar', codigoAutor: 'auditor_fiel', categoriaFalha: 'fora_de_contexto' }
    });
    const voto2 = await app.inject({
      method: 'POST',
      url: '/api/tribunal/votar',
      payload: { idItem: idSuspeito, decisao: 'reprovar', codigoAutor: 'auditor_extra', pesoAplicado: 1.5, categoriaFalha: 'fora_de_contexto' }
    });
    assert.equal(voto2.statusCode, 200);
    assert.equal(voto2.json().status, 'desclassificado');
    assert.match(voto2.json().comentarioDesclassificatorio, /SUBMISSÃO DESCLASSIFICADA/);

    // 6. Trava LGPD: rejeita CPF explícito e respeita k-anonimato >= 10
    const tentativaCpf = await app.inject({
      method: 'POST',
      url: '/api/censo',
      payload: { cpf: '123.456.789-00', regiao: 'Sudeste', faixaRenda: '2a5sm', prioridadePrincipal: 'Saúde' }
    });
    assert.equal(tentativaCpf.statusCode, 400);

    for (let i = 0; i < 10; i += 1) {
      const r = await app.inject({
        method: 'POST',
        url: '/api/censo',
        payload: {
          protocoloHash: `hash_anonimo_cliente_unico_${i}_seguro`,
          regiao: 'Sudeste',
          faixaRenda: 'ate_2_sm',
          prioridades: ['Custo de Vida']
        }
      });
      assert.equal(r.statusCode, 201);
    }

    // Região com menos de 10 respostas não deve aparecer no agregado público
    await app.inject({
      method: 'POST',
      url: '/api/censo',
      payload: {
        protocoloHash: 'hash_anonimo_isolado_norte_9999',
        regiao: 'Norte',
        faixaRenda: 'ate_2_sm',
        prioridades: ['Saúde']
      }
    });

    const ag = await app.inject({ method: 'GET', url: '/censo/agregado' });
    assert.equal(ag.statusCode, 200);
    assert.equal(ag.json().porRegiao.length, 1);
    assert.equal(ag.json().porRegiao[0].regiao, 'Sudeste');
  } finally {
    await app.close();
  }
});
