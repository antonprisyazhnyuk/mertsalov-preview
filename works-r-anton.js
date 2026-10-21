// «Работы» · вариант Антона · 19.10 (13:31 «я пофиксил работы») — десктоп один в один по его кадру Figma 81:213271.
// Основа — копия works-r-ro-os.js; отличия только на десктопе:
//   категории — столбиком слева, «РАБОТЫ» прибито к низу окна (works-r-anton.css);
//   работы по кадру: первый ряд 1 · 2 · 3, дальше по кругу 2 · 3 · 1 (так стоят 01–13 в кадре), промежуток 24, без подписей под работой;
//   колонки не сдвигаются при прокрутке (в кадре стоят неподвижно), поле — по самой длинной колонке;
//   «Один» (W[0]) в кадре нет — работы 12 там нет, 13 сразу за 11 → убрана из списка.
// Телефон — по кадру Антона 84:217722 (works-r-anton.css): без «Работы» сверху и подписей, лента категорий над нижней полосой.
// Появление шторкой и сжатие от скорости — как в ro-os.
// 19.10 вечер (финальная секция Figma 137:20237, спека design/photo-final-spec-1910.md): заголовка «РАБОТЫ» нет (кадр 111:1330 — остался только для поиска,
//   невидимым); категории по центру высоты окна; карточка = работа с кадрами: наведение листает кадры курсором по N полосам ширины, увёл — обложка;
//   телефон — свайп вбок по карточке; индикатора кадров нет (20:00 Антон: «бесят палки внизу и точки»); видео играют сами, пока на экране;
//   клик/тап — открытая работа (общая, shell.js · WO).
(() => {
const { ALL, cap, img, esc } = window.R, WO = window.WO;
const pg = document.getElementById("pg");
const DESK = matchMedia("(min-width: 768px)"), CALM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);

// ── категории: ключ в данных → пункт. Стиль — w.c, остальное — метки w.tg (works-data.js): fresh · bw · color · cover · healed · paint · dark.
//    20.10 Антон: + «Свежие» и «Перекрытия»; «Зажившие» и «Живопись» наполнены; dark art — кандидаты, решает Коля (05:11 «можно просто поставить»).
//    Пункт без единой работы не показывается (05:09: пустую — спрятать, не серым). «Орнамент» (1 работа) в список Антона не входит — только во «Все».
const has = (w, k) => w.c.includes(k) || (w.tg || []).includes(k);
// 20.10 06:16 кадр Антона (Figma 174:54095): группы — «ВСЕ  СВЕЖИЕ» одной строкой (06:23 слэш снят, зазор 20) · ч/б, цветные · реализм, портреты, ар-деко, dark art ·
//   перекрытия, зажившие · живопись. Шаг по верху букв: внутри группы 30, между группами 70. Пустой пункт (нет работ) прячется, пустая группа — тоже.
const CAT_GROUPS = [[["", "Все"], ["fresh", "Свежие"]], [["bw", "Чёрно-белые"], ["color", "Цветные"]],
  [["real", "Реализм"], ["port", "Портреты"], ["deco", "Ар-деко"], ["dark", "Dark art"]], [["cover", "Перекрытия"], ["healed", "Зажившие"]], [["paint", "Живопись"]]]
  .map(g => g.filter(([k]) => !k || ALL.some(w => has(w, k)))).filter(g => g.length);
const catBtn = ([k, l]) => `<button class="ro-cat${k ? "" : " on"}" type="button" data-k="${k}" aria-pressed="${!k}">${l}</button>`;
let flt = "";

// категории — в полосе на всю высоту страницы: на десктопе список липнет к окну (13:44 «фильтр тоже должен быть прилипший») и уходит с концом страницы
pg.innerHTML = `<h1 class="ro-t vh">Работы</h1>
<div class="an-rail"><nav class="ro-cats caps" aria-label="Категории">${CAT_GROUPS.map((g, i) =>
  `<div class="ro-grp${i ? "" : " row"}">${g.map(catBtn).join("")}</div>`).join("")}</nav></div>
<div class="ro-f" id="rof"></div>`;
const field = document.getElementById("rof"), cats = pg.querySelector(".ro-cats");
{ const put = () => cats.style.setProperty("--cats-h", cats.offsetHeight + "px"); put(); if ("ResizeObserver" in window) new ResizeObserver(put).observe(cats); document.fonts && document.fonts.ready.then(put); }   // 20.10: центр списка категорий по его высоте
cats.addEventListener("click", e => { const b = e.target.closest("button.ro-cat"); if (!b || b.dataset.k === flt) return; flt = b.dataset.k;
  cats.querySelectorAll("button.ro-cat").forEach(x => { const on = x.dataset.k === flt; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on); });
  build(); });

