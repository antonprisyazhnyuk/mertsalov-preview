/* 20.10 · экран 3 «Мой путь» на телефоне (< 768) — секция Бекки/Основы с правками Антона, Figma 189:72537 (кадры М1–М11, Антон 14:59 «делай»).
   15:15 Антон: «Мой путь» листается вбок, как лента на десктопе едет вбок («это логично же»): экран 3 — прибитый экран высотой окна, кадры М1–М11 в ряд;
   свайп влево / вправо — следующий / предыдущий кадр, ровно на кадр; смах вверх (палец вверх) тоже листает вперёд, как колесо на десктопе;
   на М10 «Сейчас» смах вверх отпускает страницу вниз, смах вниз на М1 — назад на экран 2 (это делает общий смах 1↔2↔3 в index.html — его не трогаем).
   21.10 08:07 Антон: «Сейчас» → «Дальше — твоя история» — вниз, а не вбок («иначе ломается смысл»): М11 не кадр ленты, а блок под экраном 3 (.pp-next).
   Сетка кадра 360: поля 16 · 4×70 · 16, всё на центральной оси 180, содержимое с 64, линия с годом на 704. Координаты — px кадра → rem (rem = ширина / 360 × 16).
   Видео Коли — круги 96 над работой, без звука; круги играют сами, без ▶ и без раскрытия (Антон 20:43). «Смотреть со звуком» — звук у рассказа в кадре.
   Появление: тексты по словам из размытия (как фраза экрана 2), картинки и шильдики мягко — когда кадр въехал; линия времени одна на весь ряд:
   при переходе дорисовывается слева направо от года к году, блик идёт своей скоростью, медленнее кончика (как ховер кнопок, ?gspeedm) и переливается по цифрам годов, назад — убирается.
   Вниз: вертикаль из-под «Сейчас» до низа экрана 3 → в блоке под ним до «Дальше — твоя история» → дальше вниз к ромбу рамы анкеты (#form-top, живой замер);
   обе части под экраном растут за взглядом (кончик на 65 % окна), по очереди;
   дошла до ромба — line:arrive на #form-top и path:down, как у десктопной ленты. «Уменьшить движение» — всё сразу, без переходов.
   Десктоп (≥ 768) не трогается: блок строится всегда, но виден только на телефоне (path-phone-2010.css). Подсказок и счётчиков нет (Антон их снимал). */
