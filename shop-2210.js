// Магазин · 22.10 — каталог (shop.html, <main data-view="list">) и карточка товара (shop-item.html?id=…, <main data-view="item">).
// Данные — shop-data.js (SHOP, SHOP_TABLES, SHOP_ALL). Стили — shop-2210.css. Эталон — кадры Figma секции 235:140963 (см. шапку css).
// «Заказать» — окно «Заказ» поверх страницы (order-2210.js): товар, размер, имя, связь, комментарий, согласие.
// «Таблица размеров» — своё окно: Esc, клик по фону, фокус внутри, возврат фокуса; на телефоне — шторка снизу.
(() => {
const S = window.SHOP || [], BY = Object.fromEntries(S.map(x => [x.id, x]));
const main = document.getElementById("pg"), VIEW = main.dataset.view;
const PHONE = matchMedia("(max-width: 767px)");
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const rub = n => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}&nbsp;<span class="rub">₽</span>`;
const rubTxt = n => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₽`;
const href = x => `shop-item.html?id=${x.id}`;
const CATS = [["", "Все"], ["orig", "Оригиналы"], ["print", "Принты"], ["merch", "Мерч"]];

// ═════ каталог ═════
if (VIEW === "list") {
  const ALIAS = { originals: "orig", original: "orig", prints: "print" };   // ?c= и полными словами — так набирают руками
  let flt = new URLSearchParams(location.search).get("c") || ""; flt = ALIAS[flt] || flt;
  if (!CATS.some(([k]) => k === flt)) flt = "";
  const cat = ([k, l]) => `<button class="sh-cat sh-cap${k === flt ? " on" : ""}" type="button" data-k="${k}" aria-pressed="${k === flt}">${l}</button>`;
  main.classList.add("sh");
  main.innerHTML = `<h1 class="vh">Магазин</h1>
<nav class="sh-cats" aria-label="Категории" data-side-center><div class="sh-grp">${cat(CATS[0])}</div><div class="sh-grp">${CATS.slice(1).map(cat).join("")}</div></nav>
<div class="sh-f" id="shf"></div>`;
  const field = document.getElementById("shf"), cats = main.querySelector(".sh-cats");
  // 17:43 баг с iPhone: лента категорий жила в main — на короткой странице (фильтр на 2 товара) футер, слой после main с тем же z-index, её закрывал.
  // Список — прямо в body (десктоп его ставит shell.js [data-side-center], телефон — лента над полосой); body.sh-list даёт футеру запас под ленту
  document.body.appendChild(cats); document.body.classList.add("sh-list");
  const tile = (x, h, eager) => {
    const src = PHONE.matches ? x.img800 : x.img;
    return `<a class="sh-it${x.plate ? " pl" : ""}" href="${href(x)}" style="height:${h / 16}rem">
<img src="${src}" alt="${esc(x.t)} — ${esc(x.tile.toLowerCase())}" width="${x.w}" height="${x.h}"${eager ? "" : ' loading="lazy"'} decoding="async">
<span class="sh-lb"><span class="ty"><span class="d">${esc(x.tile)}</span><span class="m">${esc(x.tileM)}</span></span><span class="pr">${rub(x.price)}</span></span></a>`; };
  // «Все» — колонки ровно как в кадре; фильтр — по очереди в самую короткую колонку, высоты плиток те же
  const build = () => {
    const ph = PHONE.matches, plan = (window.SHOP_ALL || {})[ph ? "phone" : "desk"] || [];
    const H = Object.fromEntries(plan.flat()), widths = ph ? [158, 158] : [408, 396, 408];
    let cols;
    if (!flt) cols = plan;
    else { cols = widths.map(() => []); const len = widths.map(() => 0);
      S.filter(x => x.k === flt).forEach(x => { const i = len.indexOf(Math.min(...len)); cols[i].push([x.id, H[x.id]]); len[i] += H[x.id] + (ph ? 12 : 24); }); }
    let n = 0;
    field.innerHTML = cols.map(c => `<div class="sh-col">${c.map(([id, h]) => tile(BY[id], h, n++ < 4)).join("")}</div>`).join("");
  };
  build();
  PHONE.addEventListener("change", build);
  cats.addEventListener("click", e => { const b = e.target.closest(".sh-cat"); if (!b || b.dataset.k === flt) return; flt = b.dataset.k;
    cats.querySelectorAll(".sh-cat").forEach(x => { const on = x.dataset.k === flt; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on); });
    const u = new URL(location.href); flt ? u.searchParams.set("c", flt) : u.searchParams.delete("c"); history.replaceState(history.state, "", u);
    build(); });
  if (flt) requestAnimationFrame(() => { const on = cats.querySelector(".sh-cat.on"); if (on && cats.scrollWidth > cats.clientWidth) cats.scrollLeft = on.offsetLeft - (cats.clientWidth - on.offsetWidth) / 2; });
}

