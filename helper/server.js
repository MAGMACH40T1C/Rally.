// Rally. AI helper — runs on YOUR computer, for Expo Go (and local web testing).
// It reads your OpenAI key from .env and asks the AI using ai/rallyAI.js,
// the same code the online Vercel function uses.
// Start it with:  npm run helper
// No chats are saved, and the key is never printed.

const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { findMatches, readModel } = require('../ai/rallyAI');

const ROOT = path.join(__dirname, '..');
const PORT = 3001;
const STATUS_FILE = path.join(ROOT, 'helper-status.txt');

// Saves what happened last (never the key) so problems are easy to check.
function report(message) {
  const line = `[${new Date().toLocaleString()}] ${message}`;
  console.log(line);
  try {
    fs.writeFileSync(STATUS_FILE, line + '\n');
  } catch {}
}

// Read the key from .env only.
function readKey() {
  try {
    const text = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
    const line = text.split(/\r?\n/).find((l) => l.trim().startsWith('OPENAI_API_KEY='));
    const key = line ? line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '') : '';
    return key && key !== 'paste-your-key-here' ? key : '';
  } catch {
    return '';
  }
}

function wifiAddress() {
  const found = [];
  for (const [name, list] of Object.entries(os.networkInterfaces())) {
    for (const a of list || []) {
      if (a.family === 'IPv4' && !a.internal && !/vEthernet|VirtualBox|VMware|WSL/i.test(name)) found.push(a.address);
    }
  }
  return found.find((ip) => ip.startsWith('192.168.')) || found.find((ip) => ip.startsWith('10.')) || found[0] || 'localhost';
}

function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 20000) reject(new Error('too big'));
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method === 'GET' && req.url === '/health') {
    return send(res, 200, { ok: true, keyLoaded: Boolean(readKey()), model: readModel() });
  }
  if (req.method === 'POST' && (req.url === '/match' || req.url === '/api/match')) {
    report('The app asked for matches. Asking OpenAI...');
    try {
      const answer = await findMatches(JSON.parse(await readBody(req)), readKey());
      if (answer.matches.length === 0) throw new Error('the AI gave no matches from the trusted list');
      report('OK: sent matches to the app.');
      return send(res, 200, answer);
    } catch (e) {
      report(`Problem: ${e.message}`);
      return send(res, 502, { error: 'ai_unavailable' });
    }
  }
  send(res, 404, { error: 'not found' });
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log('\n  The Rally. AI helper is already running in another window. You can close this one.\n');
  } else {
    console.log('Helper problem:', e.message);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  Rally. AI helper is running ✅');
  console.log(`  Phone address:  http://${wifiAddress()}:${PORT}`);
  console.log(`  OpenAI key in .env:  ${readKey() ? 'found' : 'NOT FOUND — paste it into .env'}`);
  console.log(`  AI model:  ${readModel()}`);
  console.log('  Leave this window open while you use the app.');
  console.log('');
  report(`Started. Key in .env: ${readKey() ? 'found' : 'NOT FOUND'}. Model: ${readModel()}.`);
});
