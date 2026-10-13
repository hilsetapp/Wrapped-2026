/* ═══════════════════════════════════════════════════════════════
   poster.js — draws the 1080×1080 shareable poster on a canvas,
   neo-brutalist zine edition. Exposes a single global: Poster
   ═══════════════════════════════════════════════════════════════ */

const Poster = (() => {
  const SIZE = 1080;
  const INK = "#17120b", PAPER = "#f6f1e7", WHITE = "#ffffff";
  const LIME = "#c8f31d", PINK = "#ff4d8d", BLUE = "#3ea6ff", SUN = "#ffc940", VIOLET = "#9d89ff", RED = "#ff5c39";
  const ARCH_ACCENT = { community_star: SUN, star_collector: SUN, night_owl: VIOLET, ai_native: LIME,
    weekend_warrior: PINK, consistent: BLUE, grid_painter: PINK, polyglot: BLUE, builder: BLUE, explorer: LIME };

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

  async function draw(canvas, stats, profile) {
    canvas.width = SIZE; canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    const f = I18N.fmt;
    const V = {
      year: stats.year, next: stats.year + 1, stars: f(stats.stars), total: f(stats.total),
      nightPct: (stats.rhythm || {}).nightPct, aiCount: stats.ai.count,
      weekendPct: (stats.heat || {}).weekendPct, longest: (stats.heat || {}).longest,
      langs: stats.langList.length,
    };
    const archText = I18N.arch(stats.arch.id, V);

    /* ── paper + halftone ── */
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = "rgba(23,18,11,0.07)";
    for (let y = 16; y < SIZE; y += 30) for (let x = 16; x < SIZE; x += 30) ctx.fillRect(x, y, 2.5, 2.5);

    /* ── flat doodles ── */
    star(ctx, 130, 70, 52, SUN);
    ctx.save();
    ctx.setLineDash([12, 10]);
    ctx.beginPath(); ctx.arc(1006, 208, 52, 0, Math.PI * 2);
    ctx.lineWidth = 5; ctx.strokeStyle = PINK; ctx.stroke();
    ctx.restore();
    squiggle(ctx, 56, 936, 160, BLUE);
    ctx.font = `900 80px ${DISP}`;
    ctx.fillStyle = VIOLET;
    ctx.textAlign = "center";
    ctx.fillText("+", 1016, 548);

    /* ── main card (940×940, leaves 70px paper field at the bottom) ── */
    hardBox(ctx, 70, 70, 940, 940, 40, WHITE);

    /* header strip */
    rrect(ctx, 70, 70, 940, 76, 38);
    ctx.fillStyle = INK; ctx.fill();
    ctx.fillStyle = LIME;
    ctx.font = `800 29px ${MONO}`;
    ctx.textAlign = "left";
    ctx.fillText("✦ GITHUB WRAPPED", 102, 120);
    ctx.textAlign = "right";
    ctx.fillStyle = PAPER;
    ctx.fillText(String(stats.year) + " ✦", 978, 120);
    ctx.textAlign = "center";

    /* giant year (pink with a sun drop) */
    ctx.font = `900 112px ${DISP}`;
    ctx.fillStyle = SUN;
    ctx.fillText(String(stats.year), SIZE / 2 + 9, 281);
    ctx.fillStyle = PINK;
    ctx.fillText(String(stats.year), SIZE / 2, 272);

    /* ── avatar + handle ── */
    const img = await loadAvatar(profile.avatar_url);
    const avY = 368, avR = 64;
    if (img) {
      ctx.save();
      ctx.beginPath(); ctx.arc(SIZE / 2, avY, avR, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
      ctx.fillStyle = "#eee"; ctx.fillRect(SIZE / 2 - avR, avY - avR, avR * 2, avR * 2);
      ctx.drawImage(img, SIZE / 2 - avR, avY - avR, avR * 2, avR * 2);
      ctx.restore();
      ctx.beginPath(); ctx.arc(SIZE / 2, avY, avR, 0, Math.PI * 2);
      ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
    }
    ctx.fillStyle = INK;
    ctx.font = `800 34px ${MONO}`;
    ctx.fillText("@" + profile.login, SIZE / 2, avY + avR + 54);

    /* ── headline number (top edge stays clear of the handle) ── */
    ctx.font = `900 104px ${DISP}`;
    ctx.fillText(f(stats.total), SIZE / 2, 606);
    ctx.font = `800 24px ${MONO}`;
    ctx.fillStyle = "rgba(23,18,11,0.72)";
    ctx.fillText("· " + I18N.t("pContrib", { year: stats.year }) + " ·", SIZE / 2, 650);

    /* ── 4 stat boxes — 2×2, fully inside the card ── */
    const boxes = [
      [f(stats.prs), I18N.t("pPRs")],
      [stats.heat ? stats.heat.longest + "d" : "—", I18N.t("pStreak")],
      [stats.heat ? stats.heat.weekendPct + "%" : "—", I18N.t("pWeekend")],
      [String(stats.langList.length || 0), I18N.t("pLangs")],
    ];
    const bw = 380, bh = 102, gap = 26;
    const x0 = (SIZE - (bw * 2 + gap)) / 2; /* =147 */
    boxes.forEach((b, i) => {
      const bx = x0 + (i % 2) * (bw + gap);
      const by = drowY(i);  /* helper below keeps the math honest */
      hardBox(ctx, bx, by, bw, bh, 20, WHITE, 3.5);
      ctx.fillStyle = INK;
      ctx.font = `900 44px ${DISP}`;
      ctx.fillText(b[0], bx + bw / 2, by + 54);
      ctx.font = `800 19px ${MONO}`;
      ctx.fillStyle = "rgba(23,18,11,0.62)";
      ctx.fillText(b[1].toUpperCase(), bx + bw / 2, by + 84);
    });
    function drowY(i) { return 678 + Math.floor(i / 2) * (bh + gap); } /* 678 / 806 */

    /* ── archetype ticket ── */
    const accent = ARCH_ACCENT[stats.arch.id] || LIME;
    const ay = 928;
    rrect(ctx, SIZE / 2 - 300 + 8, ay + 8, 600, 72, 18);
    ctx.fillStyle = INK; ctx.fill();
    rrect(ctx, SIZE / 2 - 300, ay, 600, 72, 18);
    ctx.fillStyle = accent; ctx.fill();
    ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke();
    ctx.save();
    rrect(ctx, SIZE / 2 - 288, ay + 9, 576, 54, 12);
    ctx.setLineDash([9, 7]); ctx.lineWidth = 2; ctx.strokeStyle = "rgba(23,18,11,0.5)"; ctx.stroke();
    ctx.restore();
    ctx.fillStyle = INK;
    ctx.font = `900 30px ${DISP}`;
    ctx.fillText(stats.arch.emoji + "  " + archText.title.toUpperCase(), SIZE / 2, ay + 48);

    /* ── footer strip in the paper field (the viral loop) ── */
    ctx.fillStyle = INK;
    ctx.fillRect(70, 1022, 940, 46);
    ctx.fillStyle = LIME;
    ctx.font = `800 25px ${MONO}`;
    ctx.fillText(I18N.t("pFooter1"), SIZE / 2, 1053);

    /* frame the paper sheet */
    ctx.strokeStyle = INK; ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, SIZE - 20, SIZE - 20);

    return canvas;
  }

  function download(canvas, username) {
    canvas.toBlob((blobObj) => {
      if (!blobObj) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blobObj);
      a.download = "github-wrapped-2026-" + username + ".png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, "image/png");
  }

  return { draw, download, SIZE };
})();