// 20.10 Lighthouse: родное «ленивое» кружево Хрома на телефоне тянуло ~30 кадров (до 1250 px за экраном) рядом с главным; теперь кадр грузится, когда до него осталось 500 px.
//   Пока не загружен — на месте серая подложка .r-ph с готовой пропорцией, как и у родной ленивой загрузки.
const PH = "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";
const wake = i => { i.srcset = i.dataset.ss; i.src = i.dataset.s; delete i.dataset.ss; delete i.dataset.s; };
const lio = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { wake(e.target); lio.unobserve(e.target); } }), { rootMargin: "500px 0px" }) : null;
const lazyWatch = () => { if (lio) lio.disconnect(); field.querySelectorAll("img[data-ss]").forEach(i => lio ? lio.observe(i) : wake(i)); };
const item = i => { const w = ALL[i], n = w.f.length;   // 19.10 20:00 Антон: сегменты и точки убраны — листание без индикатора
  const ph = img(w, "(max-width: 767px) 44vw, 21vw").replace(/ src="([^"]+)" srcset="([^"]+)"/, ` src="${PH}" data-s="$1" data-ss="$2"`).replace(/<\/span>$/, w.video ? `<video class="fr-cv" muted loop playsinline preload="none" poster="${w.src}" data-src="${w.video}" aria-hidden="true"></video></span>` : "</span>");
  return `<a class="ro-it" href="#work-${w.id}" data-i="${i}" data-n="${n}">${ph}${WO.awardTag(w)}</a>`; };

let cols = [], shift = [], maxY = 1, list = [];
function build() {
  // 20.10 13:40 Антон: «во „Все“ просочилась живопись — живопись живёт только в „Живописи“» → без фильтра и во всех тату-фильтрах живописи нет
  list = ALL.map((w, i) => i).filter(i => flt === "paint" ? has(ALL[i], "paint") : !has(ALL[i], "paint") && (!flt || has(ALL[i], flt)));
  const n = DESK.matches ? 3 : 2;
  field.style.height = "";
  field.innerHTML = `<div class="ro-c"></div>`.repeat(n);
  cols = [...field.children];
  let out;
  // высота модуля (кадр + подпись + шильдик) в ширину каждой колонки — замером, кадр знает высоту по aspect-ratio до загрузки
  const g = parseFloat(getComputedStyle(cols[0]).rowGap) || 0;
  const probe = (i, c) => { c.insertAdjacentHTML("beforeend", item(i)); const el = c.lastElementChild, h = el.getBoundingClientRect().height + g; el.remove(); return h; };
  const hs = list.map(i => cols.map(c => probe(i, c)));
  if (n === 3) {   // кадр Антона: 01–03 → 1 · 2 · 3, дальше по кругу 2 · 3 · 1
    out = [[], [], []]; list.forEach((i, q) => out[q < 3 ? q : [1, 2, 0][(q - 3) % 3]].push(i));
  } else {   // телефон: 2 колонки без сдвига (как у рефа); работа — в колонку, что короче, иначе внизу дыра в полэкрана
    out = [[], []]; const len = [0, 0]; list.forEach((i, q) => { const j = len[1] < len[0] - 1 ? 1 : 0; out[j].push(i); len[j] += hs[q][j]; });
  }
  cols.forEach((c, k) => c.innerHTML = out[k].map(item).join(""));
  lazyWatch(); reveal(out); measure(); watch();
}

