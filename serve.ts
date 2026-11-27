// Local static HTTP server for playing and testing game/ offline on http://localhost:8080.

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const gameRoot = resolve(fileURLToPath(new URL('./game', import.meta.url)));
const args = process.argv.slice(2);
const portFlag = args.indexOf('--port');
const parsedPort = portFlag >= 0 ? Number(args[portFlag + 1]) : 8080;
const port = Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort < 65536 ? parsedPort : 8080;

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.woff2': 'font/woff2',
};

createServer((req, res) => {
  const reqUrl = new URL(req.url ?? '/', 'http://127.0.0.1');
  let pathname: string;
  try {
    pathname = decodeURIComponent(reqUrl.pathname);
  } catch {
    res.writeHead(400).end('Bad Request');
    return;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const filePath = resolve(join(gameRoot, normalize(pathname)));
  if (filePath !== gameRoot && !filePath.startsWith(gameRoot + sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const info = statSync(filePath);
    if (!info.isFile()) throw new Error('Not a file');
    res.writeHead(200, {
      'content-type': MIME_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
      'content-length': info.size,
      'cache-control': 'no-store',
    });
    createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(404).end('Not Found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Gobble Escape serving game/ at http://127.0.0.1:${port}`);
});
