// 18.10 · второй экран главной · Infinite Canvas (Codrops / Edoardo Lunardi, MIT) — без React, на голом three.js 0.182.0 (vendor/).
// Из рефа: плоскости с картинками в своей пропорции на разной глубине, перспективная камера смотрит прямо, дымка цвета фона +
// гашение по глубине, плавное проявление текстур, камера чуть ходит за мышью. Наше: полёт по z — от обычной прокрутки страницы
// (колесо НЕ перехватываем), сцена прибита sticky на отрезке ?len= экранов (3.5), перетаскивание — только ?drag=1.
// План-минимум: three.js грузится только на десктопе ≥1024 с WebGL и только после отрисовки первого экрана (load + idle или первая прокрутка).
(() => {
  const Q = new URLSearchParams(location.search), root = document.documentElement;
  const DATA = window.S3D || [];
  // 20.10 05:55 Антон «в процессе скролла появляются повторы»: за весь проход одна работа — одна плитка. Плитки идут по глубине шагом GAP,
  //   полёт SP = (N − 1) × GAP (было 900 на ~1000 плиток с повторами), прокрутка — в той же скорости, что прежде: из 3.2 экрана len 1 экран — вводная
  //   (фраза, кнопка), полёт 900 — за 2.2 экрана (09:08 Антон — 3.2). ?ggap= — шаг для пробы.
  //   ⚠ Умолчание --len продублировано в index.html (до первой отрисовки, иначе сдвиг вёрстки): при 22 работах и шаге 20 — 2.03.
  // 20.10 10:57 Антон «что-то мало работ стало» (в кадре 3–6): в 3D идут все работы сайта (works-data.js; без живописи — 52), каждая один раз — 22 работы ленты (S3D) крупнее и
  //   с самого начала, остальные (без живописи — 30) между ними мельче; полёт прежней длины (SP 420 — как у 22 при шаге 20, len 2.03). ?set=22 — прежний вариант (22 плитки шагом GAP).
  //   Карусель телефона — по-прежнему 22 (DATA).
  //   11:08–11:10 Антон: живописи на главной не надо — работы с меткой paint (4: портрет 2014, череп 2014, Кобейн, портрет жены) в 3D не идут; итого 52. «Работы» — как были.
  const SET22 = Q.get("set") === "22";
  const TILES = SET22 ? DATA : DATA.concat((window.WORKS || []).filter(w => !DATA.some(d => d.id === w.id) && !(w.tg || []).includes("paint")).map(w => { const v = Q.get("exv") === "0" ? null : w.f.find(f => f.video && /готовая/.test(f.role)), f = v || w.f[w.cv || 0];
    return { wo: w.id, id: w.id, c: w.c, y: w.y, src: f.src, w: 800, h: Math.round(800 / f.r), ...(v ? { video: v.video, vw: 800, vh: Math.round(800 / v.r) } : {}), alt: "Татуировка — " + w.t.replace(/\n/g, " "), ex: 1 }; }));
    // 30 — картинкой, кроме 4 с роликом готовой работы (ханнья, опель, игуана, котик): без них в середине полёта бывал 1 ролик на кадр (нужно 2–6)
  //   Плотность у 56 — от глубины: полёт камеры короче (SPF 300), прокрутка та же (len от 420), камера летит чуть медленнее.
  const GAP = +(Q.get("ggap") || 20), SPN = SET22 ? Math.max(60, (DATA.length - 1) * GAP) : 420, SPF = SET22 ? SPN : 300, LEN0 = Math.round((1 + 2.2 * SPN / 900) * 100) / 100;
  const LEN = Math.max(1, Math.min(8, +(Q.get("len") || LEN0)));
  root.style.setProperty("--len", LEN);
  // vc — роликов играет разом (20.10, у 56 — 6: играют ближние, дальний седьмой в дымке стоит постером; у ?set=22 — все, как было); vd — плееров всего
  // ручки сцены (v3 · 18.10, Антон 08:16 «дать крутилку — сам поднастрою»): значения из адреса g…, панель — только с ?ui
  const KD = { ov: 0, dn: .7, sz: 2, mx: 15, fg: 55, vw: 220, sp: SPF, spot: 30, vd: 99, vc: SET22 ? 99 : 6, ps: 80, id: 1.7, ig: 1, io: 0, wb: 13, ws: 1, tf: .6, tw: .4, dis: .6, cl: .5, co: .5, ce: 2, ll: .7, fd: .5, fs: .08, fr: 10, fb: 0, za: 50, zb: 170, xs: .5, ys: .5, es: .65, qa: 1 };   // za…es — раскладка 56 (20.10, lay56): начало и конец глубины, разброс по кадру, размер 34 работ не из ленты   // v8: размытие строк сравнила 4 px и 0 — на 14 px тексте 4 px мажет, по умолчанию без него   // v5 · 09:08 Антон «так, ну вроде норм» — его значения с панели · было v4 · 08:55 — значения Антона с панели; ps — кегль фразы в px при 1920 (08:56, по кадру Figma 81:196503 — 120, «можно поменьше»)
  const K = { ...KD }; for (const k in K) if (Q.has("g" + k)) K[k] = +Q.get("g" + k);
  let LENv = LEN;
  root.style.setProperty("--spot", K.spot / 100); root.style.setProperty("--qpx", K.ps);
  // v6: вводная часть отрезка (экранов): фраза tf + кнопка 0.1 + выход работ tw; добавляется к длине отрезка
  // v7 · 09:51 Антон: переход 1→2 шторкой от прокрутки (?tr=curtain, по умолчанию) или растворением (?tr=dissolve)
  const TR = ["curtain", "dissolve"].includes(Q.get("tr")) ? Q.get("tr") : "line";   // 09:55 Антон: по умолчанию — линия (curtain, dissolve — для сравнения)
  root.classList.add("tr-" + TR);
  const trOff = () => TR === "curtain" ? K.co : TR === "line" ? K.ll : 0;   // при шторке сцена встаёт под закрытой шторкой; раскрытие — первые co экрана её отрезка
  const pinLen = () => TR === "curtain" ? K.cl : TR === "line" ? K.ll : K.dis;   // сколько экранов прибит первый экран
  root.style.setProperty("--intro", K.tf + .1 + K.tw + trOff()); root.style.setProperty("--dis", pinLen());
  const CATW = { real: "реализм", port: "портрет", deco: "ар-деко", orn: "орнамент" };
  const sty = w => w.c.length ? w.c.map(c => CATW[c]).join(" · ") : "цвет";
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desk = () => matchMedia("(min-width: 1024px)").matches && !root.classList.contains("no3d");

  // ── кнопка «Смотреть все работы»: рисунок и нажатие — как у «Записаться» в хедере, только шире (280) ──
  const step = (x, y, w, h, s) => `M${x+s} ${y}H${x+w-s}V${y+s}H${x+w}V${y+h-s}H${x+w-s}V${y+h}H${x+s}V${y+h-s}H${x}V${y+s}H${x+s}Z`;
  const OUTW = step(1, 1, 278, 50, 9), INW = step(7, 7, 266, 38, 9), INW_BIG = step(4, 4, 272, 44, 9);
  document.head.insertAdjacentHTML("beforeend", `<style>.b.bw:hover .i, .b.bw:hover .gi, .b.bw:active .i, .b.bw:active .gi { d: path("${INW_BIG}"); }</style>`);
  document.querySelectorAll(".b.bw").forEach(b => {
    const svg = b.querySelector("svg");
    svg.insertAdjacentHTML("beforeend", `<defs><linearGradient id="sheenW" gradientUnits="userSpaceOnUse" x1="-60" y1="0" x2="0" y2="0">
      <stop offset="0" style="stop-color: var(--sheen)" stop-opacity="0"/><stop offset=".5" style="stop-color: var(--sheen)" stop-opacity=".95"/><stop offset="1" style="stop-color: var(--sheen)" stop-opacity="0"/>
      <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="350 0" dur="1.5s" begin="indefinite" fill="freeze"/></linearGradient></defs>
      <path class="g" d="${OUTW}" stroke="url(#sheenW)"/><path class="g gi" d="${INW}" stroke="url(#sheenW)"/>`);
    const a = svg.querySelector("animateTransform"); b.addEventListener("mouseenter", () => a.beginElement());
  });

  // ── карусель Б (<1024 и без WebGL) — код gal-phone.html как есть, строится только когда видна ──
  const LVL = `<svg class="lv2" viewBox="0 3 90 164.33" aria-hidden="true"><g fill="currentColor"><path d="M21.665 25.333L14.6655 44.9997L23.6648 64.333L28.9977 45.333L21.665 25.333Z"/><path d="M59.662 32.666L38.997 42.3327L32.3308 61.666L51.6626 50.666L59.662 32.666Z"/><path d="M4.66626 56L5.33287 78L22.6648 94.6667L21.6649 73L4.66626 56Z"/><path d="M52.3291 56.666L32.664 70.9993L29.9976 92.666L47.3295 77.3327L52.3291 56.666Z"/><path d="M46.663 86.666L33.6641 105.333L38.997 124.333L48.9962 106.333L46.663 86.666Z"/><path d="M0 87.666L7.33275 109.333L28.9977 120.666L21.665 99.9993L0 87.666Z"/><path d="M52.6626 111.333L46.6631 133.666L60.9953 149L61.3286 128L52.6626 111.333Z"/><path d="M7.66602 123L21.6649 142.333L46.3296 146.333L31.9974 128.333L7.66602 123Z"/><path d="M68.3278 160L49.6626 151L27.3311 155.333L47.3295 167.333L68.3278 160Z"/><path d="M53.6625 3L35.9973 17.3333L32.6942 41.64L36.2572 42.7633L51.3294 24.6667L53.6625 3Z"/><path d="M38.4171 37.4837C25.6557 66.8177 25.6018 96.2272 35.1247 118.752C44.6313 141.238 63.6764 156.906 89.4063 159.028L89.1 162.745C61.8441 160.497 41.6787 143.83 31.6901 120.204C21.7181 96.6176 21.8843 66.1387 34.9975 35.9961L38.4171 37.4837Z"/></g></svg>`;
  const LVR = LVL.replace('viewBox="0 3 90 164.33"', 'viewBox="0 3 90 164.33" style="transform: scaleX(-1)"');
  const s2 = document.querySelector(".s2");
  let s2built = false;
  function buildS2() {
    if (s2built || !s2 || getComputedStyle(s2).display === "none") return; s2built = true;
    const ONE = DATA.filter(w => w.wo);   // 20.10 слово Антона: карусель телефона — вся лента главной (22 работы отбора, S3D из gen-works-data.py); прежде — 8 слайдов gal-phone.html
    const PX = Q.get("px") === "0" ? 0 : +(Q.get("px") || .15);
    s2.style.setProperty("--px", PX); if (!PX) s2.classList.add("nopx"); if (Q.get("s2sh") === "normal") s2.classList.add("shn");
    const rib = s2.querySelector(".rib"), prog = s2.querySelector(".prog");
    // 19.10 · слайд по паре Антона Figma 172:44714 (кадр 171:37961): награда текстом вверху слева под полосками (16 / 42), год по центру, строка 668–706 из 780
    //   (как открытая работа на телефоне, .wo-aw в shell.css); награда и год — из works-data.js по id работы (S3D[].wo); тап по слайду — открытая работа WO.open(id)
    const WK = id => (window.WORKS || []).find(x => x.id === id);
    const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    const spr = r => window.WO && WO.sprig ? WO.sprig(r) : (r ? LVR : LVL);
    // 21.10 скорость: картинки и заставки слайдов ставятся, когда первый экран загрузился и карусель не дальше полэкрана (LATE — index.html); без LATE — сразу
    const L = window.LATE ? "data-l" : "";
    rib.innerHTML = ONE.map((w, ix) => { const wk = WK(w.wo), a = wk ? wk.award : w.award, y = wk ? wk.y : w.y;
      return `<figure class="sl${a ? " prize" : ""}"${wk ? ` data-wo="${wk.id}" role="link" tabindex="0" aria-label="Открыть работу «${esc(wk.t.replace(/\n/g, " "))}»"` : ""}>${w.video ? `<video src="${w.video}" ${L}poster="${w.src}" muted loop playsinline preload="${ix < 2 && !L ? "metadata" : "none"}"${ix < 2 && L ? ' data-lpre="metadata"' : ""} aria-label="Татуировка · видео"></video>` : `<img ${L}src="${w.src}" alt="Татуировка · ${w.c.map(c => CATW[c]).join(", ")}${w.y ? " · " + w.y : ""}" draggable="false">`}
      ${a ? `<div class="aw" aria-label="Награда"><div class="p">${spr(0)}<span>${esc(a.p)}</span>${spr(1)}</div><div class="ls"><span class="l">${esc(a.c)}</span><span class="l">${esc(a.e)}</span></div></div>` : ""}${y ? `<p class="yr">${esc(y)}</p>` : ""}</figure>`; }).join("");
    // тап — открыть работу; свайп вбок (сдвиг пальца или ленты ≥ 10 px) — листает, не открывает
    let tp = null;
    const openSl = sl => { const id = sl && sl.dataset.wo; if (!id || !window.WO) return false;
      rib.querySelectorAll("video").forEach(v => v.pause()); WO.open(id); return true; };
    rib.addEventListener("pointerdown", e => { tp = { x: e.clientX, y: e.clientY, s: rib.scrollLeft }; }, { passive: true });
    rib.addEventListener("click", e => { const t = tp; tp = null; const sl = e.target.closest(".sl"); if (!sl || !t) return;
      if (Math.hypot(e.clientX - t.x, e.clientY - t.y) >= 10 || Math.abs(rib.scrollLeft - t.s) >= 10) return;
      if (openSl(sl)) e.preventDefault(); });
    rib.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.matches(".sl[data-wo]") && openSl(e.target)) e.preventDefault(); });
    addEventListener("popstate", () => { if (!(window.WO && WO.id)) requestAnimationFrame(() => upd()); });   // работа закрыта — видео текущего слайда снова играет
    if (L) LATE(s2, () => rib.querySelectorAll("[data-lsrc],[data-lposter],[data-lpre]").forEach(LATE.wake));
    prog.innerHTML = ONE.map(() => "<i></i>").join("");
    let raf = 0;
    const upd = () => { raf = 0; const W = rib.clientWidth, x = rib.scrollLeft, k = Math.round(x / (W || 1));
      [...prog.children].forEach((e, i) => { e.classList.toggle("on", i === k); e.classList.toggle("done", i < k); });
      [...rib.children].forEach((sl, i) => { const v = sl.querySelector("video"); if (v) { if (i === k && getComputedStyle(s2).display !== "none") { if (v.paused) v.play().catch(() => {}); } else if (!v.paused) v.pause(); } });
      if (PX) [...rib.children].forEach((s, i) => { const d = (i * W - x) / W; if (Math.abs(d) < 1.5) s.firstElementChild.style.transform = `translate3d(${-d * PX * W}px,0,0)`; }); };
    rib.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    addEventListener("resize", upd); upd();
  }
  buildS2(); matchMedia("(min-width: 1024px)").addEventListener("change", () => { buildS2(); kick(); });

  // ── v6 · появление текста — эффекты Codrops по ролям (Антон 09:13, 09:16, 09:19), переключатели в адресе. Правила — из кода демо (все MIT):
  //  крупное (фраза 2-го экрана, имя 1-го) — ?txt=
  //   blur    — ScrollBlurTypography №4 (github.com/codrops/ScrollBlurTypography, js/effect-4/blurScrollEffect.js): по словам; opacity 0→1, skewX −20°→0,
  //             blur 8px→0 (при кегле 48 = 1/6 em); ease sine.out; слово 0.5, шаг 0.04; scrub.
  //   wave    — OnScrollTypographyAnimations №2 (github.com/codrops/OnScrollTypographyAnimations, src/js/index.js, fx2Titles): по буквам; opacity 0→1,
  //             yPercent 120→0, scaleY 2.3→1, scaleX 0.7→1, origin 50% 0; ease back.inOut(2); буква 1, шаг 0.03; scrub.
  //   stretch — там же №6 (fx6Titles): у каждого слова свой отрезок, внутри по буквам; perspective 2000; opacity 0→1, rotationX −90°→0, yPercent 50→0;
  //             ease power1.inOut; буква 0.5, шаг 0.03; scrub 0.9 (догоняет прокрутку за ~0.9 с).
  //   rise    — index2 №10 (src/js/index2.js, fx25Titles): по буквам; scaleY 0→1, origin 50% 100%; ease power3.in; буква 0.5, шаг 0.05; scrub (у них ещё pin на 500 %).
  //   widen   — index2 №13 (fx28Titles, «Liberation»): у слова свой отрезок; буквы: scale от 0.5 у краёв до 2.1 к середине → 1, y 0…60px (при кегле 12vw ≈ 0.26 em) → 0,
  //             поворот −4°…0…+4° → 0, blur 12px (≈ 0.05 em) + opacity 0 → чётко; ease power2.inOut; буква 0.5, разброс старта 0.15 от середины к краям; scrub.
  //   e14     — index2 №14 (fx29Titles, «Discipline above Motivation Always»): у слова свой отрезок; буквы scale 0→1, origin у чётных слов 100% 0, у нечётных 0 100%;
  //             шаг 0.03 (чётные — с начала, нечётные — с конца); ease power4.out; буква 0.5; scrub.
  //  мелкое (формула, кнопки, хедер) — ?txts=
  //   fade      — index2 №1 (fx16Titles, абзац «As human beings…»): слова opacity 0.1→1, ease none, шаг 0.05, слово 0.5; весь блок поворот 3°→0 (origin 0 50%).
  //   blur-soft — №4 тише: blur 2px, наклон −6°.
  //   (№14 — про крупные слова, к абзацу не подходит, в мелкое не взят.)
  // У них GSAP + ScrollTrigger + Lenis + Splitting — у нас свой JS без библиотек; первый экран — по времени после загрузки, фраза — от прокрутки.
  const TXT = ["blur", "wave", "stretch", "rise", "widen", "e14"].includes(Q.get("txt")) ? Q.get("txt") : "blur";
  const TXTS = ["fade", "blur-soft"].includes(Q.get("txts")) ? Q.get("txts") : "lines";   // 10:58 Антон: формула «топорно и медленно» → строками, по умолчанию
  root.classList.add("txt-" + TXT, "txts-" + TXTS);
  const map = (a, b, c, d, x) => c + (d - c) * (x - a) / (b - a);
  function bez(x1, y1, x2, y2, x) {   // cubic-bezier как в CSS: найти t по x (Ньютон + деление пополам), вернуть y
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = t => ((ax * t + bx) * t + cx) * t, Y = t => ((ay * t + by) * t + cy) * t, dX = t => (3 * ax * t + 2 * bx) * t + cx;
    if (x <= 0) return 0; if (x >= 1) return 1; let t = x;
    for (let i = 0; i < 8; i++) { const e = X(t) - x, d = dX(t); if (Math.abs(e) < 1e-5) return Y(t); if (Math.abs(d) < 1e-6) break; t -= e / d; }
    let lo = 0, hi = 1; t = x; while (hi - lo > 1e-5) { if (X(t) < x) lo = t; else hi = t; t = (lo + hi) / 2; } return Y(t); }
  const E_ = {
    none: x => x,
    sine: x => Math.sin(x * Math.PI / 2),
    backInOut2: p => { const s = 2 * 1.525; p *= 2; return p < 1 ? .5 * p * p * ((s + 1) * p - s) : (p -= 2, .5 * (p * p * ((s + 1) * p + s) + 2)); },
    power1InOut: p => p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2,
    power2InOut: p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2,
    power3In: p => p * p * p * p,
    power4Out: p => 1 - Math.pow(1 - p, 5),
  };
  // css(t, u, B) — стиль единицы u при прогрессе t (уже после ease); u.j — номер буквы в слове, u.n — букв в слове, u.pos — номер слова
  const FX = {
    blur: { unit: "w", dur: .5, step: .04, ease: E_.sine,
      css: (t, u, B) => ({ opacity: Math.min(1, t), transform: `skewX(${-20 * (1 - t)}deg)`, filter: `blur(${B * (1 - t)}px)` }) },
    wave: { unit: "c", dur: 1, step: .03, ease: E_.backInOut2,
      css: t => ({ opacity: Math.max(0, Math.min(1, t)), transform: `translateY(${120 * (1 - t)}%) scale(${.7 + .3 * t}, ${2.3 - 1.3 * t})`, filter: "none" }) },
    stretch: { unit: "c", perWord: true, dur: .5, step: .03, ease: E_.power1InOut, scrub: .9,
      css: t => ({ opacity: t, transform: `translateY(${50 * (1 - t)}%) rotateX(${-90 * (1 - t)}deg)`, filter: "none" }) },
    rise: { unit: "c", dur: .5, step: .05, ease: E_.power3In,
      css: t => ({ opacity: 1, transform: `scaleY(${t})`, filter: "none" }) },
    widen: { unit: "c", perWord: true, dur: .5, step: 0, amount: .15, ease: E_.power2InOut,
      css: (t, u) => { const n = u.n, j = u.j, h = Math.ceil(n / 2), f = j < h ? j : h - Math.abs(Math.floor(n / 2) - j) - 1;
        const sc0 = map(0, h, .5, 2.1, f), y0 = map(0, h, 0, .26, f), r0 = j < n / 2 ? map(0, h, -4, 0, f) : map(0, h, 0, 4, f);
        return { opacity: 1, transform: `translateY(${y0 * (1 - t)}em) rotate(${r0 * (1 - t)}deg) scale(${sc0 + (1 - sc0) * t})`, filter: `blur(${.052 * (1 - t)}em) opacity(${t})` }; } },
    e14: { unit: "c", perWord: true, dur: .5, step: .03, ease: E_.power4Out, fromEndOdd: true,
      css: t => ({ opacity: 1, transform: `scale(${Math.max(0, t)})`, filter: "none" }) },
  };
  const FXS = {
    fade: { dur: .5, step: .05, ease: E_.none, css: t => ({ opacity: .1 + .9 * t, transform: "", filter: "none" }), blockRot: 3 },
    "blur-soft": { dur: .5, step: .04, ease: E_.sine, css: t => ({ opacity: Math.min(1, t), transform: `skewX(${-6 * (1 - t)}deg)`, filter: `blur(${2 * (1 - t)}px)` }) },
    // lines — 10:58: строками; подъём K.fr px + прозрачность 0→1 + размытие K.fb→0; строка K.fd с, шаг K.fs с; кривая cubic-bezier(0,0,.08,.97) (как у Wonderkin)
    lines: { lines: true, dur: .5, step: .08, ease: t => bez(0, 0, .08, .97, t), easing: "cubic-bezier(0,0,.08,.97)",
      css: t => ({ opacity: Math.max(0, Math.min(1, t)), transform: `translateY(${(K.fr * (1 - t)).toFixed(2)}px)`, filter: K.fb ? `blur(${(K.fb * (1 - t)).toFixed(2)}px)` : "none" }) },
  };
  const fx = FX[TXT], fxs = FXS[TXTS];
  const easeSine = E_.sine;
  function splitWords(el) {   // слова — в span.w (inline-block); пробелы и переводы строк остаются текстом; для побуквенных — внутри span.c
    if (!el.querySelector(".w")) {
      const walk = node => [...node.childNodes].forEach(n => {
        if (n.nodeType === 1) return walk(n);
        if (n.nodeType !== 3) return;
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(t => { if (!t) return; if (/^\s+$/.test(t)) frag.append(t); else { const w = document.createElement("span"); w.className = "w"; w.textContent = t; frag.append(w); } });
        n.replaceWith(frag); });
      walk(el);
    }
    return [...el.querySelectorAll(".w")];
  }
  function splitChars(el) { const ws = splitWords(el);
    ws.forEach(w => { if (w.querySelector(".c")) return; const t = w.textContent; w.textContent = ""; [...t].forEach(ch => { const c = document.createElement("span"); c.className = "c"; c.textContent = ch; w.append(c); }); });
    return ws; }
  // единицы с их стартом на таймлайне эффекта (шаг — × ручка «шаг»); у эффектов «свой отрезок у слова» строка ниже стартует на ~7 % позже
  function units(el, lineOf) {
    const ws = fx.unit === "c" ? splitChars(el) : splitWords(el), st = fx.step * K.ws, out = [];
    if (fx.unit === "w") ws.forEach((w, i) => out.push({ el: w, s: i * st }));
    else if (!fx.perWord) { let i = 0; ws.forEach(w => w.querySelectorAll(".c").forEach(c => out.push({ el: c, s: (i++) * st }))); }
    else ws.forEach((w, pos) => { const cs = [...w.querySelectorAll(".c")], n = cs.length, off = lineOf ? lineOf(w) * .14 : 0;
      if (fx.fromEndOdd) w.dataset.odd = pos % 2;
      cs.forEach((c, j) => { let s0;
        if (fx.amount) { const mid = (n - 1) / 2; s0 = (mid ? Math.abs(j - mid) / mid : 0) * fx.amount * K.ws; }   // stagger amount 0.15, from: center
        else s0 = (fx.fromEndOdd && pos % 2 ? n - 1 - j : j) * st;
        out.push({ el: c, s: off + s0, j, n, pos }); }); });
    const T = Math.max(...out.map(u => u.s)) + fx.dur; return { list: out, T };
  }
  const setU = (el, c) => { el.style.opacity = c.opacity >= 1 ? "" : (+c.opacity).toFixed(3); el.style.transform = c.transform; el.style.filter = c.filter === "none" ? "" : c.filter; };
  const blurOf = (el, px) => px * parseFloat(getComputedStyle(el).fontSize) / 80;   // ручка «размытие» — px при кегле фразы 80; крупнее кегль — сильнее, как в рефе (1/6 em)
  // первый экран: по времени, один раз после загрузки
  const hero = document.querySelector(".hero");
  let introAnims = [], nameTxt = null, formTxt = null;
  function runIntro() {
    introAnims.forEach(a => a.cancel()); introAnims = [];
    if (!hero || calm || Q.get("intro") === "0") { root.classList.remove("intro"); return; }
    const name = hero.querySelector(".name"), formula = hero.querySelector(".formula"), portrait = hero.querySelector(".portrait");
    if (nameTxt === null) { nameTxt = name.textContent; formTxt = formula.textContent; }
    const k = K.id / 1.7, g = K.ig * k, ms = v => Math.round(v * 1000);
    const A = (el, kf, start, dur, ease) => { const a = el.animate(kf, { duration: ms(dur), delay: ms(start), easing: ease || "linear", fill: "both" }); introAnims.push(a); return a; };
    // ключевые кадры эффекта: 12 шагов по его ease (back с перелётом и т. п. — точно, без приближения кривой Безье)
    const KF = (F, u, B) => Array.from({ length: 13 }, (_, i) => { const c = F.css(F.ease(i / 12), u, B); return { opacity: c.opacity, transform: c.transform || "none", filter: c.filter, offset: i / 12 }; });
    const pStart = K.io ? .35 * g : 0, nStart = K.io ? 0 : .4 * g;
    const U = units(name), sc = (fx.unit === "w" ? .9 : 1.3) * k / U.T, unitDur = fx.dur * sc;   // всё имя — за 0.9 с (по словам) / 1.3 с (по буквам), пропорции шага и длины — как у рефа
    const nEnd = nStart + (Math.max(...U.list.map(u => u.s)) * sc) + unitDur;
    A(portrait, [{ opacity: .02 }, { opacity: 1 }], pStart, .9 * k, "ease");   // портрет — проявлением (свет relight.js идёт своим ходом)
    const nB = blurOf(name, K.wb);
    U.list.forEach(u => A(u.el, KF(fx, u, nB), nStart + u.s * sc, unitDur));
    let fStart, fDur, fEnd;
    if (fxs.lines) {   // строками: старт вместе с хвостом имени (перекрытие 150 мс), строка K.fd, шаг K.fs
      const fl = formula.textContent.split("\n").map(x => x.trim()).filter(Boolean); formula.textContent = "";
      const spans = fl.map(t => { const sp = document.createElement("span"); sp.className = "fl"; sp.textContent = t; formula.append(sp); return sp; });
      fStart = Math.max(0, nEnd - .15); fDur = K.fd;
      const kfL = [{ opacity: 0, transform: `translateY(${K.fr}px)`, filter: K.fb ? `blur(${K.fb}px)` : "none" }, { opacity: 1, transform: "none", filter: K.fb ? "blur(0px)" : "none" }];
      spans.forEach((sp, i) => A(sp, kfL, fStart + i * K.fs, fDur, fxs.easing));
      fEnd = fStart + (spans.length - 1) * K.fs + fDur;
    } else {
      const fw = splitWords(formula), kfQ = KF(fxs, {}); fStart = nStart + (nEnd - nStart) * .6; fDur = fxs.dur * k * 1.2;
      fw.forEach((w, i) => A(w, kfQ, fStart + i * fxs.step * k * 1.2, fDur));
      if (fxs.blockRot) A(formula, [{ transform: `rotate(${fxs.blockRot}deg)`, transformOrigin: "0% 50%" }, { transform: "none", transformOrigin: "0% 50%" }], fStart, fDur + fw.length * fxs.step * k * 1.2);
      fEnd = fStart + fDur;
    }
    const hStart = fxs.lines ? fStart + 2 * K.fs + K.fd * .5 : Math.max(fStart + fDur * .6, 1.2 * g);
    document.querySelectorAll(".hd").forEach(el => fxs.lines   // 20.10: .bar (нижнее меню телефона) — сразу, без появления
      ? A(el, [{ opacity: 0, transform: `translateY(${-K.fr}px)` }, { opacity: 1, transform: "none" }], hStart, K.fd, fxs.easing)   // хедер — тем же движением, сверху (он прибит к верху)
      : A(el, KF(fxs, {}), hStart, .5 * k));
    root.classList.remove("intro");   // дальше состояния держат сами анимации (fill: both)
    window.__intro = { start: performance.now(), total: Math.round(ms(hStart + (fxs.lines ? K.fd : .5 * k))), txt: TXT, txts: TXTS, fStart: Math.round(ms(fStart)), nEnd: Math.round(ms(nEnd)) };
    Promise.all(introAnims.map(a => a.finished)).then(() => { window.__intro.done = performance.now();
      introAnims.forEach(a => a.cancel()); name.textContent = nameTxt; formula.textContent = formTxt; }).catch(() => {});   // после появления — исходный текст без разбивки: первый экран пиксель в пиксель как index
  }
  if (document.fonts && document.fonts.status !== "loaded") Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 500))]).then(runIntro); else runIntro();

  // ── v6 · растворение первого экрана (Антон 09:25): прибит sticky на K.dis экрана; портрет и имя — в фон (opacity), размытие до 6px, scale → .96; формула уезжает как при обычной прокрутке
  // ── v7 · шторка (правило шторки между страницами — shell.js, реф Codrops Isle Thorne Collective, loading-curtain):
  //    закрытие — панель растёт от нижнего края (clip-path) по кривой power1.inOut, страница уходит вверх на 100 px;
  //    раскрытие — панель уходит к верхнему краю по power4.out, новая (сцена) въезжает снизу на 100 px.
  //    У нас обе кривые — функции прогресса прокрутки (cl и co экрана), а не времени. Текста на шторке нет. Край: 0 нет · 1 темнее фона · 2 золотая линия 1 px.
  const P1 = t => t < .5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t), P4o = t => 1 - Math.pow(1 - t, 5), DRIFT = 100;
  let cur = null, curLine = null, curGrainT = 0, lineEl = null;
  function curtainEls() {
    if (cur) return;
    cur = document.createElement("div"); cur.className = "s3c"; cur.setAttribute("aria-hidden", "true");
    const n = 256, c = document.createElement("canvas"); c.width = c.height = n;   // зерно — как на главной (fx.js): плитка шума, 8 %, «живёт» сдвигом
    const x = c.getContext("2d"), im = x.createImageData(n, n), d = im.data;
    for (let i = 0; i < d.length; i += 4) { d[i] = d[i + 1] = d[i + 2] = Math.random() * 255 | 0; d[i + 3] = 255; }
    x.putImageData(im, 0, 0); cur.innerHTML = `<i style="background-image:url(${c.toDataURL()})"></i>`;
    curLine = document.createElement("div"); curLine.className = "s3c-line"; curLine.setAttribute("aria-hidden", "true");
    document.body.append(cur, curLine);
  }
  function dissolve() {
    if (!hero) return;
    const on = desk() && !calm, vh = innerHeight, portrait = hero.querySelector(".portrait"), name = hero.querySelector(".name"), f = hero.querySelector(".formula");
    const stage = document.querySelector(".s3d .stage");
    if (TR === "line") {   // v7 · 09:55 Антон: «сама эта линия может скрывать предыдущий экран» — грань (линия + полоса цвета плашки хедера) поднимается от низа окна к хедеру;
      // выше неё — первый экран (стоит, срезан клипом по линии), ниже — уже второй (сцена прибита с самого начала, пока пустая); у хедера линия тонет в его плашке
      [portrait, name].forEach(el => { if (el) { el.style.opacity = ""; el.style.filter = ""; el.style.scale = ""; } }); if (f) f.style.translate = ""; if (stage) stage.style.translate = "";
      if (cur) { cur.style.display = "none"; curLine.style.display = "none"; }
      if (!on) { if (lineEl) lineEl.style.display = "none"; hero.style.clipPath = ""; hero.style.visibility = ""; window.__sceneTop = 0; return; }
      if (!lineEl) { lineEl = document.createElement("div"); lineEl.className = "s3l"; lineEl.setAttribute("aria-hidden", "true"); document.body.append(lineEl); }
      const plate = parseFloat(getComputedStyle(root).fontSize) * 5.25 + 1;   // низ плашки хедера при прокрутке (5.25rem + 1px)
      const t = Math.max(0, Math.min(1, scrollY / (K.ll * vh))), e = P1(t), Y = vh - e * (vh - plate);
      const Yp = Math.round(Y * devicePixelRatio) / devicePixelRatio;   // 11:01 Антон «цвет CBB88F»: линия на целом пикселе — без сглаживания на два ряда (на дробном y она бледнела)
      lineEl.style.display = t > 0 && t < 1 ? "" : "none"; lineEl.style.transform = `translateY(${Yp}px)`;
      lineEl.style.opacity = Yp - plate < 24 ? Math.max(0, (Yp - plate) / 24).toFixed(3) : "";   // гаснет только в последних 24 px у кромки хедера
      hero.style.clipPath = t > 0 ? `inset(0 0 ${(vh - Y).toFixed(1)}px 0)` : "";
      hero.style.visibility = t >= 1 ? "hidden" : "";
      window.__sceneTop = t > 0 ? Y : vh;
      return;
    }
    if (lineEl) lineEl.style.display = "none"; hero.style.clipPath = "";
    if (TR === "curtain") {
      [portrait, name].forEach(el => { if (el) { el.style.opacity = ""; el.style.filter = ""; el.style.scale = ""; } }); if (f) f.style.translate = "";
      if (!on) { if (cur) { cur.style.display = "none"; curLine.style.display = "none"; } hero.style.translate = ""; hero.style.visibility = ""; if (stage) stage.style.translate = ""; return; }
      curtainEls();
      const c = Math.max(0, Math.min(1, scrollY / (K.cl * vh))), o = Math.max(0, Math.min(1, (scrollY - K.cl * vh) / (K.co * vh)));
      const ec = P1(c), eo = P4o(o);
      hero.style.translate = c > 0 ? `0 ${(-DRIFT * ec).toFixed(1)}px` : "";   // первый экран уходит вверх на 100 px, пока шторка закрывает
      hero.style.visibility = c >= 1 ? "hidden" : "";                           // закрыто — первый экран убран, сквозь пустую сцену его не видно
      if (stage) stage.style.translate = c >= 1 && o < 1 ? `0 ${(DRIFT * (1 - eo)).toFixed(1)}px` : "";   // сцена въезжает снизу на 100 px
      const vis = c > 0 && o < 1;
      cur.style.display = vis ? "" : "none"; curLine.style.display = vis && K.ce === 2 ? "" : "none";
      cur.classList.toggle("dark", K.ce === 1);
      if (vis) { const top = c < 1 ? (1 - ec) * 100 : 0, bot = c < 1 ? 0 : eo * 100;
        cur.style.clipPath = `inset(${top.toFixed(3)}% 0% ${bot.toFixed(3)}% 0%)`;
        const edge = c < 1 ? (1 - ec) * vh : (1 - eo) * vh;   // движущийся край: при закрытии — верхний, при раскрытии — нижний
        curLine.style.transform = `translateY(${(edge - (c < 1 ? 0 : 1)).toFixed(1)}px)`;
        curLine.style.opacity = (c < 1 ? (ec > .999 ? 0 : 1) : (eo < .001 ? 0 : 1));
        if (!curGrainT) curGrainT = setInterval(() => { const g = cur.firstChild; if (g) g.style.backgroundPosition = `${Math.random() * 256 | 0}px ${Math.random() * 256 | 0}px`; }, 66);
      } else if (curGrainT) { clearInterval(curGrainT); curGrainT = 0; }
      return;
    }
    if (cur) { cur.style.display = "none"; curLine.style.display = "none"; } hero.style.translate = ""; if (stage) stage.style.translate = "";
    const d = on ? Math.max(0, Math.min(1, scrollY / (K.dis * vh))) : 0;
    [portrait, name].forEach(el => { if (!el) return;
      el.style.opacity = d ? (1 - d).toFixed(3) : ""; el.style.filter = d ? `blur(${(6 * d).toFixed(2)}px)` : ""; el.style.scale = d ? (1 - .04 * d).toFixed(4) : ""; });
    if (f) f.style.translate = on && scrollY > 0 ? `0 ${-Math.min(scrollY, K.dis * vh).toFixed(1)}px` : "";   // формула уезжает с прокруткой, пока экран прибит
    hero.style.visibility = on && d >= 1 && scrollY > (K.dis + 1) * vh ? "hidden" : "";
  }
  let dsRaf = 0; addEventListener("scroll", () => { if (!dsRaf) dsRaf = requestAnimationFrame(() => { dsRaf = 0; dissolve(); }); }, { passive: true });
  addEventListener("resize", dissolve); dissolve();

  // ── v6 · переход первый → второй (Антон 09:10: «сначала должна появиться фраза, потом начаться сам полёт»), всё от прокрутки:
  // сцена пустая → слова фразы выходят из размытия (эффект №4, на всю фразу tf экрана) → кнопка тише → работы выплывают из дымки (tw экрана) → полёт
  const qEl = document.querySelector(".s3d .q"), qBtn = document.querySelector(".s3d .b");
  const sm = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const introLen = () => K.tf + .1 + K.tw + trOff();
  function phase() {   // y — сколько прокручено внутри прибитой сцены, в экранах (при шторке — от конца раскрытия)
    const s3 = document.querySelector(".s3d"); if (!s3) return { y: 0, E: 1, p: 0 };
    const vh = innerHeight, y = -s3.getBoundingClientRect().top / vh - trOff(), span = s3.offsetHeight / vh - 1 - trOff(), intro = K.tf + .1 + K.tw;
    const E = calm ? 1 : sm((y - K.tf - .1) / K.tw);
    const p = Math.max(0, Math.min(1, (y - intro) / Math.max(.01, span - intro)));
    return { y, E, p };
  }
  let qBlur = 0, qU = null, Ps = 0, Pt = 0, psRaf = 0;
  const qLineOf = w => { const ql = w.closest(".ql"); return ql ? [...qEl.querySelectorAll(".ql")].indexOf(ql) : 0; };
  function phraseApply(P) {
    if (!qEl) return; if (!qU) qU = units(qEl, qLineOf); if (!qBlur) qBlur = blurOf(qEl, K.wb);
    qU.list.forEach(u => { const t = Math.max(0, Math.min(1, (P * qU.T - u.s) / fx.dur)); setU(u.el, t >= 1 ? { opacity: 1, transform: "", filter: "none" } : fx.css(fx.ease(t), u, qBlur)); });
  }
  const qTxt = document.querySelector(".s3d .txt");
  function phraseReveal() {
    const { y } = phase(), P = calm ? 1 : Math.max(0, Math.min(1, y / K.tf));
    if (qTxt) { const v = calm ? 1 : Math.max(0, Math.min(1, (y + .15) / .15)); qTxt.style.opacity = v >= 1 ? "" : v.toFixed(3); qTxt.style.visibility = v <= 0 ? "hidden" : ""; root.classList.toggle("q-on", v > 0); }   // скрыта целиком; пятно под фразой включается, только когда фраза пошла — иначе его сдвиг при подгрузке шрифта считается сдвигом вёрстки (CLS)   // пока сцена не встала (первый экран ещё растворяется) — фразы и кнопки нет совсем
    if (fx.scrub && !calm) {   // №6: scrub 0.9 — догоняет прокрутку за ~0.9 с
      Pt = P; if (!psRaf) { let last = performance.now(); const tick = now => { const dt = (now - last) / 1000; last = now; Ps += (Pt - Ps) * (1 - Math.exp(-dt * 3.3));
        if (Math.abs(Pt - Ps) < .002) Ps = Pt; phraseApply(Ps); psRaf = Ps === Pt ? 0 : requestAnimationFrame(tick); }; psRaf = requestAnimationFrame(tick); }
    } else phraseApply(P);
    if (qBtn) { const t = calm ? 1 : easeSine(Math.max(0, Math.min(1, (y - K.tf * .9) / .12)));
      setU(qBtn, t >= 1 ? { opacity: 1, transform: "", filter: "none" } : fxs.css(fxs.ease(t), {})); qBtn.style.pointerEvents = t > .5 ? "" : "none"; }
  }
  let prRaf = 0; addEventListener("scroll", () => { if (!prRaf) prRaf = requestAnimationFrame(() => { prRaf = 0; phraseReveal(); }); }, { passive: true });
  addEventListener("resize", () => { qBlur = 0; phraseReveal(); }); if (document.fonts) document.fonts.ready.then(() => { qBlur = 0; phraseReveal(); }); phraseReveal();

  // ── десктоп: ленивый запуск three.js ─────────────────────────────────
  // свет обоев под мышью: с v7 (09:56) не выключается над сценой целиком — см. lightHoles() в сцене
  const sec = document.querySelector(".s3d"), stage = sec && sec.querySelector(".stage"), cv = sec && sec.querySelector("canvas");
  let started = false;
  function kick() {
    if (started || !sec || !desk()) return; started = true;
    window.__s3d = { t0: performance.now() };
    import("./vendor/three.module.min.js").then(init).catch(e => { console.error(e); root.classList.add("no3d"); buildS2(); });
  }
  const afterPaint = () => (window.requestIdleCallback ? requestIdleCallback(kick, { timeout: 2500 }) : setTimeout(kick, 1200));
  if (document.readyState === "complete") afterPaint(); else addEventListener("load", afterPaint, { once: true });
  addEventListener("scroll", () => { if (document.readyState === "complete") kick(); }, { passive: true, once: true });   // ушли с первого экрана раньше простоя — грузим сразу

  // ── сцена ─────────────────────────────────────────────────────────────
  function init(T) {
    window.__s3d.loaded = performance.now();
    // v3 · 18.10 (Антон 08:15–08:16): работы почти не заходят друг на друга (≤ нахлёст из ручки), плотность — за счёт пустых мест поля;
    // «тень» — тающие работы и пятно под фразой были темнее фона (смешивались с #1a1a1a, а фон с зерном на экране ≈ 35/35/35).
    // Ручки — только с ?ui, значения в адресе (g… и len).
    const rnd = s => { const x = Math.sin(s * 9999) * 10000; return x - Math.floor(x); };   // сид-рандом рефа (utils.ts)
    const FOV = 60, tanV = Math.tan(FOV / 2 * Math.PI / 180), ASP = 2.0, BGC = 0x232323;
    const renderer = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    const scene = new T.Scene();
    scene.fog = new T.Fog(BGC, 60, 300);   // дымка — в цвет фона, каким он виден на экране (с зерном)
    const cam = new T.PerspectiveCamera(FOV, 16 / 9, 1, 800);
    const geo = new T.PlaneGeometry(1, 1), loader = new T.TextureLoader();
    let CAM0 = 0, CAM1 = -K.sp, planes = [];
    const fogApply = () => { const s = K.fg / 100; scene.fog.near = K.vw * (.45 - .3 * s); scene.fog.far = K.vw * (1.5 - .5 * s); };
    // раскладка: точки равномерно по объёму (плотность как у рефа × ручка), только те, что попадут в кадр на пути камеры
    function layout() {
      planes.forEach(m => { scene.remove(m); m.material.dispose(); }); SLOTS.forEach(s => { if (s.m) s.m = null; s.v.pause(); });
      // 20.10: одна плитка на работу (было ~1000 точек по объёму с повторами; ручка «плотность» dn больше не действует). Порядок появления — порядок S3D:
      //   k-я работа на глубине от z = −150 (видна с начала полёта) до CAM1 − 110 (последняя подлетает к концу) равным шагом; место в кадре — из 40 случайных
      //   то, что дальше всего от трёх предыдущих (координаты в долях кадра на дальности 160) — соседи не ложатся друг на друга.
      CAM1 = -K.sp;
      const pts = SET22 ? lay22() : lay56();
      planes = pts.map((p, i) => {
        const w = TILES[p.wi], ar = w.w / w.h, t = TEX[w.id];
        const mat = new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, side: T.DoubleSide, map: t && t.ready ? t.tex : null });
        const m = new T.Mesh(geo, mat);
        m.scale.set(p.h * ar, p.h, 1); m.position.set(p.x, p.y, p.z);
        m.visible = false; m.userData = { w, i, op: 0, hold: false, slot: -1, on: false };
        scene.add(m); return m;
      });
      fogApply(); if (st) { target(); st.z = st.tz; st.need = true; }
    }
    // 56: порядок — 22 работы ленты равномерно по всему полёту (первая — первой), 34 остальные в промежутках; глубина — от zA (видна сразу после выхода из дымки)
    //   до CAM1 − zb (в конце полёта кадр не пустеет) равным шагом. Работа ленты — в полный размер, остальные × ges. Место в кадре — из 90 случайных то,
    //   что меньше всего ложится на соседей, которые бывают в кадре вместе с ней: нахлёст их прямоугольников на экране считается при четырёх положениях камеры
    //   (работа на дальности 50 · 90 · 140 · 190; работы крупнее «самых крупных» и дальше дымки не в счёт), плюс штраф qa, если ближняя (яркая) ложится под фразу;
    //   при равенстве — дальше от трёх предыдущих.
    function lay56() {
      const N = TILES.length, NM = DATA.length, NE = N - NM, zA = -K.za, zB = CAM1 - K.zb, A = 16 / 9, X = 160 * tanV * A * K.xs, Y = 160 * tanV * K.ys;
      const seq = [], ms = new Set(); for (let i = 0; i < NM; i++) ms.add(Math.round(i * (N - 1) / Math.max(1, NM - 1)));
      let mi = 0, ei = 0; for (let s = 0; s < N; s++) seq.push(ms.has(s) && mi < NM ? mi++ : NM + Math.min(NE - 1, ei++));
      // работы не из ленты с роликом — туда, где рядом (±6 мест) меньше всего роликов ленты: иначе на отрезке вампир–Резнор–Tattoo Week–леопард в кадре 1 ролик
      const vx = seq.filter(i => i >= NM && TILES[i].video), ePos = seq.map((i, s) => i >= NM ? s : -1).filter(s => s >= 0);
      if (vx.length) { const rest = seq.filter(i => i >= NM && !TILES[i].video), cnt = s => seq.slice(Math.max(0, s - 6), s + 7).filter(i => i < NM && TILES[i].video).length;
        const pick = []; vx.forEach(() => { const c = ePos.filter(s => !pick.includes(s) && pick.every(t => Math.abs(t - s) > 6)).sort((a, b) => cnt(a) - cnt(b) || a - b)[0]; if (c !== undefined) pick.push(c); });
        let vi = 0, ri = 0; ePos.forEach(s => { seq[s] = pick.includes(s) && vi < vx.length ? vx[vi++] : (ri < rest.length ? rest[ri++] : vx[vi++]); }); }
      const scr = (p, cz) => { const d = cz - p.z; if (d < 1 || d > K.vw * .92) return null; const hw = d * tanV * A, hh = d * tanV, w = p.h * p.ar / 2 / hw;
        if (w > K.mx / 100 + .02) return null; return { x: p.x / hw, y: p.y / hh, w, h: p.h / 2 / hh }; };
      const ovl = (a, b) => { const ix = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x - a.w, b.x - b.w), iy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y - a.h, b.y - b.h);
        return ix > 0 && iy > 0 ? ix * iy / Math.min(a.w * a.h, b.w * b.h) : 0; };
      const PH = { x: 0, y: -.07, w: .45, h: .37 };   // фраза второго экрана в долях полукадра (1920×1080: 550–1370 × 380–780 px)
      const pts = []; let seed = 1;
      seq.forEach((wi, s) => { const w = TILES[wi], ar = w.w / w.h, z = N > 1 ? zA + (zB - zA) * s / (N - 1) : zA;
        const near = pts.filter(o => Math.abs(o.z - z) < K.vw);
        let best = null, bs = 1e9;
        for (let c = 0; c < 90; c++) { const r = n => rnd(seed * 7.13 + n); seed++;
          const q = { x: (r(0) * 2 - 1) * X, y: (r(1) * 2 - 1) * Y, h: (13 + r(4) * 9) * K.sz * (w.ex ? K.es : 1), z, ar, wi };
          let sc = 0;
          for (const d of [50, 90, 140, 190]) { const a = scr(q, z + d); if (!a) continue;
            if (d < 150) sc += K.qa * (d < 100 ? 1 : .5) * ovl(a, PH) * (a.w * a.h) / Math.min(a.w * a.h, PH.w * PH.h);   // ближняя (яркая) — не под фразой
            for (const o of near) { const b = scr(o, z + d); if (b) sc += ovl(a, b) + (ovl(a, b) > 0 ? .05 : 0); } }
          const dd = pts.slice(-3).reduce((m, o) => Math.min(m, ((q.x - o.x) / X) ** 2 + ((q.y - o.y) / Y) ** 2), 9);
          sc -= dd * .01;
          if (sc < bs) { bs = sc; best = q; } }
        pts.push(best); });
      return pts;
    }
    // 22 (?set=22) — раскладка до 20.10 11:00 как была
    function lay22() {
      const N = DATA.length, zA = -150, zB = CAM1 - 110, X = 160 * tanV * ASP * .55, Y = 160 * tanV * .55;
      const pts = []; let seed = 1;
      for (let k = 0; k < N; k++) {
        let best = null, bd = -1;
        for (let c = 0; c < 40; c++) { const r = n => rnd(seed * 7.13 + n); seed++;
          const q = { x: (r(0) * 2 - 1) * X, y: (r(1) * 2 - 1) * Y, h: (13 + r(4) * 9) * K.sz };
          const dd = pts.slice(-3).reduce((m, o) => Math.min(m, ((q.x - o.x) / X) ** 2 + ((q.y - o.y) / Y) ** 2), 9);
          if (dd > bd) { bd = dd; best = q; } }
        pts.push({ ...best, z: N > 1 ? zA + (zB - zA) * k / (N - 1) : zA, wi: k });
      }
      return pts;
    }
    // текстуры: одна на работу, у всех её повторов общая
    const TEX = {}, upQ = [], SLOTS = [];
    let st = null;
    layout();
    const order = []; planes.forEach(m => { if (!order.includes(m.userData.w)) order.push(m.userData.w); }); TILES.forEach(w => { if (!order.includes(w)) order.push(w); });
    let li = 0;
    const loadNext = () => { if (li >= order.length) return; const w = order[li++];
      loader.load(w.src, tex => { tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4; TEX[w.id] = { tex, ready: false }; upQ.push(w.id); if (upQ.length === 1) idleUp(); loadNext(); }, undefined, loadNext); };
    loadNext(); loadNext(); loadNext();
    const readyIds = new Set();
    function upOne() { if (!upQ.length) return; const id = upQ.shift(), t = TEX[id]; renderer.initTexture(t.tex); t.ready = true; readyIds.add(id);
      planes.forEach(m => { if (m.userData.w.id === id && m.userData.slot < 0) { m.material.map = t.tex; m.material.needsUpdate = true; } }); st.need = true; }
    const idleUp = () => { if (!upQ.length) return; if (!st.vis) upOne(); (window.requestIdleCallback || setTimeout)(idleUp, { timeout: 500 }); };
    // видео прямо в сцене: до K.vd плееров (20.10 05:34 Антон «больше видосов одновременно»; 05:53 — все в кадре; было 4 по 2 на ролик), по одному на ролик —
    //   повторов работы на экране нет; играют видимые ближние, вне кадра — пауза, остальные стоят постером (= первый кадр ролика)
    const PER = 1;
    function slotFor(w) {
      let s = SLOTS.find(x => x.w === w && !x.m);
      if (!s && SLOTS.filter(x => x.w === w).length < PER && SLOTS.length < K.vd) {
        const v = document.createElement("video"); Object.assign(v, { src: w.video, muted: true, loop: true, playsInline: true, preload: "auto", crossOrigin: "anonymous" });
        v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
        const tex = new T.VideoTexture(v); tex.colorSpace = T.SRGBColorSpace;
        s = { w, v, tex, m: null }; SLOTS.push(s);
        if (SLOTS.filter(x => x.w === w).length > 1) v.addEventListener("loadedmetadata", () => { v.currentTime = v.duration * .45; }, { once: true });
      }
      return s;
    }
    let vidTick = 0;
    function videos(force) {
      if (!force && (vidTick++ % 8)) return;
      // 20.10 05:53 Антон «почему не показывается в действии?»: играют ВСЕ видео-плитки в кадре — без порога дальности (был < 175 при видимости до K.vw = 220)
      //   и с самого проявления (op > .1, было .35), только принятой плитке (u.on — не тающему повтору); лимит K.vd = 99 — то есть все (работ с видео в ленте 15); пауза — вне кадра и вне секции
      const cand = K.vd ? planes.filter(m => m.userData.w.video && m.visible && m.userData.on && m.userData.op > .1 && !m.userData.hold && inView(m))
        .sort((a, b) => (st.z - a.position.z) - (st.z - b.position.z)) : [];
      const keep = new Set(); const per = {};
      for (const m of cand) { const id = m.userData.w.id; if ((per[id] || 0) >= PER || keep.size >= Math.min(K.vd, K.vc)) continue; per[id] = (per[id] || 0) + 1; keep.add(m); }
      SLOTS.forEach(s => { if (s.m && !keep.has(s.m)) { const t = TEX[s.m.userData.w.id]; s.m.material.map = t ? t.tex : null; s.m.userData.slot = -1; s.m = null; s.v.pause(); } else if (!s.m && !s.v.paused) s.v.pause(); });
      keep.forEach(m => { if (m.userData.slot >= 0) return; const s = slotFor(m.userData.w); if (!s) return;
        s.m = m; m.userData.slot = SLOTS.indexOf(s); s.v.play().catch(() => {});
        const swap = () => { if (s.m === m) { m.material.map = s.tex; m.material.needsUpdate = true; } };
        s.v.readyState >= 2 ? swap() : s.v.addEventListener("loadeddata", swap, { once: true }); });
    }
    const inView = m => { const d = st.z - m.position.z, hw = d * tanV * cam.aspect, hh = d * tanV, sx = m.scale.x / 2, sy = m.scale.y / 2;
      return d > 1 && Math.abs(m.position.x - cam.position.x) < hw + sx && Math.abs(m.position.y - cam.position.y) < hh + sy; };

    // состояние полёта
    st = { tz: 0, z: 0, mx: 0, my: 0, dx: 0, dy: 0, bx: 0, by: 0, vx: 0, vy: 0, vis: false, raf: 0, last: 0, need: true, hoverXY: null };
    // v6: до полёта работы выплывают из глубины — камера на 70 ед. дальше и подъезжает, прозрачность ×E (0→1)
    function target() { const f = phase(); st.E = f.E; st.tz = CAM0 + 70 * (1 - f.E) + (CAM1 - CAM0) * f.p; }
    target(); st.z = st.tz;
    function size() { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); st.need = true; }
    size(); addEventListener("resize", size);
    addEventListener("scroll", () => { target(); st.need = true; }, { passive: true });
    if (!calm) addEventListener("pointermove", e => { st.mx = e.clientX / innerWidth * 2 - 1; st.my = -(e.clientY / innerHeight) * 2 + 1; st.hoverXY = [e.clientX, e.clientY]; st.cx = e.clientX; st.cy = e.clientY; st.need = true; }, { passive: true });
    new IntersectionObserver(es => { st.vis = es[0].isIntersecting && es[0].intersectionRatio > 0; if (st.vis && !st.raf) { st.last = performance.now(); st.raf = requestAnimationFrame(frame); }
      if (!st.vis) SLOTS.forEach(s => s.v.pause()); }, { rootMargin: "0px 0px -2px 0px" }).observe(sec);

    const S = window.__s3d; S.frames = 0; S.renders = 0; S.gpu = (() => { const gl = renderer.getContext(), x = gl.getExtension("WEBGL_debug_renderer_info"); return x ? gl.getParameter(x.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); })();
    const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    let shown = false;
    const cand = [], acc = [];
    function frame(now) {
      st.raf = 0; if (!st.vis) return;
      st.raf = requestAnimationFrame(frame);
      const dt = Math.min(.05, (now - st.last) / 1000); st.last = now; S.frames++;
      upOne();
      const kz = calm ? 1 : 1 - Math.exp(-dt * 7), kd = 1 - Math.exp(-dt * 4);
      st.z += (st.tz - st.z) * kz;
      st.dx += (st.mx * 6 - st.dx) * kd; st.dy += (st.my * 4 - st.dy) * kd;
      if (DRAG) { st.bx += st.vx; st.by += st.vy; st.vx *= .9; st.vy *= .9; }
      const moving = Math.abs(st.tz - st.z) > .005 || Math.abs(st.mx * 6 - st.dx) > .005 || Math.abs(st.my * 4 - st.dy) > .005 || Math.abs(st.vx) + Math.abs(st.vy) > .001;
      cam.position.set(st.bx + st.dx, st.by + st.dy, st.z); cam.updateMatrixWorld();
      // 1) прозрачность от глубины: тают вдали (дымка), ближние гаснут, не дорастая до «самых крупных»
      const s = K.fg / 100, F0 = K.vw * (.75 - .35 * s), cap = K.mx / 100;
      cand.length = 0;
      for (const m of planes) {
        const u = m.userData, d = st.z - m.position.z; let t = 0;
        if (readyIds.has(u.w.id) && !u.hold && d > 1 && d < K.vw) {
          const far = d <= F0 ? 1 : Math.pow(1 - (d - F0) / (K.vw - F0), 1.5);
          const wf = m.scale.x / (2 * d * tanV * cam.aspect);
          t = Math.min(far, 1 - ss(cap - .03, cap + .05, wf));
        }
        u.t = t; u.d = d;
        if (t > .25 && inView(m)) cand.push(m); else u.on = false;
      }
      // 1б) 20.10 05:34 Антон «не хочется дублей»: одна работа — одна плитка на экране. Остаётся та, что уже видна (без мигания), иначе ближняя
      const rep = new Map();
      for (const m of cand) { const u = m.userData, r = rep.get(u.w.id); if (!r || (u.on && !r.userData.on) || (u.on === r.userData.on && u.d < r.userData.d)) rep.set(u.w.id, m); }
      for (let i = cand.length; i--;) { const m = cand[i]; if (rep.get(m.userData.w.id) !== m) { m.userData.on = false; m.userData.t = 0; cand.splice(i, 1); } }
      // 2) нахлёст: ближние важнее; работа, что легла бы на уже показанную больше чем на «нахлёст» %, тает (с запасом, чтобы не мигала)
      if (K.ov < 50) {
        cand.sort((a, b) => a.userData.d - b.userData.d); acc.length = 0;
        const lim = K.ov / 100;
        for (const m of cand) { const u = m.userData, R = rectOf(m, true), aR = R.width * R.height; let worst = 0;
          for (const B of acc) { const ix = Math.min(R.left + R.width, B.left + B.width) - Math.max(R.left, B.left); if (ix <= 0) continue;
            const iy = Math.min(R.top + R.height, B.top + B.height) - Math.max(R.top, B.top); if (iy <= 0) continue;
            worst = Math.max(worst, ix * iy / Math.min(aR, B.width * B.height)); if (worst > lim + .08) break; }
          const ok = worst <= (u.on ? lim + .06 : lim);
          u.on = ok; if (ok) acc.push(R); else u.t = 0; }
      } else cand.forEach(m => m.userData.on = true);
      let fading = false;
      for (const m of planes) { const u = m.userData, t = (u.t || 0) * (st.E ?? 1);
        const op = Math.abs(t - u.op) < .004 ? t : u.op + (t - u.op) * .18;   // проявление — lerp .18, как в рефе
        if (op !== t) fading = true; u.op = op; m.material.opacity = op; m.visible = op > .01; }
      lightHoles();
      videos(st.need);
      const playing = SLOTS.some(x => x.m && !x.v.paused);
      if (!shown && readyIds.size) { shown = true; cv.classList.add("on"); S.shown = performance.now(); }
      if (st.hoverXY && !ovOpen) { const h = pick(...st.hoverXY); stage.classList.toggle("hot", !!h && (!WOM || !!woId(h))); st.hoverXY = null; }   // 19.10: плитка без работы — без лупы
      if (moving || fading || st.need || ovOpen || playing) { renderer.render(scene, cam); S.renders++; st.need = false; }
    }
    S.relayout = () => { layout(); };
    S.refog = () => { fogApply(); st.need = true; };
    S.retarget = () => { target(); st.need = true; };
    // ── свет обоев под мышью (09:56 Антон: «и вот тут тоже не происходит свечения»): холст прозрачен там, где работ нет, — свет виден на пустом поле;
    // непрозрачные работы закрывают его сами. Полупрозрачные (тают вдали, проявляются, гаснут из-за нахлёста) свет бы пропускали — «окно»;
    // их прямоугольники у курсора вырезаются из маски света (mask-composite: subtract). Дымка на работах — подмес цвета фона 35/35/35 (урок v3), не прозрачность.
    const wallLit = document.querySelector(".wall-lit"), wallShade = document.querySelector(".wall-shade"); let holeKey = "";
    function lightHoles() {
      if (!wallLit) return;
      const holes = [];
      if (st.vis && st.cx !== undefined) { const R = 150 * 1.15;
        for (const m of planes) { if (!m.visible) continue; const op = m.material.opacity; if (op >= .98 || op <= .02) continue;
          const b = rectOf(m); if (b.left > st.cx + R || b.left + b.width < st.cx - R || b.top > st.cy + R || b.top + b.height < st.cy - R) continue;
          holes.push(b); } }
      S.holes = holes;
      const key = holes.map(b => [b.left, b.top, b.width, b.height].map(v => v | 0).join(",")).join(";");
      if (key === holeKey) return; holeKey = key;
      if (!holes.length) { [wallLit, wallShade].forEach(e => { if (e) { e.style.maskImage = e.style.webkitMaskImage = ""; e.style.maskComposite = ""; e.style.maskPosition = e.style.maskSize = e.style.maskRepeat = ""; } }); return; }
      const base = getComputedStyle(wallLit).getPropertyValue("--lit-mask") || "radial-gradient(circle 150px at var(--mx) var(--my), #000 0, transparent 100%)";
      const imgs = [base, ...holes.map(() => "linear-gradient(#000, #000)")].join(", ");
      const pos = ["0 0", ...holes.map(b => `${b.left.toFixed(0)}px ${b.top.toFixed(0)}px`)].join(", ");
      const size = ["100% 100%", ...holes.map(b => `${Math.ceil(b.width)}px ${Math.ceil(b.height)}px`)].join(", ");
      const comp = ["subtract", ...holes.map(() => "add")].join(", ");
      wallLit.style.maskImage = wallLit.style.webkitMaskImage = imgs; wallLit.style.maskPosition = pos; wallLit.style.maskSize = size; wallLit.style.maskRepeat = "no-repeat"; wallLit.style.maskComposite = comp;
    }
    // попадание мышью: луч из камеры по видимым работам
    const ray = new T.Raycaster(), v2 = new T.Vector2();
    function pick(x, y) {
      const r = cv.getBoundingClientRect(); v2.set((x - r.left) / r.width * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(v2, cam);
      const hit = ray.intersectObjects(planes.filter(m => m.visible && m.material.opacity > .15), false);
      return hit.length ? hit[0].object : null;
    }
    // прямоугольник работы на экране — от её четырёх углов
    const pv = new T.Vector3();
    function rectOf(m, local) {
      cam.updateMatrixWorld(); m.updateMatrixWorld();
      const r = local ? { left: 0, top: 0, width: cv.clientWidth, height: cv.clientHeight } : cv.getBoundingClientRect(); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const [a, b] of [[-.5, -.5], [.5, -.5], [.5, .5], [-.5, .5]]) { pv.set(a, b, 0).applyMatrix4(m.matrixWorld).project(cam);
        const x = r.left + (pv.x + 1) / 2 * r.width, y = r.top + (1 - pv.y) / 2 * r.height; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      return { left: x0, top: y0, width: x1 - x0, height: y1 - y0 };
    }

    // ── перетаскивание из рефа — только ?drag=1 ──
    const DRAG = Q.get("drag") === "1";
    let down = null, moved = false;
    if (DRAG) stage.classList.add("grab");
    stage.addEventListener("pointerdown", e => { if (e.button) return; down = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY }; moved = false; if (DRAG) stage.classList.add("grabbing"); });
    addEventListener("pointermove", e => { if (!down) return; if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) moved = true;
      if (DRAG) { st.vx -= (e.clientX - down.lx) * .004; st.vy += (e.clientY - down.ly) * .004; down.lx = e.clientX; down.ly = e.clientY; } });
    addEventListener("pointerup", () => { down = null; stage.classList.remove("grabbing"); });
    // клик ловит вся сцена: работа под курсором — открыть; кнопка лежит над работами и выигрывает
    // 19.10: на главной (есть works-data.js и каркас WO) — открытая работа сайта WO.open(id) по id работы плитки (S3D[].wo); у плитки без работы (18+, w/12) клик пустой.
    //   Без WO (стенд gal-3d-1810.html) — прежний вылет к центру (open ниже)
    const WOM = !!(window.WO && window.WORKS);
    const woId = m => { const id = m && m.userData.w.wo; return id && window.WORKS.some(x => x.id === id) ? id : null; };
    stage.addEventListener("click", e => { if (moved) return; if (e.target.closest && e.target.closest(".b")) return;
      const m = pick(e.clientX, e.clientY); if (!m) return;
      if (WOM) { const id = woId(m); if (id) { e.preventDefault(); WO.open(id); } return; }
      e.preventDefault(); open(m); });

    // ── открытая работа: вылет к центру, раскрытие в своей пропорции; Esc / щелчок мимо / прокрутка — на место ──
    const EZ = "cubic-bezier(.77,0,.175,1)", DUR = 1250;
    let ovOpen = false;
    const PLATE = a => `<div class="plate" aria-label="Награда">${LVL.replace('class="lv2"', 'class="lv"')}<div class="awt"><span class="awc">${a.c}</span><b class="awp">${a.p}</b><span class="awe">${a.e}</span></div>${LVR.replace('class="lv2"', 'class="lv"')}</div>`;
    function open(m) {
      if (ovOpen) return; ovOpen = true;
      const w = m.userData.w, r0 = rectOf(m), vw = innerWidth, vh = innerHeight, nat = w.video ? w.vw / w.vh : w.w / w.h;
      const rem = parseFloat(getComputedStyle(root).fontSize);
      const maxW = w.award ? Math.min(vw * .6, vw - 2 * (21.25 * rem + 3.5 * rem + 2.5 * rem)) : vw * .6;   // призовой — место под шильдик сбоку
      let H = w.video ? vh - 48 : vh * .78, Wd = H * nat; if (Wd > maxW) { Wd = maxW; H = Wd / nat; }
      const r1 = { left: (vw - Wd) / 2, top: w.video ? (vh - H) / 2 : (vh - H) / 2 - vh * .02, width: Wd, height: H };
      const ov = document.createElement("div"); ov.className = "ov";
      ov.innerHTML = `<div class="box">${w.video ? `<video src="${w.video}" poster="${w.src}" muted loop playsinline autoplay></video>` : `<img src="${w.src}" alt="${w.alt}">`}</div>${w.award ? PLATE(w.award) : `<div class="ln">${w.y ? `<span class="yr">${w.y}</span>` : `<span class="st">${sty(w)}</span>`}</div>`}`;
      document.body.append(ov);
      const box = ov.querySelector(".box"), ln = ov.querySelector(".ln"), pl = ov.querySelector(".plate");
      const R = r => ({ left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
      Object.assign(box.style, R(r1));
      if (ln) Object.assign(ln.style, w.video ? { left: (r1.left + r1.width + 24) + "px", top: (r1.top + r1.height - 20) + "px" } : { left: r1.left + "px", top: (r1.top + r1.height + 14) + "px" });
      if (pl) { const pw = pl.offsetWidth, ph = pl.offsetHeight, gap = 3.5 * rem;
        const lx = r1.left + r1.width + gap + pw <= vw - 40 ? r1.left + r1.width + gap : Math.max(40, r1.left - gap - pw);
        Object.assign(pl.style, { left: lx + "px", top: (r1.top + r1.height - ph) + "px" }); }
      m.userData.hold = true; m.userData.op = 0; m.material.opacity = 0; m.visible = false; st.need = true;
      requestAnimationFrame(() => ov.classList.add("in"));
      box.animate([R(r0), R(r1)], { duration: DUR, easing: EZ }).onfinish = () => ov.classList.add("done");
      const y0 = scrollY;
      const close = () => {
        if (ov.dataset.closing) return; ov.dataset.closing = 1; ov.classList.remove("done", "in");
        removeEventListener("keydown", esc); removeEventListener("scroll", onSc);
        const rb = rectOf(m), v = ov.querySelector("video"); if (v) v.pause();
        box.animate([R(r1), R(rb)], { duration: DUR * .8, easing: EZ, fill: "forwards" }).onfinish = () => {
          m.userData.hold = false; m.userData.op = 1; m.material.opacity = 1; m.visible = true; st.need = true; ov.remove(); ovOpen = false; };
      };
      const esc = ev => { if (ev.key === "Escape") close(); };
      const onSc = () => { if (Math.abs(scrollY - y0) > 60) close(); };   // прокрутка не заперта: листнул — работа улетает на место
      ov.addEventListener("click", close); addEventListener("keydown", esc); addEventListener("scroll", onSc, { passive: true });
      S.open = w.id;
    }
    const best = id => planes.filter(p => p.userData.w.id === id && p.visible && inView(p)).sort((a, b) => b.userData.op - a.userData.op || b.position.z - a.position.z)[0];
    S.planes = TILES.length; S.uniq = () => new Set(planes.map(m => m.userData.w.id)).size;   // 20.10: разных работ среди плиток (= planes — ни одна не повторяется)
    Object.defineProperty(S, "instances", { get: () => planes.length }); S.openById = id => { const m = best(id); if (m) open(m); };
    S.rectById = id => { const m = best(id); return m ? Object.assign(rectOf(m), { op: m.material.opacity }) : null; };
    S.ready = () => readyIds.size;
    S.inFrame = (k = .25) => planes.filter(m => m.visible && m.userData.op > k && inView(m)).length;
    S.sizes = () => planes.filter(m => m.visible && m.userData.op > .25 && inView(m)).map(m => Math.round(rectOf(m, true).width / cv.clientWidth * 100));
    S.playing = () => SLOTS.filter(s => s.m && !s.v.paused).length;
    S.vids = (k = .25) => { const vs = planes.filter(m => m.userData.w.video && m.visible && m.userData.op > k && inView(m)); return { n: new Set(vs.map(m => m.userData.w.id)).size, still: vs.filter(m => m.userData.slot < 0).map(m => m.userData.w.id) }; };   // 20.10: видео-работ в кадре и какие из них стоят картинкой (должно быть пусто)
    S.ids = (k = .25) => planes.filter(m => m.visible && m.userData.op > k && inView(m)).map(m => m.userData.w.id);   // 20.10: какие работы сейчас в кадре
    S.dups = (k = .25) => { const ids = planes.filter(m => m.visible && m.userData.op > k && inView(m)).map(m => m.userData.w.id); return ids.length - new Set(ids).size; };   // 20.10: повторы работы на экране (должно быть 0)
    // замер нахлёста: пары видимых работ (непрозрачность > 25 %), у которых общая площадь > 10 % меньшей из двух
    S.overlaps = (k = .25, lim = .1) => { const R = planes.filter(m => m.visible && m.userData.op > k && inView(m)).map(m => rectOf(m, true)); let n = 0;
      for (let a = 0; a < R.length; a++) for (let b = a + 1; b < R.length; b++) { const A = R[a], B = R[b];
        const ix = Math.min(A.left + A.width, B.left + B.width) - Math.max(A.left, B.left), iy = Math.min(A.top + A.height, B.top + B.height) - Math.max(A.top, B.top);
        if (ix > 0 && iy > 0 && ix * iy > lim * Math.min(A.width * A.height, B.width * B.height)) n++; } return n; };
    // 20.10: почему плитки нет в кадре — по каждой: впереди в пределах дымки · из них в кадре · погашена «самыми крупными» · погашена нахлёстом · показана
    S.why = () => { const o = { ahead: 0, view: 0, big: 0, ovl: 0, shown: 0 };
      for (const m of planes) { const u = m.userData, d = st.z - m.position.z; if (d <= 1 || d >= K.vw) continue; o.ahead++; if (!inView(m)) continue; o.view++;
        if (u.on) o.shown++; else if (m.scale.x / (2 * d * tanV * cam.aspect) > K.mx / 100 - .03) o.big++; else o.ovl++; } return o; };
    S.pickAt = (x, y) => { const m = pick(x, y); return m ? m.userData.w.id : null; };
    // для проверки света: самая плотная работа под точкой (любая видимая) и её непрозрачность
    S.pickOp = (x, y) => { const r = cv.getBoundingClientRect(); v2.set((x - r.left) / r.width * 2 - 1, -((y - r.top) / r.height) * 2 + 1); ray.setFromCamera(v2, cam);
      const hit = ray.intersectObjects(planes.filter(m => m.visible && m.material.opacity > .02), false); return hit.length ? Math.max(...hit.map(h => h.object.material.opacity)) : 0; };
    S.initMs = Math.round(performance.now() - S.loaded);
    if (st.vis && !st.raf) st.raf = requestAnimationFrame(frame);
  }
  // ── панель ручек (?ui) — по образцу ручек обоев на главной (?wpui): значения пишутся в адрес, ссылку можно прислать
  if (Q.has("ui")) {
    const R = {
      ov: ["нахлёст соседей", 0, 50, 1, v => v + " %"],
      dn: ["плотность", .3, 4, .05, v => "× " + v],
      sz: ["размер работ", .5, 2, .05, v => "× " + v],
      mx: ["самые крупные", 8, 45, 1, v => v + " % ширины"],
      fg: ["дымка · сила", 0, 100, 1, v => v + " %"],
      vw: ["дымка · дальность", 120, 450, 5, v => v],
      sp: ["скорость полёта", 120, 1200, 10, v => v],
      len: ["длина отрезка", 1.5, 8, .1, v => v + " экр."],
      spot: ["пятно под фразой", 0, 100, 1, v => v ? v + " %" : "нет"],
      vd: ["видео одновременно", 0, 16, 1, v => v > 15 ? "все" : v],
      ps: ["размер фразы", 80, 130, 1, v => v + " px"],
      _h1: ["появление первого экрана"],
      id: ["длительность всего", .6, 4, .05, v => v + " с"],
      ig: ["задержки между шагами", .3, 2.5, .05, v => "× " + v],
      wb: ["размытие слов", 0, 40, 1, v => v + " px"],
      ws: ["шаг между словами / буквами", 0, 3, .05, v => "× " + v],
      fd: ["строки · длительность", .2, 1.2, .02, v => v + " с"],
      fs: ["строки · шаг", 0, .3, .01, v => Math.round(v * 1000) + " мс"],
      fr: ["строки · подъём", 0, 30, 1, v => v + " px"],
      fb: ["строки · размытие", 0, 8, .5, v => v ? v + " px" : "нет"],
      _h2: ["переход ко второму экрану"],
      dis: ["растворение первого экрана", .2, 1.5, .05, v => v + " экр."],
      cl: ["шторка · закрытие", .15, 1.5, .05, v => v + " экр."],
      co: ["шторка · раскрытие", .15, 1.5, .05, v => v + " экр."],
      ce: ["край шторки", 0, 2, 1, v => ["нет", "темнее фона", "золотая линия"][v]],
      ll: ["линия · путь до хедера", .2, 1.5, .05, v => v + " экр."],
      tf: ["прокрутка на фразу", .2, 1.5, .05, v => v + " экр."],
      tw: ["выход работ из дымки", .1, 1.2, .05, v => v + " экр."],
    };
    const val = k => k === "len" ? LENv : K[k];
    const box = document.createElement("div");
    box.style.cssText = "position:fixed;right:24px;bottom:24px;z-index:70;width:400px;max-height:80vh;overflow:auto;padding:10px 12px;background:rgba(24,24,24,.95);border:1px solid rgba(203,184,143,.5);color:#e6e5e1;font:12px/1.3 Jost,sans-serif";
    const row = k => { if (k[0] === "_") return `<div style="color:#cbb88f;letter-spacing:.08em;text-transform:uppercase;margin:12px 0 6px;padding-top:8px;border-top:1px solid rgba(203,184,143,.25)">${R[k][0]}</div>`;
      const extra = k !== "ws" ? "" : `<div style="display:grid;grid-template-columns:128px 1fr;gap:8px;align-items:center;margin:6px 0">порядок<span><label style="margin-right:14px;cursor:pointer"><input type="radio" name="io" data-io="0" ${K.io ? "" : "checked"} style="accent-color:#cbb88f"> портрет первым</label><label style="cursor:pointer"><input type="radio" name="io" data-io="1" ${K.io ? "checked" : ""} style="accent-color:#cbb88f"> имя первым</label></span></div>`
        + `<div style="display:grid;grid-template-columns:128px 1fr;gap:8px;align-items:center;margin:6px 0">крупный текст<select data-sel="txt" style="background:#1d1d1d;color:#e6e5e1;border:1px solid rgba(203,184,143,.5);font:12px Jost;padding:3px">${[["blur", "размытие · Scroll Blur №4"], ["wave", "волна · OnScroll №2"], ["stretch", "разворот · OnScroll №6"], ["rise", "подъём · index2 №10"], ["widen", "разжим · index2 №13"], ["e14", "из угла · index2 №14"]].map(([v, l]) => `<option value="${v}" ${v === TXT ? "selected" : ""}>${l}</option>`).join("")}</select></div>`
        + `<div style="display:grid;grid-template-columns:128px 1fr;gap:8px;align-items:center;margin:6px 0">переход 1 → 2<select data-sel="tr" style="background:#1d1d1d;color:#e6e5e1;border:1px solid rgba(203,184,143,.5);font:12px Jost;padding:3px">${[["line", "линия · срез экрана"], ["curtain", "шторка · Isle Thorne"], ["dissolve", "растворение"]].map(([v, l]) => `<option value="${v}" ${v === TR ? "selected" : ""}>${l}</option>`).join("")}</select></div>`
        + `<div style="display:grid;grid-template-columns:128px 1fr;gap:8px;align-items:center;margin:6px 0">мелкий текст<select data-sel="txts" style="background:#1d1d1d;color:#e6e5e1;border:1px solid rgba(203,184,143,.5);font:12px Jost;padding:3px">${[["lines", "строки · Wonderkin"], ["fade", "проявление · index2 №1"], ["blur-soft", "размытие тише · №4"]].map(([v, l]) => `<option value="${v}" ${v === TXTS ? "selected" : ""}>${l}</option>`).join("")}</select></div>`
        + `<button data-a="replay" style="width:100%;margin:2px 0 4px;background:none;border:1px solid rgba(203,184,143,.5);color:#cbb88f;font:11px Jost;padding:6px;text-transform:uppercase;cursor:pointer">повторить появление</button>`;
      return rowS(k) + extra; };
    const rowS = k => { const [lab, mn, mx, st, f] = R[k]; return `<label style="display:grid;grid-template-columns:128px 1fr 92px;gap:8px;align-items:center;margin-bottom:5px">${lab}<input data-k="${k}" type="range" min="${mn}" max="${mx}" step="${st}" value="${val(k)}" style="accent-color:#cbb88f;width:100%"><b data-v="${k}" style="font-weight:400;color:#cbb88f;text-align:right">${f(val(k))}</b></label>`; };
    box.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="color:#cbb88f;letter-spacing:.08em;text-transform:uppercase">второй экран · ручки</span><span data-a="min" style="cursor:pointer;color:#a7a294">свернуть ▾</span></div><div data-body>`
      + Object.keys(R).map(row).join("")
      + `<div style="color:#a7a294;margin:6px 0">работ в кадре сейчас: <b data-n style="font-weight:400;color:#cbb88f">—</b> · видео играет: <b data-vn style="font-weight:400;color:#cbb88f">—</b></div>`
      + `<button data-a="reset" style="width:100%;margin-top:4px;background:none;border:1px solid rgba(203,184,143,.5);color:#cbb88f;font:11px Jost;padding:6px;text-transform:uppercase;cursor:pointer">сброс</button></div>`;
    document.body.append(box);
    const url = () => { const u = new URL(location); for (const k in K) u.searchParams.set("g" + k, K[k]); u.searchParams.set("len", LENv); history.replaceState(null, "", u); };
    let relT = 0;
    const apply = k => { const S = window.__s3d;
      if (["id", "ig", "fd", "fs"].includes(k)) return;
      if (k === "fr" || k === "fb") { phraseReveal(); return; }
      if (k === "wb" || k === "ws") { qBlur = 0; qU = null; phraseReveal(); return; }
      if (["dis", "cl", "co", "ce", "ll"].includes(k)) { root.style.setProperty("--dis", pinLen()); root.style.setProperty("--intro", introLen()); dissolve(); phraseReveal(); if (S && S.retarget) S.retarget(); return; }
      if (k === "tf" || k === "tw") { root.style.setProperty("--intro", introLen()); phraseReveal(); if (S && S.retarget) S.retarget(); return; }
      if (k === "spot") root.style.setProperty("--spot", K.spot / 100);
      if (k === "ps") { root.style.setProperty("--qpx", K.ps); if (window.__s3d && window.__s3d.retarget) window.__s3d.retarget(); return; }
      if (k === "len") { root.style.setProperty("--len", LENv); }
      if (!S || !S.relayout) return;
      if (["dn", "sz", "sp", "vw"].includes(k)) { clearTimeout(relT); relT = setTimeout(() => { S.relayout(); if (k === "vw") S.refog(); }, 120); }
      else if (k === "fg") S.refog(); else S.retarget(); };
    box.addEventListener("input", e => { const k = e.target.dataset.k; if (!k) return; const v = +e.target.value; if (k === "len") LENv = v; else K[k] = v;
      box.querySelector(`[data-v="${k}"]`).textContent = R[k][4](v); apply(k); url(); });
    box.addEventListener("change", e => { const sel = e.target.dataset.sel; if (!sel) return; const u = new URL(location); u.searchParams.set(sel, e.target.value); location.href = u.href; });   // смена эффекта — перезагрузка с новым адресом (буквы режутся заново)
    box.addEventListener("change", e => { if (e.target.dataset.io === undefined) return; K.io = +e.target.dataset.io; url(); runIntro(); });
    box.addEventListener("click", e => { const a = e.target.dataset.a;
      if (a === "replay") { scrollTo(0, 0); root.classList.add("intro"); requestAnimationFrame(() => runIntro()); }
      if (a === "min") { const b = box.querySelector("[data-body]"), hid = b.style.display === "none"; b.style.display = hid ? "" : "none"; e.target.textContent = hid ? "свернуть ▾" : "ручки ▴"; }
      if (a === "reset") { Object.assign(K, KD); LENv = LEN0; box.querySelectorAll("input[data-k]").forEach(i => { i.value = val(i.dataset.k); box.querySelector(`[data-v="${i.dataset.k}"]`).textContent = R[i.dataset.k][4](val(i.dataset.k)); });
        root.style.setProperty("--spot", K.spot / 100); root.style.setProperty("--qpx", K.ps); root.style.setProperty("--len", LENv); root.style.setProperty("--intro", introLen()); root.style.setProperty("--dis", pinLen()); dissolve(); qBlur = 0; box.querySelector(`[data-io="${K.io}"]`).checked = true; phraseReveal(); const S = window.__s3d; if (S && S.relayout) { S.relayout(); S.refog(); } url(); } });
    setInterval(() => { const S = window.__s3d; if (S && S.inFrame) { box.querySelector("[data-n]").textContent = S.inFrame(); box.querySelector("[data-vn]").textContent = S.playing(); } }, 500);
  }

})();
