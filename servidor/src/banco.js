import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

/**
 * Inicializa o banco SQLite nativo em modo WAL com todas as tabelas do Desafio Prova Real.
 */
export function abrirBancoDados(caminhoBanco) {
  if (caminhoBanco !== ':memory:') {
    fs.mkdirSync(path.dirname(caminhoBanco), { recursive: true });
  }

  const db = new DatabaseSync(caminhoBanco);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS participantes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      apelido TEXT NOT NULL UNIQUE,
      provedor_identidade TEXT DEFAULT 'local',
      conta_identidade TEXT DEFAULT '',
      codigo_verificacao TEXT NOT NULL,
      bio_verificada INTEGER NOT NULL DEFAULT 0,
      arroba_tiktok TEXT DEFAULT '',
      arroba_instagram TEXT DEFAULT '',
      arroba_youtube TEXT DEFAULT '',
      arroba_x TEXT DEFAULT '',
      arroba_facebook TEXT DEFAULT '',
      reputacao REAL NOT NULL DEFAULT 1.0,
      pontos_totais INTEGER NOT NULL DEFAULT 0,
      visualizacoes_acumuladas INTEGER NOT NULL DEFAULT 0,
      comentarios_acumulados INTEGER NOT NULL DEFAULT 0,
      auditorias_aprovadas INTEGER NOT NULL DEFAULT 0,
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS submissoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      apelido_participante TEXT NOT NULL,
      rede_social TEXT NOT NULL DEFAULT 'tiktok',
      link_postagem TEXT NOT NULL,
      link_fonte TEXT NOT NULL,
      segundo_inicio REAL NOT NULL DEFAULT 0,
      segundo_fim REAL NOT NULL DEFAULT 0,
      prompt_declarado TEXT NOT NULL,
      comentario_auditoria TEXT DEFAULT '',
      hash_integridade TEXT NOT NULL,
      modelo_ia TEXT NOT NULL,
      familia_ia TEXT NOT NULL,
      tokens_entrada INTEGER NOT NULL DEFAULT 0,
      tokens_saida INTEGER NOT NULL DEFAULT 0,
      custo_reais REAL NOT NULL DEFAULT 0,
      via_mcp INTEGER NOT NULL DEFAULT 0,
      visualizacoes INTEGER NOT NULL DEFAULT 0,
      comentarios INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'em_auditoria',
      motivo_desclassificacao TEXT DEFAULT '',
      comentario_desclassificatorio TEXT DEFAULT '',
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS votos_tribunal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submissao_id INTEGER NOT NULL REFERENCES submissoes(id) ON DELETE CASCADE,
      auditor_chave TEXT NOT NULL,
      decisao TEXT NOT NULL CHECK (decisao IN ('aprovar', 'reprovar')),
      peso REAL NOT NULL DEFAULT 1.0,
      motivo_codigo TEXT DEFAULT 'fora_de_contexto',
      criado_em TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (submissao_id, auditor_chave)
    );

    CREATE TABLE IF NOT EXISTS respostas_censo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash_unico TEXT NOT NULL UNIQUE,
      regiao TEXT NOT NULL,
      faixa_renda TEXT NOT NULL,
      ocupacao TEXT DEFAULT 'nao_informado',
      prioridade_principal TEXT NOT NULL,
      nivel_ia TEXT DEFAULT 'iniciante',
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  return db;
}
