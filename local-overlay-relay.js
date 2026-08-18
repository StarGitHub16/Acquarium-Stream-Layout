/**
 * The Gelid Genteel local overlay relay.
 * Run on the stream PC: node local-overlay-relay.js
 * Uses only Node.js built-in modules; no npm install or configuration file is required.
 */
const { createServer } = require('node:http');
const { existsSync, createReadStream } = require('node:fs');
const path = require('node:path');

const port = 8787;
const rootDirectory = __dirname;
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};
let latestEvent = null;

function json(response, status, data) {
  response.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(data));
}

function isLocalNetwork(request) {
  const address = String(request.socket.remoteAddress || '').replace(/^::ffff:/, '');
  if (address === '127.0.0.1' || address === '::1') return true;
  const octets = address.split('.').map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return false;
  return octets[0] === 10
    || octets[0] === 192 && octets[1] === 168
    || octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31;
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let raw = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 12000) reject(new Error('Request is too large.'));
    });
    request.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); } catch (_) { reject(new Error('Invalid JSON.')); }
    });
    request.on('error', reject);
  });
}

function isValidControl(control) {
  const animations = new Set(['standard', 'thawing', 'frozen', 'frigid']);
  const cards = new Set(['card-thawing.html', 'card-frozen.html', 'card-offline.html']);
  return control && typeof control === 'object'
    && (!control.animation || animations.has(control.animation))
    && (control.card === undefined || control.card === null || cards.has(control.card));
}

function serveFile(response, pathname) {
  const requestedPath = pathname === '/' ? '/control-panel.html' : pathname;
  const filePath = path.resolve(rootDirectory, `.${decodeURIComponent(requestedPath)}`);
  if (!filePath.startsWith(`${rootDirectory}${path.sep}`) || !existsSync(filePath)) {
    response.writeHead(404).end('Not found');
    return;
  }
  response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  createReadStream(filePath).pipe(response);
}

const server = createServer(async (request, response) => {
  if (!isLocalNetwork(request)) return json(response, 403, { error: 'This relay only accepts devices on the local network.' });
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  if (request.method === 'OPTIONS') return json(response, 204, {});

  if (request.method === 'GET' && url.pathname === '/api/overlay/latest') return json(response, 200, { event: latestEvent });

  if (request.method === 'POST' && url.pathname === '/api/overlay/publish') {
    try {
      const body = await readJson(request);
      if (!isValidControl(body.control)) return json(response, 400, { error: 'Invalid overlay control.' });
      latestEvent = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        type: 'gelid-overlay-control',
        control: body.control,
        createdAt: Date.now(),
      };
      return json(response, 200, { event: latestEvent });
    } catch (error) {
      return json(response, 400, { error: error.message || 'Invalid request.' });
    }
  }

  if (request.method === 'GET') return serveFile(response, url.pathname);
  json(response, 405, { error: 'Method not allowed.' });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`\nGelid Genteel local overlay relay is running.`);
  console.log(`Stream PC / XSplit URL: http://127.0.0.1:${port}/index.html?video=underlay`);
  console.log(`Phone controller URL: http://YOUR-STREAM-PC-LAN-IP:${port}/control-panel.html`);
  console.log(`\nKeep this terminal open while streaming. Any device on the same Wi-Fi can use the controller.\n`);
});
