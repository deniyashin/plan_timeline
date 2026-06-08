const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT       = process.env.PORT || 3002;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Читаем .env
try {
  fs.readFileSync(path.join(__dirname, '.env'), 'utf8')
    .split('\n').forEach(function(line) {
      var m = line.match(/^([A-Z0-9_]+)=(.+)$/);
      if (m) process.env[m[1]] = m[2].trim();
    });
} catch(e) {}

var SAVE_SECRET = process.env.SAVE_SECRET || '';
var DATA_PATH   = path.join(PUBLIC_DIR, 'data.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

const MAX_BACKUPS = 5;

function cleanOldBackups() {
  var dir = path.join(__dirname, 'backups');
  fs.readdir(dir, function(err, files) {
    if (err || !files) return;
    var baks = files.filter(function(f) { return f.endsWith('.json'); })
      .map(function(f) { return { name: f, time: fs.statSync(path.join(dir, f)).mtimeMs }; })
      .sort(function(a, b) { return a.time - b.time; });
    while (baks.length > MAX_BACKUPS) {
      fs.unlink(path.join(dir, baks.shift().name), function() {});
    }
  });
}

http.createServer(function(req, res) {
  var urlPath = req.url.split('?')[0];

  // POST /api/save
  if (req.method === 'POST' && urlPath === '/api/save') {
    var auth = req.headers['authorization'] || '';
    if (!SAVE_SECRET || auth !== 'Bearer ' + SAVE_SECRET) {
      res.writeHead(401, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({error: 'Unauthorized'}));
    }
    var body = '';
    req.on('data', function(chunk) {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) { req.destroy(); } // 10 MB limit
    });
    req.on('end', function() {
      var parsed;
      try { parsed = JSON.parse(body); } catch(e) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({error: 'Invalid JSON'}));
      }
      // Бекап перед перезаписью
      var backupDir = path.join(__dirname, 'backups');
      fs.mkdir(backupDir, { recursive: true }, function() {
        var backupPath = path.join(backupDir, Date.now() + '.json');
        fs.copyFile(DATA_PATH, backupPath, function() {
          cleanOldBackups();
          fs.writeFile(DATA_PATH, JSON.stringify(parsed, null, 2), function(err) {
            if (err) {
              res.writeHead(500, {'Content-Type': 'application/json'});
              return res.end(JSON.stringify({error: err.message}));
            }
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ok: true, publishedAt: parsed.publishedAt || new Date().toISOString()}));
          });
        });
      });
    });
    return;
  }

  // Static files
  var resolved = (urlPath === '/' || urlPath.endsWith('/') || !path.extname(urlPath))
    ? urlPath.replace(/\/?$/, '/index.html')
    : urlPath;
  var filePath = path.normalize(path.join(PUBLIC_DIR, resolved));
  if (!filePath.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(filePath, function(err, data) {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });

}).listen(PORT, function() {
  console.log('[po-board] port ' + PORT + ' | SAVE_SECRET: ' + (SAVE_SECRET ? 'SET' : 'MISSING!'));
});
