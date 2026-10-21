/* 20.10 09:19 · экран 3 «Мой путь» — вариант v3 по кадру Антона (Figma 176:66319, лента 15360×1080 = 8 экранов, сетка «шаг 420»).
   Координаты — из кадра в px на 1920 → rem (/16). Десктоп ≥1024: колесо вниз — лента едет слева направо (sticky + сдвиг от прокрутки),
   после ленты прокрутка идёт дальше вниз (шаги и анкета). Уже 1024 — та же последовательность сверху вниз.
   Видео без звука; кнопка «Смотреть со звуком» — звук у рассказа у центра экрана; клик по рассказу — звук у него.
   Расхождения с кадром (узлы съехали) — в design/path-v3-2010.md. */
(() => {
  const sec = document.querySelector('.path[data-v="v3"]'); if (!sec) return;
  const P = "p/", V = "p/v3/", V2 = "p/v2/", WIDE = matchMedia("(min-width: 1024px)");
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  // 21.10 11:47 / 13:52 Антон «где иконка включить звук?»: динамик линией золотом (выкл — крестик, вкл — волны), как на телефоне
  const SPK = on => `<svg class="v3-spk${on ? " on" : " off"}" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9.5h3.2l4.8-4v13l-4.8-4H3.5z"/>${on
    ? '<path d="M15 9.2a3.6 3.6 0 0 1 0 5.6"/><path d="M17.6 6.6a7.4 7.4 0 0 1 0 10.8"/>' : '<path d="M15.5 9.5l5 5M20.5 9.5l-5 5"/>'}</svg>`;
  // 21.10 14:13 Антон: «хреново обрезается Коля под кружок» (2007 — видно рот и шею): у каждого ролика свой фокус по лицу (замер по 3 кадрам ролика):
  // fp — где по высоте кадр смотрит в круг (object-position, %), zm — приближение (ролик больше круга, лишнее обрезано)
  // 21.10 14:54 Антон: 2007 — с «Поначалу» (j07s = j07 с 4.65 с, «Как вы, мои кенты? Возвращаясь к теме с татухами» срезано; исходник j07.mp4 рядом)
  const FOCUS = { j07: { fp: 33 }, j22: { fp: 6, zm: 1.35 }, j24: { fp: 5 }, j28: { fp: 6 }, j01: { fp: 32 } };
  const focus = src => { const f = FOCUS[(String(src).match(/(j\d\d)s?\.mp4$/) || [])[1]]; if (!f) return "";
    const z = f.zm || 1; return ` style="object-position:50% ${f.fp}%${z > 1 ? `;width:${z * 100}%;height:${z * 100}%;margin:${(-(z - 1) * f.fp).toFixed(1)}% 0 0 ${(-(z - 1) / 2 * 100).toFixed(1)}%;max-width:none` : ""}"`; };
  // 21.10 14:25 Антон: «просмотрел — оно циклится, это бесит; логичнее: посмотрел — видео остановилось, посередине значок проиграть снова»
  const PLAY = '<svg class="v3-spk" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6.5v11l9-5.5z"/></svg>';
  const AGAIN = '<svg class="v3-spk" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12a7 7 0 1 1-2.05-4.95"/><path d="M19.5 4.5v4h-4"/></svg>';
  const sprig = r => (window.WO && WO.sprig ? WO.sprig(r) : "");
  // блоки ленты по порядку; у каждого элемента — x, y, w, h в px кадра 1920×1080
  const B = [
    { y: "2002", ax: 1380, items: [   // 13:46 Антон: веха-цитата по центру — год под серединой цитаты; цитата и фото серединой на оси 1380 (ось сетки 120 + 420·k)
      { k: "img", src: P + "2002.webp", x: 1275, y: 299, w: 211, h: 136, alt: "Коля на сцене с группой, 2002" },
      { k: "big", t: "С детства рассматривал альбомы с рисунками отца. Параллельно занимался музыкой — казалось, что она первичнее.", x: 1039, y: 495, w: 682, c: 1 } ] },
    { y: "2007", ax: 2640, items: [   // цитата по центру — серединой на оси 2640, год под ней
      { k: "img", src: P + "2007.webp", x: 2441, y: 205, w: 160, h: 160, alt: "Колет дома; в магазине дисков" },
      { k: "sm", t: "«Дальше я пошёл только по одному пути и выбрал татуировки»", x: 2641, y: 237, w: 204 },
      { k: "big", t: "Татуировки всё-таки заняли первое место. Начал брать клиентов и набираться опыта.", x: 2327, y: 425, w: 624, c: 1 },
      { k: "vid", src: V2 + "j07s.mp4", poster: V2 + "j07s.webp", x: 2549, y: 712, w: 180, h: 180, story: 1, cut: 1, round: 4 } ] },   // 21.10 13:50 кадр Антона 176:66319: кружок 172 в кольце 180 под текстом, блок 2007 ниже на 70
    { y: "2012", ax: 3480, items: [   // ось левого края цитаты
      { k: "big", t: "«В 2012 году мы вместе с Яриком Волковым открываем студию»", x: 3481, y: 205, w: 603 },
      { k: "img", src: P + "2012.webp", x: 3900, y: 519, w: 223, h: 176, alt: "Первая студия, 2012" },
      { k: "sm", t: "К 2014-му она выросла в большую.", x: 3900, y: 862, w: 204 } ] },
    { y: "2015", ax: 4740, items: [   // 13:46 Антон «по центру должен быть год»: веха-работа — год под серединой работы (и шильдика), работа серединой на оси 4740
      { k: "img", src: V + "thompson.webp", x: 4446, y: 105, w: 588, h: 724, alt: "Татуировка — Хантер Томпсон" },
      { k: "aw", p: "1 место", c: "Best of Second Day", e: "Татумо", x: 4446, y: 869, w: 588, center: 1 } ] },
    { y: "2015", ax: 5578.5, items: [   /* 21.10 13:50 кадр Антона: портрет 5581, шильдик справа по верху, кружок справа низом по низу работы, год — как в кадре (5561) */   // Tattoo Week — 13:31 Антон: 2015 (J20; к Коле на проверку); 13:46: портрет серединой на оси 6000, видео слева от работы, зазор 48, низ по низу работы
      { k: "img", src: V + "portrait.webp", x: 5581, y: 169, w: 371, h: 660, alt: "Татуировка — портрет, Tattoo Week" },
      { k: "aw", p: "3 место", c: "Лучший портрет", e: "Tattoo Week", x: 6000, y: 169 },
      { k: "vid", src: V + "j22.mp4", poster: V + "j22.webp", x: 6000, y: 649, w: 180, h: 180, story: 1, round: 4 } ] },
    { y: "2016", ax: 6840, items: [   // 13:46: работа серединой на оси 6840, год под ней; видео справа, зазор 48, низ по низу работы, шильдик над видео
      { k: "img", src: V2 + "moto.webp", x: 6450, y: 147, w: 789, h: 789, alt: "Татуировка — Мотогонщики" },
      { k: "aw", p: "2 место", c: "Реализм", e: "Moscow Tattoo Convention", x: 7261, y: 147 },
      { k: "vid", src: V2 + "j24.mp4", poster: V2 + "j24.webp", x: 7261, y: 756, w: 180, h: 180, story: 1, round: 4 } ] },   // 21.10 13:50 кадр Антона: шильдик и кружок справа, кружок низом по низу работы
    { y: "2019", ax: 8099.5, items: [   /* 21.10 13:50 кадр Антона: кружок слева по верху работы, шильдик под ним по низу, год — как в кадре (8082) */   // 13:46: Бивис серединой на оси 8940, год под ним; видео слева, зазор 48, низ по низу работы, шильдик над видео
      { k: "vid", src: V2 + "j28.mp4", poster: V2 + "j28.webp", x: 8101, y: 154, w: 180, h: 180, story: 1, round: 4 },
      { k: "aw", p: "2 место", c: "Индивидуальная", e: "Moscow Tattoo Convention", x: 8100, y: 860 },
      { k: "img", src: V2 + "beavis.webp", x: 8520, y: 154, w: 772, h: 772, alt: "Татуировка — Бивис и Баттхед" } ] },
    { y: "2019", ax: 9780, lab: "2019 · Германия", items: [   // 12:09 Антон «года нет»: у каждой вехи свой год, даже повторный
      { k: "vid", src: P + "2018.mp4", poster: P + "2018.webp", x: 9780, y: 148, w: 420, h: 371 },
      { k: "sm", t: "Работал в студиях Германии — «самый плотный год по поездкам».", x: 9780, y: 647, w: 322 },
      { k: "q", t: "«За 2019-й год я прогрессировал просто огромными шагами»", x: 10200, y: 647, w: 832 } ] },
    { y: "2021", ax: 11460, items: [   // 13:23 кадр Антона 176:66349: две работы рядом 420×516, шильдик справа по верху фото, цитата под обеими от оси первой работы; ⚠ заглушки Томпсона — работы у Коли
      { k: "img", src: V + "thompson.webp", x: 11460, y: 199, w: 420, h: 516, alt: "Заглушка — работа уточняется", stub: 1 },
      { k: "aw", p: "2 место", c: "Лучшая ч/б", e: "Nizhny Fest", x: 11910, y: 199 },
      { k: "q", t: "«Конвенция это вообще лютая штука, очень заряжает»", x: 11460, y: 779, w: 1068 } ] },
    { y: "2025", ax: 12300, items: [
      { k: "img", src: V + "thompson.webp", x: 12300, y: 199, w: 420, h: 516, alt: "Заглушка — работа уточняется", stub: 1 },
      { k: "aw", p: "1 место", c: "Портрет", e: "Tattoo Festival, Петербург", x: 12750, y: 199 } ] },
    { y: "Сейчас", ax: 13980, items: [   // 12:16 кадр Антона (экран 8); 13:39 — блок конвенций стал шире, «Сейчас» и финал обратно +420 (пустота блок → «Сейчас» 700)
      { k: "vid", src: P + "now.mp4", poster: P + "now.webp", x: 13700, y: 260, w: 560, h: 560 },
      { k: "big", caps: 1, html: 'Сейчас работаю в Москве, в студии <a href="https://locationtattoo.ru/mercalov" target="_blank" rel="noopener">„Локация“</a>. Даю мастер-классы и обучаю. Продолжаю активно татуировать.', x: 14400, y: 260, w: 690 },   // 12:16 кадр: капсом, 5 строк, левый край на оси 14400, верх = верх фото
      { k: "end", t: "Дальше — твоя история", x: 14400, y: 944, w: 848 } ] } ];   // 12:16 кадр: заголовок внизу на линии (середина по высоте на 980) — продолжает линию; от его оси линия уходит вниз к шагам (v3-down)

  const rem = px => px / 16 + "rem";
  // 12:23 Антон «много чего уходит под хедер»: лента живёт от низа свёрнутой шапки (5.25rem + 1px) + поле ≥ 2rem (не меньше 32 px) до низа окна.
  // 13:20 Антон «вот вёрстка, а вот как должно быть»: по горизонтали ничего не масштабируется — все x в rem, на осях сайта (120 · 540 · 960 · 1380 · 1800 при 1920).
  // По вертикали лента вписывается за счёт воздуха: расстояния по y сжимаются (py), но зазор между элементами друг над другом — не меньше 40 % прежнего;
  // не хватает и этого — элементы мельчают (ks) каждый от своего левого верхнего угла. Остаётся место — полоса встаёт по центру области под шапкой
  let FIT = { r: 1, s: 1, k: 1, ty: 0, py: 1, ks: 1, Y: y => y };
  const fit = () => {
    const vw = innerWidth, vh = innerHeight, r = vw / 1920, top = 5.25 * 16 * r + 1.5 + Math.max(32, 2 * 16 * r), avail = (vh - top - 16) / r;
    const els = [...track.querySelectorAll(".v3-b > *, .v3-head > *, .v3-line")];
    els.forEach(e => { e.style.translate = ""; e.style.scale = ""; e.__dy = 0; if (e.__mo) e.__mo.translate = undefined; });   // кэш движения — переписать заново
    if (!sec.classList.contains("v3-wide")) return (sec.v3fit = FIT = { r, s: r, k: 1, ty: 0, py: 1, ks: 1, Y: y => y * r });
    // 21.10: скрытое (строка звука) в расчёт не идёт — иначе y0 = 0 и лента сжималась зря
    const R = els.filter(e => e.classList.contains("v3-line") || e.offsetParent).map(e => ({ e, ln: e.classList.contains("v3-line"), yr: e.classList.contains("v3-y"), x: e.offsetLeft / r, w: e.offsetWidth / r, y: e.offsetTop / r, h: e.offsetHeight / r }));
    const B = R.filter(o => !o.yr && !o.ln), y0 = Math.min(...B.map(o => o.y));
    const bot = (py, k) => Math.max(...B.map(o => (o.y - y0) * py + o.h * k), (1000 - y0) * py);   // низ полосы (линия и годы на 980)
    let pmin = 0; B.forEach(a => B.forEach(b => { if (a === b || a.x >= b.x + b.w || b.x >= a.x + a.w || a.y + a.h > b.y + 1) return; const g = b.y - a.y - a.h;
      pmin = Math.max(pmin, (a.h + .4 * g) / Math.max(1, b.y - a.y)); }));   // a над b: сжатие не съедает больше 60 % зазора
    let py = 1, ks = 1;
    if (bot(1, 1) > avail) { let lo = Math.min(1, pmin), hi = 1;
      if (bot(lo, 1) <= avail) { for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (bot(m, 1) <= avail) lo = m; else hi = m; } py = lo; }
      else { let a = .2, z = Math.min(1, pmin); for (let i = 0; i < 24; i++) { const m = (a + z) / 2; if (bot(m, m) <= avail) a = m; else z = m; } py = ks = a; } }
    // влезает как в кадре — всё стоит по кадру (y × r), только то, что выше границы под шапкой, опускается до неё; не влезает — полоса от границы вниз, сжатая
    const fits = py === 1 && ks === 1, Y = y => fits ? y * r : top + (y - y0) * py * r;
    R.forEach(o => { const yy = o.yr || o.ln ? 980 : o.y; let dy = Y(yy) - yy * r; if (fits && !o.yr && !o.ln) dy = Math.max(0, top - yy * r);
      o.e.__dy = dy; o.e.style.translate = `0 ${dy.toFixed(1)}px`;
      if (ks < 1 && !o.yr && !o.ln) { const y = o.e.parentElement.querySelector(":scope > .v3-y"), ax = y ? +y.dataset.ax : NaN;
        o.e.style.scale = ks.toFixed(4); o.e.style.transformOrigin = Math.abs(o.x + o.w / 2 - ax) < 6 ? "50% 0" : "0 0"; } });   // мельчает от левого верхнего угла; стоящее серединой на оси — от середины верха
    return (sec.v3fit = FIT = { r, s: r, k: 1, ty: 0, py, ks, Y });
  };
  sec.v3fitFn = fit;
  // 21.10 скорость: картинки и заставки роликов ленты ставятся, когда до ленты не больше полэкрана (LATE — index.html); без LATE — сразу
  let near = !window.LATE;
  const lz = (k, v) => ` ${near ? "" : "data-l"}${k}="${v}"`;
  if (!near) LATE(sec, () => { near = true; sec.querySelectorAll("[data-lsrc],[data-lposter],[data-lpre]").forEach(LATE.wake); });
  const el = (it, wide) => {
    const d = document.createElement(it.k === "vid" || it.k === "img" ? "figure" : "div");
    d.className = "v3-" + it.k + (it.c ? " c" : "") + (it.caps ? " v3-up" : "") + (it.stub ? " v3-stub" : "") + (it.center ? " center" : "");
    if (wide) d.style.cssText = `left:${rem(it.x)};top:${rem(it.y)};width:${rem(it.w)}${it.h ? `;height:${rem(it.h)}` : ""}`;
    if (it.k === "img") d.innerHTML = `<img${lz("src", it.src)} alt="${esc(it.alt)}" loading="lazy" decoding="async">`;
    else if (it.k === "vid" && it.round) {   // 21.10: круг Коли — коробка = кольцо 1px, ролик кругом внутри с отступом round, значок звука на круге под 45°, без ▶
      const D = it.w - 2 * it.round, Bz = it.w > 400 ? 56 : 40, c = it.round + D / 2 * (1 + Math.SQRT1_2) - Bz / 2;
      d.classList.add("round", "story");
      d.innerHTML = `<span class="v3-cr" style="inset:${rem(it.round)}"><video muted playsinline preload="${near ? it.pre || "none" : "none"}"${!near && it.pre ? lz("pre", it.pre) : ""}${lz("poster", it.poster)} src="${it.src}"${focus(it.src)}${it.label ? ` aria-label="${esc(it.label)}"` : ""}></video></span>` +
        `<button class="v3-mute" type="button" aria-label="Включить звук" style="left:${rem(c)};top:${rem(c)};width:${rem(Bz)};height:${rem(Bz)}">${SPK(0)}${SPK(1)}</button>` +
        `<button class="v3-again" type="button" aria-label="Смотреть снова" style="width:${rem(Bz * 1.4)};height:${rem(Bz * 1.4)}">${AGAIN}</button>` +
        `<span class="v3-paused" aria-hidden="true" style="width:${rem(Bz * 1.4)};height:${rem(Bz * 1.4)}">${PLAY}</span>` +
        (it.hint ? `<button class="v3-hint" type="button" style="left:${rem(c + Bz + 14)};top:${rem(c + Bz / 2)}">Включить звук</button>` : "");   // 14:41 Антон: подсказка — вплотную справа от значка
    }
    else if (it.k === "vid") {
      d.innerHTML = `<video muted loop playsinline preload="none"${lz("poster", it.poster)} src="${it.src}"${it.cut ? ' class="cut"' : ""}></video>` + (it.story ? '<button class="v3-play" type="button" aria-label="Смотреть со звуком"><svg viewBox="0 0 14 16" aria-hidden="true"><path d="M0 0L14 8L0 16Z"/></svg></button>' : "");
      if (it.story) d.classList.add("story");
    }
    else if (it.k === "aw") d.innerHTML = `<div class="p">${sprig(0)}<span>${esc(it.p)}</span>${sprig(1)}</div><span class="l">${esc(it.c)}</span><span class="l">${esc(it.e)}</span>`;
    else if (it.k === "go") d.innerHTML = `<a href="#kak-popast" aria-label="${esc(it.t)}"><span class="v3-as"></span><svg class="v3-ah" viewBox="0 0 16 9" aria-hidden="true"><path d="M1 1L8 8L15 1"/></svg></a>`;   // стержень растёт, наконечник — в конце
    else d.innerHTML = it.html || esc(it.t);
    if (it.k === "end") d.dataset.t = it.t;   // текст для блика по буквам (path-motion-2010.css)
    return d;
  };

  const stage = document.createElement("div"); stage.className = "v3-stage"; sec.appendChild(stage);
  const track = document.createElement("div"); track.className = "v3-track"; stage.appendChild(track);
  const build = () => {
    const wide = WIDE.matches; track.replaceChildren(); sec.classList.toggle("v3-wide", wide);
    const head = document.createElement("div"); head.className = "v3-head";
    head.innerHTML = '<h2 class="v3-ttl">Мой путь</h2><button class="v3-snd" type="button" aria-pressed="false">Включить звук</button>';
    // 12:02 Антон «вот это зачем вообще едет?»: кнопка звука как в кадре — на первом экране под «Мой путь», уезжает с лентой (не прибита), видна сразу
    if (wide) { head.querySelector(".v3-ttl").style.cssText = `left:${rem(120)};top:${rem(884)}`;   /* 14:04 Антон: «Мой путь» бейзлайном на одной линии с бейзлайном года (985): в Figma бокс 899, у нас строка 120 — бейзлайн на 15 ниже, поднято */ head.querySelector(".v3-snd").style.cssText = `left:${rem(1282)};top:${rem(479)}`; }
    // 21.10 13:43 Антон: вход — приветствие Коли из закрепа «Путь джедая» («Привет, ребята! Очень круто, что вы заинтересованы…», J01) кругом над «Мой путь»,
    // по кадру Бекки Д1 https://www.figma.com/design/2mjBixbO5XTfZ3OqHIcOaJ/?node-id=205-144: круг 603 (133, 168) в кольце 627 (121, 156) #d8b77a 55 %; играет само без звука,
    // без ▶; звук — строкой «Смотреть со звуком» (рассказ у центра экрана). 2002 — на своём месте; листать можно сразу (лента не ждёт конца речи)
    // 13:53 Антон поправил Д1: круг 603 в кольце 627 на (121, 178), «Мой путь» на 899, «Включить звук» справа от круга по его середине (784, 487)
    const greet = el({ k: "vid", round: 12, hint: 1, x: 121, y: 178, w: 627, h: 627, src: V + "j01.mp4", poster: V + "j01.webp", pre: "metadata", story: 1,
      label: "Коля: «Привет, ребята! Очень круто, что вы заинтересованы в моём творчестве»" }, wide);
    greet.classList.add("v3-greet"); head.prepend(greet);
    track.appendChild(head);
    const ln = wide ? document.createElement("div") : null; if (ln) { ln.className = "v3-line"; ln.style.top = rem(980); track.appendChild(ln); }   // линия — от первого года до «Сейчас», места годов считаются ниже
    B.forEach(b => {
      const g = document.createElement("section"); g.className = "v3-b"; g.setAttribute("aria-label", b.lab || b.y || "Tattoo Week");
      if (b.y) { const y = document.createElement("div"); y.className = "v3-y"; y.textContent = b.y; y.dataset.t = b.y; y.dataset.ax = b.ax; if (wide) y.style.cssText = `left:${rem(b.ax)};top:${rem(980)}`; g.appendChild(y); }
      b.items.forEach(it => g.appendChild(el(it, wide)));
      track.appendChild(g);
    });
    // 12:07 Антон: год стоит центром на оси сетки своей вехи (ax); линия — отрезки от года к году, зазор 0.5rem у каждого года
    if (wide) { const px = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16, xs = [], hw = [];
      track.querySelectorAll(".v3-b > .v3-y").forEach(y => { const x = +y.dataset.ax / 16; y.style.left = x + "rem"; xs.push(x); hw.push(y.offsetWidth / 2 / px); });
      // 12:11 Антон: после «Сейчас» линия доезжает до оси, где начинается «Дальше — твоя история», и там обрывается
      const fin = track.querySelector(".v3-end"); if (fin && xs.length) { xs.push(fin.offsetLeft / px); hw.push(-.2); }   // линия упирается в заголовок с зазором 0.3rem
      if (xs.length) { ln.style.left = xs[0] + "rem"; ln.style.width = (xs[xs.length - 1] - xs[0]) + "rem";
        for (let i = 0; i < xs.length - 1; i++) { const a = xs[i] + hw[i] + .5 - xs[0], z = xs[i + 1] - hw[i + 1] - .5 - xs[0];
          if (z > a) { const s = document.createElement("i"); s.style.cssText = `left:${a}rem;width:${z - a}rem;--sl:${a}rem`; ln.appendChild(s); } } } }
    vids = [...track.querySelectorAll("video")].map(v => ({ v, story: v.closest("figure").classList.contains("story") }));
    // 21.10 14:25 Антон «нужна ли кнопка включить звук, если есть выключалка на кружке» — нет: звук ленты включается и выключается значком на любом круге;
    // включил — этот ролик с начала со звуком (чтобы слышать с первого слова), дальше звук у рассказа в кадре
    const restart = (f, v) => { f.classList.remove("done", "held"); const o = vids.find(x => x.v === v); if (o) { o.done = false; o.held = false; o.started = true; } try { v.currentTime = 0; } catch (e) {} v.muted = !sound; const pr = v.play(); if (pr) pr.catch(() => {}); };
    track.querySelectorAll(".v3-mute").forEach(bt => bt.addEventListener("click", e => { e.stopPropagation(); const f = bt.parentElement, v = f.querySelector("video");
      if (sound) { sound = false; solo = null; } else { sound = true; solo = v; restart(f, v); hintGone(); } sndTxt(); tick(); }));
    track.querySelectorAll(".v3-again").forEach(bt => bt.addEventListener("click", e => { e.stopPropagation(); const f = bt.parentElement, v = f.querySelector("video"); if (sound) solo = v; restart(f, v); tick(); }));
    // 14:28 Антон «должна быть кнопка паузы на кружках или я усложняю?» — отдельной нет: тап по самому кругу — пауза (по центру ▶), ещё тап — дальше
    track.querySelectorAll(".v3-vid.round").forEach(f => { f.style.cursor = "pointer"; f.addEventListener("click", () => { const v = f.querySelector("video"), o = vids.find(x => x.v === v); if (!o || o.done) return;
      o.held = !o.held; f.classList.toggle("held", o.held); if (o.held) v.pause(); tick(); }); });
    vids.forEach(o => o.v.addEventListener("ended", () => { o.done = true; o.v.closest("figure").classList.add("done"); if (solo === o.v) solo = null; tick(); }));
    track.querySelectorAll(".v3-play").forEach(bt => bt.addEventListener("click", () => { const v = bt.parentElement.querySelector("video"); solo = solo === v ? null : v; sound = !!solo || sound; sndTxt(); tick(); }));
    sndBtn = sec.querySelector(".v3-snd");
    sndTxt();   // значок динамика у строки с самого начала
    // стрелка в конце ленты — плавно к «Как попасть ко мне на сеанс» (под фиксированной шапкой)
    track.querySelectorAll(".v3-go a").forEach(a => a.addEventListener("click", e => { const t = document.querySelector(a.getAttribute("href")); if (!t) return; e.preventDefault();
      const hd = document.querySelector(".hd"), y = t.getBoundingClientRect().top + scrollY - (hd ? hd.offsetHeight : 0);
      scrollTo({ top: y, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }));
    // 21.10 14:39 Антон: на входе — только круг с Колей и рядом динамик «Включить звук»; нажал — подсказка больше не появляется, Коля говорит сначала со звуком
    const hintOn = () => { const g = track.querySelector(".v3-greet"); sound = true; hintGone(); if (g) { solo = g.querySelector("video"); restart(g, solo); } sndTxt(); tick(); };
    track.querySelectorAll(".v3-hint").forEach(h => h.addEventListener("click", e => { e.stopPropagation(); hintOn(); }));
    seen = new WeakSet();
    sec.dispatchEvent(new Event("v3:build"));   // 20.10 11:30: движение ленты (path-motion-2010.js) пересобирает свои слои
  };
  let vids = [], sound = false, solo = null, seen, raf = 0, sndBtn = null;
  // 14:42–14:43 Антон: подсказка — «ровно на один раз, только на первый переход»: живёт, пока идёт первое вступление; нажал или круг уехал — больше нет
  const hintGone = () => sec.classList.add("hint-gone");
  sec.v3hintGone = hintGone;
  const sndTxt = () => { if (!sndBtn) return; sndBtn.setAttribute("aria-pressed", sound); sndBtn.innerHTML = SPK(sound ? 1 : 0) + `<span>${sound ? "Выключить звук" : "Включить звук"}</span>`; };   // 13:53 кадр Антона: «Включить звук»   // 20.10 11:40 Антон: нажата — «Без звука»
  const tick = () => { raf = 0;
    const vw = innerWidth, vh = innerHeight, wide = sec.classList.contains("v3-wide"), b = sec.getBoundingClientRect();
    let tx = 0;
    if (wide && sec.dataset.motion !== "1") { const span = track.offsetWidth - vw, p = Math.min(1, Math.max(0, -b.top / Math.max(1, b.height - vh))); tx = p * span; track.style.transform = `translate3d(${-tx}px,0,0)`; }
    // появление блоков по ходу ленты — один раз, тонко (прозрачность и подъём на 1rem)
    if (sec.dataset.motion !== "1") track.querySelectorAll(".v3-b > *, .v3-head > *").forEach(e => { if (seen.has(e)) return; const r = e.getBoundingClientRect(); if (r.left < vw * .94 && r.right > 0 && r.top < vh * .94 && r.bottom > 0) { seen.add(e); e.classList.add("in"); } });
    // ролики: в кадре — играют без звука; звук — у выбранного кликом, иначе у рассказа ближе к центру (если включена кнопка)
    let best = null, bd = 1e9; const onSec = b.top < vh && b.bottom > 0;
    // 21.10 14:54 Антон: рассказ Коли стартует с начала, когда этап перед глазами — круг целиком в окне и левее 80 % ширины; играет один — ближе к центру;
    // ушёл — пауза, вернулся — дальше с места; досмотрел — «снова», сам не перезапускается. Остальное видео (Германия, «Сейчас») — как было: в кадре играет
    vids.forEach(o => { const r = o.v.getBoundingClientRect(); o.in = onSec && r.right > 0 && r.left < vw && r.bottom > 0 && r.top < vh;
      o.zone = o.story && onSec && r.left >= 0 && r.right <= vw && r.top >= 0 && r.bottom <= vh && r.left + r.width / 2 <= vw * .8; o.d = Math.hypot(r.left + r.width / 2 - vw / 2, r.top + r.height / 2 - vh / 2); if (o.story && o.in && o.d < bd) { bd = o.d; best = o.v; } });
    const sol = solo && vids.some(o => o.v === solo && o.in) ? solo : null;   // выбранный значком — пока в кадре, потом звук у рассказа у центра
    let one = null, od = 1e9; vids.forEach(o => { if (o.zone && !o.done && !o.held && o.d < od) { od = o.d; one = o.v; } });   // один Коля за раз
    if (sol && vids.some(o => o.v === sol && o.zone && !o.done)) one = sol;
    vids.forEach(o => { const loud = sound && o.story && o.v === one;
      o.v.muted = !loud; o.v.closest("figure").classList.toggle("loud", loud); o.v.closest("figure").classList.toggle("snd", sound);
      if (o.story) { if (o.v === one) { if (!o.started) { o.started = true; try { o.v.currentTime = 0; } catch (e) {} } o.v.play().catch(() => {}); } else o.v.pause(); }
      else if (o.in) o.v.play().catch(() => {}); else o.v.pause(); });
  };
  const ask = () => { if (!raf) raf = requestAnimationFrame(tick); };
  sec.v3tick = ask;   // движение ленты зовёт пересчёт роликов, пока лента доезжает
  // 12:16 Антон: «там дальше эта линия уже уходит в блок „Заявка“, „Эскиз“…» — от оси заголовка (середина окна в конце ленты) линия идёт вниз
  // от низа заголовка (y 1025 кадра) до ряда шагов #kak-popast; рисуется по прокрутке (path-motion-2010.js), без движения — целиком
  const down = document.createElement("div"); down.className = "v3-down"; down.setAttribute("aria-hidden", "true"); sec.appendChild(down);
  // 13:15 кадр Антона 189:72128: вертикаль идёт из-под середины «Дальше — твоя история» по оси 1380 (центр рамы анкеты) и приходит в ромб сверху рамы — #form-top;
  // пока анкета не перестроена окном merts-form — к #kak-popast
  const placeDown = () => { const top0 = document.getElementById("form-top"), kak = top0 || document.getElementById("kak-popast"), wide = sec.classList.contains("v3-wide"); down.hidden = !wide || !kak; if (down.hidden) return;
    const px = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16, vh = innerHeight, sTop = sec.getBoundingClientRect().top + scrollY;
    const F = FIT, top = sec.offsetHeight - vh + F.Y(1025), end = kak.getBoundingClientRect().top + scrollY - sTop - (top0 ? 0 : 1.5 * px);
    // 13:24 Антон «не попало в центр»: x вертикали — живой замер середины ромба #form-top (при любой ширине и сдвиге рамы), низ — верх ромба; ромба нет — ось 1380 кадра
    const kr = kak.getBoundingClientRect(), sl = sec.getBoundingClientRect().left;
    down.style.left = (top0 ? kr.left + kr.width / 2 - sl : innerWidth / 2 + 420 * F.r).toFixed(1) + "px";
    down.style.top = top + "px"; down.style.height = Math.max(0, end - top) + "px"; };
  build(); fit(); tick(); placeDown();
  addEventListener("load", () => { fit(); placeDown(); }); addEventListener("resize", () => { fit(); placeDown(); });
  if (document.fonts) document.fonts.ready.then(placeDown);
  if (window.ResizeObserver) new ResizeObserver(placeDown).observe(document.body);
  WIDE.addEventListener("change", () => { build(); fit(); tick(); });
  addEventListener("scroll", ask, { passive: true }); addEventListener("resize", ask);
  // 20.10 11:30: движение ленты по рефам Büro / Venus / Armenia / Magellan — design/path-motion-2010.md; ?motion=0 — прежнее простое проявление
  if (new URLSearchParams(location.search).get("motion") !== "0") {
    const l = document.createElement("link"); l.rel = "stylesheet"; l.href = "path-motion-2010.css?v=2010"; document.head.appendChild(l);
    const s = document.createElement("script"); s.src = "path-motion-2010.js?v=2010"; document.body.appendChild(s); }
})();
