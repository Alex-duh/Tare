# Tare — Project Brief & Progress

## What is this?
A client-side Instagram analytics web app. Users upload their official Instagram data export (zip or JSON/HTML files). All parsing happens in the browser — data never leaves the device. The main differentiator over other "unfollow tracker" sites: no Instagram login required, full privacy, and unique features like Day Ones (oldest mutual followers ranked by timestamp) and Changes Over Time (local diff history via IndexedDB).

Name: **Tare** (as in zeroing out a scale — a fresh, honest read of your Instagram).
Old working name: RatioFixer / InstaCompare.

---

## Stack (decided)
- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Zip parsing:** JSZip (client-side, browser)
- **Local persistence:** IndexedDB via the `idb` library (Jake Archibald)
- **Analytics:** Single anonymous POST to a usage counter — `trackAnalysis()` stub hitting `/api/count`
- **Analytics backend:** TBD — Cloudflare Worker (KV) OR Vercel Edge Function + Upstash Redis (see open questions)
- **Hosting:** Vercel (for custom URL)

---

## Design (decided)
- Dark background (`#0a0a0a`)
- Instagram gradient palette: `#405de6 → #833ab4 → #e1306c → #fd1d1d → #f77737 → #fcb045`
- Interactive background: CSS morphing gradient blobs (blurred orbs, `@keyframes`) + tsParticles layer
- Two-page structure: `index.html` (landing + tutorial) → `results` (tab view)
- Typography: Inter (Google Fonts)
- Not vibe-coded: gradient lives in accents, borders, buttons — not splattered everywhere
- Glassmorphism upload zone (backdrop-blur + gradient border)

---

## Features (decided)

### Tab 1 — Overview
Headline stat cards: total following, total followers, follow-back ratio, non-followers count, fans-you-don't-follow-back count.

### Tab 2 — Not Following Back
- Set A: Accounts you follow who don't follow you back (searchable, sortable, profile links)
- Set B: Accounts who follow you that you don't follow back
- Layout: two sections in one scrollable page (NOT nested tabs)

### Tab 3 — Day Ones
- Rank mutual followers by follow timestamp (oldest first)
- Human-readable: "Following each other since [date], [X] years"
- Loyalty highlight on top 10
- "Early follows who left" — accounts you followed early that no longer follow you
- **Requires JSON export** (HTML exports have no timestamps) — UI must communicate this clearly

### Tab 4 — Changes Over Time
- On each upload, store snapshot (follower + following username sets) in IndexedDB, keyed by date
- Diff current vs. most recent stored snapshot: who unfollowed, who newly followed, who you started/stopped following, net change
- First upload = baseline (empty state explaining this)
- History view: pick any two snapshots to compare
- Snapshot data NEVER leaves device — pure IndexedDB

### Footer
- "X analyses run" — pulled from the analytics counter endpoint

### Top-right
- About / Privacy modal: explains data never leaves browser, no login, no server

---

## Data format details
Instagram export paths (JSON — preferred):
- `connections/followers_and_following/followers_1.json` (may split: `followers_2.json`, etc.)
- `connections/followers_and_following/following.json`

Each entry shape:
```json
{
  "string_list_data": [
    {
      "value": "username",
      "href": "https://www.instagram.com/username",
      "timestamp": 1609459200
    }
  ]
}
```

HTML fallback paths (no timestamps — Day Ones tab disabled):
- `followers_1.html`
- `following.html`

---

## Screenshots needed from user's phone
Take these in order from the Instagram mobile app. Name them exactly as listed:

| File name | What to capture |
|---|---|
| `step-1-account-center.png` | Profile → ☰ menu → "Account Center" screen |
| `step-2-download-info.png` | "Your information and permissions" → "Download your information" |
| `step-3-select-type.png` | After selecting your account → "Some of your information" option highlighted |
| `step-4-select-data.png` | Checklist screen — ONLY "Followers and following" checked, everything else unchecked |
| `step-5-format-json.png` | Format screen — **JSON selected** (not HTML), Date range: All time |

Place screenshots in: `public/screenshots/`

---

## Open questions (to resolve before building)
1. **Analytics backend:** Cloudflare Worker + KV vs. Vercel Edge Function + Upstash Redis. Cloudflare is more purpose-built but means two platforms. Vercel keeps everything in one dashboard. Leaning toward Vercel for simplicity.
2. **HTML fallback + Day Ones:** When HTML files are detected, Day Ones tab should show a clear "Upgrade to JSON" empty state rather than silently showing no data.
3. **IndexedDB warning:** Should warn users that clearing browser storage deletes their snapshot history.

---

## Progress

- [x] Original Python script (`compare.py`) — parses HTML exports, finds non-followers
- [x] README written (as RatioFixer)
- [x] Brainstorming complete — stack, design, features, data format all decided
- [ ] Screenshots taken and placed in `public/screenshots/`
- [ ] Resolve analytics backend question (Cloudflare vs. Vercel)
- [ ] Scaffold Vite + React + TypeScript + Tailwind project
- [ ] Build upload zone + JSZip parsing
- [ ] Build Tab 1: Overview
- [ ] Build Tab 2: Not Following Back
- [ ] Build Tab 3: Day Ones
- [ ] Build Tab 4: Changes Over Time (IndexedDB)
- [ ] Build Cloudflare Worker stub / Vercel Edge Function
- [ ] Polish: interactive background, animations, mobile responsiveness
- [ ] Deploy to Vercel
- [ ] Update README with architecture + privacy model