// ── появление по рядам (реф: шторка сверху вниз, 1.6 с, шаг .04 с, пауза .6 с) ──
function reveal(out) {
  if (CALM) return;
  field.classList.add("ro-pre"); let k = 0;
  const rows = Math.max(...out.map(c => c.length));
  for (let r = 0; r < rows; r++) cols.forEach(c => { const a = c.children[r]; if (a) a.style.transitionDelay = `${(.3 + k++ * .04).toFixed(2)}s`; });
  requestAnimationFrame(() => requestAnimationFrame(() => { field.classList.add("ro-go"); field.classList.remove("ro-pre"); }));
  setTimeout(() => { field.classList.remove("ro-go"); field.querySelectorAll(".ro-it").forEach(a => a.style.transitionDelay = ""); }, (.3 + k * .04 + 1.7) * 1000);
}

// ── высота поля — по самой длинной колонке; сдвига колонок по прокрутке нет (кадр Антона) ──
function measure() {
  cols.forEach(c => c.style.transform = ""); field.style.height = "";
  const h = cols.map(c => c.offsetHeight), pad = parseFloat(getComputedStyle(field).paddingTop);
  const tail = 7.5 * rem();   // 120 под работами (телефон: лента категорий 40 + полоса 64 + 16)
  shift = h.map(() => 0);
  field.style.height = `${(pad + Math.max(...h) + tail) / rem()}rem`;
  maxY = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  window.ROOS = { shift, maxY, h };
  move();
}
function move() { const p = Math.min(1, Math.max(0, scrollY / maxY)); cols.forEach((c, k) => { c.style.transform = shift[k] ? `translate3d(0,${(-shift[k] * p).toFixed(1)}px,0)` : ""; }); }

// ── сжатие от скорости (реф: 1 − min(|v| / 50000, .2), сглаживание .12) ──
let lastY = scrollY, lastT = performance.now(), ss = 1, raf = 0;
function tick(t) {
  raf = 0; const dt = Math.max(1, t - lastT) / 1000, v = (scrollY - lastY) / dt; lastY = scrollY; lastT = t;
  move();
  const target = CALM || !DESK.matches ? 1 : 1 - Math.min(Math.abs(v) / 5e4, .2); ss += (target - ss) * .12; if (Math.abs(1 - ss) < .0005 && target === 1) ss = 1;
  field.style.setProperty("--ss", ss.toFixed(4));
  if (ss !== 1 || v) raf = requestAnimationFrame(tick);
}
addEventListener("scroll", () => { if (!raf) { lastT = performance.now() - 16; raf = requestAnimationFrame(tick); } }, { passive: true });
let rt = 0, lw = innerWidth; addEventListener("resize", () => { if (innerWidth === lw) return; lw = innerWidth; clearTimeout(rt); rt = setTimeout(build, 120); });

