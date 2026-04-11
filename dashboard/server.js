const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.DASHBOARD_PORT || 3004;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Determine file path
  let filePath = req.url;

  // Default to index.html for root or unknown paths (SPA behavior)
  if (filePath === '/' || !path.extname(filePath)) {
    filePath = '/index.html';
  }

  const fullPath = path.join(__dirname, filePath);
  const ext = path.extname(filePath);
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

  // Serve static file
  fs.readFile(fullPath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Try index.html as fallback
        if (filePath !== '/index.html') {
          fs.readFile(path.join(__dirname, 'index.html'), (err, htmlContent) => {
            if (err) {
              res.writeHead(404);
              res.end('File not found');
            } else {
              res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
              res.end(htmlContent, 'utf-8');
            }
          });
          return;
        }
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🎨 Dashboard Server running on http://localhost:${PORT}`);
  console.log(`📊 Access dashboard at: http://localhost:${PORT}`);
  console.log(`📡 API Backend: http://localhost:3003`);
  console.log(`\nPress Ctrl+C to stop\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down dashboard server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
