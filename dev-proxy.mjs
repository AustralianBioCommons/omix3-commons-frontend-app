import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

const TARGET = 'https://omix3.test.biocommons.org.au';
const PORT = 8080;

const server = http.createServer((clientReq, clientRes) => {
  const url = new URL(clientReq.url, TARGET);

  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname + url.search,
    method: clientReq.method,
    headers: {
      ...clientReq.headers,
      host: 'omix3.test.biocommons.org.au',
    },
  };

  // Remove headers that cause issues
  delete options.headers['connection'];

  const proxyReq = https.request(options, (proxyRes) => {
    clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(clientRes, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    clientRes.writeHead(502);
    clientRes.end('Proxy error');
  });

  clientReq.pipe(proxyReq, { end: true });
});

server.listen(PORT, () => {
  console.log(`Dev proxy running on http://localhost:${PORT} -> ${TARGET}`);
});