// ═════ карточка ═════
if (VIEW === "item") {
  const x = BY[new URLSearchParams(location.search).get("id")] || BY["cobain-print"];
  document.title = `${x.t} · Магазин · Николай Мерцалов`;
  let size = x.size0 || null;
  const row = (k, v) => `<dl class="pr-row"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></dl>`;
  const scale = ed => { let s = ""; for (let i = 0; i < ed.all; i++) { const xx = (1.5 + i * 6.36).toFixed(2); s += `<line class="${i < ed.free ? "fr" : "gn"}" x1="${xx}" y1="0" x2="${xx}" y2="14"/>`; }
    return `<svg viewBox="0 0 318 14" preserveAspectRatio="none" aria-hidden="true">${s}</svg>`; };
  const rows = [];
  if (x.k === "merch") {
    if (x.sizes) rows.push(`<div class="pr-row"><span class="pr-k" id="sz-k">Размер</span>
<div class="pr-sz" role="radiogroup" aria-labelledby="sz-k">${x.sizes.map(s => `<button type="button" role="radio" aria-checked="${s === size}" data-s="${s}">${s}</button>`).join("")}</div>
${x.table ? '<button class="pr-tab sh-cap sh-lnk" type="button" aria-haspopup="dialog">Таблица размеров</button>' : ""}</div>`);
    else if (x.size) rows.push(row("Размер", x.size));   // 16:31 Антон: вещь без размеров (шоппер) — строкой, как «Цвет», без таблицы
    rows.push(row("Цвет", x.color), row("Материал", x.mat));
  } else {
    x.rows.forEach(([k, v]) => rows.push(row(k, v)));
    if (x.ed) rows.push(`<div class="pr-row pr-ed"><span class="pr-k">Тираж · ${x.ed.all} экземпляров</span>${scale(x.ed)}<p>${x.ed.free} из ${x.ed.all} ещё свободны</p></div>`);
  }
  const FL = {
    wall: ["На стене", `<img src="shop/cobain-interior.webp" alt="Принт в раме на стене" width="1890" height="1064" loading="lazy" decoding="async">`],   // ⚠ интерьер — макет
    detail: ["Деталь", `<img src="shop/cobain-detail.webp" alt="Фрагмент картины крупно" width="1680" height="1120" loading="lazy" decoding="async">`],
    process: ["Процесс", `<video muted loop playsinline preload="none" poster="w/p-cobain/02-1600.webp" data-src="w/p-cobain/02.mp4" aria-label="Работа над картиной"></video>
<svg class="play" viewBox="0 0 35 40" aria-hidden="true"><path d="M0 0L35 20L0 40V0Z" fill="#fff"/></svg>`],
    body: ["На теле", `<p class="ph">кадра на теле пока нет</p>`],   // ⚠ кадров на теле нет — плашка
    sign: ["Деталь знака", `<img src="shop/tee-sign-detail.webp" alt="Знак М на футболке крупно" width="1680" height="1120" loading="lazy" decoding="async">`],
  };
  const floors = (x.floors || []).map(k => `<section class="si-fl f-${k}"><h2 class="sh-cap">${FL[k][0]}</h2><div class="md">${FL[k][1]}</div></section>`).join("");
  const mo = id => { const m = BY[id]; if (!m) return "";
    const tall = m.plate && m.h > m.w;
    return `<li class="mo${m.plate ? " pl" : ""}${tall ? " tall" : ""}"><a href="${href(m)}"><span class="ph"><img src="${m.img800}" alt="${esc(m.t)}" width="${m.w}" height="${m.h}" loading="lazy" decoding="async"></span>
<span class="ty sh-cap">${esc(m.type.split(" · ")[0] === "Оригинал" ? "Оригинал" : m.k === "merch" ? "Мерч" : (x.work === m.work && m.k === "print" ? "Принт этой картины" : "Принт картины"))}</span>
<span class="nm">${esc(m.tt || m.t).replace("\n", " <br>")}</span><span class="pr">${rub(m.price)}</span></a></li>`; };
  main.classList.add("si", x.k);
  main.innerHTML = `<div class="si-hero">
<a class="si-back sh-cap" href="shop.html">← Магазин</a>
<div class="si-pic"><img src="${x.img}" alt="${esc(x.t)}" width="${x.w}" height="${x.h}" fetchpriority="high" decoding="async"></div>
<p class="si-ty">${esc(x.type)}</p>
<h1 class="si-t">${esc(x.tt || x.t)}</h1>
<div class="si-pass">${rows.join("")}
<div class="pr-line" aria-hidden="true"></div>
<p class="pr-price">${rub(x.price)}</p>
<button class="b ord" type="button" aria-haspopup="dialog"><svg viewBox="0 0 200 52" aria-hidden="true"><path class="o"/><path class="i"/></svg><span class="caps">Заказать</span></button>
</div></div>
${floors}
<section class="si-more"><h2 class="sh-cap">Ещё в магазине</h2><a class="all sh-cap sh-lnk" href="shop.html">Смотреть все</a>
<ul class="mo-row">${(x.more || []).map(mo).join("")}</ul></section>`;
  // «← Магазин»: из каталога — назад в историю (тот же фильтр и место прокрутки), иначе — shop.html.
  // Живёт в body, в nav.si-tape: на телефоне — лента над полосой, как лента категорий каталога (18:02 Антон); на десктопе обёртка не рисуется (display: contents)
  const back = main.querySelector(".si-back"), tape = document.createElement("nav"); tape.className = "si-tape"; tape.setAttribute("aria-label", "Назад в магазин");
  tape.appendChild(back); document.body.appendChild(tape); document.body.classList.add("si-page");
  back.addEventListener("click", e => { let r = null; try { r = document.referrer && new URL(document.referrer); } catch (_) {}
    if (r && r.origin === location.origin && /\/shop\.html$/.test(r.pathname) && history.length > 1) { e.preventDefault(); history.back(); } });
  const ord = main.querySelector(".ord");
  if (window.SBTN) { SBTN.decorate(ord.querySelector("svg"), 200, 52); SBTN.hover(ord); }

  // размер
  const sz = main.querySelector(".pr-sz");
  if (sz) sz.addEventListener("click", e => { const b = e.target.closest("button[data-s]"); if (!b) return; size = b.dataset.s;
    sz.querySelectorAll("button").forEach(o => o.setAttribute("aria-checked", o === b)); });
  if (sz) sz.addEventListener("keydown", e => { if (!/^Arrow(Left|Right|Up|Down)$/.test(e.key)) return; e.preventDefault();
    const bs = [...sz.querySelectorAll("button")], i = bs.findIndex(o => o.dataset.s === size), d = /Right|Down/.test(e.key) ? 1 : -1;
    const n = bs[(i + d + bs.length) % bs.length]; n.click(); n.focus(); });

  // видео процесса — играет, пока на экране (muted loop playsinline, постер до первого кадра)
  const v = main.querySelector(".si-fl.f-process video");
  if (v && !matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
    new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause(); }), { threshold: .25 }).observe(v);
    v.addEventListener("playing", () => v.parentElement.classList.add("on")); v.addEventListener("pause", () => v.parentElement.classList.remove("on"));
  }

  // «Заказать» → окно «Заказ» (order-2210.js, по первому нажатию; 17:36 Антон: «да, отдельная форма»): товар, у мерча — выбранный размер;
  //   размер, сменённый в окне, возвращается в карточку. Анкета записи больше не трогается.
  let orderLoad = null;
  const syncSize = s => { size = s; if (sz) sz.querySelectorAll("button").forEach(o => o.setAttribute("aria-checked", o.dataset.s === s)); };
  ord.addEventListener("click", async () => {
    if (!window.ORDER) orderLoad = orderLoad || new Promise(res => { const sc = document.createElement("script"); sc.src = "order-2210.js?v=2210a"; sc.onload = sc.onerror = res; document.head.appendChild(sc); });
    await orderLoad; if (window.ORDER) ORDER.open(x, size, ord, syncSize);
  });

  // окно «Таблица размеров»
  const tb = main.querySelector(".pr-tab"), T = x.table && (window.SHOP_TABLES || {})[x.table];
  if (tb && T) {
    const ov = document.createElement("div"); ov.className = "sz"; ov.hidden = true;
    ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-labelledby", "sz-h");
    document.body.appendChild(ov);
    const fill = () => { const cols = PHONE.matches ? T.colsM : T.cols;
      ov.innerHTML = `<div class="sz-bg"></div><div class="sz-w">
<h2 class="sz-h" id="sz-h">Таблица размеров</h2><button class="sz-x sh-cap" type="button">Закрыть</button>
<p class="sz-s">${esc(x.t)} · мерки изделия, см</p>
<table class="sz-t"><thead><tr>${cols.map(c => `<th scope="col">${c}</th>`).join("")}</tr></thead>
<tbody>${T.rows.map(r => `<tr${r[0] === size ? ' class="on"' : ""}>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>
<p class="sz-n">Мерки сняты с вещи, лежащей ровно.</p></div>`; };   // ⚠ цифры таблицы — заглушки (shop-data.js)
    let last = null;
    const close = () => { if (ov.hidden) return; ov.classList.remove("in"); document.documentElement.classList.remove("sz-on");
      setTimeout(() => { ov.hidden = true; }, 260); if (last) last.focus({ preventScroll: true }); };
    const open = () => { fill(); last = document.activeElement; ov.hidden = false; document.documentElement.classList.add("sz-on");
      requestAnimationFrame(() => requestAnimationFrame(() => ov.classList.add("in")));
      setTimeout(() => ov.querySelector(".sz-x").focus({ preventScroll: true }), 30); };
    tb.addEventListener("click", open);
    ov.addEventListener("click", e => { if (e.target.classList.contains("sz-bg") || e.target.closest(".sz-x")) close(); });
    ov.addEventListener("keydown", e => { if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab") return; e.preventDefault(); ov.querySelector(".sz-x").focus(); });   // в окне одна кнопка — фокус держится на ней
  }
}
})();
