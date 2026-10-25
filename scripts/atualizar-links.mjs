#!/usr/bin/env node
/**
 * Sincroniza todos os links oficiais definidos em configuracao-links.json
 * para o painel React, o README.md e o Kit de Disparo Imediato.
 *
 * Uso: node scripts/atualizar-links.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, "..");
const caminhoConfig = path.join(raiz, "configuracao-links.json");

const cfg = JSON.parse(fs.readFileSync(caminhoConfig, "utf-8"));

// 1. Sincroniza JSON consumido pelo painel React
const destinoWebJson = path.join(raiz, "web", "src", "dados", "configuracaoLinks.json");
if (fs.existsSync(path.dirname(destinoWebJson))) {
  fs.writeFileSync(destinoWebJson, JSON.stringify(cfg, null, 2) + "\n", "utf-8");
  console.log("✅ Atualizado:", path.relative(raiz, destinoWebJson));
}

// 2. Atualiza README.md principal
const caminhoReadme = path.join(raiz, "README.md");
if (fs.existsSync(caminhoReadme)) {
  let md = fs.readFileSync(caminhoReadme, "utf-8");
  md = md.replace(
    /🌐 \*\*Painel Oficial e Placar das IAs:\*\* .*/,
    `🌐 **Painel Oficial e Placar das IAs:** [${cfg.siteOficial}](${cfg.siteOficial})  `
  );
  md = md.replace(
    /📱 \*\*Redes Oficiais do Desafio:\*\* .*/,
    `📱 **Redes Oficiais do Desafio:** [TikTok](${cfg.redesSociais.tiktok.urlPerfil}) • [Instagram](${cfg.redesSociais.instagram.urlPerfil}) • [YouTube](${cfg.redesSociais.youtube.urlPerfil}) • [X](${cfg.redesSociais.x.urlPerfil}) • [Facebook](${cfg.redesSociais.facebook.urlPerfil})`
  );
  md = md.replace(
    /- ⚡ \*\*Apoio Rápido \(LivePix\):\*\* .*/,
    `- ⚡ **Apoio Rápido (LivePix):** [${cfg.apoioLivePix}](${cfg.apoioLivePix})`
  );
  md = md.replace(
    /- ₿ \*\*Carteira Cripto \(Bitcoin\):\*\* .*/,
    `- ₿ **Carteira Cripto (Bitcoin):** \`${cfg.carteiraCripto}\``
  );
  fs.writeFileSync(caminhoReadme, md, "utf-8");
  console.log("✅ Atualizado: README.md");
}

// 3. Regera placeholders caso exista o KIT_DISPARO_IMEDIATO.md
const caminhoKit = path.join(raiz, "privado-operador", "KIT_DISPARO_IMEDIATO.md");
if (fs.existsSync(caminhoKit)) {
  let kit = fs.readFileSync(caminhoKit, "utf-8");
  const substituicoes = {
    "__SITE_OFICIAL__": cfg.siteOficial,
    "__GITHUB_OFICIAL__": cfg.repositorioGithub,
    "__PERFIL_TIKTOK__": cfg.redesSociais.tiktok.urlPerfil,
    "__POST1_TIKTOK__": cfg.redesSociais.tiktok.urlPrimeiroPost,
    "__ARROBA_TIKTOK__": cfg.redesSociais.tiktok.arroba,
    "__PERFIL_INSTAGRAM__": cfg.redesSociais.instagram.urlPerfil,
    "__POST1_INSTAGRAM__": cfg.redesSociais.instagram.urlPrimeiroPost,
    "__ARROBA_INSTAGRAM__": cfg.redesSociais.instagram.arroba,
    "__PERFIL_YOUTUBE__": cfg.redesSociais.youtube.urlPerfil,
    "__POST1_YOUTUBE__": cfg.redesSociais.youtube.urlPrimeiroPost,
    "__ARROBA_YOUTUBE__": cfg.redesSociais.youtube.arroba,
    "__PERFIL_X__": cfg.redesSociais.x.urlPerfil,
    "__POST1_X__": cfg.redesSociais.x.urlPrimeiroPost,
    "__ARROBA_X__": cfg.redesSociais.x.arroba,
    "__PERFIL_FACEBOOK__": cfg.redesSociais.facebook.urlPerfil,
    "__POST1_FACEBOOK__": cfg.redesSociais.facebook.urlPrimeiroPost,
  };
  for (const [chave, valor] of Object.entries(substituicoes)) {
    kit = kit.split(chave).join(valor);
  }
  fs.writeFileSync(caminhoKit, kit, "utf-8");
  console.log("✅ Sincronizado: privado-operador/KIT_DISPARO_IMEDIATO.md");
}

console.log("🚀 Todos os links foram sincronizados com sucesso!");
