// The checklist the student fills in before the AI picks their matches.

export const AGE_GROUPS = [
  { id: '11-12', label: '11–12', maxAge: 12 },
  { id: '13-14', label: '13–14', maxAge: 14 },
  { id: '15-17', label: '15–17', maxAge: 17 },
];

export const INTERESTS = [
  { id: 'animals', label: '🐾 Animals' },
  { id: 'outdoors', label: '🌳 Being outside' },
  { id: 'environment', label: '♻️ Helping the planet' },
  { id: 'kids', label: '🧒 Helping younger kids' },
  { id: 'seniors', label: '👵 Older adults' },
  { id: 'food', label: '🥫 Food & hunger' },
  { id: 'reading', label: '📚 Books & reading' },
  { id: 'arts', label: '🎨 Art & crafts' },
  { id: 'music', label: '🎵 Music' },
  { id: 'sports', label: '🏀 Sports & moving' },
  { id: 'tech', label: '💻 Tech' },
  { id: 'building', label: '🔨 Building things' },
  { id: 'health', label: '🏥 Health' },
];

export const SETTINGS = [
  { id: 'indoors', label: 'Inside' },
  { id: 'outdoors', label: 'Outside' },
  { id: 'both', label: 'Either is fine' },
];

export const COMPANY = [
  { id: 'friends', label: 'With friends' },
  { id: 'family', label: 'With family' },
  { id: 'new-people', label: 'Meeting new people' },
];

export const TIMES = [
  { id: 'after-school', label: 'After school' },
  { id: 'weekends', label: 'Weekends' },
  { id: 'summer', label: 'Summer break' },
];

export const EMPTY_ANSWERS = {
  nickname: '',
  ageGroup: null,
  interests: [],
  setting: null,
  company: [],
  times: [],
};

// Turn ids into plain words so the AI gets readable facts.
export function describeAnswers(a) {
  const labels = (list, ids) =>
    list.filter((x) => ids.includes(x.id)).map((x) => x.label.replace(/^[^A-Za-z]+/, ''));
  const one = (list, id) => list.find((x) => x.id === id)?.label || 'not answered';
  return {
    nickname: a.nickname || '(no nickname)',
    ageGroup: one(AGE_GROUPS, a.ageGroup),
    interests: labels(INTERESTS, a.interests),
    setting: one(SETTINGS, a.setting),
    company: labels(COMPANY, a.company),
    times: labels(TIMES, a.times),
  };
}

// Safety: block anything that looks like a real name, address or phone number.
export function nicknameProblem(text) {
  if (!text) return null;
  if (/\d/.test(text)) return 'Nicknames can’t have numbers. Please don’t share phone numbers or addresses.';
  if (/@/.test(text)) return 'Please don’t share email addresses.';
  if (text.trim().split(/\s+/).length > 1) return 'Just one word, please. Use a nickname, not your full name.';
  if (text.length > 15) return 'Keep your nickname short (15 letters or less).';
  return null;
}
