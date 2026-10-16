/* ═══════════════════════════════════════════════════════════════
   poster.js — draws the shareable poster on a canvas (vertical
   1080×1350, the classic 4:5 social format), neo-brutalist zine
   edition. Exposes a single global: Poster
   ═══════════════════════════════════════════════════════════════ */

const Poster = (() => {
  const W = 1080, H = 1350;
  const INK = "#17120b", PAPER = "#f6f1e7", WHITE = "#ffffff";
  const LIME = "#c8f31d", PINK = "#ff4d8d", BLUE = "#3ea6ff", SUN = "#ffc940", VIOLET = "#9d89ff", RED = "#ff5c39";
  const ARCH_ACCENT = { community_star: SUN, star_collector: SUN, night_owl: VIOLET, ai_native: LIME,
    weekend_warrior: PINK, consistent: BLUE, grid_painter: PINK, polyglot: BLUE, builder: BLUE, explorer: LIME };
  const PEAK_ACCENT = { early: SUN, day: LIME, evening: PINK, night: VIOLET };

  const HEAT_COLORS = ["#e9e4d8", "#bdf3a0", "#7adc3e", "#2ea90f", "#175c05"];

  const DISP = '"Arial Black", Impact, "DejaVu Sans", sans-serif';
  const MONO = '"Courier New", ui-monospace, monospace';

  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* box with a hard offset shadow — the signature move */
  function hardBox(ctx, x, y, w, h, r, fill, border = 4) {
    rrect(ctx, x + 14, y + 14, w, h, r);
    ctx.fillStyle = INK; ctx.fill();
    rrect(ctx, x, y, w, h, r);
    ctx.fillStyle = fill; ctx.fill();
    ctx.lineWidth = border; ctx.strokeStyle = INK; ctx.stroke();
  }

  function star(ctx, cx, cy, R, color) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? R * 0.42 : R;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      ctx[i ? "lineTo" : "moveTo"](cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fillStyle = color; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
  }

  function squiggle(ctx, x, y, w, color) {
    ctx.beginPath();
    ctx.moveTo(x, y + 10);
    for (let i = 1; i <= 6; i++) ctx.quadraticCurveTo(x + (w / 6) * (i - 0.5), y + (i % 2 ? -8 : 26), x + (w / 6) * i, y + 10);
    ctx.lineWidth = 9; ctx.lineCap = "round"; ctx.strokeStyle = color; ctx.stroke();
  }

  function loadAvatar(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url + "&s=200";
    });
  }

  /* ── the contribution grid, 52×7 miniature ── */
  function drawGrid(ctx, days, y0) {
    if (!days || !days.length) return;
    const cell = 15, box = 13;
    const cols = Math.min(52, Math.ceil(days.length / 7));
    const slice = days.slice(-(cols * 7));
    const x0 = (W - cols * cell) / 2;
    slice.forEach((d, i) => {
      const col = Math.floor(i / 7), row = i % 7;
      ctx.fillStyle = HEAT_COLORS[d.level] || HEAT_COLORS[0];
      ctx.fillRect(x0 + col * cell, y0 + row * cell, box, box);
    });
  }

  /* ── top languages as hatched bars ── */
  function drawLangs(ctx, list, yTop) {
    if (!list || !list.length) return;
    list.slice(0, 3).forEach((l, i) => {
      const y = yTop + i * 32;
      ctx.font = `800 25px ${MONO}`;
      ctx.fillStyle = INK; ctx.textAlign = "left";
      ctx.fillText(l.name.length > 12 ? l.name.slice(0, 11) + "…" : l.name, 124, y + 21);
      const tx = 400, tw = 470, th = 20;
      rrect(ctx, tx, y + 3, tw, th, 10);
      ctx.fillStyle = WHITE; ctx.fill();
      ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke();
      const fw = Math.max(8, ((tw - 6) * Math.min(100, l.pct)) / 100);
      rrect(ctx, tx + 3, y + 6, fw, th - 6, 7);
      ctx.fillStyle = l.color; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
      ctx.font = `800 25px ${MONO}`;
      ctx.textAlign = "right"; ctx.fillStyle = INK;
      ctx.fillText(l.pct + "%", 948, y + 21);
    });
    ctx.textAlign = "center";
  }

  /* ── QR sticker linking back to the site ── */
  function drawQR(ctx, url, x, y, area, rot) {
    if (typeof qrcode !== "function") return; /* vendored lib missing - skip gracefully */
    let qr;
    try { qr = qrcode(0, "M"); qr.addData(url); qr.make(); } catch (_) { return; }
    const n = qr.getModuleCount();
    const cell = Math.max(2, Math.floor(area / n));
    const total = cell * n, pad = 12, box = total + pad * 2;
    ctx.save();
    ctx.translate(x + box / 2, y + box / 2);
    ctx.rotate(rot);
    rrect(ctx, -box / 2 + 7, -box / 2 + 7, box, box, 16);
    ctx.fillStyle = INK; ctx.fill();
    rrect(ctx, -box / 2, -box / 2, box, box, 16);
    ctx.fillStyle = WHITE; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = INK;
    const x0 = -total / 2, y0 = -total / 2;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++)
      if (qr.isDark(r, c)) ctx.fillRect(x0 + c * cell, y0 + r * cell, cell, cell);
    ctx.restore();
  }

  async function draw(canvas, stats, profile) {
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    const f = I18N.fmt;
    const V = {
      year: stats.year, next: stats.year + 1, stars: f(stats.stars), total: f(stats.total),
      nightPct: (stats.rhythm || {}).nightPct, aiCount: stats.ai.count,
      weekendPct: (stats.heat || {}).weekendPct, longest: (stats.heat || {}).longest,
      langs: stats.langList.length,
    };
    const archText = I18N.arch(stats.arch.id, V);
    const secText = stats.arch.secondaryId ? I18N.arch(stats.arch.secondaryId, V) : null;

    /* ── paper + halftone ── */
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(23,18,11,0.07)";
    for (let y = 16; y < H; y += 30) for (let x = 16; x < W; x += 30) ctx.fillRect(x, y, 2.5, 2.5);

    /* ── flat doodles ── */
    star(ctx, 120, 84, 46, SUN);
    ctx.save();
    ctx.setLineDash([12, 10]);
    ctx.beginPath(); ctx.arc(1006, 212, 46, 0, Math.PI * 2);
    ctx.lineWidth = 5; ctx.strokeStyle = PINK; ctx.stroke();
    ctx.restore();
    squiggle(ctx, 56, 1206, 148, BLUE);
    ctx.font = `900 76px ${DISP}`;
    ctx.fillStyle = VIOLET;
    ctx.textAlign = "center";
    ctx.fillText("+", 1014, 600);

    /* ── main card ── */
    hardBox(ctx, 60, 60, 960, 1206, 40, WHITE);

    /* header strip */
    rrect(ctx, 60, 60, 960, 76, 38);
    ctx.fillStyle = INK; ctx.fill();
    ctx.fillStyle = LIME;
    ctx.font = `800 29px ${MONO}`;
    ctx.textAlign = "left";
    ctx.fillText("✦ GITHUB WRAPPED", 92, 110);
    ctx.textAlign = "right";
    ctx.fillStyle = PAPER;
    ctx.fillText(String(stats.year) + " ✦", 988, 110);
    ctx.textAlign = "center";

    /* giant year (pink with a sun drop) */
    ctx.font = `900 112px ${DISP}`;
    ctx.fillStyle = SUN;
    ctx.fillText(String(stats.year), W / 2 + 9, 302);
    ctx.fillStyle = PINK;
    ctx.fillText(String(stats.year), W / 2, 293);

    /* ── avatar + handle ── */
    const img = await loadAvatar(profile.avatar_url);
    const avY = 402, avR = 62;
    ctx.beginPath(); ctx.arc(W / 2, avY, avR, 0, Math.PI * 2); ctx.closePath();
    ctx.fillStyle = "#eee"; ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.arc(W / 2, avY, avR, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
    if (img) ctx.drawImage(img, W / 2 - avR, avY - avR, avR * 2, avR * 2);
    else {
      ctx.fillStyle = INK;
      ctx.font = `900 52px ${DISP}`;
      ctx.fillText((profile.login[0] || "@").toUpperCase(), W / 2, avY + 18);
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(W / 2, avY, avR, 0, Math.PI * 2);
    ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = `800 34px ${MONO}`;
    ctx.fillText("@" + profile.login, W / 2, avY + avR + 50);

    /* ── headline number ── */
    ctx.font = `900 104px ${DISP}`;
    ctx.fillText(f(stats.total), W / 2, 644);
    ctx.font = `800 24px ${MONO}`;
    ctx.fillStyle = "rgba(23,18,11,0.72)";
    ctx.fillText("· " + I18N.t("pContrib", { year: stats.year }) + " ·", W / 2, 686);
    ctx.fillStyle = INK;

    /* ── stat row: 4 boxes across ── */
    const boxes = [
      [f(stats.prs), I18N.t("pPRs")],
      [stats.heat ? stats.heat.longest + "d" : "—", I18N.t("pStreak")],
      [stats.heat ? stats.heat.weekendPct + "%" : "—", I18N.t("pWeekend")],
      [String(stats.langList.length || 0), I18N.t("pLangs")],
    ];
    const bw = 217, bh = 88, gap = 14, bx0 = 84, by = 706;
    boxes.forEach((b, i) => {
      const bx = bx0 + i * (bw + gap);
      hardBox(ctx, bx, by, bw, bh, 18, WHITE, 3.5);
      ctx.fillStyle = INK;
      ctx.font = `900 40px ${DISP}`;
      ctx.fillText(b[0], bx + bw / 2, by + 50);
      ctx.font = `800 14px ${MONO}`;
      ctx.fillStyle = "rgba(23,18,11,0.62)";
      ctx.fillText(b[1].toUpperCase(), bx + bw / 2, by + 74);
      ctx.fillStyle = INK;
    });

    /* ── contribution grid ── */
    if (stats.heat && stats.heat.days && stats.heat.days.length) {
      ctx.font = `800 22px ${MONO}`;
      ctx.fillStyle = "rgba(23,18,11,0.55)";
      ctx.fillText(I18N.t("pGrid").toUpperCase(), W / 2, 826);
      ctx.fillStyle = INK;
      drawGrid(ctx, stats.heat.days, 840);
    } else {
      /* the grid source did not answer — keep the layout, say so honestly */
      ctx.save();
      ctx.setLineDash([10, 8]);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(23,18,11,0.35)";
      rrect(ctx, 124, 832, 832, 118, 16);
      ctx.stroke();
      ctx.restore();
      ctx.font = `800 22px ${MONO}`;
      ctx.fillStyle = "rgba(23,18,11,0.45)";
      ctx.fillText(I18N.t("gridNA").toUpperCase(), W / 2, 898);
      ctx.fillStyle = INK;
    }

    /* ── top languages ── */
    drawLangs(ctx, stats.langList, 972);

    /* ── rhythm sticker ── */
    const peak = stats.rhythm ? stats.rhythm.peak : null;
    let pill = null;
    if (peak) {
      const label = I18N.t("r" + peak.id[0].toUpperCase() + peak.id.slice(1));
      pill = { text: `${peak.emo} ${label} · ${stats.rhythm.nightPct}% ${I18N.t("pNight")}`, color: PEAK_ACCENT[peak.id] || LIME };
    } else if (stats.heat) {
      pill = { text: `🗓 ${stats.heat.weekendPct}% ${I18N.t("pWeekend")}`, color: LIME };
    } else {
      pill = { text: `★ ${f(stats.stars)} · ${stats.reposTotal} ${I18N.t("pRepos")}`, color: SUN };
    }
    if (pill) {
      ctx.font = `800 25px ${MONO}`;
      const tw = ctx.measureText(pill.text).width;
      const pw = Math.min(640, tw + 72), ph = 60, pcx = 110 + pw / 2, pcy = 1112;
      ctx.save();
      ctx.translate(pcx, pcy);
      ctx.rotate(-0.055);
      rrect(ctx, -pw / 2 + 6, -ph / 2 + 6, pw, ph, 30);
      ctx.fillStyle = INK; ctx.fill();
      rrect(ctx, -pw / 2, -ph / 2, pw, ph, 30);
      ctx.fillStyle = pill.color; ctx.fill();
      ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke();
      ctx.fillStyle = INK;
      ctx.fillText(pill.text, 0, 9);
      ctx.restore();
    }

    /* ── archetype ticket ── */
    const accent = ARCH_ACCENT[stats.arch.id] || LIME;
    const tw2 = 520, tx2 = 200, th2 = secText ? 88 : 72, ty2 = 1248 - th2;
    rrect(ctx, tx2 + 8, ty2 + 8, tw2, th2, 18);
    ctx.fillStyle = INK; ctx.fill();
    rrect(ctx, tx2, ty2, tw2, th2, 18);
    ctx.fillStyle = accent; ctx.fill();
    ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke();
    ctx.save();
    rrect(ctx, tx2 + 12, ty2 + 9, tw2 - 24, th2 - 18, 12);
    ctx.setLineDash([9, 7]); ctx.lineWidth = 2; ctx.strokeStyle = "rgba(23,18,11,0.5)"; ctx.stroke();
    ctx.restore();
    ctx.fillStyle = INK;
    ctx.font = `900 30px ${DISP}`;
    ctx.fillText(stats.arch.emoji + "  " + archText.title.toUpperCase(), tx2 + tw2 / 2, ty2 + 46);
    if (secText) {
      ctx.font = `800 16px ${MONO}`;
      ctx.fillStyle = "rgba(23,18,11,0.75)";
      ctx.fillText(I18N.t("hintOf", { emoji: stats.arch.secondaryEmoji, title: secText.title.toUpperCase() }), tx2 + tw2 / 2, ty2 + 72);
      ctx.fillStyle = INK;
    }

    /* ── QR sticker back to the site ── */
    drawQR(ctx, "https://hilsetapp.github.io/Wrapped-2026/", 846, 1068, 150, 0.07);

    /* ── footer strip in the paper field (the viral loop) ── */
    rrect(ctx, 60, 1288, 960, 46, 12);
    ctx.fillStyle = INK; ctx.fill();
    ctx.fillStyle = LIME;
    ctx.font = `800 24px ${MONO}`;
    ctx.fillText(I18N.t("pFooter1"), W / 2, 1319);

    /* frame the paper sheet */
    ctx.strokeStyle = INK; ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, W - 20, H - 20);

    return canvas;
  }

  function download(canvas, username) {
    const name = "github-wrapped-2026-" + username + ".png";
    const save = (href, revoke) => {
      const a = document.createElement("a");
      a.href = href; a.download = name; a.rel = "noopener";
      document.body.appendChild(a); /* some mobile browsers ignore clicks on detached links */
      a.click();
      a.remove();
      if (revoke) setTimeout(() => URL.revokeObjectURL(href), 8000);
    };
    return new Promise((resolve) => {
      const viaDataURL = () => {
        try { save(canvas.toDataURL("image/png"), false); resolve(true); }
        catch (_) { resolve(false); }
      };
      if (canvas.toBlob) {
        canvas.toBlob((b) => { if (b) { save(URL.createObjectURL(b), true); resolve(true); } else viaDataURL(); }, "image/png");
      } else viaDataURL();
    });
  }

  return { draw, download, W, H };
})();
