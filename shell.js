// Каркас сайта Мерцалова · 18.10 — разметка и поведение, дословно из index.html (разметка 426–498, скрипты 501–566, 847–862).
// Подключать первым в <body>: <body data-page="works"><script src="shell.js"></script> … Стили — shell.css.
// Вставляет в начало body то, чего на странице нет: слои обоев, header.hd, .drawer, .bar, .curtain (шторка переходов), template#btn.
// Активный раздел — по <body data-page="works|about|blog|shop|contacts">. Магазин пока скрыт (hidden).
// Ручки для снимков, как на главной: ?fx=0 без зерна · ?glow=x,y свет без мыши · ?state=scrolled · ?marksheen=0.6 · ?wp= · ?wpui · ?dark=1|2.
(() => {
const Q = new URLSearchParams(location.search), body = document.body, root = document.documentElement;
const PAGE = body.dataset.page || "";

// ── адреса прототипа ──
const NAV = [
  ["works", "works-r-1710.html", "Работы", "РАБОТЫ"],
  ["about", "#about", "Обо мне", "ОБО МНЕ"],
  ["blog", "#blog", "Блог", "БЛОГ"],
  ["shop", "shop.html", "Магазин", "МАГАЗИН"],   // 21.10 17:55 Антон: «сейчас надо будет его показать для Коли» — виден, ведёт на заглушку «скоро» (было: скрыт до запуска)
  ["contacts", "#footer", "Контакты", "КОНТАКТЫ"],
];
const HOME = "index.html", ZAPIS = "#zapis";
const links = upper => NAV.map(([k, href, ru, RU, hid]) =>
  `<a href="${href}" data-k="${k}"${hid ? " hidden" : ""}${k === PAGE ? ' class="on" aria-current="page"' : ""}>${upper ? RU : ru}</a>`).join("");
const LANGS = `<div class="langs caps"><a class="on" href="#ru">RU</a><a href="#en">EN</a><a href="#de">DE</a></div>`;

// ── разметка (как в index.html) ──
const PARTS = [
  [".wall", `<div class="wall"></div><div class="wall-lit"></div><div class="wall-shade"></div>`],
  ["header.hd", `<header class="hd" id="hd">
  <div class="plate"></div>
  <nav class="caps" aria-label="Разделы">${links(false)}</nav>
  <a class="mark" href="${HOME}" aria-label="На главную">MARK</a>
  ${LANGS}
  <div class="cta">BTN</div>
</header>`],
  [".drawer", `<div class="drawer" id="drawer" aria-hidden="true">
  <svg class="dia" viewBox="0 0 6.52 10" aria-hidden="true"><path d="M3.26 0 6.52 5 3.26 10 0 5Z" style="fill: var(--gold)"/></svg>
  <nav aria-label="Разделы"><a href="${HOME}" data-k="home"${PAGE ? "" : ' class="on" aria-current="page"'}>ГЛАВНАЯ</a>${links(true)}</nav>
  ${LANGS}
  <div class="sep"><svg viewBox="0 0 5.22 8" aria-hidden="true"><path d="M2.61 0 5.22 4 2.61 8 0 4Z" style="fill: var(--gold)"/></svg></div>
  <div class="soc caps"><a href="#tg">Telegram</a><a href="#vk">VK</a><a href="#ig">Instagram</a></div>
</div>`],
  [".bar", `<div class="bar">
  <button class="menu caps" id="menuBtn" type="button" aria-expanded="false">Меню</button>
  <a class="mark" href="${HOME}" aria-label="На главную">MARK</a>
  <a class="rec caps" href="${ZAPIS}">Запись</a>
</div>`],
  [".curtain", `<div class="curtain" id="curtain" aria-hidden="true"><i class="curtain-grain"></i>
  <!-- 18.10 09:51 Антон: «на шторке никакого текста не надо» — строку сняла -->
</div>`],
  ["template#btn", `<template id="btn">
  <button class="b" type="button">
    <svg viewBox="0 0 200 52" aria-hidden="true"><path class="o"/><path class="i"/></svg>
    <span class="caps">Записаться</span>
  </button>
</template>`],
];
body.insertAdjacentHTML("afterbegin", PARTS.filter(([sel]) => !document.querySelector(sel)).map(([, html]) => html).join("\n"));

// ── знак ──
const MARK = `<svg viewBox="0 0 923 846" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"> <path fill-rule="evenodd" clip-rule="evenodd" d="M465.667 550.723H466.42L547.721 49.7734L556.479 51.1943L475.754 548.595L615.021 99.6523L623.495 102.281L486.827 542.843L661.413 155.746L669.502 159.395L493.008 550.723H498.525L773.865 41.3047H922.462V52.7773H881.479L855.763 100.356V676.168C855.763 722.061 882.687 748.832 922.462 748.832V760.305H729.709V748.832H737.358C777.132 748.832 804.056 722.059 804.056 676.166V196.022L488.248 780.313L461.23 738.887L434.214 780.313L118.406 196.022V676.166C118.406 722.059 145.33 748.831 185.104 748.831L192.753 748.832V760.305H0V748.832C39.7749 748.832 66.699 722.061 66.6992 676.168V100.356L40.9824 52.7773H0V41.3047H148.597L423.937 550.723H429.454L252.96 159.395L261.049 155.746L435.632 542.837L298.967 102.281L307.44 99.6523L446.707 548.595L365.983 51.1943L374.741 49.7734L456.043 550.723H456.795V0H465.667V550.723ZM81.0791 683.816C81.0791 720.531 65.7812 737.358 50.4834 748.832H134.621C119.324 737.358 104.027 720.53 104.026 683.815V171.336H105.063L81.0791 126.962V683.816ZM817.398 171.336H818.436V683.815C818.435 720.53 803.138 737.357 787.841 748.831L871.979 748.832C856.681 737.358 841.383 720.531 841.383 683.816V126.962L817.398 171.336ZM461.231 695.291L808.51 52.7773H782.044L461.231 646.327L140.418 52.7773H113.952L461.231 695.291Z" fill="currentColor"/> <path fill-rule="evenodd" clip-rule="evenodd" d="M461.174 769.305L486.118 807.55L461.174 845.795L436.23 807.55L461.174 769.305ZM461.174 786.653L474.804 807.55L461.174 828.447L447.544 807.55L461.174 786.653Z" fill="currentColor"/> </svg> `;
const marks = document.querySelectorAll(".hd .mark, .bar .mark");
marks.forEach(m => m.innerHTML = MARK);
// блик по знаку: при наведении (14.10 12:25) и сам, иногда, без наведения (15:37) — светлая полоса слева направо за 1.5 с
const markSheens = [];
marks.forEach((m, k) => {
  const svg = m.querySelector("svg"), id = "markSheen" + k, shapes = [...svg.querySelectorAll("path")].map(p => p.getAttribute("d"));
  svg.insertAdjacentHTML("beforeend",
    `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="-260" y1="0" x2="0" y2="0">
       <stop offset="0" style="stop-color: var(--sheen)" stop-opacity="0"/><stop offset=".5" style="stop-color: var(--sheen)" stop-opacity=".9"/><stop offset="1" style="stop-color: var(--sheen)" stop-opacity="0"/>
       <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="1200 0" dur="1.5s" begin="indefinite" fill="freeze"/>
     </linearGradient></defs>` + shapes.map(d => `<path d="${d}" fill-rule="evenodd" fill="url(#${id})"/>`).join(""));
  const a = svg.querySelector("animateTransform");
  m.addEventListener("mouseenter", () => a.beginElement());
  markSheens.push({ svg, a });
});
// сам по себе: через 2 с после загрузки и дальше раз в 9–14 с; не в фоне и не при «уменьшить движение»
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const shine = () => { if (!document.hidden) markSheens.forEach(({ svg, a }) => { if (svg.getBoundingClientRect().width) a.beginElement(); }); };
  const loop = () => setTimeout(() => { shine(); loop(); }, 9000 + Math.random() * 5000);
  setTimeout(() => { shine(); loop(); }, 2000);
}
// для снимков: ?marksheen=0.6 — застыть на этой секунде блика
{ const ms = Q.get("marksheen");
  if (ms) setTimeout(() => { const { svg, a } = markSheens[0]; a.beginElement(); svg.pauseAnimations(); svg.setCurrentTime(svg.getCurrentTime() + +ms); }, 300); }

// ── кнопка: ступенька 9, внутренний контур отступ 7; вдох — отступ 4 ──
const step = (x, y, w, h, s) => `M${x+s} ${y}H${x+w-s}V${y+s}H${x+w}V${y+h-s}H${x+w-s}V${y+h}H${x+s}V${y+h-s}H${x}V${y+s}H${x+s}Z`;
const OUT = step(1, 1, 198, 50, 9), IN = step(7, 7, 186, 38, 9), IN_BIG = step(4, 4, 192, 44, 9);
document.head.insertAdjacentHTML("beforeend", `<style>.b:hover .i, .b:hover .gi, .b:active .i, .b:active .gi { d: path("${IN_BIG}"); }</style>`);
const b = document.getElementById("btn").content.firstElementChild.cloneNode(true);
b.querySelector(".o").setAttribute("d", OUT); b.querySelector(".i").setAttribute("d", IN);
b.querySelector("svg").insertAdjacentHTML("beforeend",
  `<defs><linearGradient id="sheen" gradientUnits="userSpaceOnUse" x1="-60" y1="0" x2="0" y2="0">
     <stop offset="0" style="stop-color: var(--sheen)" stop-opacity="0"/><stop offset=".5" style="stop-color: var(--sheen)" stop-opacity=".95"/><stop offset="1" style="stop-color: var(--sheen)" stop-opacity="0"/>
     <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="270 0" dur="1.5s" begin="indefinite" fill="freeze"/>
   </linearGradient></defs>
   <path class="g" d="${OUT}" stroke="url(#sheen)"/><path class="g gi" d="${IN}" stroke="url(#sheen)"/>`);
const anim = b.querySelector("animateTransform");
b.addEventListener("mouseenter", () => anim.beginElement());
// 20.10 14:36 Антон: «почему на „Отправить заявку“ нет ховера с переливом?» — ступенчатая кнопка любого размера тем же приёмом, что «Записаться»:
// SBTN.decorate(svg, w, h) — рамка, внутренний контур, «вдох» внутреннего контура на ховере и перелив по рамке (свой градиент на кнопку);
// SBTN.hover(кнопка) — перелив по наведению. Классы и переменные — .b из shell.css
let sbN = 0;
window.SBTN = {
  decorate(svg, w, h) {
    const id = "sheen-sb" + (++sbN), O = step(1, 1, w - 2, h - 2, 9), I = step(7, 7, w - 14, h - 14, 9), IB = step(4, 4, w - 8, h - 8, 9);
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.querySelector(".o").setAttribute("d", O); svg.querySelector(".i").setAttribute("d", I);
    svg.style.setProperty("--ib", `path("${IB}")`);
    svg.insertAdjacentHTML("beforeend", `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="-60" y1="0" x2="0" y2="0">
      <stop offset="0" style="stop-color: var(--sheen)" stop-opacity="0"/><stop offset=".5" style="stop-color: var(--sheen)" stop-opacity=".95"/><stop offset="1" style="stop-color: var(--sheen)" stop-opacity="0"/>
      <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="${w + 70} 0" dur="1.5s" begin="indefinite" fill="freeze"/></linearGradient></defs>
      <path class="g" d="${O}" stroke="url(#${id})"/><path class="g gi" d="${I}" stroke="url(#${id})"/>`);
  },
  hover(btn) { btn.classList.add("sb"); btn.addEventListener("mouseenter", () => btn.querySelectorAll("animateTransform").forEach(a => { if (a.closest("svg").getClientRects().length) a.beginElement(); })); },
};
document.head.insertAdjacentHTML("beforeend", "<style>.b.sb:hover .i, .b.sb:hover .gi, .b.sb:active .i, .b.sb:active .gi { d: var(--ib); }</style>");
// 20.10 13:33 Антон: «Записаться» — попап анкеты поверх страницы (решение 18.10, site-logic-1810.md), а не прыжок к анкете; модуль zpop-2010.js — по первому нажатию
const SHELL_BASE = (document.currentScript && document.currentScript.src || "").replace(/[^/]*$/, "");
let zpopLoad = null;
const openZapis = async opener => {
  if (!window.ZPOP) zpopLoad = zpopLoad || new Promise(res => { const s = document.createElement("script"); s.src = SHELL_BASE + "zpop-2010.js?v=2110"; s.onload = s.onerror = res; document.head.appendChild(s); });
  await zpopLoad; if (window.ZPOP) ZPOP.open(opener); else location.href = ZAPIS;   // модуль не загрузился — по-старому, к анкете
};
b.addEventListener("click", () => openZapis(b));   // «Записаться» → попап анкеты
document.querySelector(".hd .cta").replaceChildren(b);
const rec = document.querySelector(".bar a.rec");   // «Запись» в полосе телефона — тот же попап
if (rec) rec.addEventListener("click", e => { e.preventDefault(); openZapis(rec); });

// ── свет руки: мышь и палец двигают пятно на обоях ──
const lit = e => { const p = e.touches ? e.touches[0] : e; root.style.setProperty("--mx", p.clientX + "px"); root.style.setProperty("--my", p.clientY + "px"); };
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  addEventListener("pointermove", lit, { passive: true }); addEventListener("touchstart", lit, { passive: true }); addEventListener("touchmove", lit, { passive: true });
}
// ── прокрутка: хедер и полоса темнеют и уменьшаются (порог 40 px); обои — лёгкий параллакс 0.05 ──
const hd = document.getElementById("hd");
const wallEls = document.querySelectorAll(".wall, .wall-lit");
// 20.10 Антон: «меню на всех работах отличается от меню на главной» — на внутренних страницах телефона полоса сразу тёмная и ужатая (под ней работы, полупрозрачная их размывала)
// 21.10 18:03 Антон: на главной телефона полоса «всегда 52, как сейчас, только убери дёрганье» — она была ужатой по ошибке
// (innerPhone() без data-page давал undefined, toggle с undefined переключал класс на каждом событии у верха) → на телефоне полоса ужата на всех страницах
const phone = () => matchMedia("(max-width: 767px)").matches;
const onScroll = () => { const on = scrollY > 40; hd.classList.toggle("scrolled", on); body.classList.toggle("scrolled", on || phone());
  const py = -scrollY * .05 + "px"; wallEls.forEach(e => e.style.backgroundPositionY = py); };
