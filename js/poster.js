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
    star(ctx, 120, 140, 66, SUN);
    ctx.save();
    ctx.setLineDash([14, 12]);
    ctx.beginPath(); ctx.arc(968, 168, 64, 0, Math.PI * 2);
    ctx.lineWidth = 5; ctx.strokeStyle = PINK; ctx.stroke();
    ctx.restore();
    squiggle(ctx, 60, 950, 170, BLUE);
    ctx.font = `900 88px ${DISP}`;
    ctx.fillStyle = VIOLET;
    ctx.fillText("+", 940, 1000);

    /* ── main card ── */
    hardBox(ctx, 70, 70, SIZE - 140, SIZE - 140, 40, WHITE);

    /* header strip */
    rrect(ctx, 70, 70, SIZE - 140, 78, 40);
    ctx.fillStyle = INK; ctx.fill();
    ctx.fillStyle = LIME;
    ctx.font = `800 30px ${MONO}`;
    ctx.textAlign = "left";
    ctx.fillText("✦ GITHUB WRAPPED", 104, 121);
    ctx.textAlign = "right";
    ctx.fillStyle = PAPER;
    ctx.fillText(String(stats.year) + " ✦", SIZE - 104, 121);
    ctx.textAlign = "center";

    /* giant year */
    ctx.font = `900 128px ${DISP}`;
    ctx.fillStyle = SUN;
    ctx.fillText(String(stats.year), SIZE / 2 + 8, 296);
    ctx.fillStyle = PINK;
    ctx.fillText(String(stats.year), SIZE / 2, 288);

    /* ── avatar + handle ── */
    const img = await loadAvatar(profile.avatar_url);
    const avY = img ? 400 : 360;
    if (img) {
      ctx.save();
      ctx.beginPath(); ctx.arc(SIZE / 2, avY, 74, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
      ctx.fillStyle = "#eee"; ctx.fillRect(SIZE / 2 - 74, avY - 74, 148, 148);
      ctx.drawImage(img, SIZE / 2 - 74, avY - 74, 148, 148);
      ctx.restore();
      ctx.beginPath(); ctx.arc(SIZE / 2, avY, 74, 0, Math.PI * 2);
      ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
    }
    ctx.fillStyle = INK;
    ctx.font = `800 42px ${MONO}`;
    ctx.fillText("@" + profile.login, SIZE / 2, avY + (img ? 130 : 26));

    /* ── headline number ── */
    const numY = avY + (img ? 222 : 110);
    ctx.font = `900 138px ${DISP}`;
    ctx.fillStyle = INK;
    ctx.fillText(f(stats.total), SIZE / 2, numY);
    ctx.font = `800 26px ${MONO}`;
    ctx.fillStyle = "rgba(23,18,11,0.72)";
    ctx.fillText("· " + I18N.t("pContrib", { year: stats.year }) + " ·", SIZE / 2, numY + 46);

    /* ── 4 stat boxes ── */
    const boxes = [
      [f(stats.prs), I18N.t("pPRs")],
      [stats.heat ? stats.heat.longest + "d" : "—", I18N.t("pStreak")],
      [stats.heat ? stats.heat.weekendPct + "%" : "—", I18N.t("pWeekend")],
      [String(stats.langList.length || 0), I18N.t("pLangs")],
    ];
    const bw = 372, bh = 128, gap = 32;
    const x0 = (SIZE - (bw * 2 + gap)) / 2;
    const y0 = numY + 90;
    boxes.forEach((b, i) => {
      const bx = x0 + (i % 2) * (bw + gap);
      const by = y0 + Math.floor(i / 2) * (bh + gap);
      hardBox(ctx, bx, by, bw, bh, 22, WHITE, 3.5);
      ctx.fillStyle = INK;
      ctx.font = `900 54px ${DISP}`;
      ctx.fillText(b[0], bx + bw / 2, by + 60);
      ctx.font = `800 22px ${MONO}`;
      ctx.fillStyle = "rgba(23,18,11,0.62)";
      ctx.fillText(b[1].toUpperCase(), bx + bw / 2, by + 100);
    });

    /* ── archetype ticket ── */
    const accent = ARCH_ACCENT[stats.arch.id] || LIME;
    const ay = y0 + bh * 2 + gap + 40;
    hardBox(ctx, SIZE / 2 - 380, ay, 760, 112, 20, accent);
    ctx.save();
    rrect(ctx, SIZE / 2 - 366, ay + 12, 732, 88, 14);
    ctx.setLineDash([10, 8]); ctx.lineWidth = 2.5; ctx.strokeStyle = "rgba(23,18,11,0.55)"; ctx.stroke();
    ctx.restore();
    ctx.fillStyle = INK;
    ctx.font = `900 44px ${DISP}`;
    ctx.fillText(stats.arch.emoji + " " + archText.title.toUpperCase(), SIZE / 2, ay + 52);
    ctx.font = `800 22px ${MONO}`;
    ctx.fillStyle = "rgba(23,18,11,0.7)";
    ctx.fillText(I18N.t("rare", { year: stats.year }), SIZE / 2, ay + 88);

    /* ── footer strip (the viral loop) ── */
    ctx.fillStyle = INK;
    ctx.fillRect(70, SIZE - 158, SIZE - 140, 100);
    ctx.fillStyle = LIME;
    ctx.font = `800 27px ${MONO}`;
    ctx.fillText(I18N.t("pFooter1"), SIZE / 2, SIZE - 120);
    ctx.fillStyle = "rgba(246,241,231,0.6)";
    ctx.font = `700 21px ${MONO}`;
    ctx.fillText(I18N.t("pFooter2"), SIZE / 2, SIZE - 84);

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
