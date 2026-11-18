# Notes

- After each save point, push it to GitHub.

## Settings
- Expo SDK: 58 (matches Expo Go from the app store). Only change this if Expo Go on the phone changes.
- AI model: gpt-5.4-mini
- The OpenAI key lives only in `.env` (OPENAI_API_KEY=...). `.env` is in `.gitignore`.

## How to run it
**Easy way (Windows):** double-click **Start Rally.bat** in the Rally folder. It installs Node.js LTS just for you if it's missing (no admin password), installs packages the first time, opens the AI helper and Expo in two windows, and opens a QR code page (also saved as `rally-qr.png`). Keep both windows open.

**In a web browser (no Expo Go):** double-click **Start Rally (Web).bat**. It starts the AI helper and opens Rally. at http://localhost:8082. Keep both windows open. Great for screen-recording the video.

**By hand:** you need two windows open on your computer, both inside the Rally. folder.
1. **AI helper:** `npm run helper` — leave it open. It says if your key was found.
2. **Expo:** `npx expo start` — scan the QR code with Expo Go on your phone.
- Phone and computer must be on the same Wi-Fi. The app finds the helper at your computer's Wi-Fi address, port 3001.
- If you start Expo with `--tunnel`, the phone can't reach the helper. Use the normal `npx expo start` on the same Wi-Fi instead.
- First time on a new computer: run `npm install`, then `npx expo install --fix` and `npx expo-doctor`.

## Putting it online with Vercel
How it works online: Vercel builds the website with `npx expo export -p web`, serves the `dist` folder, and sends every page to the app (settings are in `vercel.json`). The web app asks the AI through the Vercel function `api/match.js`, which reads the key from Vercel's `OPENAI_API_KEY` setting. The key is never in the app or on GitHub.
1. Go to vercel.com and sign in with GitHub.
2. Click **Add New → Project**, pick the **Rally.** repository, and click **Import**.
3. Leave Framework Preset as **Other**. Vercel reads the build settings from `vercel.json`.
4. Open **Environment Variables** and add `OPENAI_API_KEY` with your OpenAI key as the value.
5. Click **Deploy**. Every new push to GitHub updates the website by itself.
- If you change the key later, update it in Vercel → Settings → Environment Variables, then redeploy.
- Tip: set a monthly spending limit on platform.openai.com, because anyone with the link can use the AI. The function allows at most 8 requests a minute from the same address.

## How the AI is reached
- Expo Go → the local AI helper on your computer (`npm run helper`).
- Web on your own computer (localhost) → the local AI helper too.
- Web online (Vercel) → `api/match.js`.
- All three use the same code in `ai/rallyAI.js` and the same trusted list in `src/data/places.json`.

## What's done (Version 1)
1. AI matches: fill in the checklist, tap "Find my matches", and the AI picks trusted places for you, starting with "Nice choices!".
2. Browse a list of trusted volunteer places.
3. Read a description, minimum age, and how to start for each place.
4. Safety tips for volunteering with adults.
5. Safe AI answers: the AI only picks from Rally.'s trusted list, the app throws away anything else, and places are filtered by age.
- Safety: no names (nickname only, no numbers), no addresses, chats aren't saved, no public profiles. Only checklist answers are saved on the phone.

## What's next
- Test with real students and fix anything confusing.
- Put the web version online with Vercel (steps above).
- Pick features from "Maybe Later".

## Maybe Later
- The user can filter volunteer opportunities by age requirements.
- The user can view the location of volunteer sites on a map.
- The user can check the schedule and availability of each opportunity.
- The user can save their favorite volunteer opportunities for later.
- The user can share volunteer opportunities with friends via a link.
- The user can report any unsafe or suspicious volunteer listings.
- The user can receive reminders about upcoming volunteer events they signed up for.
- The user can see ratings and reviews for each volunteer organization.
- The user can search for volunteer opportunities by date or timeframe.
- The user can easily reset their preferences for finding new opportunities.