root.classList.add("bar-now"); addEventListener("scroll", onScroll, { passive: true }); onScroll();
// 20.10: при открытии страницы полоса сразу в своём виде — без ужатия 64 → 52 на глазах (и после восстановления прокрутки браузером)
addEventListener("load", () => setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("bar-now"))), 300), { once: true });
// для снимков: ?glow=x,y — пятно света без мыши
const gq = Q.get("glow");
if (gq) { const [gx, gy] = gq.split(","); root.style.setProperty("--mx", gx + "px"); root.style.setProperty("--my", gy + "px"); }
// для снимков: ?state=scrolled — затемнение без прокрутки
if (Q.get("state") === "scrolled") { removeEventListener("scroll", onScroll); hd.classList.add("scrolled"); body.classList.add("scrolled"); }

// ── язык — цветом; разделы — по data-page ──
function single(sel) {
  document.querySelectorAll(sel).forEach(a => a.addEventListener("click", () => {
    document.querySelectorAll(sel).forEach(o => o.classList.toggle("on", o === a));
  }));
}
single(".hd .langs a"); single(".drawer .langs a");
// «Контакты» → футер этой страницы; пока футера нет — к низу страницы
document.querySelectorAll('.hd nav a[data-k="contacts"], .drawer nav a[data-k="contacts"]').forEach(a => a.addEventListener("click", e => {
  if (document.getElementById("footer")) return;
  e.preventDefault(); scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
}));
// 21.10 16:21 Антон: в меню телефона нужен пункт «Главная» (18.10 07:04 «наверное надо») — первым; на самой главной — наверх без перезагрузки
// 22.10 Антон: «клики по лого почему не перенаправляют на главную» — на самой главной знак тоже наверх (было: та же страница — ничего)
document.querySelectorAll('.drawer nav a[data-k="home"], .hd .mark, .bar .mark').forEach(a => a.addEventListener("click", e => {
  if (PAGE) return;
  e.preventDefault(); root.classList.add("jump"); scrollTo({ top: 0, behavior: "instant" });   // jump — страховка шагов экранов в index.html не принимает прыжок за инерцию (возвращала на «Мой путь», 1640)
  setTimeout(() => root.classList.remove("jump"), 400);
}));

