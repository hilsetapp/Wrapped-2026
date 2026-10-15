/* ═══════════════════════════════════════════════════════════════
   i18n.js — bilingual strings (EN/RU) + tiny templating helper.
   Exposes a single global: I18N
   ═══════════════════════════════════════════════════════════════ */

const I18N = (() => {
  /* EN is the international default; a saved choice always wins */
  let lang = localStorage.getItem("wrapped2026-lang");
  if (!lang) lang = "en";

  const setLang = (l) => { lang = l; try { localStorage.setItem("wrapped2026-lang", l); } catch (_) {} };
  const getLang = () => lang;

  /* template fill: tpl(str, {n: 5}) replaces {n} */
  const tpl = (s, vars = {}) => s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : "{" + k + "}"));

  const S = {
    en: {
      /* landing */
      tagline: "Your year in code as a loud, shareable story.",
      tagline2: "No login. No server. <strong>Just a username.</strong>",
      wrapBtn: "Wrap my year ✨",
      demoLine: "see a demo first:",
      advToggle: "Caught the rate limit? Paste your own GitHub token",
      advHint: "Optional. Lifts the limit from 60 to 5000 requests/hour. Create one at github.com/settings/tokens -> Generate new token (classic), no scopes needed. Kept in this browser only.",
      privacy: "runs 100% in your browser — nothing is uploaded",
      badge: "NO LOGIN!",
      error404: "Couldn't find @{u} on GitHub — check the spelling 👀",
      error403: "GitHub's free API limit is hit (60 requests/hour per visitor). Take a coffee and retry ☕",
      error403at: "GitHub's free API limit is hit. It refills at {t}. Or paste your own token below - that gives 5000 requests/hour ☕",
      error401: "That token didn't work, so I forgot it. Create a fresh one on GitHub and paste it again 🔑",
      errorTimeout: "GitHub API is not answering (timeout). Slow connection or VPN — retry 🔁",
      errorNetwork: "Requests to GitHub are blocked: disable ad-blocker / VPN / turbo-mode for this page 🔁",
      errorWatchdog: "Still nothing after 45 seconds 😔 — something is blocking requests to GitHub. Try again, or check blockers/VPN.",
      errorGeneric: "Something went wrong while talking to GitHub. Check your connection and retry 🔁",

      /* steps */
      stepCache: "found in your browser cache ✨",
      stepProfile: "fetching profile…",
      stepRepos: "reading repositories…",
      stepGrid: "painting your contribution grid…",
      stepPrs: "counting pull requests…",
      stepIssues: "counting issues…",
      stepRhythm: "sensing your coding rhythm…",
      stepDone: "wrapping it up…",

      /* story */
      introTitle: "your {year}<br>in code",
      introSub: "tap → or let it play",
      kHeadline: "First — the headline",
      contribIn: "contributions in {year}",
      cPRs: "pull requests", cRepos: "new repos", cStars: "stars earned",
      kLang: "Your language of the year",
      ofRepos: "{pct}% of your repositories",
      kGrid: "Exhibit A",
      gridTitle: "The grid knows<br>everything",
      cLongest: "longest streak", cCurrent: "current streak", cWildest: "wildest day · {date}",
      kRhythm: "When do you code?",
      aTrue: "a true {label}", steady: "steady all week",
      rhythmSub: "based on your last {n} public events",
      cNight: "activity 22:00–06:00", cWeekend: "contributions on weekends",
      kArch: "Your coding archetype",
      hintOf: "× with a hint of {emoji} {title}",
      kRepos: "Signature work",
      reposTitle: "Repos that defined the year",
      aiLine: "+{n} AI-flavored repos — certified {year} material",
      aSide: "A-side · {year} pressing",
      kFinale: "That's a wrap",
      btnDownload: "⬇ Download poster",
      btnAgain: "↻ make yours",
      shared: "✓ copied",
      savedHint: "Poster saved to Downloads ✨ Don't see it? Check the browser's download list.",
      hintAttach: "poster downloaded — attach it to your post ✨",

      /* rhythm labels */
      rEarly: "early bird", rDay: "daytime coder", rEvening: "evening hacker", rNight: "night owl",

      share: "My GitHub Wrapped {year} 🔥 {total} contributions, archetype: {emoji} {title}. Make yours — no login: {url}",

      /* poster */
      pContrib: "contributions in {year}",
      pPRs: "pull requests", pStreak: "longest streak", pWeekend: "on weekends", pLangs: "languages",
      pFooter1: "make yours → hilsetapp.github.io/wrapped-2026",
      pFooter2: "no login · 100% browser · open source",

      /* archetypes */
      a_community_star: ["Community Star", "People actually use what you build. {stars} stars say it loud."],
      a_star_collector: ["Star Collector", "{stars} stars collected — strangers found your code useful."],
      a_night_owl: ["Night Owl", "{nightPct}% of recent activity happens 22:00–06:00. Best bugs are found at 2am."],
      a_ai_native: ["AI Native", "{aiCount} projects about AI, agents, LLMs — you're riding the era's loudest wave."],
      a_weekend_warrior: ["Weekend Warrior", "{weekendPct}% of contributions on weekends. You code like you mean it."],
      a_consistent: ["The Metronome", "A {longest}-day streak. Discipline > motivation, proven by your graph."],
      a_grid_painter: ["Grid Painter", "{total} contributions — your profile graph is modern art."],
      a_polyglot: ["Polyglot", "{langs} languages in {year}. Jack of all trades, master of shipping."],
      a_builder: ["The Builder", "No gimmicks, just shipped code. Keep going — {next} is yours."],
      a_explorer: ["The Explorer", "Quiet graph so far — every senior dev started here. Your year is loading…"],
      rare: "RARE · {year} SERIES",
    },

    ru: {
      tagline: "Твой год в коде — как громкая история.",
      tagline2: "Без логина. Без сервера. <strong>Просто ник.</strong>",
      wrapBtn: "Замотать мой год ✨",
      demoLine: "сначала глянуть демо:",
      advToggle: "Поймал лимит? Вставь свой токен GitHub",
      advHint: "Необязательно. Поднимает лимит с 60 до 5000 запросов в час. Создать: github.com/settings/tokens -> Generate new token (classic), галочки не нужны. Хранится только в этом браузере.",
      privacy: "100% в твоём браузере — ничего не улетает",
      badge: "БЕЗ ЛОГИНА!",
      error404: "Не нашли @{u} на GitHub — проверь написание 👀",
      error403: "Уперлись в бесплатный лимит GitHub API (60 запросов/час). Кофе и повтор ☕",
      error403at: "Уперлись в бесплатный лимит GitHub API. Обновится в {t}. Или вставь свой токен ниже - будет 5000 запросов в час ☕",
      error401: "Токен не подошёл, я его забыл. Сделай новый на GitHub и вставь ещё раз 🔑",
      errorTimeout: "GitHub API не отвечает (таймаут). Медленная сеть или VPN — попробуй снова 🔁",
      errorNetwork: "Запросы к GitHub блокируются: отключи блокировщик/VPN/турбо-режим для этой страницы 🔁",
      errorWatchdog: "45 секунд — и тишина 😔. Что-то блокирует запросы к GitHub. Попробуй ещё раз или проверь блокировщик/VPN.",
      errorGeneric: "Что-то пошло не так при обращении к GitHub. Проверь сеть и повтори 🔁",

      stepCache: "нашлось в кэше браузера ✨",
      stepProfile: "качаем профиль…",
      stepRepos: "читаем репозитории…",
      stepGrid: "рисуем графу года…",
      stepPrs: "считаем пул-реквесты…",
      stepIssues: "считаем ишью…",
      stepRhythm: "чувствуем твой ритм…",
      stepDone: "заматываем…",

      introTitle: "твой {year}<br>в коде",
      introSub: "тапни → или не трогай",
      kHeadline: "Сначала — главное",
      contribIn: "вкладов в {year}",
      cPRs: "пул-реквестов", cRepos: "новых реп", cStars: "звёзд собрано",
      kLang: "Твой язык года",
      ofRepos: "{pct}% твоих репозиториев",
      kGrid: "Вещдок А",
      gridTitle: "Графа знает<br>всё",
      cLongest: "самая длинная серия", cCurrent: "текущая серия", cWildest: "бешеный день · {date}",
      kRhythm: "Когда ты кодишь?",
      aTrue: "самый настоящий {label}", steady: "ровно всю неделю",
      rhythmSub: "по последним {n} публичным событиям",
      cNight: "активность 22:00–06:00", cWeekend: "вкладов в выходные",
      kArch: "Твой архетип кодера",
      hintOf: "× с примесью {emoji} «{title}»",
      kRepos: "Визитная карточка",
      reposTitle: "Репы, что сделали год",
      aiLine: "+{n} реп про AI — сертифицированный {year}",
      aSide: "Сторона A · издание {year}",
      kFinale: "Конец ленты",
      btnDownload: "⬇ Скачать постер",
      btnAgain: "↻ сделать своё",
      shared: "✓ скопировано",
      savedHint: "Постер ушёл в Загрузки ✨ Не видно? Глянь список загрузок браузера.",
      hintAttach: "постер скачан — прикрепи его к посту ✨",

      rEarly: "жаворонок", rDay: "дневной кодер", rEvening: "вечерний хакер", rNight: "сова",

      share: "Мой GitHub Wrapped {year} 🔥 {total} вкладов, архетип: {emoji} {title}. Сделай свой — без логина: {url}",

      pContrib: "вкладов в {year}",
      pPRs: "пул-реквестов", pStreak: "серия дней", pWeekend: "в выходные", pLangs: "языков",
      pFooter1: "сделай свою → hilsetapp.github.io/wrapped-2026",
      pFooter2: "без логина · всё в браузере · open source",

      a_community_star: ["Звезда комьюнити", "Люди реально пользуются твоим кодом: {stars} звёзд — это громко."],
      a_star_collector: ["Собиратель звёзд", "{stars} звёзд в коллекции — незнакомцы оценили твой код."],
      a_night_owl: ["Сова", "{nightPct}% недавней активности между 22:00 и 06:00. Лучшие баги — в два ночи."],
      a_ai_native: ["AI-натив", "{aiCount} проектов про AI, агентов и LLM — ты на самой громкой волне эпохи."],
      a_weekend_warrior: ["Воин выходного дня", "{weekendPct}% вкладов в субботу-воскресенье. Кодишь — как дышишь."],
      a_consistent: ["Метроном", "Серия в {longest} дн.! Дисциплина бьёт мотивацию — графа доказала."],
      a_grid_painter: ["Художник графы", "{total} вкладов — твоя графа профиля готова к выставке."],
      a_polyglot: ["Полиглот", "{langs} языков за {year}. Мастер на все руки — и все руки шипят."],
      a_builder: ["Строитель", "Без понтов, просто поставленный код. {next} — уже твой."],
      a_explorer: ["Первопроходец", "Пока тихо — но каждый сеньор так начинал. Твой год загружается…"],
      rare: "РЕДКАЯ · СЕРИЯ {year}",
    },
  };

  const t = (key, vars) => tpl(S[lang][key] ?? S.en[key] ?? key, vars);

  /* archetype renderer: returns { title, blurb } for an arch id */
  const arch = (id, vars) => {
    const pair = S[lang]["a_" + id] || S.en["a_" + id];
    return { title: tpl(pair[0], vars), blurb: tpl(pair[1], vars) };
  };

  const fmt = (n) => (n == null ? "—" : new Intl.NumberFormat(lang === "ru" ? "ru-RU" : "en-US").format(Number(n)));

  const dateFmt = (iso) =>
    new Date(iso + "T00:00:00Z").toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", { month: "short", day: "numeric" });

  return { t, tpl, arch, fmt, dateFmt, setLang, getLang };
})();
