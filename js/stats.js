/* ═══════════════════════════════════════════════════════════════
   stats.js — turns raw GitHub data into wrapped stats.
   Pure functions, exposes a single global: Stats
   ═══════════════════════════════════════════════════════════════ */

const Stats = (() => {
  const YEAR = 2026;

  const LANG_COLORS = {
    JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572a5", Go: "#00add8",
    Rust: "#dea584", HTML: "#e34c26", CSS: "#663399", "C#": "#68217a", Java: "#b07219",
    Ruby: "#cc342d", PHP: "#4f5d95", C: "#9599a3", "C++": "#f34b7d", Swift: "#f05138",
    Kotlin: "#a97bff", Shell: "#89e051", Vue: "#41b883", Svelte: "#ff3e00", Dart: "#00b4ab",
  };

  const AI_RE = /\b(ai|llm|gpt|agent|agents|mcp|claude|openai|anthropic|prompt|prompts|neural|diffusion|rag|embedding|vector|ml|bert|transformer|copilot|vibe)\b/i;

  const fmt = (n) => (n == null ? "—" : Number(n).toLocaleString("en-US"));

  function compute(raw) {
    const year = raw.year || YEAR;
    const own = raw.repos.filter((r) => !r.fork);

    /* ── languages ── */
    const langCount = {};
    own.forEach((r) => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });
    const langTotal = Object.values(langCount).reduce((a, b) => a + b, 0) || 1;
    const langList = Object.entries(langCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name, count,
        pct: Math.round((count / langTotal) * 100),
        color: LANG_COLORS[name] || "#22d3ee",
      }));

    /* ── stars & top repos ── */
    const stars = own.reduce((a, r) => a + (r.stargazers_count || 0), 0);
    const createdThisYear = own.filter((r) => (r.created_at || "").startsWith(String(year)));
    const pickFrom = createdThisYear.length ? createdThisYear : own;
    const topRepos = [...pickFrom]
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 3)
      .map((r) => ({ name: r.name, stars: r.stargazers_count || 0 }));

    /* ── AI-era footprint ── */
    const aiRepos = own
      .filter((r) => AI_RE.test(`${r.name} ${r.description || ""} ${(r.topics || []).join(" ")}`))
      .map((r) => r.name);

    /* ── contribution heatmap data ── */
    let heat = null;
    const days = raw.contrib && Array.isArray(raw.contrib.contributions) ? raw.contrib.contributions : [];
    const total = raw.contrib && raw.contrib.total ? (raw.contrib.total[String(year)] || 0) : 0;

    if (days.length) {
      let longest = 0, run = 0, busiest = { date: null, count: 0 };
      days.forEach((d) => {
        run = d.count > 0 ? run + 1 : 0;
        longest = Math.max(longest, run);
        if (d.count > busiest.count) busiest = { date: d.date, count: d.count };
      });
      const weekendPct = total > 0 ? Math.round(
        (days.filter((d) => [0, 6].includes(new Date(d.date + "T00:00:00Z").getUTCDay()))
          .reduce((a, d) => a + d.count, 0) / total) * 100
      ) : 0;

      /* current streak: run of active days ending today ("today = 0" is still fresh) */
      let current = 0;
      for (let i = days.length - 1; i >= 0; i--) {
        if (days[i].count > 0) current++;
        else break;
      }
      heat = { days, longest, current, busiest, weekendPct };
    }

    /* ── rhythm (recent events — GitHub keeps ~90 days) ── */
    let rhythm = null;
    if (raw.events && raw.events.length) {
      const hours = raw.events.map((e) => new Date(e.created_at).getHours());
      const night = hours.filter((h) => h >= 22 || h < 6).length;
      const nightPct = Math.round((night / hours.length) * 100);
      const buckets = [
        { label: "early bird 🌅", emo: "🌅", from: 5, to: 11, n: hours.filter((h) => h >= 5 && h < 11).length },
        { label: "daytime coder ☀️", emo: "☀️", from: 11, to: 17, n: hours.filter((h) => h >= 11 && h < 17).length },
        { label: "evening hacker 🌇", emo: "🌇", from: 17, to: 22, n: hours.filter((h) => h >= 17 && h < 22).length },
        { label: "night owl 🦉", emo: "🦉", from: 22, to: 5, n: hours.filter((h) => h >= 22 || h < 5).length },
      ];
      buckets.sort((a, b) => b.n - a.n);
      rhythm = { nightPct, peak: buckets[0], totalEvents: hours.length };
    }

    /* ── archetype ── */
    const arches = [];
    if (stars >= 500) arches.push({ emoji: "🌟", title: "Community Star", blurb: "People actually use what you build. " + fmt(stars) + " stars say it loud." });
    if (stars >= 100) arches.push({ emoji: "⭐", title: "Star Collector", blurb: fmt(stars) + " stars collected — strangers found your code useful. That never gets old." });
    if (rhythm && rhythm.nightPct >= 40) arches.push({ emoji: "🦉", title: "Night Owl", blurb: rhythm.nightPct + "% of your recent activity happens between 22:00 and 06:00. The best bugs are found at 2am." });
    if (aiRepos.length >= 2) arches.push({ emoji: "🤖", title: "AI Native", blurb: aiRepos.length + " projects about AI, agents, LLMs — you are building the hot thing of the era." });
    if (heat && heat.weekendPct >= 35) arches.push({ emoji: "⚔️", title: "Weekend Warrior", blurb: heat.weekendPct + "% of contributions on weekends. You code like you mean it — on your own time." });
    if (heat && heat.longest >= 30) arches.push({ emoji: "🧘", title: "The Consistent", blurb: "A " + heat.longest + "-day streak. Discipline > motivation, proven by your graph." });
    if (total >= 1500) arches.push({ emoji: "🎨", title: "Grid Painter", blurb: fmt(total) + " contributions — your profile graph is modern art." });
    if (langList.length >= 5) arches.push({ emoji: "🌍", title: "Polyglot", blurb: langList.length + " languages in " + year + ". Jack of all trades, master of shipping." });
    let arch;
    if (arches.length) { arch = arches[0]; if (arches[1]) arch = { ...arches[0], secondary: arches[1] }; }
    else if (total > 0) arch = { emoji: "🔨", title: "The Builder", blurb: "No gimmicks, just shipped code. Keep going — " + (year + 1) + " is yours." };
    else arch = { emoji: "🌱", title: "The Explorer", blurb: "Quiet graph so far — every senior dev started here. Your year is loading…" };

    return {
      year, total, prs: raw.prs, issues: raw.issues, stars,
      langList, topRepos, ai: { count: aiRepos.length, names: aiRepos.slice(0, 3) },
      heat, rhythm, arch, reposMade: createdThisYear.length, reposTotal: own.length,
    };
  }

  return { compute, fmt, LANG_COLORS };
})();