// ── телефон: МЕНЮ ↔ ЗАКРЫТЬ ──
const drawer = document.getElementById("drawer"), menuBtn = document.getElementById("menuBtn");
function setMenu(open) {
  drawer.classList.toggle("open", open); drawer.setAttribute("aria-hidden", !open);
  menuBtn.setAttribute("aria-expanded", open); menuBtn.textContent = open ? "Закрыть" : "Меню";
  body.classList.toggle("menu-open", open);
}
menuBtn.addEventListener("click", () => setMenu(!drawer.classList.contains("open")));
drawer.querySelectorAll("nav a").forEach(a => a.addEventListener("click", () => setMenu(false)));

// ── шторка между страницами · 18.10 — правило рефа Codrops Isle Thorne Collective (transitions/loading-curtain.ts):
//    клик → шторка растёт от нижнего края (clip-path) 600 мс power1.inOut, страница уезжает вверх на 100 px →
//    держим, пока грузится новая (+ шрифты и картинки первого экрана, не дольше 1.5 с) → шторка уходит к верхнему краю
//    800 мс power4.out, новая страница въезжает снизу на 100 px. «Назад» — всё зеркально. Обои и зерно фона стоят.
//    Новая страница раскрывается через View Transitions между документами (@view-transition в shell.css); где их нет —
//    та же шторка руками. «Уменьшить движение» — без шторки, мгновенно. Якоря (#…), картинки, другие сайты — без шторки.
//    Ручка для показа: ?slowmo=4 — всё вчетверо медленнее (держится до закрытия вкладки).
const curtain = document.getElementById("curtain");
const RM = matchMedia("(prefers-reduced-motion: reduce)");
{ const s = Q.get("slowmo"); try { if (s) sessionStorage.setItem("curtain-slowmo", s); } catch (e) {} }
const SLOW = (() => { try { return Math.max(1, +sessionStorage.getItem("curtain-slowmo") || 1); } catch (e) { return 1; } })();
const LEAVE = 600 * SLOW, ENTER = 800 * SLOW, MEDIA = 1500, DRIFT = 100;
const sampled = f => `linear(${Array.from({ length: 49 }, (_, i) => +f(i / 48).toFixed(4)).join(", ")})`;
const LIN = CSS.supports("transition-timing-function", "linear(0, 1)");
const P1 = LIN ? sampled(t => t < .5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)) : "cubic-bezier(.455,.03,.515,.955)";   // gsap power1.inOut
const P4 = LIN ? sampled(t => 1 - Math.pow(1 - t, 5)) : "cubic-bezier(.23,1,.32,1)";                                  // gsap power4.out
const FULL = "inset(0% 0% 0% 0%)", FROM_BELOW = "inset(100% 0% 0% 0%)", FROM_ABOVE = "inset(0% 0% 100% 0%)";
// 20.10 Антон: «везде моб меню должно быть всегда — непререкаемая истина» → полоса телефона со шторкой не уезжает и шторкой не закрывается (стоит над ней, shell.css)
const blocks = () => [...document.querySelectorAll("body > main, .hd" + (matchMedia("(max-width: 767px)").matches ? "" : ", .bar"))];   // что уезжает с шторкой: страница и хедер; обои, зерно и полоса телефона стоят
// зерно шторки — как на главной (fx.js): плитка шума 0.5 px, сдвиг плитки ~15 раз в секунду, пока шторка на экране
let grainT = 0;
function grainOn() {
  const g = curtain.querySelector(".curtain-grain");
  if (!g.style.backgroundImage) { const n = 256, c = document.createElement("canvas"); c.width = c.height = n;
    const x = c.getContext("2d"), im = x.createImageData(n, n), d = im.data;
    for (let i = 0; i < d.length; i += 4) { d[i] = d[i + 1] = d[i + 2] = Math.random() * 255 | 0; d[i + 3] = 255; }
    x.putImageData(im, 0, 0); g.style.backgroundImage = `url(${c.toDataURL()})`; }
  clearInterval(grainT); grainT = setInterval(() => g.style.backgroundPosition = `${Math.random() * 128 | 0}px ${Math.random() * 128 | 0}px`, 66);
}
function cover(on) { curtain.classList.toggle("on", on); if (on) grainOn(); else { clearInterval(grainT); curtain.style.clipPath = ""; } }
const sleep = ms => new Promise(r => setTimeout(r, ms));
// как в рефе (media.ts): ждать шрифты и картинки первого экрана (до 1.25 высоты окна), но не дольше 1.5 с
const mediaReady = () => Promise.race([sleep(MEDIA), (async () => {
  if (document.readyState === "loading") await new Promise(r => addEventListener("DOMContentLoaded", r, { once: true }));
  const imgs = [...document.images].filter(i => { const b = i.getBoundingClientRect();
    return b.width && b.height && b.right > 0 && b.left < innerWidth && b.bottom > 0 && b.top < innerHeight * 1.25; });
  await Promise.all([document.fonts.ready, ...imgs.map(i => i.decode().catch(() => {}))]);
})()]);
const noHash = u => { const x = new URL(u, location.href); x.hash = ""; return x.href; };
const back = () => { try { const a = navigation.activation; return a.navigationType === "traverse" && a.from && a.entry.index < a.from.index; } catch (e) { return false; } };

