// Блог · 22.10 — разметка списка (blog.html, <body data-view="list">) и статьи (blog-post.html?id=<id>, data-view="post") из blog-data.js.
// Стили — blog-2210.css; каркас — shell.js (боковой список по центру — [data-side-center], открытая работа — WO, «Записаться» — [data-zapis]).
// Рубрики — как фильтры «Работ»: выбор пишется в адрес ?c=<ключ>, ссылкой можно поделиться; на телефоне — лента над полосой, у футера прячется.
// Фото работы — из w/<id>/ (works-data.js); клик — открытая работа поверх страницы (как в «Наградах» «Обо мне»), без скрипта — «Работы» с этой работой.
(() => {
const { CATS, POSTS, CTA, BY, label } = window.BLOG, pg = document.getElementById("pg");
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const lines = (s, cls = "") => esc(s).replace(/\n/g, ` <br${cls ? ` class="${cls}"` : ""}>`);   // пробел перед переносом: где перенос спрятан, слова не слипаются
const W = id => (window.WORKS || []).find(w => w.id === id);
const url = p => `blog-post.html?id=${encodeURIComponent(p.id)}`;
const Q = new URLSearchParams(location.search);

// кадр: { w, k } — фото работы (800 / 1600), { src } — своя картинка
function img(o, sizes, eager) {
  const lazy = eager ? ' fetchpriority="high"' : ' loading="lazy"', pos = o.pos ? ` style="object-position:${o.pos}"` : "";
  if (o.src) return `<img src="${o.src}" alt=""${lazy} decoding="async"${pos}>`;
  const w = W(o.w), f = w && w.f[o.k]; if (!f) return "";
  return `<img src="${f.src}" srcset="${f.src} 800w, ${f.big} 1600w" sizes="${sizes}" alt="${esc("Татуировка — " + w.t)}"${lazy} decoding="async"${pos}>`;
}
// фото работы — ссылка на открытую работу
const photo = (o, sizes, cls = "bp-ph", eager) => { const w = o.w && W(o.w), f = w && w.f[o.k], r = f ? ` style="--r:${f.r.toFixed(4)}"` : "";
  return w ? `<a class="${cls}" href="works-r-1710.html#work-${w.id}" data-wo="${w.id}" data-k="${o.k}"${r} aria-label="${esc("Открыть работу «" + w.t + "»")}">${img(o, sizes, eager)}</a>`
           : `<span class="${cls}"${r}>${img(o, sizes, eager)}</span>`; };

// карточка статьи (список и «Ещё в блоге»)
const card = p => `<article class="bl-it${p.soon ? " soon" : ""}" data-wt="${p.wt}" data-c="${p.c}">
  ${p.wt ? `<a class="bl-ph" href="${url(p)}" tabindex="-1" aria-hidden="true">${img(p.cover, p.wt === 840 ? "(max-width: 767px) 92vw, 44vw" : "(max-width: 767px) 46vw, 22vw")}</a>` : ""}
  <p class="bl-c caps">${p.soon ? "Скоро" : esc(label(p.c))}</p>
  <h2 class="bl-t">${p.soon ? esc(p.t) : `<a href="${url(p)}">${lines(p.tl)}</a>`}</h2>
  ${p.a ? `<p class="bl-a">${esc(p.a)}</p>` : ""}
  ${p.soon ? "" : `<p class="bl-d caps">${esc(p.d)}</p>`}
</article>`;

// ── список ──
function list() {
  let flt = CATS.some(([k]) => k && k === Q.get("c")) ? Q.get("c") : "";
  pg.innerHTML = `<div class="bl-hd"><h1>Блог</h1><p class="bl-lead">Статьи голосом мастера:<br> процесс, разбор работ, уход.</p></div>
<div class="bl-rail"><nav class="bl-cats caps" aria-label="Рубрики" data-side-center>${CATS.map(([k, l]) =>
  `<button class="bl-cat" type="button" data-k="${k}" aria-pressed="${k === flt}">${esc(l)}</button>`).join("")}</nav></div>
<div class="bl-list">${POSTS.map(card).join("")}</div>`;
  const cats = pg.querySelector(".bl-cats"), items = [...pg.querySelectorAll(".bl-it")];
  const apply = () => {
    cats.querySelectorAll(".bl-cat").forEach(b => { const on = b.dataset.k === flt; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
    items.forEach(it => it.hidden = !!flt && (it.classList.contains("soon") || it.dataset.c !== flt));   // «скоро» — только во «Всех»
    const u = new URL(location.href); if (flt) u.searchParams.set("c", flt); else u.searchParams.delete("c"); history.replaceState(history.state, "", u);
    dispatchEvent(new Event("resize"));   // высота страницы сменилась — боковой список пересчитать (shell.js)
  };
  cats.addEventListener("click", e => { const b = e.target.closest(".bl-cat"); if (!b || b.dataset.k === flt) return; flt = b.dataset.k; apply(); });
  apply();
  // телефон: у футера лента прячется (иначе ложится на «© 2008–2026»), как лента разделов «Обо мне»
  const ft = document.getElementById("footer");
  if (ft && "IntersectionObserver" in window) new IntersectionObserver(es => es.forEach(e => cats.classList.toggle("off", e.isIntersecting))).observe(ft);
}

// ── статья ──
function post() {
  const p = POSTS.find(x => x.id === Q.get("id"));
  if (!p) { location.replace("blog.html"); return; }
  document.title = `${p.t} · Блог · Николай Мерцалов`;
  const d = document.querySelector('meta[name="description"]'); if (d && p.a) d.content = p.a;
  const floor = f => { const kind = f.ph && f.ph.length > 1 ? "pair" : f.big ? "big" : f.ph ? "side" : "text";
    const sz = kind === "big" ? "(max-width: 767px) 92vw, 44vw" : kind === "pair" ? "(max-width: 767px) 44vw, 22vw" : "(max-width: 767px) 46vw, 22vw";
    return `<section class="bp-fl ${kind}"${f.h ? ` aria-label="${esc(f.h)}"` : ""}>
  ${f.h ? `<h2 class="bp-fh">${lines(f.hm || f.h, "m")}</h2>` : ""}
  ${f.p || f.award ? `<div class="bp-tx">${f.p ? `<p>${esc(f.p)}</p>` : ""}${f.award ? WO.awardFull(f.award) : ""}</div>` : ""}
  ${f.ph ? `<div class="bp-phs">${f.ph.map(o => photo(o, sz)).join("")}</div>` : ""}
  ${f.cap ? `<p class="bp-cap">${lines(f.capm || f.cap, "m")}</p>` : ""}
</section>`; };
  const next = POSTS.find(x => x !== p && !x.soon);
  pg.innerHTML = `<nav class="bp-tape" aria-label="Назад в блог"><a class="bp-back caps" href="blog.html">← Блог</a></nav>
<header class="bp-hd"><h1>${lines(p.tl, "m")}</h1><p class="bp-meta">${esc((p.soon ? "Скоро" : label(p.c)) + " · " + p.d + " · " + BY)}</p></header>
${p.main ? `<figure class="bp-main">${photo(p.main, "(max-width: 767px) 92vw, 66vw", "bp-ph", true)}${p.cap ? `<figcaption class="bp-cap">${esc(p.cap)}</figcaption>` : ""}</figure>` : ""}
${p.lead ? `<p class="bp-lead">${esc(p.lead)}</p>` : ""}
${p.fl.map(floor).join("")}
${next ? `<section class="bp-more" aria-label="Ещё в блоге"><h2 class="bp-mh">Ещё в блоге</h2>${card(next)}</section>` : ""}
<aside class="bp-cta fplate" id="bp-cta" aria-label="Запись">
  <i class="fd fd-t"></i><i class="fd fd-b"></i><i class="fd fd-l"></i><i class="fd fd-r"></i>
  <p class="bp-cta-h">${esc(CTA.h)}</p>
  <p class="bp-cta-t">${esc(CTA.t)}</p>
  <button class="b" type="button" data-zapis><svg viewBox="0 0 200 52" aria-hidden="true"><path class="o"/><path class="i"/></svg><span class="caps">${esc(CTA.b)}</span></button>
</aside>`;
  // «← Блог»: десктоп — на полях слева вверху; телефон — лента над полосой меню, тем же видом, что лента рубрик (18:02–18:06 Антон, как «← Магазин»).
  // Лента живёт в body: внутри main её перекрывал бы футер. Пришли из списка блога — шаг назад (список на том же месте и с той же рубрикой)
  const tape = pg.querySelector(".bp-tape"); document.body.appendChild(tape); document.body.classList.add("bp-page");
  tape.querySelector("a").addEventListener("click", e => { let r = null; try { r = new URL(document.referrer); } catch (_) {}
    if (r && r.origin === location.origin && /\/blog\.html$/.test(r.pathname) && history.length > 1) { e.preventDefault(); e.stopImmediatePropagation(); history.back(); } });
  const b = pg.querySelector(".bp-cta button.b");
  // ступенчатая кнопка; на телефоне — во всю ширину плашки 280 × 52 (кадр 212:64874): рамку рисуем заново под ширину, как «Написать» в «Обо мне»
  const PHONE = matchMedia("(max-width: 767px)");
  if (window.SBTN) { const draw = () => { const svg = b.querySelector("svg"); svg.innerHTML = '<path class="o"/><path class="i"/>'; SBTN.decorate(svg, PHONE.matches ? 280 : 200, 52); };
    draw(); SBTN.hover(b); PHONE.addEventListener("change", draw); }
  // фото работы → открытая работа на этом кадре
  pg.addEventListener("click", e => { const a = e.target.closest("a[data-wo]"); if (!a || !window.WO || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); WO.open(a.dataset.wo, +a.dataset.k || 0); });
}

(document.body.dataset.view === "post" ? post : list)();
})();