(() => {
  const sec = document.querySelector('.path[data-v="v3"]'); if (!sec) return;
  const l = document.createElement("link"); l.rel = "stylesheet"; l.href = "path-phone-2010.css?v=2010"; document.head.appendChild(l);
  const Q = new URLSearchParams(location.search);
  const P = "p/", V2 = "p/v2/", V3 = "p/v3/", PHONE = matchMedia("(max-width: 767px)"), RM = matchMedia("(prefers-reduced-motion: reduce)");
  const GSPEED = Math.max(20, +(Q.get("gspeedm") ?? 240) || 240), DRAW = 1100;   // блик, px кадра/с: год → год (360) за 1.5 с, как проход по кнопке · ход линии через кадр, мс
  const FH = 584, LINE = 568;   // кадр над полосой меню · линия с годом, px кадра (fit вписывает в окно)
  // 21.10 11:47 Антон: «нужна видимо иконка для включить звук» → значок динамика (вкл — с волнами, выкл — с крестиком), три места на выбор ?sndi=:
  // line — у строки «Смотреть со звуком» · circle — на каждом кружке Коли (тап — звук всей ленты; строки нет) · both — и там, и там (по умолчанию)
  const SNDI = ["line", "circle", "both"].includes(Q.get("sndi")) ? Q.get("sndi") : "both";   // 14:25 строка не нужна как кнопка → 14:39 Антон: «Включить звук» — подсказка до первого нажатия, дальше только значок на кружке
  const SPK = on => `<svg class="pp-spk" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9.5h3.2l4.8-4v13l-4.8-4H3.5z"/>${on
    ? '<path d="M15 9.2a3.6 3.6 0 0 1 0 5.6"/><path d="M17.6 6.6a7.4 7.4 0 0 1 0 10.8"/>' : '<path d="M15.5 9.5l5 5M20.5 9.5l-5 5"/>'}</svg>`;
  // 21.10 14:13 Антон: «хреново обрезается Коля под кружок» (2007 — видно рот и шею): у каждого ролика свой фокус по лицу (замер по 3 кадрам ролика):
  // fp — где по высоте кадр смотрит в круг (object-position, %), zm — приближение (ролик больше круга, лишнее обрезано)
  // 21.10 14:54 Антон: 2007 — с «Поначалу» (j07s = j07 с 4.65 с, «Как вы, мои кенты? Возвращаясь к теме с татухами» срезано; исходник j07.mp4 рядом)
  const FOCUS = { j07: { fp: 33 }, j22: { fp: 6, zm: 1.35 }, j24: { fp: 5 }, j28: { fp: 6 }, j01: { fp: 32 } };
  // на телефоне без приближения (z = 1): у круга нет обрезающей обёртки — значок звука выходит за круг
  const focus = src => { const f = FOCUS[(String(src).match(/(j\d\d)s?\.mp4$/) || [])[1]]; if (!f) return "";
    const z = 1; return ` style="object-position:50% ${f.fp}%${z > 1 ? `;width:${z * 100}%;height:${z * 100}%;margin:${(-(z - 1) * f.fp).toFixed(1)}% 0 0 ${(-(z - 1) / 2 * 100).toFixed(1)}%;max-width:none` : ""}"`; };
  const AGAIN = '<svg class="pp-spk" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12a7 7 0 1 1-2.05-4.95"/><path d="M19.5 4.5v4h-4"/></svg>';
  const PLAYI = '<svg class="pp-spk pl" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6.5v11l9-5.5z"/></svg>';
  const rem = px => +(px / 16).toFixed(4) + "rem";
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const nb = t => t.replace(/(^|[\s«„(])([А-Яа-яЁё])\s/g, "$1$2 ").replace(/\s—/g, " —");   // предлог в одну букву и тире не висят — как в кадре
  const sprig = r => (window.WO && WO.sprig ? WO.sprig(r) : "");
  const L = [[0, 158], [202, 360]];   // отрезки линии по бокам года (год серединой на 180)
  const VID = (src, poster) => ({ k: "vid", src, poster, x: 132, y: 64, w: 96, h: 96, round: 1 });   // 20:43 Антон: кружки просто играют сами, без ▶ и без раскрытия на весь экран
  // кадры: y — годы на линии [текст, середина], s — отрезки линии, v — вертикали [x, y0, y1 | "form"], items — x, y, w, h в px кадра; c — по центру, aw — шильдик серединой на x
  // 21.10 08:17–08:19 Антон: «не очень сбалансировано по лейауту — докрутить расположение объектов во всех этапах; полоска с годом может быть ниже, нормально так ниже,
  // за счёт этого больше воздуха между объектами» → Бекка (Основа): кадр 360×584 (айфон Антона над полосой меню), верх 32 · низ работы 472 · шильдик с 488 ·
  // низ текста 544 · линия 568 (под ней до полосы 16). Разбор — design/path-phone-balance-2110.md. На стенде — вариант при кегле big 28/36 (M28), ждёт слова Антона.
  const M32 = [
    { id: "189:72543", lab: "2002", y: [["2002", 180]], s: [[203, 360]], items: [
      { k: "ttl", t: "Мой путь", x: 16, y: 32, w: 328 },
      { k: "snd", x: 16, y: 104, w: 328 },
      { k: "img", src: P + "2002.webp", x: 102, y: 144, w: 156, h: 96, alt: "Коля на сцене с группой, 2002" },
      { k: "big", c: 1, t: "С детства рассматривал альбомы с рисунками отца. Параллельно занимался музыкой — казалось, что она первичнее.", x: 16, y: 256, w: 328 } ] },   // 9 строк = 360 → низ 616, не влезает на 72
    { id: "189:72565", lab: "2007", y: [["2007", 180]], s: L, items: [
      { ...VID(V2 + "j07s.mp4", V2 + "j07s.webp"), y: 32 },
      { k: "big", c: 1, t: "Татуировки всё-таки заняли первое место. Начал брать клиентов и набираться опыта.", x: 16, y: 144, w: 328 },   // 7 строк = 280
      { k: "sm", c: 1, t: "«Дальше я пошёл только по одному пути и выбрал татуировки»", x: 48, y: 448, w: 264 },
      { k: "img", src: P + "2007.webp", x: 120, y: 512, w: 120, h: 120, alt: "Колет дома; в магазине дисков" } ] },   // низ 632, не влезает на 88
    { id: "189:72590", lab: "2012", y: [["2012", 180]], s: L, items: [
      { k: "big", c: 1, html: "«В 2012 году<br>мы вместе<br>с Яриком<br>Волковым<br>открываем<br>студию»", x: 16, y: 32, w: 328 },   // переносы — как в кадре; 6 строк = 240
      { k: "sm", c: 1, t: "К 2014-му она выросла в большую.", x: 16, y: 296, w: 328 },
      { k: "img", src: P + "2012.webp", x: 52, y: 336, w: 256, h: 208, alt: "Первая студия, 2012" } ] },
    { id: "189:72611", lab: "2015 · Старый Оскол", y: [["2015", 180]], s: L, items: [
      { k: "img", src: V3 + "thompson.webp", x: 16, y: 32, w: 328, h: 440, alt: "Татуировка — Хантер Томпсон" },
      { k: "aw", p: "1 место", l: ["Best of Second Day", "Татумо"], x: 180, y: 488 } ] },
    { id: "189:72659", lab: "2015 · Tattoo Week", y: [["2015", 180]], s: L, items: [
      { ...VID(V3 + "j22.mp4", V3 + "j22.webp"), y: 32 },
      { k: "img", src: V3 + "portrait.webp", x: 88, y: 144, w: 184, h: 328, alt: "Татуировка — портрет, Tattoo Week" },
      { k: "aw", p: "3 место", l: ["Лучший портрет", "Tattoo Week"], x: 180, y: 488 } ] },
    { id: "189:72711", lab: "2016", y: [["2016", 180]], s: L, items: [
      { ...VID(V2 + "j24.mp4", V2 + "j24.webp"), y: 32 },
      { k: "img", src: V2 + "moto.webp", x: 16, y: 144, w: 328, h: 328, alt: "Татуировка — Мотогонщики" },
      { k: "aw", p: "2 место", l: ["Реализм", "Moscow Tattoo Convention"], x: 180, y: 488 } ] },
    { id: "189:72763", lab: "2019", y: [["2019", 180]], s: L, items: [
      { ...VID(V2 + "j28.mp4", V2 + "j28.webp"), y: 32 },
      { k: "img", src: V2 + "beavis.webp", x: 16, y: 144, w: 328, h: 328, alt: "Татуировка — Бивис и Баттхед" },
      { k: "aw", p: "2 место", l: ["Индивидуальная", "Moscow Tattoo Convention"], x: 180, y: 488 } ] },
    { id: "189:72815", lab: "2019 · Германия", y: [["2019", 180]], s: L, items: [
      { k: "vid", src: P + "2018.mp4", poster: P + "2018.webp", x: 60, y: 32, w: 240, h: 224 },   // в кадре — заставка; ролик без звука, без ▶ (как на десктопе)
      { k: "sm", c: 1, t: "Работал в студиях Германии — «самый плотный год по поездкам».", x: 16, y: 272, w: 328 },
      { k: "big", c: 1, t: "«За 2019-й год я прогрессировал просто огромными шагами»", x: 16, y: 344, w: 328 } ] },   // 5 строк = 200 → низ 544
    { id: "189:72836", lab: "2021 · 2025", y: [["2021", 94], ["2025", 266.5]], s: [[0, 72], [116, 244], [289, 360]], items: [
      { k: "big", c: 1, t: "«Конвенция это вообще лютая штука, очень заряжает»", x: 64, y: 32, w: 232 },   // 5 строк = 200
      { k: "img", src: V3 + "thompson.webp", x: 16, y: 256, w: 156, h: 208, alt: "Заглушка — работа уточняется" },
      { k: "img", src: V3 + "thompson.webp", x: 188, y: 256, w: 156, h: 208, alt: "Заглушка — работа уточняется" },
      { k: "aw", p: "2 место", l: ["Лучшая ч/б", "Nizhny Fest"], x: 93.7, y: 480 },
      { k: "aw", p: "1 место", l: ["Портрет", "Tattoo Festival,", "Петербург"], x: 265.5, y: 480 } ] },   // три строки → низ 541; шильдики на 8 выше прочих кадров, иначе третья строка упирается в линию
    { id: "189:72884", lab: "Сейчас", y: [["Сейчас", 180.5]], s: [[0, 148]], v: [[180, 576, 584]], items: [
      { k: "vid", src: P + "now.mp4", poster: P + "now.webp", x: 96, y: 32, w: 168, h: 168 },
      { k: "big", c: 1, html: nb("Сейчас работаю в Москве, в студии ") + '<a href="https://locationtattoo.ru/mercalov" target="_blank" rel="noopener">„Локация“</a>' + nb(". Даю мастер-классы и обучаю. Продолжаю активно татуировать."), x: 16, y: 224, w: 328 } ] } ];   // 8 строк = 320 → низ 544

  // M28 — ПРЕДЛОЖЕНИЕ при big 28/36 (.pp-big { font: 400 1.75rem/2.25rem }), не вшивать без слова Антона. Отличается только в кадрах 2002, 2007, 2012, 2019 · Германия, 2021 · 2025, Сейчас.
  // Строк при 28/36 (Chromium): 2002 — 7 · 2007 — 5 · 2012 — 6 · Германия — 4 · 2021 — 5 · Сейчас — 7.
  const M28 = M32.map(m => ({ ...m, items: m.items.map(it => ({ ...it })) }));
  const set = (lab, j, o) => Object.assign(M28.find(m => m.lab === lab).items[j], o);
  set("2002", 2, { x: 80, y: 144, w: 200, h: 128 });  set("2002", 3, { y: 288 });                                       // низ 540
  set("2007", 1, { y: 144 });  set("2007", 2, { y: 352 });  set("2007", 3, { x: 116, y: 416, w: 128, h: 128 });         // низ 544
  set("2012", 0, { y: 32 });  set("2012", 1, { y: 272 });  set("2012", 2, { x: 36, y: 312, w: 288, h: 232 });            // низ 544
  set("2019 · Германия", 0, { x: 28, y: 32, w: 304, h: 280 });  set("2019 · Германия", 1, { y: 328 });  set("2019 · Германия", 2, { y: 400 });   // низ 544
  set("2021 · 2025", 1, { y: 240, h: 224 });  set("2021 · 2025", 2, { y: 240, h: 224 });                                  // текст 32–212, работы 240–464
  set("Сейчас", 0, { x: 64, y: 32, w: 232, h: 232 });  set("Сейчас", 1, { y: 288 });                                    // низ 540
  // 21.10 13:55 Антон поправил первый кадр телефона https://www.figma.com/design/2mjBixbO5XTfZ3OqHIcOaJ/?node-id=205-3: вход — приветствие Коли (J01)
  // «Мой путь» сверху по центру (32) · круг 312 в кольце 328 (16, 128) · «Включить звук» по центру (496) · линия с середины (180) вправо, начало — точкой, без года.
  // 2002 — следующим кадром без заголовка, по кадру Бекки 205:22: фото 328×212 с 32, текст с 268 (линия — с обеих сторон года: идёт из кадра входа)
  M28.unshift({ id: "205:3", lab: "Мой путь", y: [], s: [[180, 360]], dot: 180, items: [
    { k: "ttl", c: 1, t: "Мой путь", x: 16, y: 32, w: 328 },
    { k: "vid", src: V3 + "j01.mp4", poster: V3 + "j01.webp", x: 16, y: 128, w: 328, h: 328, round: 1, ring: 8, pre: "metadata", label: "Коля: «Привет, ребята! Очень круто, что вы заинтересованы в моём творчестве»" },
    { k: "snd", c: 1, x: 16, y: 496, w: 328 } ] });
  { const f = M28.find(m => m.lab === "2002"); f.s = L;
    f.items = [{ ...f.items[2], x: 16, y: 32, w: 328, h: 212 }, { ...f.items[3], y: 268 }]; }
  const M = M28;
  const box = (d, it) => { d.style.left = rem(it.x); d.style.top = rem(it.y); if (it.w) d.style.width = rem(it.w); if (it.h) d.style.height = rem(it.h); };
  // 21.10 скорость: картинки и заставки роликов ленты ставятся, когда до ленты не больше полэкрана (LATE — index.html); без LATE — сразу
  let near = !window.LATE;
  const lz = (k, v) => ` ${near ? "" : "data-l"}${k}="${v}"`;
  if (!near) LATE(sec, () => { near = true; sec.querySelectorAll("[data-lsrc],[data-lposter],[data-lpre]").forEach(LATE.wake); });
  const el = it => {
    const tag = { ttl: "h2", snd: "button", img: "figure", vid: "figure" }[it.k] || "div", d = document.createElement(tag);
    d.className = "pp-" + it.k + (it.c ? " c" : "") + (it.round ? " round" : ""); box(d, it);
    if (it.k === "snd") { d.type = "button"; d.setAttribute("aria-pressed", "false"); d.textContent = "Включить звук"; }
    else if (it.k === "img") d.innerHTML = `<img${lz("src", it.src)} alt="${esc(it.alt)}" loading="lazy" decoding="async">`;
    else if (it.k === "vid") {
      d.innerHTML = `<video muted${it.round ? "" : " loop"} playsinline preload="${near ? it.pre || "none" : "none"}"${!near && it.pre ? lz("pre", it.pre) : ""}${lz("poster", it.poster)} src="${it.src}"${it.round ? focus(it.src) : ""}${it.label ? ` aria-label="${esc(it.label)}"` : ""}></video>`;
      if (it.ring) { d.classList.add("ring"); d.style.setProperty("--ri", rem(it.ring)); }
      if (it.round) { d.classList.add("story");
        // значок на круге под 45° снизу справа (на кромке ролика)
        const ri = it.ring || 0, D = it.w - 2 * ri, Bz = it.w > 200 ? 36 : 28, c = ri + D / 2 * (1 + Math.SQRT1_2) - Bz / 2;
        // 14:25–14:28 Антон: досмотрел — стоп и по центру «снова»; тап по кругу — пауза (по центру ▶)
        d.insertAdjacentHTML("beforeend", `<button class="pp-again" type="button" aria-label="Смотреть снова" style="width:${rem(Bz * 1.4)};height:${rem(Bz * 1.4)}">${AGAIN}</button><span class="pp-paused" aria-hidden="true" style="width:${rem(Bz * 1.4)};height:${rem(Bz * 1.4)}">${PLAYI}</span>`);
        if (SNDI !== "line") d.insertAdjacentHTML("beforeend", `<button class="pp-mute" type="button" aria-label="Включить звук" aria-pressed="false" style="left:${rem(c)};top:${rem(c)};width:${rem(Bz)};height:${rem(Bz)}">${SPK(false)}</button>`); }
    }
    else if (it.k === "aw") d.innerHTML = `<div class="p">${sprig(0)}<span>${esc(it.p)}</span>${sprig(1)}</div>` + it.l.map(t => `<span class="l">${esc(t)}</span>`).join("");
    else d.innerHTML = it.html || esc(nb(it.t));
    return d;
  };
  // слова — единицы входа из размытия; неразрывный пробел не режем (предлог держится со словом), слово с дефисом — целиком, как в кадре
  const split = d => {
    let i = 0; const B = (13 * parseFloat(getComputedStyle(d).fontSize) / 80).toFixed(2) + "px";
    const walk = node => [...node.childNodes].forEach(ch => {
      if (ch.nodeType === 3) {
        const f = document.createDocumentFragment();
        ch.textContent.split(/([ \t\n\r]+)/).forEach(t => { if (!t) return; if (/^[ \t\n\r]+$/.test(t)) { f.appendChild(document.createTextNode(t)); return; }
          const w = document.createElement("span"); w.className = "pw"; w.style.setProperty("--i", i++); w.textContent = t; f.appendChild(w); });
        ch.replaceWith(f);
      } else if (ch.nodeType === 1) walk(ch);
    });
    walk(d); d.style.setProperty("--B", B);
  };

  const FW = 360, N = M.length;
  const root = document.createElement("div"); root.className = "pp";
  const track = document.createElement("div"); track.className = "pp-t"; root.appendChild(track);
  // линия времени — одна на весь ряд кадров: отрезки и годы каждого кадра со сдвигом на его место; дорисовка — обрезкой слоя
  const ln = document.createElement("div"); ln.className = "pp-l"; ln.setAttribute("aria-hidden", "true"); ln.style.width = rem(FW * N);
  // 21.10 08:22 Антон: блик «топорный, не похож на блик — сильно концентрированный, по годам проходит линией, а не переливом» → свет идёт по самой линии
  // (фон отрезков, как перелив по рамке кнопки): мягкая полоса GW с плавным краем с обеих сторон; по цифрам года — та же широкая полоса. Отдельной черты нет.
  const GW = 120;   // ширина блика, px кадра (треть кадра; на кнопке — треть кнопки)
  const years = [], verts = [], fe = [];   // fe — где кончается линия кадра (до неё кончик доходит, когда кадр встал)
  M.forEach((m, i) => {
    const b = document.createElement("section"); b.className = "pp-b"; b.setAttribute("aria-label", m.lab); b.dataset.fig = m.id;
    b.__it = m.items.map(it => { const d = el(it); b.appendChild(d); return { d, it }; });
    m.s.forEach(([a, z]) => { const s = document.createElement("i"); s.style.left = rem(i * FW + a); s.style.setProperty("--sl", rem(i * FW + a)); s.style.width = rem(z - a); ln.appendChild(s); });
    if (m.dot != null) { const t = document.createElement("b"); t.className = "pp-dot"; t.style.left = rem(i * FW + m.dot); ln.appendChild(t); }   // начало линии — точкой (кадр входа 205:3)
    fe.push(m.s.length ? i * FW + Math.max(...m.s.map(s => s[1])) : fe[i - 1]);
    m.y.forEach(([t, x]) => { const d = document.createElement("div"); d.className = "pp-y"; d.textContent = t; d.dataset.t = t; d.style.left = rem(i * FW + x); track.appendChild(d); years.push({ d, x: i * FW + x, end: fe[i] }); });
    (m.v || []).forEach(([x, a, z]) => { const below = a >= LINE; const d = document.createElement("div"); d.className = "pp-v"; d.setAttribute("aria-hidden", "true"); d.style.left = rem(x); d.style.top = rem(a); d.style.height = rem(z - a);
      if (below) d.style.left = rem(i * FW + x); (below ? track : b).appendChild(d); verts.push({ d, i, gp: null, t0: 0, a, below }); });
    track.appendChild(b);
  });
  track.appendChild(ln);
  // вертикаль М11 вниз к ромбу анкеты — в странице (выходит за экран 3), видна, когда стоит М11
  // М11 (Figma 189:73272) — блок под экраном 3: вертикаль 0–136 · «Дальше — твоя история» на 160 · вертикаль с 264 вниз к ромбу анкеты
  const next = document.createElement("section"); next.className = "pp pp-next"; next.setAttribute("aria-label", "Дальше — твоя история"); next.dataset.fig = "189:73272";
  const end = el({ k: "end", t: "Дальше — твоя история", x: 16, y: 160, w: 328 }); next.appendChild(end);
  const seg = (top, h) => { const d = document.createElement("div"); d.className = "pp-down"; d.setAttribute("aria-hidden", "true"); d.style.top = rem(top); if (h) d.style.height = rem(h);
    next.appendChild(d); return { d, gp: null }; };
  const vA = seg(0, 136), vB = seg(264), down = vB.d;
  sec.appendChild(root); sec.after(next);
  const frames = [...track.children].filter(c => c.classList.contains("pp-b"));
  const units = [...root.querySelectorAll(".pp-ttl, .pp-big, .pp-sm, .pp-img, .pp-vid, .pp-aw"), end];
  units.forEach(u => { if (u.matches(".pp-img, .pp-vid, .pp-aw")) u.classList.add("pr"); });
  const texts = units.filter(u => u.matches(".pp-ttl, .pp-big, .pp-sm, .pp-end"));
  let splitDone = false, cssOk = false;
  l.addEventListener("load", () => { cssOk = true; place(); ask(); });
  const doSplit = () => { if (splitDone || !cssOk || !PHONE.matches) return; splitDone = true; texts.forEach(split); };   // кегль нужен телефонный — режем, когда стили телефона уже стоят

  // 20:21 Антон (скрин с айфона): «не влазит» — кадр рассчитан на окно 800 при ширине 360, в Safari с панелями видно меньше, низ уходит под полосу меню.
  // Правило Антона 13:20 (десктоп): по высоте вписывать сперва воздухом, размеры уменьшать только когда воздуха не хватило. Ширина и оси не трогаются.
  // Дефицит D = 748 − (высота экрана 3 − полоса 52) в px кадра. Линия, годы и вертикаль под линией поднимаются на D; ряды кадра (элементы, что стоят
  // на одной высоте, — один ряд) сдвигаются за счёт зазоров: сверху остаётся ≥ 32, между рядами ≥ 16, до линии ≥ 24 — забираем пропорционально лишнему.
  // Не хватило — кадр уменьшается целиком и равномерно от верха по оси 180 (как на десктопе: размеры — только от верха), линия и годы не уменьшаются.
  // 21.10: высокий телефон (окно выше кадра) — наоборот, лишний воздух раздаётся по тем же зазорам пропорционально им, линия опускается к полосе.
  const AIR = { top: 32, gap: 16, end: 24 };
  const fit = () => {
    const k = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16, H = root.clientHeight / k - 52, D = Math.round(FH - H);
    root.dataset.d = D;
    ln.style.top = rem(LINE - D); years.forEach(y => { y.d.style.top = rem(LINE - 7 - D); });
    const Hs = root.clientHeight / k; verts.forEach(o => { if (o.below) { o.d.style.top = rem(o.a - D); o.d.style.height = rem(Hs - (o.a - D)); } });   // вертикаль под «Сейчас» — до низа экрана 3, дальше её ведёт блок под ним
    frames.forEach((b, i) => {
      const its = b.__it; its.forEach(({ d, it }) => box(d, it)); b.style.transform = "";   // от исходных координат кадра
      if (!D || !M[i].s.length) return;
      const hs = its.map(({ d, it }) => it.h || d.offsetHeight / k);
      // ряды: элементы, что пересекаются по высоте
      const ord = its.map((o, j) => j).sort((a, c) => its[a].it.y - its[c].it.y), rows = [];
      ord.forEach(j => { const t = its[j].it.y, z = t + hs[j], r = rows[rows.length - 1];
        if (r && t < r.z - 1) { r.js.push(j); r.z = Math.max(r.z, z); } else rows.push({ js: [j], t, z }); });
      const gaps = rows.map((r, n) => n ? r.t - rows[n - 1].z : r.t), mins = rows.map((r, n) => n ? AIR.gap : AIR.top);
      gaps.push(LINE - rows[rows.length - 1].z); mins.push(AIR.end);
      const spare = gaps.map((g, n) => D > 0 ? Math.max(0, g - mins[n]) : g), S = spare.reduce((a, c) => a + c, 0), take = D > 0 ? Math.min(D, S) : D;
      let shift = 0;
      rows.forEach((r, n) => { shift += S ? spare[n] / S * take : 0; r.js.forEach(j => { const { d, it } = its[j]; d.style.top = rem(it.y - shift); }); });
      const zEnd = rows[rows.length - 1].z - shift, room = LINE - D - AIR.end;
      if (zEnd > room + .5) b.style.transform = `scale(${(room / zEnd).toFixed(4)})`;
    });
  };

  // вертикаль в ромб рамы анкеты — живой замер (#form-top ставит merts-form; рамы нет — до низа экрана 3)
  const place = () => { if (!PHONE.matches) return; fit();
    const ft = document.getElementById("form-top"), r = ft && ft.getBoundingClientRect(), top = down.getBoundingClientRect().top;
    const h = r && r.height ? r.top - top : sec.getBoundingClientRect().bottom - top; down.style.height = Math.max(0, h).toFixed(1) + "px"; };

  // ── кадры: лист вбок ──
  let idx = 0, idxT = 0, drag = 0, dragging = false;
  const fw = () => root.clientWidth || innerWidth;
  const setX = () => { track.style.transform = `translate3d(${(-idx * fw() + drag).toFixed(1)}px,0,0)`; };
  const goTo = j => { j = Math.max(0, Math.min(N - 1, j)); drag = 0; dragging = false; track.classList.remove("drag");
    if (j !== idx) { if (idx === 0 && typeof hideHint === "function") hideHint(); idx = j; idxT = performance.now(); tipTo(fe[idx]); root.dataset.i = idx;
      vids.forEach(o => { if (o.v.closest(".pp-b") === frames[idx] && !o.done) { o.held = false; o.v.closest("figure").classList.remove("held"); try { o.v.currentTime = 0; } catch (e) {} } }); }   // 08:13 Антон: перешёл на этап — ролик с начала; досмотренный (14:25) — стоит со «снова»
    setX(); ask(); };
  const downTo = () => { const from = scrollY, to = Math.round(next.getBoundingClientRect().top + scrollY), t0 = performance.now(), D = 700;
    const step = now => { const k = Math.min(1, (now - t0) / D), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; scrollTo(0, from + (to - from) * e); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step); };
  const atPath = () => Math.abs(scrollY - Math.round(sec.getBoundingClientRect().top + scrollY)) <= 1;
  // жест: вбок — кадр за пальцем, отпустил — доводка на кадр; вертикаль на прибитом экране 3 — кадр вперёд / назад (кроме выхода: вниз на М11, вверх на М1 — это страница)
  let x0 = 0, y0 = 0, t0 = 0, axis = "", own = false, fired = false, moved = 0, rawDx = 0;
  sec.addEventListener("touchstart", e => { if (!PHONE.matches || e.touches.length > 1) return; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; t0 = performance.now(); axis = ""; own = false; fired = false; }, { passive: true });
  sec.addEventListener("touchmove", e => {
    if (!PHONE.matches || e.touches.length > 1) return;
    const dx = e.touches[0].clientX - x0, dy = e.touches[0].clientY - y0;
    if (!axis && Math.hypot(dx, dy) > 6) { axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y"; moved = performance.now();
      if (axis === "x") own = root.contains(e.target);
      else own = atPath() && (dy < 0 ? idx < N - 1 : idx > 0); }   // палец вверх = вперёд; выход со М11 вниз и с М1 вверх — не наш, его ведёт страница
    if (!own) return;
    e.preventDefault(); e.stopPropagation(); moved = performance.now();
    if (axis === "x") { rawDx = dx; const edge = (dx > 0 && idx === 0) || (dx < 0 && idx === N - 1); drag = edge ? dx * .3 : dx; dragging = true; track.classList.add("drag"); setX(); ask(); }
    else if (!fired && Math.abs(dy) > 10) { fired = true; goTo(idx + (dy < 0 ? 1 : -1)); }
  }, { passive: false });
  sec.addEventListener("touchend", e => { if (!own) return; moved = performance.now();
    if (axis === "x") { const dx = drag, v = Math.abs(dx) / Math.max(1, performance.now() - t0), w = fw();
      const swiped = Math.abs(dx) > w * .18 || (Math.abs(dx) > 24 && v > .35);
      // 15:12 Антон: на «Сейчас» свайп вперёд не упирается в край — страница сама едет вниз, к «Дальше — твоя история»
      const rw = Math.abs(rawDx), rs = rw > w * .18 || (rw > 24 && rw / Math.max(1, performance.now() - t0) > .35);   // на краю — по ходу пальца, не по «резинке»
      if (rawDx < 0 && idx === N - 1 && rs) { goTo(idx); downTo(); }
      else goTo(swiped ? idx + (dx < 0 ? 1 : -1) : idx); }   // один свайп = один кадр
    wake(); own = false; }, { passive: true });
  root.addEventListener("click", e => { if (performance.now() - moved < 350) { e.preventDefault(); e.stopPropagation(); } }, true);   // свайп не открывает видео
  // колесо (узкое окно на компьютере) — как палец: вниз — вперёд, вверх — назад; выход со М11 / М1 — страницей
  let wheelT = 0;
  sec.addEventListener("wheel", e => { if (!PHONE.matches || !atPath() || (!e.deltaY && !e.deltaX) || Math.abs(e.deltaY) < Math.abs(e.deltaX) * .5) return;
    const fwd = (e.deltaY || e.deltaX) > 0; if (fwd ? idx >= N - 1 : idx <= 0) return;
    e.preventDefault(); const now = performance.now(); if (now - wheelT < 650) return; wheelT = now; goTo(idx + (fwd ? 1 : -1)); }, { passive: false });

  // ── ролики ──
  const vids = [...root.querySelectorAll("video")].map(v => ({ v, story: v.parentElement.classList.contains("story") }));
  const snd = root.querySelector(".pp-snd");
  let sound = false, raf = 0, arrived = false, downDone = null, seen = false;
  const sndTxt = () => { snd.setAttribute("aria-pressed", sound);
    snd.innerHTML = (SNDI !== "circle" ? SPK(sound) : "") + `<span>${sound ? "Выключить звук" : "Включить звук"}</span>`;   // 13:53–13:55 кадры Антона: «Включить звук»
    root.querySelectorAll(".pp-mute").forEach(b => { b.innerHTML = SPK(sound); b.setAttribute("aria-pressed", sound); b.setAttribute("aria-label", sound ? "Выключить звук" : "Включить звук"); }); };
  if (SNDI === "circle") snd.hidden = true;
  // 21.10 Антон «видео воспроизводится, но звука нет»: Safari на айфоне даёт звук ролику, только если тот хоть раз заиграл со звуком прямо в касании —
  // поэтому рассказ кадра включается со звуком прямо в касании: в нажатии «Смотреть со звуком» и в конце каждого свайпа (touchend — касание, touchmove — нет)
  // 15:09 Антон: «включил звук на первом — логично, что хочешь послушать и всё остальное» — так и есть: звук общий; на каждом свайпе (касание) рассказ нового кадра
  // включается со звуком сразу, досмотренный не трогаем
  const wake = () => { if (!sound) return; vids.forEach(o => { if (o.story && !o.done && !o.held && o.v.closest(".pp-b") === frames[idx]) { o.v.muted = false; const p = o.v.play(); if (p) p.catch(() => {}); } }); };
  const restart = o => { o.done = false; o.held = false; o.v.closest("figure").classList.remove("done", "held"); try { o.v.currentTime = 0; } catch (e) {} o.v.muted = !sound; const p = o.v.play(); if (p) p.catch(() => {}); };
  // включил звук — рассказ кадра с начала (слышно с первого слова); выключил — просто тишина
  // 14:42–14:43 Антон: подсказка — один раз, на первый переход: нажал звук или ушёл с кадра входа — больше нет
  let hintGone = false;
  const hideHint = () => { if (hintGone) return; hintGone = true; snd.classList.add("gone"); };
  const toggle = () => { sound = !sound; if (sound) hideHint(); sndTxt(); if (sound) vids.forEach(o => { if (o.story && o.v.closest(".pp-b") === frames[idx]) restart(o); }); ask(); };
  root.querySelectorAll(".pp-again").forEach(b => b.addEventListener("click", e => { e.stopPropagation(); const o = vids.find(x => x.v === b.parentElement.querySelector("video")); if (o) restart(o); ask(); }));
  root.querySelectorAll(".pp-vid.round").forEach(f => f.addEventListener("click", () => { if (performance.now() - moved < 350) return; const o = vids.find(x => x.v === f.querySelector("video")); if (!o || o.done) return;
    o.held = !o.held; f.classList.toggle("held", o.held); if (o.held) o.v.pause(); ask(); }));
  vids.forEach(o => o.v.addEventListener("ended", () => { o.done = true; o.v.closest("figure").classList.add("done"); ask(); }));
  snd.addEventListener("click", toggle);
  root.querySelectorAll(".pp-mute").forEach(b => b.addEventListener("click", e => { e.stopPropagation(); toggle(); }));   // касание — Safari даёт звук ролику (wake)
  sndTxt();

  // 15:19 Антон «перелив ещё медленнее, как на ховерах кнопок» (и на телефоне): блик идёт своей скоростью ?gspeedm (px кадра 360 в секунду) по уже нарисованной линии,
  // отстаёт, сколько отстанет; линия встала — доходит до кончика и гаснет; отстал больше чем на far — перескакивает; назад кончик не обгоняет (как glide на десктопе)
  let gdt = 1 / 60, tPrev = 0;
  const glide = (g, tip, far, k) => { if (g == null || tip <= g) return tip; g = Math.max(g + GSPEED * k * gdt, tip - far); return Math.min(g, tip); };
  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  // кончик линии: едет от года к году за DRAW мс (назад — вдвое быстрее), стартует, когда кадр почти въехал
  let tipA = 0, tipB = 0, tipT = 0, tipD = DRAW, gpH = null;
  const tipNow = now => tipA + (tipB - tipA) * ease(clamp((now - tipT) / tipD));
  function tipTo(to) { const now = performance.now(), cur = tipNow(now); tipA = cur; tipB = to; tipD = to < cur ? DRAW / 2 : DRAW; tipT = now + (to < cur ? 0 : 250); }

  // ── кадр: появление (один раз), линия, вертикали, ролики ──
  const tick = () => { raf = 0;
    if (!PHONE.matches) { vids.forEach(o => o.v.pause()); return; }
    doSplit();
    const now = performance.now(), vh = innerHeight, vw = innerWidth, bar = document.querySelector(".bar"), edge = vh - (bar ? bar.offsetHeight : 0), px = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16;
    const sr = sec.getBoundingClientRect(), onScreen = sr.top < edge - 4 && sr.bottom > 0;
    let more = false; gdt = tPrev ? Math.min(.1, (now - tPrev) / 1000) : 1 / 60; tPrev = now;
    if (!seen && onScreen) { seen = true; tipTo(fe[idx]); }   // экран 3 показался — линия первого кадра дорисовывается
    const vis = r => r.height && r.top < edge - 4 && r.bottom > 0 && r.left < vw - 4 && r.right > 4;
    if (RM.matches) units.forEach(u => u.classList.add("in"));
    else units.forEach(u => { if (!u.classList.contains("in") && vis(u.getBoundingClientRect())) u.classList.add("in"); });
    // линия времени
    const tip = RM.matches ? (seen ? fe[idx] : 0) : tipNow(now);
    if (!RM.matches && (now < tipT + tipD)) more = true;
    ln.style.clipPath = `inset(-3px ${(100 - tip / (FW * N) * 100).toFixed(4)}% -2px 0)`;
    years.forEach(y => y.d.classList.toggle("on", tip >= Math.min(y.x - 20, y.end - .5)));
    if (!RM.matches) { let gp = gpH = glide(gpH, tip, FW, 1); if (tip - gp < .5) gp = gpH = tip;
      const gOn = tip - gp > 3; ln.style.setProperty("--gx", ((gp - GW) * px).toFixed(1) + "px"); ln.classList.toggle("gl", gOn); if (Math.abs(tip - gp) > .5) more = true;
      // 15:20 Антон «и цифры годов тоже должны переливаться»: блик, проходя год, переливается по его цифрам (полоса той же ширины, слева направо)
      years.forEach(y => { const w = y.d.offsetWidth / px, gx = gp - GW - (y.x - w / 2), v = gOn && gx > -GW && gx < w ? (gx * px).toFixed(1) + "px" : "-999px";
        if (y.d.__gx !== v) { y.d.__gx = v; y.d.style.setProperty("--gx", v); } }); }
    // вертикаль под «Сейчас» — когда линия дошла до года
    verts.forEach(o => { const H = o.d.offsetHeight, ready = idx >= o.i && tip >= fe[o.i] - .5;
      if (ready && !o.t0) o.t0 = now; if (!ready) o.t0 = 0;
      const Lh = RM.matches ? (ready ? H : 0) : o.t0 ? H * ease(clamp((now - o.t0) / 500)) : 0;
      o.d.style.clipPath = `inset(0 -2px ${Math.max(0, H - Lh).toFixed(1)}px -2px)`;
      if (!RM.matches) { let gp = o.gp = glide(o.gp, Lh, vh, px); if (Lh - gp < .5) gp = o.gp = Lh; o.d.style.setProperty("--gy", (gp - GW * px).toFixed(1) + "px"); o.d.classList.toggle("gl", Lh - gp > 3);
        if (o.t0 && (now - o.t0 < 500 || Lh - gp > .5)) more = true; } });
    // вниз: стоит «Сейчас» и его вертикаль дорисована — части под экраном растут за взглядом (кончик на 65 % окна) по очереди, назад убираются
    const vNow = verts[verts.length - 1], go = idx === N - 1 && vNow && vNow.t0 && now - vNow.t0 > 500;
    let prevFull = true, DH = 0, DL = 0, gV = 0;
    [vA, vB].forEach(o => { const r = o.d.getBoundingClientRect(), Hh = r.height;
      let Lh = go && prevFull ? clamp(vh * .65 - r.top, 0, Hh) : 0; if (RM.matches && go) Lh = Hh;
      o.d.classList.toggle("on", go); o.d.style.clipPath = `inset(0 -2px ${Math.max(0, Hh - Lh).toFixed(1)}px -2px)`;
      let gp = Lh; if (!RM.matches) { gp = o.gp = glide(o.gp, Lh, vh, px); if (Lh - gp < .5) gp = o.gp = Lh;
        o.d.style.setProperty("--gy", (gp - GW * px).toFixed(1) + "px"); o.d.classList.toggle("gl", Lh - gp > 3); if (Lh - gp > .5) more = true; }
      prevFull = Hh > 0 && Lh >= Hh - .5; DH = Hh; DL = Lh; gV = gp; });
    // дошла до ромба — знак раме анкеты, как у десктопной ленты: line:arrive на #form-top (когда и блик дошёл) и path:down + html.path-down-done
    const done = DH > 0 && DL >= DH - .5, inD = done && gV >= DH - 1, ft = document.getElementById("form-top");
    if (inD && !arrived && ft) ft.dispatchEvent(new Event("line:arrive", { bubbles: true })); arrived = inD;
    if (done !== downDone) { downDone = done; document.documentElement.classList.toggle("path-down-done", done); document.dispatchEvent(new CustomEvent("path:down", { detail: { done } })); }
    // ролики: в кадре — играют сами без звука; звук — у рассказа в кадре, если включена строка «Смотреть со звуком»
    let best = null, bd = 1e9;
    vids.forEach(o => { const r = o.v.getBoundingClientRect(); o.in = !!vis(r); o.d = Math.abs(r.left + r.width / 2 - vw / 2) + Math.abs(r.top + r.height / 2 - edge / 2); if (o.story && o.in && o.d < bd) { bd = o.d; best = o.v; } });
    vids.forEach(o => { const loud = o.in && sound && o.v === best;
      o.v.muted = !loud; o.v.closest("figure").classList.toggle("loud", loud);
      // телефон не дал запустить сам (энергосбережение, звук без касания) — по центру ▶, тап по кругу запускает
      if (o.in && !o.done && !o.held) o.v.play().catch(() => { if (!o.v.paused) return; o.held = true; o.v.closest("figure").classList.add("held"); }); else o.v.pause(); });
    if (more || dragging) ask();
  };
  const ask = () => { if (!raf) raf = requestAnimationFrame(tick); };
  track.addEventListener("transitionend", ask);
  addEventListener("scroll", ask, { passive: true }); addEventListener("resize", () => { setX(); place(); ask(); });
  PHONE.addEventListener("change", () => { setX(); place(); ask(); });
  addEventListener("load", () => { place(); ask(); });
  if (document.fonts) document.fonts.ready.then(() => { place(); ask(); });
  if (window.ResizeObserver) new ResizeObserver(() => { place(); ask(); }).observe(document.body);
  sec.ppGo = goTo; sec.ppIndex = () => idx;   // для проверки и соседних окон
  root.dataset.i = 0; setX(); place(); ask();
})();