// уход: клик по ссылке на другую страницу прототипа
let leaving = false;
addEventListener("click", e => {   // на window, после обработчиков страницы: их preventDefault (лайтбокс работ) уважаем
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest && e.target.closest("a[href]");
  if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
  const to = new URL(a.href, location.href);
  if (to.origin !== location.origin || !/(\.html?|\/)$/.test(to.pathname)) return;   // другие сайты, картинки, файлы — как было
  if (noHash(to) === noHash(location.href)) { if (!to.hash) e.preventDefault(); return; }   // якорь этой страницы; та же страница — ничего (как в рефе)
  if (RM.matches) return;   // «уменьшить движение»: обычный переход, мгновенно
  e.preventDefault();
  if (leaving) return; leaving = true;
  const pf = document.createElement("link"); pf.rel = "prefetch"; pf.href = to.href; document.head.append(pf);   // новая грузится, пока шторка едет
  cover(true);
  const opt = { duration: LEAVE, easing: P1, fill: "forwards" };
  const run = [curtain.animate({ clipPath: [FROM_BELOW, FULL] }, opt), ...blocks().map(b => b.animate({ transform: ["translateY(0)", `translateY(${-DRIFT}px)`] }, opt))];
  run[0].finished.then(() => {
    try { sessionStorage.setItem("curtain", JSON.stringify({ to: noHash(to), t: Date.now() })); } catch (e) {}
    location.href = to.href;   // старая страница стоит закрытой шторкой, пока новая не нарисуется
  });
  window.__curtainLeave = run;
});
// уход на страницу без каркаса: переход слоями туда не нужен — снять его здесь (с 19.10 главная на каркасе — таких страниц нет),
// иначе браузер сам его отменяет и пишет ошибку в консоль новой страницы
const NO_SHELL = [];
addEventListener("pageswap", e => { const vt = e.viewTransition; if (!vt) return; vt.ready.catch(() => {});
  try { const to = new URL(e.activation.entry.url); if (NO_SHELL.some(f => to.pathname.endsWith("/" + f))) vt.skipTransition(); } catch (err) {} });
