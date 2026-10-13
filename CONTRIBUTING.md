# Contributing to GitHub Wrapped 2026

Thanks for wanting to help! This project is deliberately simple — plain HTML/CSS/JS, zero
dependencies, no build step. If you can open a browser, you can contribute.

## Quick start

```bash
git clone https://github.com/hilsetapp/wrapped-2026.git
cd wrapped-2026
python3 -m http.server 8000   # or just open index.html
```

Edit, reload, done. Before sending a PR, please run a syntax check:

```bash
node --check js/github.js && node --check js/stats.js && node --check js/poster.js && node --check js/app.js
```

## Great places to help

- **New archetypes** — rules live in `js/stats.js` (`const arches = []`). New archetypes
  should be funny *and* accurate, based only on data we already fetch (no new API calls).
- **Slide ideas** — new slides are just functions returning HTML string, added in `js/app.js#buildDeck()`.
- **Poster design** — `js/poster.js` is pure canvas drawing.
- **Translations** — UI is English-first; landing page localization PRs welcome.
- **Bug reports** — [open an Issue](https://github.com/hilsetapp/wrapped-2026/issues) with your
  browser, username tested, and a screenshot of DevTools console.

## Ground rules

1. **No backend, ever.** Everything must run client-side.
2. **No account, ever.** Only unauthenticated, CORS-open public APIs.
3. **Graceful degradation.** Every extra data source must be optional (`optional()` helper),
   so one dead API never kills the whole story.
4. Keep the code beginner-readable — this is a learning-friendly project.

## Commit style

Short imperative messages are perfect: `add "Caped Commenter" archetype`, `fix streak off-by-one`.

By contributing you agree your work is licensed under the [MIT License](LICENSE).
