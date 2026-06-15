# Tare

**Zero out the dead weight.**

A client-side Instagram follow analytics tool. Upload your official Instagram data export and instantly see who doesn't follow you back, who your most loyal followers are, and how your follower count has grown over time. No login. No server. Your data never leaves your device.

**Live:** [usetare.vercel.app](https://usetare.vercel.app)

---

## Features

- **Not Following Back** — searchable, sortable list of everyone you follow who doesn't follow back, with a per-user "done" tracker so you can hide accounts as you unfollow them
- **Fans** — people who follow you that you haven't followed back
- **Day Ones** — your oldest mutuals ranked by how long you've followed each other, plus early follows who still haven't followed back
- **Growth Graph** — cumulative follower/following chart over time with interactive hover tooltips and PNG export
- **Share Card** — severity-rated 1080×1080 PNG (ur cooked / yikes... / could be worse / not bad) with dynamic color themes
- **Changes Over Time** — IndexedDB snapshot history; upload again weeks later to see exactly who unfollowed you or followed you since
- **EN / ES** — full bilingual support via react-i18next
- **Zero data upload** — all parsing runs in the browser via JSZip; nothing is sent to any server

---

## Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| ZIP parsing | JSZip |
| Local persistence | IndexedDB via `idb` |
| i18n | react-i18next |
| Analytics | PostHog (custom events) + Vercel Analytics |
| Deployment | Vercel |

---

## How it works

Instagram lets you export your own data as a ZIP file containing JSON files for your followers and following lists. Tare reads those files entirely in the browser — no server ever sees your data.

The export has two different JSON schemas (followers use one format, following uses another with a different field structure). Tare handles both, plus HTML fallback for older exports.

---

## Running locally

```bash
npm install
npm run dev
```

Requires a `.env.local` with PostHog credentials (analytics only — the app works without it):

```
VITE_POSTHOG_PROJECT_TOKEN=your_token
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

## Deploy

```bash
npx vercel@latest --prod
```

---

## Privacy

Tare processes everything locally. The only external calls are:
- PostHog analytics events (anonymous, no PII — just counts and aggregate stats)
- Vercel Analytics (anonymous page views)

No Instagram credentials are ever requested or stored.
