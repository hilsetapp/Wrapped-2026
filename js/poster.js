/* ═══════════════════════════════════════════════════════════════
   poster.js — draws the 1080×1080 shareable poster on a canvas.
   Exposes a single global: Poster
   ═══════════════════════════════════════════════════════════════ */

const Poster = (() => {
  const SIZE = 1080;

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function blob(ctx, cx, cy, r, color) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(11,18,32,0)");
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  function loadAvatar(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // avatars.githubusercontent.com is CORS-open
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null); // poster still works without it
      img.src = url + "&s=200";
    });
  }

  /**
   * Draw the poster. Returns the canvas (async because avatar loads).
   * data = result of Stats.compute(raw) plus raw.profile.
   */
  async function draw(canvas, stats, profile) {
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    const S = Stats.fmt;

    /* ── background ── */
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, SIZE, SIZE);
    blob(ctx, 140, 120, 460, "rgba(192,38,211,0.34)");
    blob(ctx, 940, 880, 520, "rgba(79,70,229,0.4)");
    blob(ctx, 880, 160, 340, "rgba(34,211,238,0.18)");

    /* ── glass card ── */
    const card = { x: 62, y: 62, w: SIZE - 124, h: SIZE - 124, r: 56 };
    roundRect(ctx, card.x, card.y, card.w, card.h, card.r);
    ctx.fillStyle = "rgba(255,255,255,0.075)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    /* top glass highlight */
    roundRect(ctx, card.x, card.y, card.w, 120, 56);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fill();

    ctx.textAlign = "center";

    /* ── header ── */
    ctx.fillStyle = "rgba(234,240,251,0.75)";
    ctx.font = "600 30px system-ui, sans-serif";
    ctx.letterSpacing = "6px";
    ctx.fillText("✦ GITHUB WRAPPED ✦", SIZE / 2, 150);

    const grad = ctx.createLinearGradient(SIZE / 2 - 220, 0, SIZE / 2 + 220, 0);
    grad.addColorStop(0, "#22d3ee");
    grad.addColorStop(1, "#e879f9");
    ctx.fillStyle = grad;
    ctx.font = "900 118px system-ui, sans-serif";
    ctx.fillText(String(stats.year), SIZE / 2, 268);
    ctx.letterSpacing = "0px";

    /* ── avatar + handle ── */
    const img = await loadAvatar(profile.avatar_url);
    if (img) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(SIZE / 2, 392, 72, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, SIZE / 2 - 72, 392 - 72, 144, 144);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(SIZE / 2, 392, 72, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    ctx.fillStyle = "#eaf0fb";
    ctx.font = "700 44px system-ui, sans-serif";
    ctx.fillText("@" + profile.login, SIZE / 2, img ? 512 : 420);

    /* ── big headline number ── */
    ctx.fillStyle = "rgba(234,240,251,0.72)";
    ctx.font = "600 28px system-ui, sans-serif";
    ctx.fillText("contributions in " + stats.year, SIZE / 2, img ? 592 : 500);
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 132px system-ui, sans-serif";
    ctx.fillText(S(stats.total), SIZE / 2, img ? 716 : 624);

    /* ── stat boxes (2×2) ── */
    const boxes = [
      [S(stats.prs), "pull requests"],
      [stats.heat ? String(stats.heat.longest) + "d" : "—", "longest streak"],
      [stats.heat ? stats.heat.weekendPct + "%" : "—", "on weekends"],
      [String(stats.langList.length || 0), "languages"],
    ];
    const bw = 380, bh = 132, gap = 30;
    const x0 = (SIZE - (bw * 2 + gap)) / 2;
    const y0 = img ? 762 : 690;
    boxes.forEach((b, i) => {
      const bx = x0 + (i % 2) * (bw + gap);
      const by = y0 + Math.floor(i / 2) * (bh + gap);
      roundRect(ctx, bx, by, bw, bh, 26);
      ctx.fillStyle = "rgba(255,255,255,0.09)";
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 52px system-ui, sans-serif";
      ctx.fillText(b[0], bx + bw / 2, by + 62);
      ctx.fillStyle = "rgba(234,240,251,0.6)";
      ctx.font = "500 24px system-ui, sans-serif";
      ctx.fillText(b[1], bx + bw / 2, by + 102);
    });

    /* ── archetype pill ── */
    const pillText = stats.arch.emoji + "  " + stats.arch.title;
    ctx.font = "700 34px system-ui, sans-serif";
    const tw = ctx.measureText(pillText).width;
    const py = y0 + bh * 2 + gap + 34;
    roundRect(ctx, SIZE / 2 - tw / 2 - 42, py - 46, tw + 84, 74, 37);
    ctx.fillStyle = "rgba(34,211,238,0.16)";
    ctx.fill();
    ctx.strokeStyle = "rgba(34,211,238,0.55)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#bfeffb";
    ctx.fillText(pillText, SIZE / 2, py + 4);

    /* ── footer / watermark (the viral loop) ── */
    ctx.fillStyle = "rgba(234,240,251,0.55)";
    ctx.font = "500 25px system-ui, sans-serif";
    ctx.fillText("make yours → hilsetapp.github.io/wrapped-2026", SIZE / 2, SIZE - 96);
    ctx.fillStyle = "rgba(234,240,251,0.32)";
    ctx.font = "500 20px system-ui, sans-serif";
    ctx.fillText("no login · 100% in-browser · open source", SIZE / 2, SIZE - 62);

    return canvas;
  }

  /* trigger PNG download */
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
