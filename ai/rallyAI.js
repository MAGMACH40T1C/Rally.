// rallyAI.js — the one place that asks OpenAI for Rally. matches.
// Used by BOTH the local AI helper (helper/server.js) and the online
// Vercel function (api/match.js). It never prints or stores the key.

const fs = require('fs');
const path = require('path');
const PLACES = require('../src/data/places.json');

const ROOT = path.join(__dirname, '..');
const OPENAI_URL = process.env.RALLY_OPENAI_URL || 'https://api.openai.com/v1/chat/completions';
const AGE_MAX = { '11-12': 12, '13-14': 14, '15-17': 17 };

function readFileSafe(name) {
  try {
    return fs.readFileSync(path.join(ROOT, name), 'utf8');
  } catch {
    return '';
  }
}

// The model name is written in NOTES.md (line: "AI model: ...").
function readModel() {
  const m = readFileSafe('NOTES.md').match(/AI model:\s*`?([\w.\-]+)`?/i);
  return m ? m[1] : 'gpt-5.4-mini';
}

// "My AI’s instructions" section from BRIEF.md.
function readBriefInstructions() {
  const brief = readFileSafe('BRIEF.md');
  const start = brief.search(/^## My AI.s instructions/m);
  if (start === -1) return '';
  const rest = brief.slice(start);
  const next = rest.slice(3).search(/^## /m);
  return (next === -1 ? rest : rest.slice(0, next + 3)).trim();
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

const clean = (v, max = 40) => String(v || '').replace(/[^\p{L}\p{N} &'’\-–,.()]/gu, '').slice(0, max);
const cleanList = (v) => (Array.isArray(v) ? v.slice(0, 15).map((x) => clean(x)) : []);

// The server builds the trusted list itself, so nobody can slip in other places.
function trustedPlacesFor(ageGroupId) {
  const maxAge = AGE_MAX[ageGroupId] || 17;
  return PLACES.filter((p) => p.minAgeWithAdult <= maxAge).map((p) => ({
    id: p.id,
    name: p.name,
    interests: p.interests,
    setting: p.setting,
    minAgeWithAdult: p.minAgeWithAdult,
    minAgeAlone: p.minAgeAlone,
    description: p.description,
  }));
}

// body = { ageGroup: '13-14', checklist: { nickname, ageGroup, interests, setting, company, times } }
async function findMatches(body, key) {
  if (!key) throw new Error('No OpenAI key found');
  const c = (body && body.checklist) || {};
  const checklist = {
    // Nickname: one word, letters only (no numbers, so no phone numbers or addresses).
    nickname: String(c.nickname || '').trim().split(/\s+/)[0].replace(/[^\p{L}'\-]/gu, '').slice(0, 15) || '(no nickname)',
    ageGroup: clean(c.ageGroup),
    interests: cleanList(c.interests),
    setting: clean(c.setting),
    company: cleanList(c.company),
    times: cleanList(c.times),
  };
  const places = trustedPlacesFor(body && body.ageGroup);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 40000);
  try {
    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: readModel(),
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemInstructions() },
          { role: 'user', content: JSON.stringify({ checklist, places }) },
        ],
      }),
    });
    if (!res.ok) {
      throw new Error(res.status === 401 ? 'OpenAI says the key is wrong or expired (401)' : `OpenAI error ${res.status}`);
    }
    const data = await res.json();
    const answer = JSON.parse(data.choices?.[0]?.message?.content || '{}');

    // Keep only matches from the trusted list for this age.
    const allowed = new Set(places.map((p) => p.id));
    return {
      intro: String(answer.intro || 'Nice choices!').slice(0, 400),
      matches: (Array.isArray(answer.matches) ? answer.matches : [])
        .filter((m) => m && allowed.has(m.id))
        .slice(0, 4)
        .map((m) => ({ id: m.id, why: String(m.why || '').slice(0, 400) })),
      tip: String(answer.tip || '').slice(0, 300),
    };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { findMatches, readModel };
