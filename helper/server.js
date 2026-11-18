// Rally. AI helper — runs on YOUR computer, never inside the app.
// It reads your OpenAI key from .env, passes the student's checklist
// to the AI, and sends the answer back to the phone.
// Start it with:  npm run helper
// No chats are saved, and the key is never printed.

const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = 3001;
const OPENAI_URL = process.env.RALLY_OPENAI_URL || 'https://api.openai.com/v1/chat/completions';

// --- Read the key from .env only ---
function readKey() {
  try {
    const text = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
    const line = text.split(/\r?\n/).find((l) => l.trim().startsWith('OPENAI_API_KEY='));
    const key = line ? line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '') : '';
    if (!key || key === 'paste-your-key-here') return '';
    return key;
  } catch {
    return '';
  }
}

// --- Read the model name from NOTES.md (line: "AI model: ...") ---
function readModel() {
  try {
    const notes = fs.readFileSync(path.join(ROOT, 'NOTES.md'), 'utf8');
    const m = notes.match(/AI model:\s*`?([\w.\-]+)`?/i);
    if (m) return m[1];
  } catch {}
  return 'gpt-5.4-mini';
}

// --- Read "My AI’s instructions" from BRIEF.md ---
function readBriefInstructions() {
  try {
    const brief = fs.readFileSync(path.join(ROOT, 'BRIEF.md'), 'utf8');
    const start = brief.search(/^## My AI.s instructions/m);
    if (start === -1) return '';
    const rest = brief.slice(start);
    const next = rest.slice(3).search(/^## /m);
    return (next === -1 ? rest : rest.slice(0, next + 3)).trim();
  } catch {
    return '';
  }
}

function systemInstructions() {
  return [
    'You are the AI inside Rally., a phone app that helps students (mostly ages 11-17, grades 6-12) find volunteer activities they will actually enjoy.',
    '',
    'These are the project owner’s instructions for you, from BRIEF.md:',
    readBriefInstructions(),
    '',
    'Extra rules you must always follow:',
    '- Only recommend places from the "places" list you are given. Never invent a place, an address, a phone number, a website, a person, or a schedule.',
    '- Use only the facts from the student’s checklist. Do not guess anything else about them.',
    '- Never ask for or mention a real name, address, school name, phone number, email, or other personal details. Use the nickname only if one was given.',
    '- Respect ages: the student’s age must be at least the place’s minAgeWithAdult. Remind them to check the place’s own age rules.',
    '- Always remind them that a trusted adult should be with them or know where they are.',
    '- Be warm, upbeat, and simple. Short sentences a middle schooler can read easily.',
    '',
    'Reply ONLY with JSON in exactly this shape:',
    '{"intro": "starts with \\"Nice choices!\\" (add the nickname if given), one or two friendly sentences",',
    ' "matches": [{"id": "place id from the list", "why": "1-2 sentences linking this place to their checklist answers"}],',
    ' "tip": "one short safety tip about volunteering with a trusted adult"}',
    'Give 3 matches (or fewer if fewer fit), best match first.',
  ].join('\n');
}

function wifiAddress() {
  for (const list of Object.values(os.networkInterfaces())) {
    for (const a of list || []) {
      if (a.family === 'IPv4' && !a.internal) return a.address;
    }
  }
  return 'localhost';
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
      if (data.length > 50000) reject(new Error('too big'));
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function askOpenAI(checklist, places) {
  const key = readKey();
  if (!key) throw new Error('No OpenAI key found in .env');

  // Extra safety: nickname is one word, no numbers.
  const safeChecklist = { ...checklist };
  safeChecklist.nickname = String(checklist.nickname || '').replace(/[^A-Za-z'\- ()]/g, '').split(' ')[0].slice(0, 15);

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: readModel(),
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemInstructions() },
        { role: 'user', content: JSON.stringify({ checklist: safeChecklist, places }) },
      ],
    }),
  });
  if (!res.ok) {
    const status = res.status;
    throw new Error(status === 401 ? 'OpenAI says the key is wrong or expired (401)' : `OpenAI error ${status}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '{}';
  return JSON.parse(text);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method === 'GET' && req.url === '/health') {
    return send(res, 200, { ok: true, keyLoaded: Boolean(readKey()), model: readModel() });
  }
  if (req.method === 'POST' && req.url === '/match') {
    try {
      const { checklist, places } = JSON.parse(await readBody(req));
      if (!checklist || !Array.isArray(places) || places.length === 0) return send(res, 400, { error: 'bad request' });
      const answer = await askOpenAI(checklist, places);
      console.log(`[${new Date().toLocaleTimeString()}] Sent matches to the app.`);
      return send(res, 200, answer);
    } catch (e) {
      console.log(`[${new Date().toLocaleTimeString()}] Problem: ${e.message}`);
      return send(res, 502, { error: 'ai_unavailable' });
    }
  }
  send(res, 404, { error: 'not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  Rally. AI helper is running ✅');
  console.log(`  Phone address:  http://${wifiAddress()}:${PORT}`);
  console.log(`  OpenAI key in .env:  ${readKey() ? 'found' : 'NOT FOUND — paste it into .env'}`);
  console.log(`  AI model:  ${readModel()}`);
  console.log('  Leave this window open while you use the app.');
  console.log('');
});