// вернулись «назад» на страницу из кэша браузера — она ещё под шторкой: убрать
addEventListener("pageshow", e => { if (!e.persisted) return; leaving = false;
  curtain.getAnimations().concat(...blocks().map(b => b.getAnimations())).forEach(a => a.cancel()); cover(false); });

// приход: новая страница рисуется под шторкой и раскрывается
const arrived = (() => { try { const f = JSON.parse(sessionStorage.getItem("curtain") || "null"); sessionStorage.removeItem("curtain");
  return !!f && f.to === noHash(location.href) && Date.now() - f.t < 10000; } catch (e) { return false; } })();
if (arrived && !RM.matches) { cover(true); curtain.style.clipPath = FULL; }

// раскрытие руками (нет View Transitions между документами)
async function revealByHand() {
  await mediaReady();
  const opt = { duration: ENTER, easing: P4 };
  const run = [curtain.animate({ clipPath: [FULL, FROM_ABOVE] }, { ...opt, fill: "forwards" }), ...blocks().map(b => b.animate({ transform: [`translateY(${DRIFT}px)`, "translateY(0)"] }, opt))];
  window.__curtainEnter = run;
  await run[0].finished; cover(false); run[0].cancel();
}
if (arrived && !RM.matches && !("onpagereveal" in window)) revealByHand();   // браузер без события pagereveal (Firefox) — сразу руками
const vtPseudo = (name, kf, opt) => root.animate(kf, { ...opt, pseudoElement: `::view-transition-${name}` });
addEventListener("pagereveal", async e => {
  const vt = e.viewTransition;
  if (!vt) { if (arrived && !RM.matches) revealByHand(); return; }
  if (RM.matches) { vt.skipTransition(); return; }
  // в снимок новой страницы шторка попадает закрытой; страница и хедер — отдельными слоями, чтобы ехать без обоев
  cover(true); curtain.style.clipPath = FULL; root.classList.add("vt-on");
  vt.finished.finally(() => { root.classList.remove("vt-on"); cover(false); });
  try { await vt.ready; } catch (err) { cover(false); return; }
  const named = blocks().filter(b => b.getClientRects().length).map(b => getComputedStyle(b).viewTransitionName).filter(n => n && n !== "none");
  let run;
  if (arrived) {
    // старую страницу шторка закрыла ещё там: здесь только раскрытие; ждём шрифты и картинки, как реф
    const opt = { duration: ENTER, easing: P4, fill: "both" };
    run = [vtPseudo("new(curtain)", { clipPath: [FULL, FROM_ABOVE] }, opt),
      ...named.map(n => vtPseudo(`new(${n})`, { transform: [`translateY(${DRIFT}px)`, "translateY(0)"] }, opt))];
    run.forEach(a => a.pause());
    window.__curtainEnter = run;
    await mediaReady();
    if (!window.__curtainFreeze) run.forEach(a => a.play());   // __curtainFreeze — для покадровых снимков
  } else {
    // «назад» / «вперёд» в истории: шторки на старой странице не было — весь путь здесь: закрыть, сразу раскрыть
    const s = back() ? -1 : 1, T = LEAVE + ENTER, k = LEAVE / T;
    run = [
      vtPseudo("new(curtain)", [{ clipPath: s > 0 ? FROM_BELOW : FROM_ABOVE, easing: P1 }, { clipPath: FULL, offset: k, easing: P4 }, { clipPath: s > 0 ? FROM_ABOVE : FROM_BELOW }], { duration: T }),
      vtPseudo("old(root)", [{ opacity: 1, transform: "translateY(0)" }, { opacity: 1, transform: `translateY(${-s * DRIFT}px)` }], { duration: LEAVE, easing: P1 }),
      vtPseudo("new(root)", { opacity: [0, 0] }, { duration: LEAVE }),
      ...named.flatMap(n => [vtPseudo(`new(${n})`, { opacity: [0, 0] }, { duration: LEAVE }),
        vtPseudo(`new(${n})`, { transform: [`translateY(${s * DRIFT}px)`, "translateY(0)"] }, { duration: ENTER, delay: LEAVE, easing: P4, fill: "backwards" })]),
    ];
    window.__curtainEnter = run;
  }
  run[0].finished.then(() => cover(false));   // шторка ушла — снять её и под слоями перехода, без мигания в последнем кадре
});

