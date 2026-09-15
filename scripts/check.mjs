import { readdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
let count = 0;
for (const dir of ['src', 'scripts', 'tests']) {
  for (const file of await readdir(dir)) {
    if (!/\.(m?js)$/.test(file)) continue;
    const result = spawnSync(process.execPath, ['--check', path.join(dir, file)], { encoding: 'utf8' });
    if (result.status) { process.stderr.write(result.stderr); process.exit(1); }
    count++;
  }
}
const html = await readFile('index.html', 'utf8');
if (/https?:[^"']+\.(js|css)["']/.test(html)) throw new Error('External runtime dependency found');
console.log(`${count} JavaScript files syntax-checked; no external runtime scripts or styles.`);
