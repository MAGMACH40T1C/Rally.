// Vercel function: the web version of Rally. asks the AI through here.
// The key comes ONLY from Vercel's OPENAI_API_KEY environment variable.

const { findMatches } = require('../ai/rallyAI');

// Simple guard so strangers can't run up your OpenAI bill:
// at most 8 requests per minute from the same address.
const recent = new Map();
function tooMany(ip) {
  const now = Date.now();
  const list = (recent.get(ip) || []).filter((t) => now - t < 60000);
  list.push(now);
  recent.set(ip, list);
  return list.length > 8;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (tooMany(ip)) return res.status(429).json({ error: 'Too many requests. Wait a minute and try again.' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const answer = await findMatches(body, process.env.OPENAI_API_KEY);
    if (answer.matches.length === 0) throw new Error('no matches');
    return res.status(200).json(answer);
  } catch (e) {
    console.log('Rally AI problem:', e.message);
    return res.status(502).json({ error: 'ai_unavailable' });
  }
};
