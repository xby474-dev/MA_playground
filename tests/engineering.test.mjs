import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { basename, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
let server, base;
function build() {
  const result = spawnSync(process.execPath, ['scripts/build.mjs'], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
}
async function digest(dir) {
  const hashes = {};
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) Object.assign(hashes, await digest(resolve(dir, entry.name)));
    else hashes[resolve(dir, entry.name)] = createHash('sha256').update(await readFile(resolve(dir, entry.name))).digest('hex');
  }
  return hashes;
}
before(async () => {
  build();
  server = spawn(process.execPath, ['scripts/serve.mjs', '--dir', 'dist', '--port', '0'], { cwd: root });
  base = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Preview server startup timeout')), 6000);
    server.once('error', error => { clearTimeout(timer); reject(error); });
    server.stdout.on('data', chunk => {
      const match = chunk.toString().match(/http:\/\/127\.0\.0\.1:\d+/);
      if (match) { clearTimeout(timer); resolve(match[0]); }
    });
  });
});
after(() => server?.kill());

test('Production build is deterministic and includes only the intended static files', async () => {
  const first = await digest(resolve(root, 'dist')); build();
  assert.deepEqual(await digest(resolve(root, 'dist')), first);
  assert.ok(Object.keys(first).some(path => basename(path) === '.nojekyll'));
  assert.ok(!Object.keys(first).some(path => /(?:\.env|\.github|node_modules|test-results)/.test(path)));
});
test('Production server serves identical entry HTML at root and GitHub Pages subpath', async () => {
  const home = await fetch(base + '/'); const pages = await fetch(base + '/MA_playground/');
  assert.equal(home.status, 200); assert.equal(pages.status, 200);
  assert.equal(home.headers.get('content-type'), 'text/html; charset=utf-8');
  assert.equal(home.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(await home.text(), await pages.text());
});
test('CSS, favicon, entry module and complete module graph resolve with correct MIME under a subpath', async () => {
  for (const prefix of ['/', '/MA_playground/']) {
    for (const [file, mime] of [['styles/app.css','text/css'],['assets/favicon.svg','image/svg+xml'],...['app','math','state','content','plots','icons'].map(name=>[`src/${name}.js`,'text/javascript'])]) {
      const response=await fetch(base+prefix+file);
      assert.equal(response.status,200,file); assert.ok(response.headers.get('content-type').startsWith(mime),file);
      assert.ok((await response.text()).length>50,file);
    }
  }
});
test('Static proof references and no-Jekyll marker are included and served', async () => {
  for (const file of ['.nojekyll','docs/MATHEMATICS.md','docs/ACCESSIBILITY.md','LICENSE','404.html']) {
    assert.equal((await fetch(base+'/MA_playground/'+file)).status,200,file);
  }
});
test('Preview refuses dotfile and encoded traversal requests', async () => {
  for (const file of ['.env','.git/config','%2e%2e%2fpackage.json','.github/workflows/ci-pages.yml']) {
    assert.equal((await fetch(base+'/'+file)).status,403,file);
  }
});
test('Missing assets and malformed encodings are not silently returned as successful HTML', async () => {
  assert.equal((await fetch(base+'/src/not-found.js')).status,404);
  assert.equal((await fetch(base+'/%GG')).status,400);
});
test('Offline HTML contains the full application without external styles, scripts or font downloads', async () => {
  const html=await readFile(resolve(root,'dist/standalone.html'),'utf8');
  assert.ok(html.includes('__modules["math"]')); assert.ok(html.includes('__modules["app"]'));
  assert.ok(html.includes('<style>')); assert.ok(html.includes('data:image/svg+xml,'));
  assert.ok(!/<script[^>]+src=/.test(html)); assert.ok(!/<link[^>]+rel="stylesheet"/.test(html));
  assert.ok(!/url\(['"]?https?:\/\//.test(html));
  assert.equal((await fetch(base+'/MA_playground/standalone.html')).status,200);
});

test('New field modules, local stylesheet and authored offline proofs resolve at both deployment paths', async()=>{
  for(const prefix of ['/','/MA_playground/'])for(const file of ['src/field-math.js','src/field-state.js','src/field-content.js','src/field-plots.js','src/field-lab.js','styles/fields.css','docs/FIELD-MATHEMATICS.md','docs/FIELD-GUIDE.md']) {
    const r=await fetch(base+prefix+file);assert.equal(r.status,200,file);assert.ok((await r.text()).length>50,file);
  }
});
test('New direct offline entry opens the unified lab but retains all three experiments', async()=>{
  const r=await fetch(base+'/MA_playground/field-lab.html');assert.equal(r.status,200);
  const html=await r.text();assert.ok(html.includes('data-initial-lab="fields"'));
  for(const id of ['nav-limits','nav-differentiability','nav-fields'])assert.ok(html.includes(id));
  assert.ok(!/<script[^>]+src=/.test(html));assert.ok(!/<link[^>]+rel="stylesheet"/.test(html));
});

test('Relation mathematics, controller, views, stylesheet and authored proofs resolve at both deployment paths', async()=>{
  for(const prefix of ['/','/MA_playground/'])for(const file of ['src/relations-math.js','src/relations-state.js','src/relations-content.js','src/relations-plots.js','src/relations-lab.js','styles/relations.css','docs/RELATIONS-MATHEMATICS.md','docs/RELATIONS-GUIDE.md']){
    const r=await fetch(base+prefix+file);assert.equal(r.status,200,file);assert.ok((await r.text()).length>50,file);
  }
});
test('New offline relation entry opens the reworked second lab and contains the complete application without runtime downloads', async()=>{
  const html=await (await fetch(base+'/MA_playground/relations-lab.html')).text();
  assert.ok(html.includes('data-initial-lab="differentiability&mode=relations"'));
  for(const name of ['relations-math','relations-content','relations-plots','relations-lab','field-lab','app'])assert.ok(html.includes(`__modules["${name}"]`));
  assert.ok(!/<script[^>]+src=/.test(html));assert.ok(!/<link[^>]+rel="stylesheet"/.test(html));assert.ok(!/url\(['"]?https?:\/\//.test(html));
});

test('Completeness module and offline mathematics are served at both static deployment paths',async()=>{
 for(const prefix of ['/','/MA_playground/'])for(const file of ['src/completeness-math.js','src/completeness-state.js','src/completeness-content.js','src/completeness-plots.js','src/completeness-lab.js','styles/completeness.css','docs/COMPLETENESS-MATHEMATICS.md','docs/COMPLETENESS-GUIDE.md']){
  const r=await fetch(base+prefix+file);assert.equal(r.status,200,file);assert.ok((await r.text()).length>50,file);
 }
});
test('Completeness offline entry retains the whole app and requires no external assets',async()=>{
 const r=await fetch(base+'/MA_playground/completeness-lab.html');assert.equal(r.status,200);const html=await r.text();assert.ok(html.includes('data-initial-lab="completeness"'));
 for(const id of ['nav-limits','nav-differentiability','nav-fields','nav-completeness'])assert.ok(html.includes(id));
 for(const module of ['completeness-math','completeness-lab','relations-lab','field-lab'])assert.ok(html.includes(`__modules["${module}"]`));
 assert.ok(!/<script[^>]+src=/.test(html));assert.ok(!/<link[^>]+rel="stylesheet"/.test(html));assert.ok(!/url\(['"]?https?:\/\//.test(html));
});

test('Taylor formulas, views, style and authored proofs resolve under root and Pages paths',async()=>{
 for(const prefix of ['/','/MA_playground/'])for(const file of ['src/taylor-math.js','src/taylor-state.js','src/taylor-content.js','src/taylor-plots.js','src/taylor-lab.js','styles/taylor.css','docs/TAYLOR-MATHEMATICS.md','docs/TAYLOR-GUIDE.md']){
  const response=await fetch(base+prefix+file);assert.equal(response.status,200,file);assert.ok((await response.text()).length>50,file);
 }
});
test('Taylor offline entry retains all five labs without remote runtime downloads',async()=>{
 const response=await fetch(base+'/MA_playground/taylor-lab.html');assert.equal(response.status,200);const html=await response.text();assert.ok(html.includes('data-initial-lab="taylor"'));
 for(const id of ['nav-limits','nav-differentiability','nav-fields','nav-completeness','nav-taylor'])assert.ok(html.includes(id));
 for(const name of ['taylor-math','taylor-lab','completeness-lab','relations-lab','field-lab'])assert.ok(html.includes(`__modules["${name}"]`));
 assert.ok(!/<script[^>]+src=/.test(html));assert.ok(!/<link[^>]+rel="stylesheet"/.test(html));assert.ok(!/url\(['"]?https?:\/\//.test(html));
});
