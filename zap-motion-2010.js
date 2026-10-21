/* 20.10 13:26 Антон: «форма должна появляться, а не как будто она уже была на месте, ровно как и всё, что ниже».
   Язык — как у ленты (path-motion-2010.js): всё привязано к прокрутке, таймеров нет; тексты — по словам из размытия со скосом (как фраза экрана 2),
   остальное — прозрачность и подъём на 1.5rem.
   Порядок: линия из ленты доходит до ромба (её рисует лента) → рама прорисовывается от ромба: верх расходится в обе стороны, бока вниз, низ сходится →
   «Расскажи идею» и строка → поля сверху вниз по очереди. Ниже: «Как проходит работа?» → шаги 01 → 02 → 03 → 04 (номер, потом название и текст).
   Футер — мягко целиком. Проявившееся остаётся на месте (анкету не прячем обратно, пока в ней пишут).
   «Уменьшить движение», ?motion=0 и приход якорем (#zapis, #kak-popast, «Записаться» в шапке) — анкета сразу целиком. */
(() => {
  const zap = document.querySelector(".zap"), form = zap && zap.querySelector(".form"), zr = form && form.querySelector(".zr");
  if (!zr || matchMedia("(prefers-reduced-motion: reduce)").matches || new URLSearchParams(location.search).get("motion") === "0") return;
  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const out3 = t => 1 - (1 - t) ** 3;
  const put = (el, k, v) => { const c = el.__zm || (el.__zm = {}); if (c[k] !== v) { c[k] = v; el.style[k] = v; } };
  const span = (p, a, d) => clamp((p - a) / d);

  // слова — единицы входа из размытия (неразрывный пробел не режем: «о своей» не разъедется)
  const split = el => {
    const walk = node => [...node.childNodes].forEach(ch => {
      if (ch.nodeType === 3) {
        const f = document.createDocumentFragment();
        ch.textContent.split(/([ \t\n\r]+)/).forEach(t => { if (!t) return; if (/^[ \t\n\r]+$/.test(t)) { f.appendChild(document.createTextNode(t)); return; }
          const w = document.createElement("span"); w.className = "zw"; w.textContent = t; f.appendChild(w); });
        ch.replaceWith(f);
      } else if (ch.nodeType === 1 && ch.tagName !== "BR") walk(ch);
    });
    walk(el);
    return { el, w: [...el.querySelectorAll(".zw")], B: 13 * parseFloat(getComputedStyle(el).fontSize) / 80 };   // размытие 13 px на кегль 80, как в ленте
  };
  const words = (t, e) => {   // слово 0.5 хода, шаг 0.04, кривая sine — как в ленте
    const T = (t.w.length - 1) * .04 + .5;
    t.w.forEach((w, i) => { const k = Math.sin(clamp((e * T - i * .04) / .5) * Math.PI / 2);
      if (k >= .999) { put(w, "opacity", "1"); put(w, "transform", "none"); put(w, "filter", "none"); return; }
      put(w, "opacity", k.toFixed(3)); put(w, "transform", `skewX(${(-20 * (1 - k)).toFixed(2)}deg)`); put(w, "filter", `blur(${(t.B * (1 - k)).toFixed(2)}px)`); });
  };
  const rise = (el, e) => { const k = out3(e);
    put(el, "opacity", k >= .999 ? "" : k.toFixed(3)); put(el, "transform", k >= .999 ? "" : `translate3d(0,${((1 - k) * 1.5).toFixed(3)}rem,0)`); };

  // ── анкета ──
  const h2 = split(form.querySelector(".zl h2")), sub = split(form.querySelector(".zl p"));
  const f = zr.querySelector(".zf");
  const fields = [...f.querySelectorAll(".z3 > .zi"), f.querySelector(".zt"), f.querySelector(".zc"), f.querySelector(".zp"), ...f.querySelectorAll(".z2 > .zi"), ...f.querySelectorAll(":scope > label.zi"), f.querySelector(".zok"), f.querySelector(".send")].filter(Boolean);
  // рама: две линии (наружная 1.6, внутренняя 0.7) — каждая двумя половинами от ромба сверху до середины низа
  const NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "zframe"); svg.setAttribute("aria-hidden", "true");
  const halves = [];
  [[1.6, .0625], [.7, .365625]].forEach(([sw, ins]) => [0, 1].forEach(side => {
    const p = document.createElementNS(NS, "path"); p.setAttribute("pathLength", "1"); p.style.strokeWidth = sw; svg.appendChild(p); halves.push({ p, ins, side }); }));
  // блик на кончике: по половине наружной линии — от ромба вниз до середины низа (14:14); включается приходом линии ленты в ромб
  // 21.10 15:10 Антон: блик рамы «очень топорно анимируется на телефоне» (толстая черта 2 px со свечением) → как блик линии ленты (08:22): мягкий свет по самой
  // наружной линии той же толщины, полосой с плавными краями — три наложенных отрезка (длина пути .16 / .09 / .04, яркость по нарастающей к середине), без свечения
  const GL = [[.16, .28], [.09, .38], [.04, .5]];
  const glints = []; [0, 1].forEach(side => GL.forEach(([L, a]) => { const g = document.createElementNS(NS, "path"); g.setAttribute("pathLength", "1"); g.setAttribute("class", "zgl");
    g.style.strokeWidth = 1.6; g.style.strokeDasharray = `${L} 2`; svg.appendChild(g); glints.push({ p: g, ins: .0625, side, L, a }); }));
  let armed = false;
  zr.prepend(svg);
  const dm = { t: zr.querySelector(".dm.t"), l: zr.querySelector(".dm.l"), r: zr.querySelector(".dm.r"), b: zr.querySelector(".dm.b") };
  let sideAt = .5;
  const box = () => getComputedStyle(zr).position === "static" ? zr.offsetParent || zr : zr;   // телефон: рама — весь блок анкеты (14:59, М11)
  const geom = () => {
    const B = box(), w = B.offsetWidth, h = B.offsetHeight, rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    [...halves, ...glints].forEach(({ p, ins, side }) => { const o = ins * rem, x = side ? w - o : o;
      p.setAttribute("d", `M${w / 2} ${o}H${x}V${h - o}H${w / 2}`); });
    sideAt = (w / 2 + h / 2) / (w + h);   // доля пути, где линия проходит середину бока — там зажигаются боковые ромбы
  };

  // ── «Как проходит работа?» и шаги ──
  const work = zap.querySelector(".work"), wt = work && split(work.querySelector(".wt"));
  const steps = work ? [...work.querySelectorAll(".steps > div")].map(s => ({ n: s.querySelector(".n"), h: split(s.querySelector("h3")), p: split(s.querySelector("p")) })) : [];
  const ft = document.querySelector(".ft");

  let formDone = false, workDone = false, ftDone = false, raf = 0;
  const showForm = () => { formDone = true; zap.classList.add("zm-form-done"); zr.style.setProperty("--zbk", "1"); [h2, sub].forEach(t => words(t, 1)); fields.forEach(x => rise(x, 1)); halves.forEach(({ p }) => put(p, "strokeDashoffset", "0")); glints.forEach(({ p }) => put(p, "opacity", "0")); Object.values(dm).forEach(d => d && put(d, "opacity", "1")); };
  const frame = () => {
    raf = 0;
    const vh = innerHeight;
    if (!formDone) {
      // 13:50 Антон «линия слишком быстро — нет ощущения, что форма рисуется при просмотре»: кончик линии ленты идёт на 65 % окна (merts-path-motion)
      // и приходит в ромб, когда ромб на 65 %. С этого момента рама рисуется по прокрутке и дорисована, когда её низ входит в окно;
      // «Расскажи идею» и строка — по ходу рамы; поля — по очереди, каждое по своему месту в кадре, но не раньше середины рамы
      const top = (dm.t || form).getBoundingClientRect().top, h = box().offsetHeight;
      const D = vh * .65 - top, DF = Math.max(vh * .25, vh * .65 - (vh - h));   // путь рамы: от ромба на 65 % до низа рамы у низа окна
      const fr = clamp(D / DF);
      {   // 14:59: рама есть и на телефоне
        const e = fr;   // ровный ход: линия идёт ровно с прокруткой
        halves.forEach(({ p }) => put(p, "strokeDashoffset", (1 - e).toFixed(4)));
        const bk = e.toFixed(3); if (zr.__bk !== bk) { zr.__bk = bk; zr.style.setProperty("--zbk", bk); }   // подложка — вместе с рамой
        if (D > 2) armed = true;   // на случай, если лента не прислала line:arrive
        const gl = armed && e > 0 && e < 1 ? Math.min(1, e / .04, (1 - e) / .08) * .9 : 0;
        const c = e - .05;   // середина полосы — чуть позади кончика рамы
        glints.forEach(({ p, L, a }) => { put(p, "strokeDashoffset", (L / 2 - c).toFixed(4)); put(p, "opacity", (gl * a / .9).toFixed(3)); });
        put(dm.t, "opacity", D > 0 ? "1" : "0"); put(dm.l, "opacity", e >= sideAt ? "1" : "0"); put(dm.r, "opacity", e >= sideAt ? "1" : "0"); put(dm.b, "opacity", e >= .999 ? "1" : "0");
      }
      // заголовок и поля — по пройденному от ромба пути (доли окна), а не по доле рамы: на телефоне рама высокая, и поля не ждут её низа
      const dv = D / vh;
      words(h2, span(dv, .05, .25)); words(sub, span(dv, .12, .25));
      let all = fr >= 1 && D > 0;
      fields.forEach((x, i) => { const r = x.getBoundingClientRect(), own = clamp((vh * .97 - r.top) / (vh * .14)), gate = Math.max(span(dv, .25 + Math.min(i, 4) * .04, .2), span(fr, .45 + Math.min(i, 4) * .05, .3)), e = Math.min(own, gate);   // ворота — что раньше: путь от ромба или ход рамы
        rise(x, e); if (e < 1) all = false; });
      if (all) showForm();
    }
    if (work && !workDone) {
      const Q = clamp((vh - work.getBoundingClientRect().top) / (vh * .7));
      words(wt, span(Q, 0, .35));
      steps.forEach((s, k) => { const a = .15 + k * .15; rise(s.n, span(Q, a, .25)); words(s.h, span(Q, a + .1, .3)); words(s.p, span(Q, a + .12, .3)); });
      if (Q >= 1) workDone = true;
    }
    if (ft && !ftDone) { const e = clamp((vh - ft.getBoundingClientRect().top) / (vh * .4)); rise(ft, e); if (e >= 1) ftDone = true; }
  };
  const go = () => { if (!raf) raf = requestAnimationFrame(frame); };

  if (dm.t) dm.t.addEventListener("line:arrive", () => { armed = true; go(); });   // merts-path-motion: кончик вертикали пришёл в ромб
  // пришёл якорем — анкета уже стоит целиком
  const isForm = h => h === "#zapis" || h === "#kak-popast";
  if (isForm(location.hash)) showForm();
  addEventListener("hashchange", () => { if (isForm(location.hash)) { showForm(); go(); } });
  document.addEventListener("click", e => { const a = e.target.closest && e.target.closest('a[href$="#zapis"], a[href$="#kak-popast"]'); if (a) showForm(); }, true);

  zap.classList.add("zm");
  geom(); frame();
  addEventListener("scroll", go, { passive: true });
  addEventListener("resize", () => { geom(); go(); });
  if ("ResizeObserver" in window) { const ro = new ResizeObserver(() => geom()); ro.observe(zr); ro.observe(form); }   // рама меняет высоту (ошибка, «Спасибо!»)
})();
