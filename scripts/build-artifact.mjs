#!/usr/bin/env node
/**
 * Extrae el cuerpo de index.html a dist/dashboard-trading-operation.part.html.
 *
 * index.html es la fuente y funciona sola con doble clic. El fragmento que
 * genera este script es lo que se publica como artefacto en claude.ai, donde
 * el <head> lo pone el propio host y no debe venir en el fichero.
 *
 *   node scripts/build-artifact.mjs
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = await readFile(join(raiz, "index.html"), "utf8");

const cuerpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
if (!cuerpo) {
  console.error("index.html no tiene <body>: nada que extraer.");
  process.exit(1);
}

const fragmento = cuerpo[1].replace(/^\n+/, "");
if (!/<title>/i.test(fragmento)) {
  console.error("El fragmento no lleva <title>: el artefacto se quedaría sin nombre.");
  process.exit(1);
}

await mkdir(join(raiz, "dist"), { recursive: true });
await writeFile(join(raiz, "dist", "dashboard-trading-operation.part.html"), fragmento, "utf8");
console.log(`fragmento: ${fragmento.length} B -> dist/dashboard-trading-operation.part.html`);
