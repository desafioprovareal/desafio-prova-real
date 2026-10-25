#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import {
  auditarContextoJanela,
  gerarComentarioERegistrarMetricas,
  ingerirETranscreverMidia,
  renderizarCorteEditorial,
  verificarFatosOficiais
} from './ferramentas.js';

export function criarServidorMcp() {
  const servidor = new Server(
    { name: 'mcp-prova-real', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  servidor.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'ingerir_e_transcrever_midia',
        description: 'Extrai metadados, data original da publicação e transcrição com timestamps de um vídeo ou URL.',
        inputSchema: {
          type: 'object',
          properties: {
            origem: { type: 'string', description: 'URL pública do vídeo ou caminho local do arquivo' },
            caminhoTranscricaoJson: { type: 'string', description: 'Caminho opcional para JSON de transcrição já processado' }
          },
          required: ['origem']
        }
      },
      {
        name: 'auditar_contexto_janela',
        description: 'Audita obrigatoriamente -60s antes e +60s depois do corte proposto, bloqueando recortes que omitam ressalvas ou invertam sentido.',
        inputSchema: {
          type: 'object',
          properties: {
            segmentos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  inicio: { type: 'number' },
                  fim: { type: 'number' },
                  texto: { type: 'string' }
                },
                required: ['inicio', 'fim', 'texto']
              }
            },
            segundoInicio: { type: 'number' },
            segundoFim: { type: 'number' }
          },
          required: ['segmentos', 'segundoInicio', 'segundoFim']
        }
      },
      {
        name: 'verificar_fatos_oficiais',
        description: 'Consulta proposições, cadastro de parlamentares (Raio-X público) e portais oficiais brasileiros (TSE, Transparência, Câmara, Senado, TCU, CNJ, IBGE).',
        inputSchema: {
          type: 'object',
          properties: {
            termoBusca: { type: 'string', description: 'Nome de político/parlamentar, palavra-chave, medida governamental ou número de projeto de lei' },
            ano: { type: 'number', description: 'Ano opcional da proposição' }
          },
          required: ['termoBusca']
        }
      },
      {
        name: 'renderizar_corte_editorial',
        description: 'Renderiza vídeo vertical 9:16 em Tela Dividida Editorial com velocidade travada em 1.0x (anti-cheapfake) e organização em pastas por vídeo.',
        inputSchema: {
          type: 'object',
          properties: {
            caminhoVideoOrigem: { type: 'string' },
            pastaSaidaBase: { type: 'string' },
            identificadorVideo: { type: 'string' },
            segundoInicio: { type: 'number' },
            segundoFim: { type: 'number' },
            velocidadeVoz: { type: 'number', description: 'Deve ser obrigatoriamente 1.0' },
            trocarFundoRealistaIa: { type: 'boolean', description: 'Bloqueado por conformidade TSE se verdadeiro' },
            dataOriginalFala: { type: 'string' },
            resumoFonteOficial: { type: 'string' },
            apenasSimularComando: { type: 'boolean' }
          },
          required: ['caminhoVideoOrigem', 'identificadorVideo', 'segundoInicio', 'segundoFim', 'dataOriginalFala', 'resumoFonteOficial']
        }
      },
      {
        name: 'gerar_comentario_e_registrar_metricas',
        description: 'Calcula o custo dos tokens em reais (R$), gera o Comentário Oficial de Auditoria em português com aviso anti-edição e envia telemetria ao placar.',
        inputSchema: {
          type: 'object',
          properties: {
            linkFonteOriginal: { type: 'string' },
            segundoInicio: { type: 'number' },
            segundoFim: { type: 'number' },
            dataOriginal: { type: 'string' },
            vereditoFontes: { type: 'string' },
            modeloIa: { type: 'string' },
            tokensEntrada: { type: 'number' },
            tokensSaida: { type: 'number' },
            promptUsado: { type: 'string' },
            urlApiDesafio: { type: 'string' },
            apelidoParticipante: { type: 'string' },
            redeSocial: { type: 'string' },
            linkPostagemPublicada: { type: 'string' }
          },
          required: ['linkFonteOriginal', 'segundoInicio', 'segundoFim', 'dataOriginal', 'vereditoFontes', 'modeloIa', 'tokensEntrada', 'tokensSaida', 'promptUsado']
        }
      }
    ]
  }));

  servidor.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args = {} } = req.params;
    let resultado;

    switch (name) {
      case 'ingerir_e_transcrever_midia':
        resultado = await ingerirETranscreverMidia(args);
        break;
      case 'auditar_contexto_janela':
        resultado = auditarContextoJanela(args);
        break;
      case 'verificar_fatos_oficiais':
        resultado = await verificarFatosOficiais(args);
        break;
      case 'renderizar_corte_editorial':
        resultado = renderizarCorteEditorial(args);
        break;
      case 'gerar_comentario_e_registrar_metricas':
        resultado = await gerarComentarioERegistrarMetricas(args);
        break;
      default:
        throw new Error(`Ferramenta desconhecida: ${name}`);
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(resultado, null, 2) }]
    };
  });

  return servidor;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const servidor = criarServidorMcp();
  const transporte = new StdioServerTransport();
  await servidor.connect(transporte);
}