// ── ручки, как на главной ──
{ const wp = Q.get("wp"); if (wp) root.style.setProperty("--wp", wp);
  if (Q.has("wpui")) addEventListener("DOMContentLoaded", () => { const w = document.createElement("script"); w.src = "wallui.js"; body.append(w); }); }   /* ручки обоев — только с ?wpui */
{ const d = Q.get("dark"), r = root.style;   /* ?dark=1 полоса, шторка, хедер в цвет фона; ?dark=2 ещё и плашки кнопок */
  if (d === "1" || d === "2") { r.setProperty("--deep", "#1a1a1a"); r.setProperty("--deep-rgb", "26,26,26"); r.setProperty("--deep2", "#1a1a1a"); }
  if (d === "2") { r.setProperty("--plate", "#1a1a1a"); r.setProperty("--plate-in", "#1a1a1a"); r.setProperty("--plate-on", "#1a1a1a"); } }
// зерно — fx.js, как на главной: по умолчанию ?fx=A (зерно); ?fx=0 — без эффектов; ?fx=W — волны
addEventListener("DOMContentLoaded", () => { const f = (Q.get("fx") || "A").toUpperCase();
  if (f !== "0") { const s = document.createElement("script"); s.src = f === "W" ? "fx-waves.js" : "fx.js?v=2010"; body.append(s); } });

