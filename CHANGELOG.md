# Changelog

All notable changes to this project will be documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/).

## [0.1.0] — 2026-10-13

### Added
- 🎉 First public release of **GitHub Wrapped 2026**
- Username-only flow — no login, no OAuth, works straight from `index.html`
- Animated story deck: intro → big numbers → languages → contribution grid →
  rhythm → archetype reveal → signature repos → finale poster
- Coding archetypes (Night Owl, AI Native, Weekend Warrior, Grid Painter,
  Polyglot, Community Star…) with a secondary "hint of" tag
- Downloadable 1080×1080 poster PNG with share watermark
- Share buttons for X / Telegram / copy-link; deep links via `?u=username`
- 15-minute `localStorage` cache to be gentle with GitHub's rate limits
- Graceful fallbacks for rate limits and unavailable data sources

## [0.1.1] — 2026-10-13

### Fixed
- 🔧 **Never a silent spinner again**: every API request now has a 15s timeout
  (AbortController) and a 45s overall watchdog — blocked or dead networks surface a
  clear, actionable message instead of an endless loader.
- Error states now distinguish: user not found / rate limit / timeout / blocked-by-extension.

## [0.1.2] — 2026-10-13

### Fixed
- 🥞 **THE z-layer bug**: author's `display: flex` on `#loading` and `#story`
  overrode the `hidden` attribute (classic CSS priority gotcha), so the loading
  overlay was rendered on top of the landing from page load and swallowed all clicks —
  the app looked permanently stuck. Added the canonical `[hidden] { display: none !important; }` guard.
