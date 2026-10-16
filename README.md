<div align="center">

<img src="assets/logo.png" width="120" alt="GitHub Wrapped 2026 logo">

# GitHub Wrapped 2026

**Your year in code as a beautiful shareable story — no login, just a username.**

[![Live site](https://img.shields.io/badge/Try%20it-hilsetapp.github.io%2Fwrapped--2026-22d3ee?style=for-the-badge)](https://hilsetapp.github.io/wrapped-2026/)
[![License: MIT](https://img.shields.io/badge/License-MIT-e879f9?style=for-the-badge)](LICENSE)
[![No backend](https://img.shields.io/badge/backend-none.%20ever.-4f46e5?style=for-the-badge)](#how-it-works)

[🌍 Русская версия → README.ru.md](README.ru.md)

![GitHub Wrapped 2026 banner](assets/og-banner.png)

</div>

---

## ✨ What is this?

Spotify Wrapped — but for your GitHub. Type any username and get an **animated story**
(tap-through slides, just like Instagram/Spotify) about their 2026:

- 📊 **the big numbers** — contributions, pull requests, new repos, stars earned
- 🎨 **top languages** with animated bars
- 🟩 **your contribution grid**, painted — longest streak, wildest day
- 🦉 **your coding rhythm** — night owl or daytime coder? weekend warrior?
- 🃏 **your coding archetype** — *Night Owl, AI Native, Weekend Warrior, Grid Painter, Polyglot…*
- 📦 **repos that defined your year** + your AI-era footprint 🤖
- 🌍 **English & Русский** — one-tap language switch, works even mid-story, poster included

…ending with a **shareable 1080×1350 poster PNG** (vertical 4:5: the year, your grid,
top languages, rhythm, archetype and a QR back to the site) you can download and post anywhere.

## 🚀 Try it in 10 seconds

> **https://hilsetapp.github.io/Wrapped-2026/**

1. Open the link.
2. Type any GitHub username — yours, a friend's, `torvalds`…
3. Tap through the story, download the poster, share it.

No account, no OAuth, no "Sign in with GitHub". Nothing to install — there isn't even a server.

## 🔒 Privacy is the feature

Everything runs **100% in your browser**. The page does a handful of `fetch` calls
straight from your device to free public APIs, and that's it:

- there is **no backend**, no database, no analytics, no cookies;
- your result is cached in **your own** `localStorage` for 15 minutes (so a refresh is instant);
- the poster is rendered by your browser's `<canvas>` and never uploaded anywhere.

You can verify this yourself: open DevTools → Network — you'll only see calls to
`api.github.com` and the contributions API, all triggered by *your* browser.

## 🛠 How it works

Data comes from unauthenticated, CORS-open public endpoints (60 GitHub API
requests/hour per visitor IP — the app handles the limit gracefully):

| What | Where from |
|---|---|
| Profile & avatar | `api.github.com/users/{u}` |
| Repos, languages, stars, AI footprint | `api.github.com/users/{u}/repos` |
| Full-year contribution graph & streaks | `github-contributions-api.jogruber.de` |
| PR / issue counts for 2026 | `api.github.com/search/issues` |
| Coding rhythm (night owl %) | `api.github.com/users/{u}/events/public` |

If one source is unavailable, its slide is skipped, not the whole wrap.

### Tech stack (deliberately boring)

Plain **HTML + CSS + JavaScript. Zero dependencies. No build step.**
You can clone the repo and double-click `index.html` — it works.

```
wrapped-2026/
├── index.html          # landing + story viewport
├── styles.css          # neo-brutalist "zine" theme: paper, ink, hard shadows
├── js/
│   ├── i18n.js         # EN/RU strings for landing, story and poster
│   ├── github.js       # the data layer (fetch + localStorage cache)
│   ├── stats.js        # turns raw data into streaks, languages, archetypes
│   ├── poster.js       # draws the 1080×1350 PNG on canvas
│   ├── vendor/         # vendored qrcode-generator (MIT) for the poster QR
│   └── app.js          # story engine: slides, autoplay, tap zones, share
└── assets/             # logo & og-banner
```

### Run locally

```bash
git clone https://github.com/hilsetapp/wrapped-2026.git
cd wrapped-2026
# option 1: just open index.html in a browser ✅
# option 2: serve it (nicer for mobile testing on the same Wi-Fi):
python3 -m http.server 8000
```

## 🎁 Why share the poster?

The watermark on every poster is the viral loop: friends see your result →
they type their own username → they post their own poster. That's the whole
Wrapped magic, now for developers.

## 🤝 Contributing

Ideas for new archetypes, slide designs or translations are very welcome —
see [CONTRIBUTING.md](CONTRIBUTING.md). Bug reports and feature wishes go into
[Issues](https://github.com/hilsetapp/wrapped-2026/issues).

## ⭐ Star this repo

If the story made you smile, a star helps others find it — and makes the
author's own Wrapped much prettier 😄

## License

MIT — do anything, just keep the notice. See [LICENSE](LICENSE).

---

<div align="center">
Made with 💜 and zero servers · 2026
</div>
