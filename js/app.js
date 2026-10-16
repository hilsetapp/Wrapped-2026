/* ═══════════════════════════════════════════════════════════════
   app.js — story engine + UI orchestration (bilingual edition).
   ═══════════════════════════════════════════════════════════════ */

(() => {
  const $ = (sel) => document.querySelector(sel);
  const SITE_URL = "https://hilsetapp.github.io/wrapped-2026/";
  const SLIDE_MS = 6500;
  const ACCENTS = ["lime", "sun", "pink", "blue", "violet", "red"];

  const landing = $("#landing"), story = $("#story"), loading = $("#loading");
  const slidesEl = $("#slides"), progressEl = $("#progress");
  const fillEl = $("#loading-fill"), stepEl = $("#loading-step");
  const errorEl = $("#error");

  let raw = null, stats = null;
  let slideFns = [];
  let idx = 0;
  let timer = null, startedAt = 0, remaining = SLIDE_MS;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ══════════ language ══════════ */
  const ARCH_ACCENT = { community_star: "sun", star_collector: "sun", night_owl: "violet", ai_native: "lime",
    weekend_warrior: "pink", consistent: "blue", grid_painter: "pink", polyglot: "blue", builder: "blue", explorer: "lime" };

  function applyLanding() {
    document.documentElement.lang = I18N.getLang();
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = I18N.t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = I18N.t(el.dataset.i18nHtml); });
    document.querySelectorAll(".lang-btn").forEach((b) => b.classList.toggle("on", b.dataset.lang === I18N.getLang()));
    $("#username").placeholder = I18N.getLang() === "ru" ? "твой ник на GitHub" : "your GitHub username";
    /* ticker */
    const words = I18N.getLang() === "ru"
      ? ["GITHUB WRAPPED 2026", "без логина", "в код верим", "постер внутри", "открытый код", "поставь ★"]
      : ["GITHUB WRAPPED 2026", "no login", "just a username", "poster inside", "open source", "star it ★"];
    const seq = words.map((w, i) => `<span class="${i % 2 ? "a" : "b"}">${esc(w)}</span><span>•</span>`).join("");
    $("#ticker").innerHTML = seq + seq; /* 2 copies for the -50% loop */
  }

  function setLang(l) {
    I18N.setLang(l);
    applyLanding();
    if (stats && !story.hidden) {
      buildDeck();                 // re-translate the whole deck
      [...slidesEl.children].forEach((el) => { delete el.dataset.built; });
      reShowCurrent();
    }
  }

  document.querySelectorAll(".lang-btn").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));

  /* ══════════ loading ══════════ */
  const showLoading = () => { loading.hidden = false; fillEl.style.width = "4%"; };
  const hideLoading = () => { loading.hidden = true; };

  let watchdogT = null;
  function armWatchdog() {
    clearTimeout(watchdogT);
    watchdogT = setTimeout(() => {
      hideLoading(); watchdogT = null;
      showError(I18N.t("errorWatchdog"));
    }, 45000);
  }
  function disarmWatchdog() { clearTimeout(watchdogT); watchdogT = null; }

  const loadStep = (key, frac) => {
    stepEl.textContent = I18N.t("step" + key);
    fillEl.style.width = Math.round(frac * 100) + "%";
    if (watchdogT) armWatchdog();
  };

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
    armWatchdog();
    try {
      raw = await GH.fetchWrapped(username, loadStep);
      stats = Stats.compute(raw);
      buildDeck();
      enterStory();
    } catch (e) {
      hideLoading();
      if (e.code === 404) showError(I18N.t("error404", { u: username }));
      else if (e.code === 403) showError(e.reset
        ? I18N.t("error403at", { t: e.reset.toLocaleTimeString(I18N.getLang() === "ru" ? "ru-RU" : "en-US", { hour: "2-digit", minute: "2-digit" }) })
        : I18N.t("error403"));
      else if (e.code === 401) showError(I18N.t("error401"));
      else if (e.code === "timeout") showError(I18N.t("errorTimeout"));
      else if (e.code === "network") showError(I18N.t("errorNetwork"));
      else showError(I18N.t("errorGeneric"));
    } finally {
      disarmWatchdog();
      btn.disabled = false;
    }
  }

  function resetToLanding() {
    clearTimeout(timer);
    timer = null;
    idx = 0;
    story.hidden = true;
    landing.hidden = false;
    slidesEl.innerHTML = "";
    progressEl.innerHTML = "";
    $("#username").focus();
  }

  /* ══════════ numbers that count up ══════════ */
  function runCounters(slideEl) {
    slideEl.querySelectorAll(".count-up[data-val]").forEach((el) => {
      const target = Number(el.dataset.val);
      const t0 = performance.now(), dur = 950;
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = I18N.fmt(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ══════════ deck construction ══════════ */
  const HEAT_COLORS = ["#ffffff", "#bdf3a0", "#7adc3e", "#2ea90f", "#175c05"];

  function heatmapHTML(days) {
    const cells = days.slice(-21 * 7); /* ~last 5 months fit a phone nicely */
    let cols = '<div class="heat-col">';
    cells.forEach((d, i) => {
      cols += `<span class="heat-cell" style="background:${HEAT_COLORS[d.level] || HEAT_COLORS[0]}" title="${d.date}: ${d.count}"></span>`;
      if (i % 7 === 6) cols += '</div><div class="heat-col">';
    });
    cols += "</div>";
    return `<div class="evidence" data-case="2026-A"><div class="heatmap">${cols}</div></div>`;
  }

  function archVars() {
    const f = I18N.fmt;
    return {
      year: stats.year, next: stats.year + 1, stars: f(stats.stars), total: f(stats.total),
      nightPct: (stats.rhythm || {}).nightPct, aiCount: stats.ai.count,
      weekendPct: (stats.heat || {}).weekendPct, longest: (stats.heat || {}).longest,
      langs: stats.langList.length,
    };
  }

  function buildDeck() {
    const p = raw.profile;
    const f = I18N.fmt;
    const V = archVars();
    slideFns = [];
    let accI = 0;
    const acc = (name) => name || ACCENTS[accI++ % ACCENTS.length];

    /* — 1: intro — */
    slideFns.push(() => ({ accent: acc("lime"), html: `
      <div class="polaroid"><img src="${esc(p.avatar_url)}" alt="avatar"></div>
      <p class="kicker">GitHub Wrapped</p>
      <h2 class="h-lg">@${esc(p.login)},</h2>
      <h2 class="h-xl" style="font-size:clamp(44px,11vw,72px)">${I18N.t("introTitle", { year: stats.year })}</h2>
      <p class="sub">${I18N.t("introSub")}</p>
    ` }));

    /* — 2: big numbers — */
    slideFns.push(() => ({ accent: acc(), html: `
      <p class="kicker">${I18N.t("kHeadline")}</p>
      <h2 class="h-xl count-up" data-val="${stats.total}">0</h2>
      <p class="sub">${I18N.t("contribIn", { year: stats.year })}</p>
      <div class="stat-row">
        <div class="stat"><b class="count-up" data-val="${stats.prs ?? 0}">0</b><span>${I18N.t("cPRs")}</span></div>
        <div class="stat"><b class="count-up" data-val="${stats.reposMade}">0</b><span>${I18N.t("cRepos")}</span></div>
        <div class="stat"><b class="count-up" data-val="${stats.stars}">0</b><span>${I18N.t("cStars")} ⭐</span></div>
      </div>
    ` }));

    /* — 3: languages — */
    if (stats.langList.length) {
      slideFns.push(() => {
        const top = stats.langList[0];
        return { accent: acc(), html: `
          <p class="kicker">${I18N.t("kLang")}</p>
          <h2 class="h-xl" style="font-size:clamp(40px,10vw,64px);color:${top.color};-webkit-text-stroke:2px var(--ink)">${esc(top.name)}</h2>
          <p class="sub">${I18N.t("ofRepos", { pct: top.pct })}</p>
          <div class="lang-bar">
            ${stats.langList.map((l) => `
              <div class="lang-row">
                <span class="lang-name">${esc(l.name)}</span>
                <span class="lang-track"><span class="lang-fill" style="width:${Math.max(l.pct, 4)}%;background:repeating-linear-gradient(45deg, ${l.color} 0 9px, rgba(23,18,11,.35) 9px 11px)"></span></span>
                <span class="lang-pct">${l.pct}%</span>
              </div>`).join("")}
          </div>
        ` };
      });
    }

    /* — 4: heatmap + streak — */
    if (stats.heat) {
      slideFns.push(() => {
        const b = stats.heat.busiest;
        const nice = b.date ? I18N.dateFmt(b.date) : null;
        return { accent: acc(), html: `
          <p class="kicker">${I18N.t("kGrid")}</p>
          <h2 class="h-lg">${I18N.t("gridTitle")}</h2>
          ${heatmapHTML(stats.heat.days)}
          <div class="stat-row">
            <div class="stat"><b>🔥 ${stats.heat.longest}d</b><span>${I18N.t("cLongest")}</span></div>
            <div class="stat"><b>${stats.heat.current}d</b><span>${I18N.t("cCurrent")}</span></div>
            ${nice ? `<div class="stat"><b>${b.count}</b><span>${I18N.t("cWildest", { date: nice })}</span></div>` : ""}
          </div>
        ` };
      });
    }

    /* — 5: rhythm — */
    if (stats.rhythm || stats.heat) {
      slideFns.push(() => {
        const r = stats.rhythm;
        const w = stats.heat ? stats.heat.weekendPct : null;
        const label = r ? I18N.t("r" + r.peak.id[0].toUpperCase() + r.peak.id.slice(1)) : null;
        return { accent: acc(), html: `
          <p class="kicker">${I18N.t("kRhythm")}</p>
          <div class="big-emoji">${r ? r.peak.emo : "⏰"}</div>
          <h2 class="h-lg">${r ? I18N.t("aTrue", { label }) : I18N.t("steady")}</h2>
          ${r ? `<p class="sub">${I18N.t("rhythmSub", { n: r.totalEvents })}</p>` : ""}
          <div class="stat-row">
            ${r ? `<div class="stat"><b>${r.nightPct}%</b><span>${I18N.t("cNight")}</span></div>` : ""}
            ${w != null ? `<div class="stat"><b>${w}%</b><span>${I18N.t("cWeekend")}</span></div>` : ""}
          </div>
        ` };
      });
    }

    /* — 6: archetype reveal — */
    slideFns.push(() => {
      const a = I18N.arch(stats.arch.id, V);
      const sec = stats.arch.secondaryId ? I18N.arch(stats.arch.secondaryId, V) : null;
      return { accent: ARCH_ACCENT[stats.arch.id] || acc(), html: `
        <p class="kicker">${I18N.t("kArch")}</p>
        <div class="arch-card" style="--acc:var(--${ARCH_ACCENT[stats.arch.id] || "lime"})">
          <div class="arch-head"><span>GitHub Wrapped</span><span>${I18N.t("rare", { year: stats.year })}</span></div>
          <div class="arch-body">
            <div class="arch-crest">${stats.arch.emoji}</div>
            <div class="arch-title">${esc(a.title)}</div>
            ${sec ? `<div class="arch-sub">${I18N.t("hintOf", { emoji: stats.arch.secondaryEmoji, title: sec.title })}</div>` : ""}
            <p class="arch-blurb">${esc(a.blurb)}</p>
          </div>
        </div>
      ` };
    });

    /* — 7: repos + AI footprint — */
    if (stats.topRepos.length || stats.ai.count) {
      slideFns.push(() => ({ accent: acc(), html: `
        <p class="kicker">${I18N.t("kRepos")}</p>
        <h2 class="h-lg">${I18N.t("reposTitle")}</h2>
        <div class="tracklist">
          <span class="tracklist-head">▸ ${I18N.t("aSide", { year: stats.year })}</span>
          ${stats.topRepos.map((r, i) => `
            <div class="repo-item"><span class="no">${String(i + 1).padStart(2, "0")}</span><span class="name">${esc(r.name)}</span><span class="stars">★ ${f(r.stars)}</span></div>`).join("")}
        </div>
        ${stats.ai.count ? `<span class="ai-stamp">🤖 ${I18N.t("aiLine", { n: stats.ai.count, year: stats.year })}</span>` : ""}
      ` }));
    }

    /* — 8: finale — */
    slideFns.push(() => ({ accent: acc("lime"), html: `
      <p class="kicker">${I18N.t("kFinale")}</p>
      <div class="fsticker fst-a" aria-hidden="true">✦</div>
      <div class="fsticker fst-b" aria-hidden="true">★</div>
      <div class="fsticker fst-c" aria-hidden="true">🌙</div>
      <canvas id="poster-canvas" width="1080" height="1350"></canvas>
      <div class="finale-actions">
        <button class="btn-primary" id="btn-download">${I18N.t("btnDownload")}</button>
        <p class="share-hint" id="dl-hint" hidden>${I18N.t("savedHint")}</p>
        <div class="share-row">
          <button class="btn-ghost" id="btn-x">𝕏</button>
          <button class="btn-ghost" id="btn-tg">✈️ Telegram</button>
          <button class="btn-ghost" id="btn-copy">🔗 Copy</button>
        </div>
        <p class="share-hint" id="share-hint" hidden>${I18N.t("hintAttach")}</p>
        <button class="btn-ghost" id="btn-again">${I18N.t("btnAgain")}</button>
      </div>
    ` }));
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

  function reShowCurrent() {
    const slides = slidesEl.children;
    [...slides].forEach((el, i) => {
      if (el.classList.contains("active")) {
        const def = slideFns[i]();
        el.innerHTML = def.html;
        el.style.setProperty("--acc", "var(--" + def.accent + ")");
        el.dataset.built = "1";
        runCounters(el);
        if (i === slideFns.length - 1) wireFinale(el);
      }
    });
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
        const def = slideFns[i]();
        el.innerHTML = def.html;
        el.style.setProperty("--acc", "var(--" + def.accent + ")");
        el.dataset.built = "1";
        runCounters(el);
        if (i === slideFns.length - 1) wireFinale(el);
      }
      segs[i].classList.toggle("done", i < idx);
      segs[i].classList.remove("active");
    });

    const last = idx === slideFns.length - 1;
    if (!last) {
      const seg = segs[idx];
      requestAnimationFrame(() => {
        seg.firstChild.style.animationDuration = SLIDE_MS + "ms";
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

    el.querySelector("#btn-download").onclick = async () => {
      const saved = await Poster.download(canvas, raw.profile.login);
      el.querySelector("#dl-hint").hidden = !saved;
    };

    const archText = I18N.arch(stats.arch.id, archVars());
    const shareText = I18N.t("share", {
      year: stats.year, total: I18N.fmt(stats.total),
      emoji: stats.arch.emoji, title: archText.title, url: SITE_URL,
    });

    /* Sharing images into social nets:
       - mobile: native share sheet WITH the poster file attached
       - desktop: social_url only carries text → pre-download the poster and hint to attach it */
    const hint = el.querySelector("#share-hint");
    const shareToSocial = async (intentUrl) => {
      let nativeDone = false;
      try {
        const file = await new Promise((res) =>
          canvas.toBlob((b) => res(b ? new File([b], "github-wrapped-2026-" + raw.profile.login + ".png", { type: "image/png" }) : null), "image/png"));
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text: shareText });
          nativeDone = true;
        }
      } catch (err) {
        if (err && err.name === "AbortError") return; /* user closed the native sheet */
      }
      if (nativeDone) return;
      Poster.download(canvas, raw.profile.login);
      window.open(intentUrl, "_blank");
      hint.hidden = false;
    };

    el.querySelector("#btn-x").onclick = () =>
      shareToSocial("https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText));
    el.querySelector("#btn-tg").onclick = () =>
      shareToSocial("https://t.me/share/url?url=" + encodeURIComponent(SITE_URL) + "&text=" + encodeURIComponent(shareText));
    el.querySelector("#btn-copy").onclick = async (ev) => {
      try {
        await navigator.clipboard.writeText(shareText);
        const old = ev.target.textContent;
        ev.target.textContent = I18N.t("shared");
        setTimeout(() => (ev.target.textContent = old), 1600);
      } catch (_) { /* clipboard blocked */ }
    };
    el.querySelector("#btn-again").onclick = resetToLanding;
  }

  /* ══════════ wiring ══════════ */
  $("#form").addEventListener("submit", (e) => {
    e.preventDefault();
    const u = $("#username").value.trim();
    if (u) start(u.replace(/^@/, ""));
  });

  document.querySelectorAll("[data-demo]").forEach((chip) =>
    chip.addEventListener("click", () => {
      $("#username").value = chip.dataset.demo;
      start(chip.dataset.demo);
    })
  );

  /* optional personal token: prefilled from the browser, saved on change */
  const tokenInput = $("#gh-token");
  if (tokenInput) {
    tokenInput.value = GH.getToken();
    tokenInput.addEventListener("change", () => GH.setToken(tokenInput.value.trim()));
  }

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

  applyLanding();

  /* deep link: wrapped-2026/?u=torvalds jumps straight into the story */
  const deep = new URLSearchParams(location.search).get("u");

  /* lang switch inside the story frame too */
  const storySwitch = document.createElement("div");
  storySwitch.className = "lang-switch story-switch";
  storySwitch.innerHTML = `<button class="lang-btn" data-lang="en" type="button">EN</button><button class="lang-btn" data-lang="ru" type="button">RU</button>`;
  storySwitch.addEventListener("click", (e) => { if (e.target.dataset.lang) setLang(e.target.dataset.lang); });
  $("#story .frame").appendChild(storySwitch);

  if (deep) {
    $("#username").value = deep;
    start(deep);
  }
})();
