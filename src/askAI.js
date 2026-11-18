// askAI.js — the ONLY place in the app that talks to the AI.
// The app never holds the OpenAI key.
//  • Expo Go: asks the Rally. AI helper running on your computer.
//  • Web (online): asks the Vercel function at /api/match.
//  • Web on your own computer (localhost): asks the local AI helper,
//    because Expo's local web server doesn't run Vercel functions.

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { PLACES, getPlace } from './data/places';
import { AGE_GROUPS, describeAnswers } from './data/checklist';

const HELPER_PORT = 3001;

export const FRIENDLY_ERROR =
  'Rally. couldn’t reach the AI right now. Please check that your OpenAI key is correct, and that the Rally. AI helper is running on your computer (and that your phone is on the same Wi-Fi).';

export function aiUrl() {
  if (Platform.OS === 'web') {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1' || /^(192\.168|10)\./.test(host);
    return isLocal ? `http://${host}:${HELPER_PORT}/match` : '/api/match';
  }
  // Expo Go tells us the computer's Wi-Fi address (like 192.168.1.20:8081).
  const hostUri = Constants.expoConfig?.hostUri || '';
  const host = hostUri.split(':')[0] || 'localhost';
  return `http://${host}:${HELPER_PORT}/match`;
}

// Only places the student is old enough for (with a trusted adult).
export function placesForAge(ageGroupId) {
  const group = AGE_GROUPS.find((g) => g.id === ageGroupId);
  const maxAge = group ? group.maxAge : 17;
  return PLACES.filter((p) => p.minAgeWithAdult <= maxAge);
}

export async function findMatches(answers) {
  const allowedIds = new Set(placesForAge(answers.ageGroup).map((p) => p.id));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  try {
    const res = await fetch(aiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({ ageGroup: answers.ageGroup, checklist: describeAnswers(answers) }),
    });
    if (!res.ok) throw new Error('helper error');
    const data = await res.json();

    // Safety check: keep only places on Rally.'s trusted list for this age.
    const matches = (data.matches || [])
      .filter((m) => m && allowedIds.has(m.id))
      .map((m) => ({ place: getPlace(m.id), why: String(m.why || '') }))
      .slice(0, 4);
    if (matches.length === 0) throw new Error('no matches');

    return {
      intro: String(data.intro || 'Nice choices!'),
      matches,
      tip: String(data.tip || 'Always go with a trusted adult and check the place’s age rules.'),
    };
  } catch (e) {
    throw new Error(FRIENDLY_ERROR);
  } finally {
    clearTimeout(timer);
  }
}
