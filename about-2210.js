// «Обо мне» · 22.10 — поведение страницы (разметка about.html, стили about-2210.css; каркас — shell.js, футер и «Сотрудничество» — footer-2010.js).
// Меню разделов подсвечивает раздел на экране, клик — плавно к разделу · петля процесса играет, только пока на экране · шторка до / после
// (логика демо _cover-ba-2210.html) и миниатюры пар · «Награды» — открытая работа (WO, shell.js) · «Написать» — ступенчатая кнопка (SBTN, shell.js).
(() => {
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const PHONE = matchMedia("(max-width: 767px)");

// ── меню разделов ──
const nav = document.querySelector(".ab-nav");
const links = [...nav.querySelectorAll("a")];
const secs = links.map(a => document.querySelector(a.getAttribute("href")));
let cur = -1;
function mark() {
  // раздел на экране — последний, чей верх выше 40 % окна; у низа страницы — последний
  const line = innerHeight * .4;
  let i = 0;
  secs.forEach((s, k) => { if (s.getBoundingClientRect().top <= line) i = k; });
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) i = secs.length - 1;
  if (i === cur) return; cur = i;
  links.forEach((a, k) => { a.classList.toggle("on", k === i); if (k === i) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
  if (PHONE.matches) { const a = links[i], l = a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2;   // лента: активный пункт — к середине
    nav.scrollTo({ left: Math.max(0, l), behavior: RM ? "auto" : "smooth" }); }
}
let raf = 0;
addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; mark(); ribbon(); }); }, { passive: true });
addEventListener("resize", () => { cur = -1; mark(); ribbon(); });
links.forEach((a, k) => a.addEventListener("click", e => {
  e.preventDefault();
  secs[k].scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", location.pathname + location.search);   // без якоря в адресе: #work-… остаётся за открытой работой
}));
// телефон: лента уходит, когда на экране футер (он сам несёт контакты; иначе лента ложится на «© 2008–2026»)
const foot = document.getElementById("footer");
function ribbon() { if (!PHONE.matches || !foot) return nav.classList.remove("off");
  nav.classList.toggle("off", foot.getBoundingClientRect().top < innerHeight - nav.getBoundingClientRect().height - 52); }
mark(); ribbon();

// ── петля процесса: файл грузится у экрана, играет только на экране; «уменьшить движение» — постер ──
const v = document.querySelector(".ab-loop video");
let dead = false;   // браузер не играет файл — остаётся постер, а не чёрный квадрат
if (v) v.addEventListener("error", () => { dead = true; v.removeAttribute("src"); v.load(); }, true);
if (v && !RM && "IntersectionObserver" in window) {
  new IntersectionObserver(es => es.forEach(e => {
    if (dead) return;
    if (e.isIntersecting) { if (!v.getAttribute("src")) { v.src = v.dataset.src; v.preload = "auto"; } v.play().catch(() => {}); }
    else if (v.getAttribute("src")) v.pause();
  }), { rootMargin: "300px 0px" }).observe(v);
}

// ── шторка до / после: где курсор — там граница; левее «до», правее «после»; палец — тянуть; мышь ушла — граница на середину ──
const ba = document.querySelector(".ab-ba");
if (ba) {
  const put = cx => { const r = ba.getBoundingClientRect(); ba.style.setProperty("--x", Math.max(0, Math.min(1, (cx - r.left) / r.width)) * 100 + "%"); };
  ba.addEventListener("pointermove", e => { if (e.pointerType === "mouse" || e.buttons) put(e.clientX); });
  ba.addEventListener("pointerdown", e => { ba.setPointerCapture(e.pointerId); put(e.clientX); });
  ba.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") ba.style.setProperty("--x", "50%"); });
  const bf = ba.querySelector(".bf"), af = ba.querySelector(".af");
  const ths = [...document.querySelectorAll(".ab-ths button")];
  ths.forEach(b => b.addEventListener("click", () => {
    ths.forEach(o => { o.classList.toggle("on", o === b); o.setAttribute("aria-pressed", o === b); });
    bf.src = b.dataset.b; af.src = b.dataset.a; ba.style.setProperty("--x", "50%");
    ba.setAttribute("aria-label", `Перекрытие «${b.dataset.n}»: до и после`);
  }));
  // пары грузятся заранее, когда раздел близко — смена без пустого кадра
  if ("IntersectionObserver" in window) { const io = new IntersectionObserver(es => { if (!es.some(e => e.isIntersecting)) return; io.disconnect();
    ths.forEach(b => [b.dataset.b, b.dataset.a].forEach(s => { const i = new Image(); i.src = s; })); }, { rootMargin: "600px 0px" }); io.observe(ba); }
}

// ── призыв «Не спеши на лазер»: блик по тексту сам раз в 9–14 с и при наведении (как знак М, shell.js); клик — запись с отметкой «перекрытие» ──
const cta = document.querySelector(".ab-ov-a");
if (cta) {
  const shine = () => { if (RM || document.hidden || cta.classList.contains("sheen")) return; cta.classList.add("sheen"); };
  cta.addEventListener("animationend", () => cta.classList.remove("sheen"));
  cta.addEventListener("mouseenter", shine);
  if (!RM) { const loop = () => setTimeout(() => { if (cta.getBoundingClientRect().bottom > 0 && cta.getBoundingClientRect().top < innerHeight) shine(); loop(); }, 9000 + Math.random() * 5000); loop(); }
  // окно записи открывает shell.js ([data-zapis]); как только анкета на месте — отметить «Перекрытие старой татуировки»
  cta.addEventListener("click", () => { let n = 0; const t = setInterval(() => {
    const c = document.querySelector('input[name="cover-tattoo"]');
    if (c && window.ZPOP && ZPOP.isOpen()) { clearInterval(t); if (!c.checked) { c.checked = true; c.dispatchEvent(new Event("change", { bubbles: true })); } }
    else if (++n > 40) clearInterval(t); }, 100); });
}

// ── «Студия»: живая карта (YMAP из faq-2010.js) — десктоп, когда блок подъезжает к экрану; телефон и ошибка API — снимок ──
const sm = document.querySelector(".ab-sd-map");
if (sm && window.YMAP && "IntersectionObserver" in window) {
  const WIDE = matchMedia("(min-width: 768px)"); let near = false, started = false;
  const go = () => { if (started || !near || !WIDE.matches) return; started = true; YMAP.mount(sm, sm.dataset.ll, sm.dataset.key).catch(() => { started = false; }); };
  new IntersectionObserver(es => { near = es.some(e => e.isIntersecting); go(); }, { rootMargin: "400px 0px" }).observe(sm);
  WIDE.addEventListener("change", go);
}

// ── награды: клик по строке — открытая работа ──
document.querySelectorAll(".ab-it[data-work]").forEach(a => a.addEventListener("click", e => {
  if (!window.WO) return; e.preventDefault(); WO.open(a.dataset.work);
}));

// ── «Написать» в плашке — ступенчатая кнопка, как «Записаться» (рамка, вдох, перелив) ──
// на телефоне кнопка во всю ширину плашки — 280 × 52 (17:35, кадр 236:157894): рамку рисуем заново под ширину
const gb = document.querySelector(".ab-gs-b");
if (gb && window.SBTN) {
  const draw = () => { const svg = gb.querySelector("svg"); svg.innerHTML = '<path class="o"/><path class="i"/>'; SBTN.decorate(svg, PHONE.matches ? 280 : 200, 52); };
  draw(); SBTN.hover(gb); PHONE.addEventListener("change", draw);
}
})();
