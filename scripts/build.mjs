import { cp, mkdir, rm, readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { makeStandalone } from './standalone.mjs';
const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'dist');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const entry of ['index.html', 'styles', 'src', 'assets']) await cp(resolve(root, entry), resolve(out, entry), { recursive: true });
await writeFile(resolve(out, '.nojekyll'), '');
// Hash routing means the same relative assets work at / and /MA_playground/.
await writeFile(resolve(out, '404.html'), await readFile(resolve(root, 'index.html')));
await mkdir(resolve(out, 'docs'), { recursive: true });
for (const name of ['MATHEMATICS.md', 'ACCESSIBILITY.md', 'FIELD-MATHEMATICS.md', 'FIELD-GUIDE.md']) {
  try { await cp(resolve(root, 'docs', name), resolve(out, 'docs', name)); } catch (err) { if (err.code !== 'ENOENT') throw err; }
}
await cp(resolve(root, 'LICENSE'), resolve(out, 'LICENSE'));
await makeStandalone(root, out);
// A second offline entry opens the new experiment without changing the classic home.
const standalone = await readFile(resolve(out, 'standalone.html'), 'utf8');
await writeFile(resolve(out, 'field-lab.html'), standalone.replace('<body>', '<body data-initial-lab="fields">'));
let bytes = 0, files = 0;
async function size(dir) { for (const e of await readdir(dir, { withFileTypes: true })) { const f = resolve(dir, e.name); if (e.isDirectory()) await size(f); else { bytes += (await readFile(f)).length; files++; } } }
await size(out);
console.log(`Built ${files} files · ${(bytes / 1024).toFixed(1)} KiB · no runtime dependencies → dist/`);
