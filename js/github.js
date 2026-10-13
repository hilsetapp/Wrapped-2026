/* ═══════════════════════════════════════════════════════════════
   github.js — data layer.
   Everything is fetched from public, unauthenticated, CORS-open
   APIs. Nothing leaves the visitor's browser.
   Exposes a single global: GH
   ═══════════════════════════════════════════════════════════════ */

const GH = (() => {
  const YEAR = 2026;
  const CACHE_PREFIX = "wrapped2026:";
  const CACHE_TTL = 15 * 60 * 1000; // 15 min

  /* ---------- tiny fetch helper with typed errors ---------- */
  const TIMEOUT_MS = 15000;

  async function getJSON(url) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
    let res;
    try {
      res = await fetch(url, { signal: ctl.signal });
    } catch (e) {
      const err = new Error(
        e.name === "AbortError"
          ? "timeout — GitHub API did not answer in time"
          : "network — a browser extension, VPN, turbo-mode or antivirus web filter is likely blocking requests to GitHub"
      );
      err.code = e.name === "AbortError" ? "timeout" : "network";
      throw err;
    } finally {
      clearTimeout(timer);
    }
    if (res.status === 404) {
      const e = new Error("not-found");
      e.code = 404;
      throw e;
    }
    if (res.status === 403) {
      const e = new Error("rate-limited — GitHub allows 60 unauthenticated requests/hour. Try again in a bit.");
      e.code = 403;
      throw e;
    }
    if (!res.ok) {
      const e = new Error("api error " + res.status);
      e.code = res.status;
      throw e;
    }
    return res.json();
  }

  /* optional source: failure returns null instead of breaking the whole wrap */
  async function optional(promise) {
    try { return await promise; } catch (_) { return null; }
  }

  /* ---------- cache ---------- */
  function readCache(user) {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + user);
      if (!raw) return null;
      const item = JSON.parse(raw);
      if (Date.now() - item.time > CACHE_TTL) return null;
      return item.data;
    } catch (_) { return null; }
  }
  function writeCache(user, data) {
    try {
      localStorage.setItem(CACHE_PREFIX + user, JSON.stringify({ time: Date.now(), data }));
    } catch (_) { /* storage may be unavailable — fine */ }
  }

  /* ---------- main collector ---------- */
  // onStep(label, fraction) drives the loading screen
  async function fetchWrapped(username, onStep = () => {}) {
    const user = username.trim().toLowerCase();
    const cached = readCache(user);
    if (cached) {
      onStep("found in your browser cache ✨", 1);
      return cached;
    }

    onStep("fetching profile…", 0.15);
    const profile = await getJSON(`https://api.github.com/users/${encodeURIComponent(user)}`);

    onStep("reading repositories…", 0.35);
    const repos = await getJSON(
      `https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=updated`
    );

    onStep("painting your contribution grid…", 0.55);
    /* this API generates the grid lazily on first request → give it extra time */
    const contrib = await optional(
      getJSON(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(user)}?y=${YEAR}`, 30000)
    );

    onStep("counting pull requests…", 0.72);
    const prs = await optional(
      getJSON(`https://api.github.com/search/issues?q=type:pr+author:${encodeURIComponent(user)}+created:${YEAR}-01-01..${YEAR}-12-31&per_page=1`)
    );

    onStep("counting issues…", 0.8);
    const issues = await optional(
      getJSON(`https://api.github.com/search/issues?q=type:issue+author:${encodeURIComponent(user)}+created:${YEAR}-01-01..${YEAR}-12-31&per_page=1`)
    );

    onStep("sensing your coding rhythm…", 0.9);
    const events = await optional(
      getJSON(`https://api.github.com/users/${encodeURIComponent(user)}/events/public?per_page=100`)
    );

    const data = {
      year: YEAR,
      profile,
      repos: Array.isArray(repos) ? repos : [],
      contrib,        // may be null → heatmap slide is skipped gracefully
      prs: prs ? prs.total_count : null,
      issues: issues ? issues.total_count : null,
      events: Array.isArray(events) ? events : [],
    };

    onStep("wrapping it up…", 1);
    writeCache(user, data);
    return data;
  }

  return { fetchWrapped, YEAR };
})();
