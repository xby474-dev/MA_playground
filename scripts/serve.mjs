import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const args = process.argv.slice(2);
const option = (name, fallback) => { const i = args.indexOf(name); return i < 0 ? fallback : args[i + 1]; };
const root = path.resolve(option('--dir', '.'));
const port = Number(option('--port', process.env.PORT || '5173'));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.md': 'text/plain; charset=utf-8', '.json': 'application/json' };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    // Support a deployment-like subdirectory for regression tests.
    let decoded = decodeURIComponent(url.pathname).replace(/^\/MA_playground(?=\/|$)/, '');
    const file = path.resolve(root, '.' + (decoded || '/'));
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end('Forbidden'); return; }
    if (decoded.split('/').some(x => x.startsWith('.') && x !== '.nojekyll')) { res.writeHead(403).end('Forbidden'); return; }
    const actual = (await stat(file)).isDirectory() ? path.join(file, 'index.html') : file;
    const data = await readFile(actual);
    res.writeHead(200, { 'Content-Type': mime[path.extname(actual)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    res.end(data);
  } catch (e) { res.writeHead(e.code === 'ENOENT' ? 404 : 400).end('Not found'); }
});
server.listen(port, '127.0.0.1', () => console.log(`MA Playground: http://127.0.0.1:${server.address().port} (${root})`));
