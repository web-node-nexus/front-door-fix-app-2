/**
 * Forward phone LAN traffic to local Laravel (PHP often blocked by Windows Firewall;
 * Node.js is already allowed inbound).
 */
const http = require('http');

const LISTEN_PORT = Number(process.env.API_PROXY_PORT || 8001);
const TARGET_HOST = process.env.API_PROXY_TARGET_HOST || '127.0.0.1';
const TARGET_PORT = Number(process.env.API_PROXY_TARGET_PORT || 8000);

const server = http.createServer((req, res) => {
  const opts = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `${TARGET_HOST}:${TARGET_PORT}` },
  };

  const upstream = http.request(opts, (up) => {
    res.writeHead(up.statusCode || 502, up.headers);
    up.pipe(res);
  });

  upstream.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'API proxy upstream error', error: String(err.message || err) }));
  });

  req.pipe(upstream);
});

server.listen(LISTEN_PORT, '0.0.0.0', () => {
  console.log(`API proxy http://0.0.0.0:${LISTEN_PORT} -> http://${TARGET_HOST}:${TARGET_PORT}`);
});