// ── открытая работа · 19.10 — ОДНА на весь сайт: window.WO.open(id[, кадр]) · WO.close(). Данные — window.WORKS (works-data.js, страница подключает до своего кода).
//    Адрес работы — #work-<id> (статика выдержит: без сервера, ссылкой делится, «назад» браузера и телефона закрывает). Стили — shell.css «открытая работа».
//    Десктоп: ← → — соседний кадр, Esc и «← НАЗАД» закрывают, клик по миниатюре — кадр. Телефон: свайп вбок — кадр. Видео-кадр играет на месте фото, без звука.
const LVP = `<path d="M21.665 25.333L14.6655 44.9997L23.6648 64.333L28.9977 45.333L21.665 25.333Z"/><path d="M59.662 32.666L38.997 42.3327L32.3308 61.666L51.6626 50.666L59.662 32.666Z"/><path d="M4.66626 56L5.33287 78L22.6648 94.6667L21.6649 73L4.66626 56Z"/><path d="M52.3291 56.666L32.664 70.9993L29.9976 92.666L47.3295 77.3327L52.3291 56.666Z"/><path d="M46.663 86.666L33.6641 105.333L38.997 124.333L48.9962 106.333L46.663 86.666Z"/><path d="M0 87.666L7.33275 109.333L28.9977 120.666L21.665 99.9993L0 87.666Z"/><path d="M52.6626 111.333L46.6631 133.666L60.9953 149L61.3286 128L52.6626 111.333Z"/><path d="M7.66602 123L21.6649 142.333L46.3296 146.333L31.9974 128.333L7.66602 123Z"/><path d="M68.3278 160L49.6626 151L27.3311 155.333L47.3295 167.333L68.3278 160Z"/><path d="M53.6625 3L35.9973 17.3333L32.6942 41.64L36.2572 42.7633L51.3294 24.6667L53.6625 3Z"/><path d="M38.4171 37.4837C25.6557 66.8177 25.6018 96.2272 35.1247 118.752C44.6313 141.238 63.6764 156.906 89.4063 159.028L89.1 162.745C61.8441 160.497 41.6787 143.83 31.6901 120.204C21.7181 96.6176 21.8843 66.1387 34.9975 35.9961L38.4171 37.4837Z"/>`;
const sprig = r => `<svg class="lv2${r ? " r" : ""}" viewBox="0 3 90 164.33" aria-hidden="true"><g fill="currentColor">${LVP}</g></svg>`;
const escH = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const PLAY = `<svg viewBox="0 0 14 16" aria-hidden="true"><path d="M0 0L14 8L0 16Z" fill="#fff"/></svg>`;
const PHONE = matchMedia("(max-width: 767px)");
// короткая метка награды на карточке: «N МЕСТО» между веточками (Figma 171:34914); на телефоне — только веточки (⚠ ждёт слова Антона, текст 6.4 px не читается)
const awardTag = w => w.award ? `<span class="aw-tag" title="${escH(w.award.p + " · " + w.award.c + " · " + w.award.e)}">${sprig(0)}<span>${escH(w.award.p)}</span>${sprig(1)}</span>` : "";
const wo = document.createElement("div"); wo.className = "wo"; wo.setAttribute("role", "dialog"); wo.setAttribute("aria-modal", "true");
let cur = null, k = 0, pushed = false;
const W = id => (window.WORKS || []).find(w => w.id === id);
function frameHTML(f) {
  return `<div class="wo-f" style="--r:${f.r.toFixed(4)}">${f.video
    ? `<video src="${f.video}" poster="${f.big}" muted loop playsinline preload="none"></video>`
    : `<img src="${f.big}" alt="" decoding="async">`}</div>`;
}
function render(w) {
  const n = w.f.length, a = w.award;
  wo.setAttribute("aria-label", "Работа · " + w.t.replace(/\n/g, " "));
  wo.innerHTML = `<div class="wo-st"><div class="wo-tr">${w.f.map(frameHTML).join("")}</div></div>
<div class="wo-sh wo-sh-t"></div><div class="wo-sh wo-sh-b"></div>
${n > 1 ? `<div class="wo-bars" aria-hidden="true">${"<i></i>".repeat(n)}</div>` : ""}
<button class="wo-back" type="button">← Назад</button>
${w.y ? `<p class="wo-y">${escH(w.y)}</p>` : ""}
<h2 class="wo-t">${escH(w.t)}</h2>
${a ? `<div class="wo-aw" aria-label="Награда"><div class="p">${sprig(0)}<span>${escH(a.p)}</span>${sprig(1)}</div><div class="ls"><span class="l">${escH(a.c)}</span><span class="l">${escH(a.e)}</span></div></div>` : ""}
${w.d ? `<p class="wo-d">${escH(w.d)}</p>` : ""}
${n > 1 ? `<div class="wo-th" aria-label="Кадры" style="--wo-n:${n};--wo-rm:${Math.max(...w.f.map(f => f.r)).toFixed(4)}">${w.f.map((f, i) => `<button type="button" aria-label="Кадр ${i + 1}"><img src="${f.th}" alt="" loading="lazy">${f.video ? PLAY : ""}</button>`).join("")}</div>` : ""}`;
  wo.querySelector(".wo-back").onclick = () => close();
  wo.querySelectorAll(".wo-th button").forEach((b, i) => b.onclick = () => go(i));
  fit();
}
// одно длинное слово, что не влезает в 420, — кегль меньше до влезания (спека п. 3)
function fit() { const t = wo.querySelector(".wo-t"); if (!t) return; t.style.removeProperty("--wo-ts");
  for (let s = 2.75; s > 1.5 && t.scrollWidth > t.clientWidth + 1; s -= .125) t.style.setProperty("--wo-ts", s + "rem"); }
