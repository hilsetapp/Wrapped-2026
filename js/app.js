/* ═══════════════════════════════════════════════════════════════
   app.js — story engine + UI orchestration.
   ═══════════════════════════════════════════════════════════════ */

(() => {
  const $ = (sel) => document.querySelector(sel);
  const SITE_URL = "https://hilsetapp.github.io/wrapped-2026/";
  const SLIDE_MS = 6500;

  const landing = $("#landing"), story = $("#story"), loading = $("#loading");
  const slidesEl = $("#slides"), progressEl = $("#progress");
  const fillEl = $("#loading-fill"), stepEl = $("#loading-step");
  const errorEl = $("#error");

  let raw = null, stats = null;
  let slideFns = [];
  let idx = 0;
  let timer = null, startedAt = 0, remaining = SLIDE_MS;
  let posterReady = false;

  /* ══════════ loading ══════════ */
  const showLoading = () => { loading.hidden = false; fillEl.style.width = "4%"; };
  const hideLoading = () => { loading.hidden = true; };
  const loadStep = (label, frac) => { stepEl.textContent = label; fillEl.style.width = Math.round(frac * 100) + "%"; };

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  /* ══════════ start / reset ══════════ */
  async function start(username) {
    errorEl.hidden = true;
    const btn = landing.querySelector(".btn-primary");
    btn.disabled = true;
    showLoading();
    /* overall watchdog: an app must never become a silent spinner */
    const watchdog = setTimeout(() => {
      hideLoading();
      showError("Still nothing after 45 seconds 😔 — something is blocking requests to GitHub. Try disabling your ad-blocker / VPN / browser turbo-mode for this page and press the button again.");
    }, 45000);
    try {
      raw = await GH.fetchWrapped(username, loadStep);
      stats = Stats.compute(raw);
      buildDeck();
      enterStory();
    } catch (e) {
      hideLoading();
      if (e.code === 404) showError("Couldn't find @" + username + " on GitHub — check the spelling 👀");
      else if (e.code === 403) showError("GitHub's free API limit is hit (60 requests/hour per visitor). Take a coffee and try again ☕");
      else if (e.code === "timeout") showError("GitHub API is not answering (timeout). Might be a slow connection or a VPN — try again 🔁");
      else if (e.code === "network") showError("Requests to GitHub are blocked: disable ad-blocker / VPN / turbo-mode / antivirus web filter for this page and retry 🔁");
      else showError("Something went wrong while talking to GitHub. Check your connection and retry 🔁");
    } finally {
      clearTimeout(watchdog);
      btn.disabled = false;
    }
  }

  function resetToLanding() {
    clearTimeout(timer);
    timer = null;
    posterReady = false;
    idx = 0;
    story.hidden = true;
    landing.hidden = false;
    slidesEl.innerHTML = "";
    progressEl.innerHTML = "";
    $("#username").focus();
  }

  /* ══════════ deck construction ══════════ */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const HEAT_COLORS = ["rgba(255,255,255,.08)", "#155e75", "#0e7490", "#22d3ee", "#a5f3fc"];

  function heatmapHTML(days) {
    /* take the last full 24 weeks (~ late half of year) so the grid fits the phone */
    const cells = days.slice(-24 * 7);
    let cols = '<div class="heat-col">';
    cells.forEach((d, i) => {
      cols += `<span class="heat-cell" style="background:${HEAT_COLORS[d.level] || HEAT_COLORS[0]}" title="${d.date}: ${d.count}"></span>`;
      if (i % 7 === 6) cols += '</div><div class="heat-col">';
    });
    cols += "</div>";
    return `<div class="heatmap">${cols}</div>`;
  }

  function buildDeck() {
    const p = raw.profile;
    const f = Stats.fmt;
    slideFns = [];

    /* — 1: intro — */
    slideFns.push(() => `
      <img class="avatar-xl" src="${esc(p.avatar_url)}" alt="avatar">
      <p class="kicker">GitHub Wrapped</p>
      <h2 class="h-lg">@${esc(p.login)},<br>your ${stats.year} in code</h2>
      <p class="sub">tap or wait — the story plays itself</p>
    `);

    /* — 2: big numbers — */
    slideFns.push(() => `
      <p class="kicker">First — the headline</p>
      <h2 class="h-xl">${f(stats.total)}</h2>
      <p class="sub">contributions in ${stats.year}</p>
      <div class="stat-row">
        <div class="stat"><b>${f(stats.prs)}</b><span>pull requests</span></div>
        <div class="stat"><b>${f(stats.reposMade)}</b><span>new repos</span></div>
        <div class="stat"><b>${f(stats.stars)}</b><span>stars earned ⭐</span></div>
      </div>
    `);

    /* — 3: languages — */
    if (stats.langList.length) {
      const top = stats.langList[0];
      slideFns.push(() => `
        <p class="kicker">Your language of the year</p>
        <h2 class="h-lg" style="color:${top.color}">${esc(top.name)}</h2>
        <p class="sub">${top.pct}% of your repositories</p>
        <div class="lang-bar">
          ${stats.langList.map((l) => `
            <div class="lang-row">
              <span class="lang-dot" style="background:${l.color}"></span>
              <span class="lang-name">${esc(l.name)}</span>
              <span class="lang-track"><span class="lang-fill" style="width:${Math.max(l.pct, 3)}%;background:${l.color}"></span></span>
              <span class="lang-pct">${l.pct}%</span>
            </div>`).join("")}
        </div>
      `);
    }

    /* — 4: heatmap + streak — */
    if (stats.heat) {
      const b = stats.heat.busiest;
      const nice = b.date ? new Date(b.date + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;
      slideFns.push(() => `
        <p class="kicker">Your year, painted</p>
        <h2 class="h-lg">The grid knows everything</h2>
        ${heatmapHTML(stats.heat.days)}
        <div class="stat-row">
          <div class="stat"><b>🔥 ${stats.heat.longest}d</b><span>longest streak</span></div>
          <div class="stat"><b>${stats.heat.current}d</b><span>current streak</span></div>
          ${nice ? `<div class="stat"><b>${b.count}</b><span>your wildest day · ${nice}</span></div>` : ""}
        </div>
      `);
    }

    /* — 5: rhythm — */
    if (stats.rhythm || stats.heat) {
      const r = stats.rhythm;
      const w = stats.heat ? stats.heat.weekendPct : null;
      slideFns.push(() => `
        <p class="kicker">When do you code?</p>
        <div class="big-emoji">${r ? r.peak.emo : "⏰"}</div>
        <h2 class="h-lg">${r ? "a true " + r.peak.label : "steady all week"}</h2>
        <p class="sub">${r ? `based on your last ${r.totalEvents} public events (GitHub keeps ~90 days)` : ""}</p>
        <div class="stat-row">
          ${r ? `<div class="stat"><b>${r.nightPct}%</b><span>activity 22:00–06:00</span></div>` : ""}
          ${w != null ? `<div class="stat"><b>${w}%</b><span>contributions on weekends</span></div>` : ""}
        </div>
      `);
    }

    /* — 6: archetype reveal — */
    slideFns.push(() => `
      <p class="kicker">Your coding archetype</p>
      <div class="arch-card">
        <div class="big-emoji">${stats.arch.emoji}</div>
        <div class="arch-title">${esc(stats.arch.title)}</div>
        ${stats.arch.secondary ? `<p class="sub" style="margin:2px 0 6px">× with a hint of ${esc(stats.arch.secondary.emoji)} ${esc(stats.arch.secondary.title)}</p>` : ""}
        <p class="arch-blurb">${esc(stats.arch.blurb)}</p>
      </div>
    `);

    /* — 7: repos + AI footprint — */
    if (stats.topRepos.length || stats.ai.count) {
      slideFns.push(() => `
        <p class="kicker">Signature work</p>
        <h2 class="h-lg">Repos that defined the year</h2>
        <div class="repo-list">
          ${stats.topRepos.map((r) => `
            <div class="repo-item"><span>📦 ${esc(r.name)}</span><span class="stars">★ ${f(r.stars)}</span></div>`).join("")}
        </div>
        ${stats.ai.count ? `<p class="sub" style="margin-top:14px">🤖 +${stats.ai.count} AI-flavored repos — certified ${stats.year} material</p>` : ""}
      `);
    }

    /* — 8: finale — */
    slideFns.push(() => `
      <p class="kicker">That's a wrap</p>
      <canvas id="poster-canvas" width="1080" height="1080"></canvas>
      <div class="finale-actions">
        <button class="btn-primary" id="btn-download">⬇️ Download poster PNG</button>
        <div class="share-row">
          <button class="btn-ghost" id="btn-x">𝕏 Share</button>
          <button class="btn-ghost" id="btn-tg">✈️ Telegram</button>
          <button class="btn-ghost" id="btn-copy">🔗 Copy</button>
        </div>
        <button class="btn-ghost" id="btn-again">↻ make yours</button>
      </div>
    `);
  }

  /* ══════════ story engine ══════════ */
  function enterStory() {
    hideLoading();
    landing.hidden = true;
    story.hidden = false;

    progressEl.innerHTML = slideFns.map(() => `<div class="seg"><span></span></div>`).join("");
    slidesEl.innerHTML = slideFns.map(() => `<div class="slide"></div>`).join("");

    show(0);
  }

  function show(n) {
    clearTimeout(timer);
    const slides = slidesEl.children;
    const segs = progressEl.children;
    idx = Math.max(0, Math.min(n, slideFns.length - 1));

    [...slides].forEach((el, i) => {
      el.classList.toggle("active", i === idx);
      el.classList.toggle("left", i < idx);
      if (i === idx && !el.dataset.built) {
        el.innerHTML = slideFns[i]();
        el.dataset.built = "1";
        if (i === slideFns.length - 1) wireFinale(el);
      }
      segs[i].classList.toggle("done", i < idx);
      segs[i].classList.remove("active");
    });

    const last = idx === slideFns.length - 1;
    if (!last) {
      const seg = segs[idx];
      requestAnimationFrame(() => {
        const span = seg.firstChild;
        span.style.animationDuration = SLIDE_MS + "ms";
        seg.classList.add("active");
      });
      startedAt = Date.now();
      remaining = SLIDE_MS;
      timer = setTimeout(() => show(idx + 1), SLIDE_MS);
    } else if (segs[idx]) {
      segs[idx].classList.add("done");
    }
  }

  function pauseStory() {
    if (!timer) return;
    clearTimeout(timer);
    timer = null;
    remaining = Math.max(400, remaining - (Date.now() - startedAt));
    const seg = progressEl.children[idx];
    if (seg) seg.firstChild.style.animationPlayState = "paused";
  }
  function resumeStory() {
    if (timer || idx === slideFns.length - 1) return;
    const seg = progressEl.children[idx];
    if (seg) seg.firstChild.style.animationPlayState = "running";
    startedAt = Date.now();
    timer = setTimeout(() => show(idx + 1), remaining);
  }

  /* ══════════ finale (poster + share) ══════════ */
  async function wireFinale(el) {
    const canvas = el.querySelector("#poster-canvas");
    await Poster.draw(canvas, stats, raw.profile);
    posterReady = true;

    el.querySelector("#btn-download").onclick = () => Poster.download(canvas, raw.profile.login);

    const shareText =
      `My GitHub Wrapped ${stats.year} 🔥 ` +
      `${Stats.fmt(stats.total)} contributions, archetype: ${stats.arch.emoji} ${stats.arch.title}. ` +
      `Make yours — no login: ${SITE_URL}`;

    el.querySelector("#btn-x").onclick = () =>
      window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText), "_blank");
    el.querySelector("#btn-tg").onclick = () =>
      window.open("https://t.me/share/url?url=" + encodeURIComponent(SITE_URL) + "&text=" + encodeURIComponent(shareText), "_blank");
    el.querySelector("#btn-copy").onclick = async (ev) => {
      try {
        await navigator.clipboard.writeText(shareText);
        ev.target.textContent = "✓ copied";
        setTimeout(() => (ev.target.textContent = "🔗 Copy"), 1600);
      } catch (_) { /* clipboard blocked — no big deal */ }
    };
    el.querySelector("#btn-again").onclick = resetToLanding;
  }

  /* ══════════ wiring ══════════ */
  $("#form").addEventListener("submit", (e) => {
    e.preventDefault();
    const u = $("#username").value.trim();
    if (u) start(u);
  });

  document.querySelectorAll("[data-demo]").forEach((chip) =>
    chip.addEventListener("click", () => {
      $("#username").value = chip.dataset.demo;
      start(chip.dataset.demo);
    })
  );

  $("#tap-right").addEventListener("click", () => show(idx + 1));
  $("#tap-left").addEventListener("click", () => show(idx - 1));
  $("#btn-close").addEventListener("click", resetToLanding);

  const frame = story.querySelector(".frame");
  frame.addEventListener("pointerdown", pauseStory);
  frame.addEventListener("pointerup", resumeStory);
  frame.addEventListener("pointerleave", resumeStory);

  document.addEventListener("keydown", (e) => {
    if (story.hidden) return;
    if (e.key === "ArrowRight") show(idx + 1);
    else if (e.key === "ArrowLeft") show(idx - 1);
    else if (e.key === "Escape") resetToLanding();
  });

  /* deep link: wrapped-2026/?u=torvalds jumps straight into the story */
  const deep = new URLSearchParams(location.search).get("u");
  if (deep) {
    $("#username").value = deep;
    start(deep);
  }
})();
