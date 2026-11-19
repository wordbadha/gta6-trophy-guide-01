// Leonida Trophy Atlas — the entrypoint (Node 22, standard library only).
// The guide itself is plain static files under app/ (index.html, style.css, app.js,
// data/trophies.json) — no build step, no network at run time. This program hands it in:
// it copies app/ and screenshots/ from beside this file into the output directory and
// writes dossier.json there with the vendored make.fun library, exactly as the scorer
// rebuilds it. vendor/makefun-frontend.ts is the kit's copy and must stay unchanged.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// It must be deterministic: run it twice and the bytes in the output are identical.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy the whole guide first, then the screenshots beside it.
mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The caps match the gate: at most 4 screenshots, each at most 256 KiB; app/ at most
// 993 files and directories and 48 MiB in all; the dossier text at most 160 KiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`Leonida Trophy Atlas handed in: ${outputDir} (dossier.json ${dossier.length} bytes)`);