function go(i) {
  if (!cur) return; const n = cur.f.length; k = Math.max(0, Math.min(n - 1, i));
  const fs = wo.querySelectorAll(".wo-f");
  fs.forEach((f, j) => { f.classList.toggle("on", j === k); const v = f.querySelector("video");
    if (v) { if (j === k) { v.preload = "auto"; v.play().catch(() => {}); } else v.pause(); } });
  wo.querySelector(".wo-tr").style.transform = PHONE.matches ? `translateX(${-k * 100}%)` : "";
  wo.querySelectorAll(".wo-th button").forEach((b, j) => { b.classList.toggle("on", j === k); b.setAttribute("aria-current", j === k); });
  wo.querySelectorAll(".wo-bars i").forEach((b, j) => { b.className = j === k ? "on" : j < k ? "done" : ""; });
}
function show(id, i = 0) {
  const w = W(id); if (!w) return false;
  if (!wo.isConnected) body.append(wo);
  cur = w; render(w); go(i);
  wo.classList.add("on"); root.classList.add("wo-on");
  requestAnimationFrame(() => wo.classList.add("in"));
  return true;
}
function hide() { if (!cur) return; cur = null; wo.classList.remove("in", "on"); root.classList.remove("wo-on");
  wo.querySelectorAll("video").forEach(v => v.pause()); wo.innerHTML = ""; }
const hashId = () => { const m = /^#work-([\w-]+)$/.exec(location.hash); return m ? m[1] : null; };
function open(id, i = 0) {
  if (!show(id, i)) return;
  if (hashId() !== id) { history.pushState({ wo: id }, "", "#work-" + id); pushed = true; }
}
function close() {
  if (!cur) return;
  if (pushed && hashId()) { pushed = false; history.back(); return; }   // закрытие = шаг назад в истории (popstate ниже снимет работу)
  hide(); if (hashId()) history.replaceState(null, "", location.pathname + location.search);
}
addEventListener("popstate", () => { const id = hashId(); if (id) show(id); else { pushed = false; hide(); } });
addEventListener("keydown", e => { if (!cur) return;
  if (e.key === "Escape") { e.preventDefault(); close(); }
  else if (e.key === "ArrowRight") { e.preventDefault(); go(k + 1); }
  else if (e.key === "ArrowLeft") { e.preventDefault(); go(k - 1); } });
// телефон: свайп вбок — кадр (палец ведёт ленту, порог 15 % ширины или быстрый жест)
{ let x0 = 0, y0 = 0, t0 = 0, dx = 0, drag = 0;
  wo.addEventListener("touchstart", e => { if (!PHONE.matches || !cur || cur.f.length < 2 || !e.target.closest(".wo-st")) return;
    const p = e.touches[0]; x0 = p.clientX; y0 = p.clientY; t0 = performance.now(); dx = 0; drag = 1; }, { passive: true });
  wo.addEventListener("touchmove", e => { if (!drag) return; const p = e.touches[0]; dx = p.clientX - x0;
    if (drag === 1 && Math.abs(p.clientY - y0) > Math.abs(dx)) { drag = 0; return; }
    drag = 2; const tr = wo.querySelector(".wo-tr"); tr.style.transition = "none";
    const edge = (k === 0 && dx > 0) || (k === cur.f.length - 1 && dx < 0) ? .3 : 1;
    tr.style.transform = `translateX(calc(${-k * 100}% + ${dx * edge}px))`; }, { passive: true });
  wo.addEventListener("touchend", () => { if (drag !== 2) { drag = 0; return; } drag = 0;
    const tr = wo.querySelector(".wo-tr"); tr.style.transition = "";
    const fast = Math.abs(dx) / (performance.now() - t0) > .4 && Math.abs(dx) > 20;
    go(Math.abs(dx) > innerWidth * .15 || fast ? k - Math.sign(dx) : k); }); }
PHONE.addEventListener("change", () => { if (cur) go(k); });
// открыт адрес #work-<id> — работа открыта сразу (страница с данными подключила works-data.js)
addEventListener("DOMContentLoaded", () => { const id = hashId(); if (id) show(id); });
window.WO = { open, close, go, awardTag, sprig, get id() { return cur && cur.id; }, get k() { return k; } };
})();

// 20.10 12:48 Антон про лигатуру «ОС» в Foglihten («МОСКВЕ» — О и С сливаются в один знак): «бесит», «ОС имеется в виду».
// Остальные лигатуры шрифта (КО, ЖО, ОО…) остаются: между О и С в текстах, набранных Foglihten, ставим невидимый разрыв лигатуры U+200C.
// Тексты ленты и вставки строятся скриптами позже — поэтому проход повторяется на изменения страницы.
(() => {
  const ZW = "‌", RE = /([Оо])(?=[Сс])/g, isFog = el => /Foglihten/i.test(getComputedStyle(el).fontFamily);
  const fix = root => { const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) { const t = n.nodeValue; if (!/[Оо][Сс]/.test(t) || !n.parentElement || !isFog(n.parentElement)) continue; n.nodeValue = t.replace(RE, "$1" + ZW); } };
  const run = () => { fix(document.body); new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(x => { if (x.nodeType === 1) fix(x); else if (x.nodeType === 3 && x.parentElement) fix(x.parentElement); })))
    .observe(document.body, { childList: true, subtree: true }); };
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", run) : run();
})();
