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

## [0.2.0] — 2026-10-13

### Changed
- 🎨 **Full visual identity overhaul**: out with the generic AI-neon look (blobs,
  glass cards, gradient text), in with a hand-printed neo-brutalist "zine" —
  paper + halftone, thick ink borders, hard offset shadows, rotated stickers,
  marquee ticker, per-slide accents, count-up numbers, trading-card archetype
  reveal and a tracklist for repos. Poster PNG redesigned to match.

### Added
- 🌍 **Bilingual EN/RU**: landing, story, archetypes, errors, share text and even
  the downloadable poster — switch anywhere (landing top-right, story top-left);
  choice persists, browser language is auto-detected.
- New flat sticker-style logo and OG banner.

## [0.2.1] — 2026-10-13

### Fixed
- 🖼 **Poster layout collision**: content overflowed the card (handle overlapped
  the headline number, stat boxes crashed into the footer, the archetype ticket
  fell off the card). Recomputed the vertical grid — everything fits inside the
  940×940 card now; the "make yours" footer moved into the paper margin.
- 🌍 Default language is now **English** (previous auto-detection started RU for
  Russian browsers; saved choice still persists).

### Added
- 📤 **Smarter sharing**: X/Telegram buttons now pre-download the poster and show
  an "attach it" hint on desktop; on mobile they open the native share sheet with
  the PNG already attached (Web Share API).

## [0.2.2] — 2026-10-13

### Fixed
- Completed the v0.2.1 language patch: EN is now genuinely the default
  (the previous commit raced and kept the RU auto-detection), and the RU
  "attach your poster" hint string is back.

## [0.2.3] — 2026-10-13

### Fixed
- 📱 **Poster preview squash**: the finale `<canvas>` shrank vertically when the
  slide content exceeded the frame height (flexbox default) — pinned with
  `flex-shrink: 0` + `aspect-ratio: 1/1`.

### Changed
- 🖼 OG/README banner is now **drawn programmatically** (`assets/og-banner.py`,
  PIL) in the zine identity — guaranteed margins, crisp vectors, nothing clipped
  at the edges (the AI-generated one glued text to the left border).

## [0.2.4] - 2026-10-15

### Changed
- Cache lifetime raised from 15 minutes to 12 hours: a year of stats barely moves, and repeat visits stop burning the GitHub limit.
- Hit the rate limit? The error now shows the exact time it refills (GitHub sends that in a response header).

### Added
- Optional personal token field, collapsed under the input. Lifts the limit from 60 to 5000 requests/hour. Lives in this browser only; a rejected token is dropped automatically.

### Fixed
- The contribution-grid request asked for a 30-second timeout but the argument was ignored and it always cut off at 15 seconds. Honored now.

## [0.2.5] - 2026-10-15

### Fixed
- **Download button on phones**: the invisible left/right tap zones used for story navigation were sitting on top of the finale buttons, so taps near their edges were eaten by slide navigation (looked like "the button does nothing", or it jumped a slide back). The finale controls now sit above the tap zones. Same fix covers the share buttons and "make yours".
- The save link is now attached to the page before clicking — some mobile browsers ignore programmatic clicks on links that are not in the DOM — and falls back to a data URL if blob saving fails.

### Added
- A small "saved to Downloads" hint under the download button, so it's visible that the tap registered.

## [0.2.6] - 2026-10-16

### Changed
- The poster is now **vertical 1080×1350 (4:5)** instead of a 1080×1080 square: on phones it no longer reads as a squashed tile, and it sits right in feeds and stories.
- The poster got a lot more to look at: the **contribution grid** (52×7 miniature), **top languages** as bars, a rotated **rhythm sticker** ("night owl · 58% after 22:00"), the secondary archetype as a small line on the ticket, and a **QR sticker** that opens the site so anyone can make their own from your post.
- Finale slide: the preview now matches the 4:5 poster (no more square), sizes itself to fit short screens, and got a few floating doodles so the last screen doesn't feel empty.

### Added
- If the contribution-grid source doesn't answer, the poster shows an honest "grid unavailable" placeholder instead of a hole; with no rhythm data it falls back to a stars/repos sticker, so the layout never falls apart.
- Finale controls shrink on very short screens so the buttons stay reachable.

### Added
- Vendored `qrcode-generator` (MIT, Kazuhiko Arase) under `js/vendor/` with its license in `licenses/` - the site stays dependency-free at runtime.
