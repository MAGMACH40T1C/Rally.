// Rally.'s trusted list lives in places.json, so the app, the local AI helper
// and the online Vercel function all use exactly the same list.
// The AI may ONLY pick from these places. Ages are typical starting points;
// every location sets its own rules, so the app always says to check.
import PLACES_DATA from './places.json';

export const PLACES = PLACES_DATA;

export function getPlace(id) {
  return PLACES.find((p) => p.id === id);
}
