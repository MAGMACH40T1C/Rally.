// askAI.js — the ONLY place in the app that talks to the AI.
// The app never holds the OpenAI key. It sends the checklist to the
// Rally. AI helper running on your computer, and the helper asks OpenAI.

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { PLACES, getPlace } from './data/places';
import { AGE_GROUPS, describeAnswers } from './data/checklist';

const HELPER_PORT = 3001;

export const FRIENDLY_ERROR =
  'Rally. couldn’t reach the AI right now. Please check that your OpenAI key in .env is correct, and that the Rally. AI helper is running on your computer (and that your phone is on the same Wi-Fi).';

// Expo Go tells us the computer's Wi-Fi address (like 192.168.1.20:8081).
// The helper runs on that same computer, so we reuse the address.
export function helperUrl() {
  // In a web browser, the helper is on the same computer as the page.
  if (Platform.OS === 'web') return `http://${window.location.hostname || 'localhost'}:${HELPER_PORT}`;
  const hostUri = Constants.expoConfig?.hostUri || '';
  const host = hostUri.split(':')[0] || 'localhost';
  return `http://${host}:${HELPER_PORT}`;
}

// Only places the student is old enough for (with a trusted adult).
export function placesForAge(ageGroupId) {
  const group = AGE_GROUPS.find((g) => g.id === ageGroupId);
  const maxAge = group ? group.maxAge : 17;
  return PLACES.filter((p) => p.minAgeWithAdult <= maxAge);
}

export async function findMatches(answers) {
  const allowed = placesForAge(answers.ageGroup);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  try {
    const res = await fetch(`${helperUrl()}/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        checklist: describeAnswers(answers),
        places: allowed.map((p) => ({
          id: p.id,
          name: p.name,
          interests: p.interests,
          setting: p.setting,
          minAgeWithAdult: p.minAgeWithAdult,
          minAgeAlone: p.minAgeAlone,
          description: p.description,
        })),
      }),
    });
    if (!res.ok) throw new Error('helper error');
    const data = await res.json();

    // Safety check: keep only places that are on Rally.'s trusted list
    // AND allowed for this age. Anything else the AI says is thrown away.
    const allowedIds = new Set(allowed.map((p) => p.id));
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