// ── кадры на карточке · 19.10 (спека п. 2 и 5) ──
// кадр k поверх обложки: своя пропорция, вписан в карточку (не обрезается); видео-кадр — его постер
function setFrame(a, k) {
  const w = ALL[+a.dataset.i], ph = a.querySelector(".r-ph"), cv = ph.querySelector(".fr-cv");
  if (+a.dataset.k === k) return; a.dataset.k = k;
  ph.querySelectorAll(".fr-l").forEach(e => e.remove());
  if (k === 0) { if (cv && a.dataset.vis) play(cv); return; }
  if (cv) cv.pause();
  const f = w.f[k], el = document.createElement(f.video ? "video" : "img"); el.className = "fr-l";
  if (f.video) { el.muted = true; el.loop = true; el.playsInline = true; el.setAttribute("muted", ""); el.setAttribute("playsinline", ""); el.poster = f.src; el.src = f.video; }
  else { el.alt = ""; el.decoding = "async"; el.src = f.src; }
  ph.append(el); if (f.video) play(el);
}
// 19.10 20:00 Антон «почему видео не воспроизводится в Работах?»: видео-работа и видео-кадр играют сами — без звука, по кругу, пока карточка на экране; вне экрана — пауза
// 20.10 Lighthouse: видео первого экрана (до 0.9 МБ каждое) начинали качаться вместе с обложками и тормозили показ страницы; теперь стартуют через 0.7 с после загрузки страницы (обложка-картинка на месте всё это время)
const settled = new Promise(ok => { const go = () => setTimeout(ok, 700); document.readyState === "complete" ? go() : addEventListener("load", go, { once: true }); });
const play = v => settled.then(() => { const a = v.closest(".ro-it"); if (a && !a.dataset.vis) return; if (v.dataset.src && !v.getAttribute("src")) v.src = v.dataset.src; v.play().catch(() => {}); });
const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { const a = e.target;
  if (e.isIntersecting) { a.dataset.vis = 1; const v = a.querySelector(".fr-l") || a.querySelector(".fr-cv"); if (v && v.tagName === "VIDEO") play(v); }
  else { delete a.dataset.vis; a.querySelectorAll("video").forEach(v => v.pause()); } }), { rootMargin: "10% 0px" }) : null;
const watch = () => { if (!io) return; io.disconnect(); field.querySelectorAll(".ro-it").forEach(a => { if (ALL[+a.dataset.i].f.some(f => f.video)) io.observe(a); }); };
const preload = a => { if (a.dataset.pre) return; a.dataset.pre = 1; ALL[+a.dataset.i].f.slice(1).forEach(f => { const im = new Image(); im.decoding = "async"; im.src = f.src; }); };
// десктоп: курсор в полосе k из N по ширине карточки → кадр k
field.addEventListener("pointermove", e => { if (e.pointerType !== "mouse") return; const a = e.target.closest(".ro-it"); if (!a || +a.dataset.n < 2) return;
  preload(a); const r = a.getBoundingClientRect(), n = +a.dataset.n;
  setFrame(a, Math.min(n - 1, Math.max(0, Math.floor((e.clientX - r.left) / r.width * n)))); });
field.addEventListener("pointerout", e => { if (e.pointerType !== "mouse") return; const a = e.target.closest(".ro-it");   // палец уходит с карточки после свайпа — кадр не сбрасывать
  if (!a || a.contains(e.relatedTarget)) return; setFrame(a, 0); });
// телефон: свайп вбок по карточке — следующий / прежний кадр; вертикальный — прокрутка страницы, как обычно
{ let a = null, x0 = 0, y0 = 0, mode = 0;
  field.addEventListener("touchstart", e => { const c = e.target.closest(".ro-it"); if (!c || +c.dataset.n < 2) { a = null; return; }
    a = c; preload(a); x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; mode = 0; }, { passive: true });
  field.addEventListener("touchmove", e => { if (!a || mode) return; const dx = e.touches[0].clientX - x0, dy = e.touches[0].clientY - y0;
    if (Math.abs(dx) > 12 || Math.abs(dy) > 12) mode = Math.abs(dx) > Math.abs(dy) ? 1 : 2;
    if (mode === 1) { const n = +a.dataset.n, k = +(a.dataset.k || 0); setFrame(a, Math.max(0, Math.min(n - 1, k + (dx < 0 ? 1 : -1)))); a.dataset.swiped = Date.now(); } }, { passive: true });
  field.addEventListener("touchend", () => { a = null; }, { passive: true }); }
// клик / тап → открытая работа (общая для сайта, shell.js); после свайпа по карточке — не открывать
field.addEventListener("click", e => {
  const a = e.target.closest(".ro-it"); if (!a) return; e.preventDefault();
  if (Date.now() - (+a.dataset.swiped || 0) < 400) return;
  WO.open(ALL[+a.dataset.i].id, PHONE_K(a));
});
const PHONE_K = a => DESK.matches ? 0 : +(a.dataset.k || 0);   // телефон: открыть на том кадре, что листнули; десктоп — с обложки (кадр Антона 171:32455)

if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
build();
addEventListener("load", measure);
})();
