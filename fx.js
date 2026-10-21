// 16.10 13:30 — пробы «шиммера» на заднике (слово Антона: зерно + золотые искры + вспышки под пальцем/курсором, варианты и их сочетания).
// Подключается только с ?fx=… (без параметра сайт как был). Плашка внизу слева — тап переключает вариант по кругу.
// Всё на заднике (z-index -1, как обои), под фото и текстом. «Уменьшить движение» — эффектов нет.
(() => {
  const P = new URLSearchParams(location.search), PRESETS = {   // 13:49 Антон: «искорки всякие сносим точно» — остались зерно и дым
    A: { name: "зерно", grain: 1 },
    G: { name: "дым + зерно", smoke: 1, grain: 1 },
  }, ORDER = Object.keys(PRESETS);
  let key = (P.get("fx") || "A").toUpperCase(); if (!PRESETS[key]) key = "A";
  const UI = P.has("fxui");   // 14:08 Антон: «убери пока контролы» — плашки и панель только с ?fxui
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const GOLD = [216, 183, 122], mobile = () => matchMedia("(max-width: 767px)").matches;
  const css = document.createElement("style");
  css.textContent = `
  .fx-l { position: fixed; inset: 0; z-index: -1; pointer-events: none; }
  .fx-grain { opacity: var(--go, .08); mix-blend-mode: screen; image-rendering: pixelated; background-repeat: repeat; }
  .fx-smoke { overflow: hidden; }   /* 13:51 Антон: дым темнее фона, не золото; больше гибкости — панель ручек */
  .fx-smoke i { position: absolute; left: 50%; top: 50%; border-radius: 50%; will-change: transform; }
  .fx-panel { position: fixed; left: 8px; right: 8px; bottom: 60px; z-index: 61; padding: 10px 12px 6px; background: rgba(24,24,24,.94); border: 1px solid rgba(203,184,143,.5);
    color: #e6e5e1; font: 12px/1.2 Jost, sans-serif; display: none; }
  .fx-panel.on { display: block; }
  .fx-panel label { display: grid; grid-template-columns: 74px 1fr 40px; align-items: center; gap: 8px; margin-bottom: 6px; }
  .fx-panel input { width: 100%; accent-color: #cbb88f; }
  .fx-panel b { font-weight: 400; color: #cbb88f; text-align: right; }
  .fx-panel .row { display: flex; gap: 8px; justify-content: space-between; margin-top: 4px; }
  .fx-panel button { flex: 1; background: none; border: 1px solid rgba(203,184,143,.5); color: #cbb88f; font: 11px Jost; padding: 6px; text-transform: uppercase; letter-spacing: .08em; }
  @media (min-width: 768px) { .fx-panel { left: auto; right: 24px; bottom: 70px; width: 340px; } }
  .fx-pill2 { left: auto !important; right: 12px; }
  .fx-pill3 { top: 50px !important; }
  @media (min-width: 768px) { .fx-pill3 { top: auto !important; left: 470px !important; } }
  @media (min-width: 768px) { .fx-pill2 { right: auto !important; left: 300px !important; } }
  .fx-pill.off { display: none !important; }
  .fx-pill { position: fixed; left: 12px; top: 12px; z-index: 60; padding: 8px 12px; border: 1px solid rgba(203,184,143,.6);
    background: rgba(31,31,31,.85); color: #cbb88f; font: 12px/1 Jost, sans-serif; letter-spacing: .08em; text-transform: uppercase; cursor: pointer; user-select: none; -webkit-tap-highlight-color: transparent; }
  @media (min-width: 768px) { .fx-pill { top: auto; bottom: 24px; left: 24px; } }`;
  document.head.append(css);

  const layer = cls => { const e = document.createElement(cls === "fx-sparks" ? "canvas" : "div"); e.className = "fx-l " + cls; document.body.prepend(e); return e; };
  let smokeEl = null, grainCv = null, sparkCv = null;

  // ── зерно (13:34 Антон: «капец крупное» — было 180 точек на весь экран): теперь плитка шума, зерно = GS css-px
  //    (по умолчанию 1), 6 заранее посчитанных кадров меняются ~12 раз в секунду со случайным сдвигом — дёшево и мелко
  const GSS = [0.5, 1, 1.5, 2]; let GS = +(P.get("gs") || .5); if (!GSS.includes(GS)) GS = .5;   // 13:46 Антон: норм 0.5
  let gframes = [], gctx = null;
  function grainInit() { grainCv = layer("fx-grain"); const T = 256, n = Math.round(T / GS);
    const c = document.createElement("canvas"); c.width = c.height = n; const x = c.getContext("2d"), im = x.createImageData(n, n);
    // 20.10 замер Lighthouse: без ?gfr=1 используется один кадр — остальные пять (по 262 тыс. пикселей шума + PNG каждый) считались зря, ~0.5 с скрипта на телефоне
    gframes = []; for (let f = 0; f < (GFR ? 6 : 1); f++) { const d = im.data; for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255 | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
      x.putImageData(im, 0, 0); c.toBlob(b => { gframes.push(`url(${URL.createObjectURL(b)})`); }); }   // PNG-кодирование — не на главном потоке
    grainCv.style.backgroundSize = T + "px " + T + "px"; gctx = true; }
  let gf = 0;
  // 16.10 16:07 Антон с айфона: «мигание фона сзади» — Safari на каждой подмене картинки-кадра успевал показать пустой кадр.
  //   Теперь картинка одна на всё время, «живёт» только случайный сдвиг плитки. ?gfr=1 — как было (смена кадров).
  const GFR = P.get("gfr") === "1";
  function grainDraw() { if (!gframes.length) return; if (GFR || !grainCv.style.backgroundImage) { gf = (gf + 1) % gframes.length; grainCv.style.backgroundImage = gframes[gf]; }
    grainCv.style.backgroundPosition = `${Math.random() * 256 | 0}px ${Math.random() * 256 | 0}px`; }

  // ── искры: редкие золотые точки, вспыхивают и гаснут; часть — блик-звёздочка (четыре луча)
  let sctx = null, DPR = 1, W = 0, H = 0, sparks = [], bursts = [];
  function sparkInit() { sparkCv = layer("fx-sparks"); resize(); }
  function resize() { if (!sparkCv) return; DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    sparkCv.width = W * DPR; sparkCv.height = H * DPR; sparkCv.style.width = W + "px"; sparkCv.style.height = H + "px";
    sctx = sparkCv.getContext("2d"); sctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const n = Math.round(W * H / (mobile() ? 5200 : 7000)); sparks = Array.from({ length: n }, mk); }
  const mk = () => ({ x: Math.random() * W, y: Math.random() * H, r: .5 + Math.random() * 1.1, per: 2.5 + Math.random() * 5, ph: Math.random() * 10, star: Math.random() < .12 });
  function glow(x, y, r, a, star) {
    sctx.globalAlpha = a; sctx.fillStyle = `rgb(${GOLD})`; sctx.beginPath(); sctx.arc(x, y, r, 0, 6.283); sctx.fill();
    sctx.globalAlpha = a * .35; sctx.beginPath(); sctx.arc(x, y, r * 3, 0, 6.283); sctx.fill();
    if (star && cur.stars) { const L = r * 7 * a; sctx.globalAlpha = a * .8; sctx.strokeStyle = `rgb(${GOLD})`; sctx.lineWidth = .6;
      sctx.beginPath(); sctx.moveTo(x - L, y); sctx.lineTo(x + L, y); sctx.moveTo(x, y - L); sctx.lineTo(x, y + L); sctx.stroke(); }
  }
  function sparkDraw(t) {
    sctx.clearRect(0, 0, W, H);
    for (const s of sparks) { const k = Math.sin((t / 1000 + s.ph) * 6.283 / s.per); const a = Math.pow(Math.max(0, k), 10); if (a > .02) glow(s.x, s.y, s.r, a, s.star); }
    for (let i = bursts.length - 1; i >= 0; i--) { const b = bursts[i], age = (t - b.t0) / b.life; if (age >= 1) { bursts.splice(i, 1); continue; }
      const a = Math.sin(age * 3.1416); glow(b.x, b.y, b.r, a, b.star); }
    sctx.globalAlpha = 1;
  }
  // ── под пальцем/курсором: искры вспыхивают чаще в круге ~90 px
  let lastSpawn = 0;
  function touchAt(x, y, now) { if (!cur.touch || !sctx) return; if (now - lastSpawn < 24) return; lastSpawn = now;
    for (let i = 0; i < 3; i++) { const a = Math.random() * 6.283, d = Math.sqrt(Math.random()) * 90;
      bursts.push({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, r: .5 + Math.random() * 1.2, t0: now, life: 500 + Math.random() * 900, star: Math.random() < .2 }); }
    if (bursts.length > 220) bursts.splice(0, bursts.length - 220); }
  addEventListener("pointermove", e => touchAt(e.clientX, e.clientY, performance.now()), { passive: true });
  addEventListener("touchmove", e => { const t = e.touches[0]; if (t) touchAt(t.clientX, t.clientY, performance.now()); }, { passive: true });
  addEventListener("touchstart", e => { const t = e.touches[0]; if (t) touchAt(t.clientX, t.clientY, performance.now()); }, { passive: true });

  // ── сборка варианта
  let cur = {};
  function apply(k) { key = k; cur = PRESETS[k];
    [smokeEl, grainCv, sparkCv].forEach(e => e && e.remove()); smokeEl = grainCv = sparkCv = null; sctx = gctx = null; bursts = [];
    if (cur.smoke) { smokeEl = layer("fx-smoke"); buildSmoke(); }
    if (cur.grain) grainInit();
    pill.textContent = `FX ${k} · ${cur.name}  ▸`; p2(); p3();
    if (UI) { const u = new URL(location); u.searchParams.set("fx", k); history.replaceState(null, "", u); }
    if (!UI) document.querySelectorAll(".fx-pill").forEach(e => e.classList.add("off")); }
  const pill = document.createElement("div"); pill.className = "fx-pill"; document.body.append(pill);
  const pill2 = document.createElement("div"); pill2.className = "fx-pill fx-pill2"; document.body.append(pill2);
  // ── панель ручек дыма; значения живут в адресе (их можно прислать одной строкой)
  const SM = { so: .45, tn: -.75, sz: 1.15, sp: 1, bl: 24, n: 4 };   // 13:58 Антон: «вот так вроде прикольно»
  const SMR = { so: [0, 1, .05, "сила"], tn: [-1, 1, .05, "тон"], sz: [.4, 2, .05, "размер"], sp: [.2, 3, .1, "скорость"], bl: [0, 80, 2, "размытие"], n: [1, 6, 1, "пятен"] };
  for (const k in SM) if (P.has("s" + k)) SM[k] = +P.get("s" + k);
  let smAnims = [];
  function smColor(i) { const t = SM.tn;   // тон < 0 — темнее фона (чёрный дым), > 0 — тёплый золотистый
    return t <= 0 ? `rgba(8,8,8,${(-t * .9).toFixed(2)})` : `rgba(${[150, 104, 48].join(",")},${(t * .7).toFixed(2)})`; }
  function buildSmoke() { if (!smokeEl) return; smokeEl.innerHTML = ""; smAnims = [];
    smokeEl.style.opacity = SM.so; smokeEl.style.filter = `blur(${SM.bl}px)`;
    let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < SM.n; i++) { const e = document.createElement("i"), w = (55 + rnd() * 45) * SM.sz;
      e.style.width = w + "vmax"; e.style.height = w * (.7 + rnd() * .3) + "vmax"; e.style.marginLeft = -w / 2 + "vmax"; e.style.marginTop = -w * .4 + "vmax";
      e.style.background = `radial-gradient(closest-side, ${smColor(i)}, transparent)`; smokeEl.append(e);
      const pt = () => `translate3d(${(rnd() - .5) * 90}vw, ${(rnd() - .5) * 80}vh, 0) scale(${.8 + rnd() * .5})`;
      const a = e.animate([{ transform: pt() }, { transform: pt() }, { transform: pt() }], { duration: (10 + rnd() * 10) * 1000, direction: "alternate", iterations: Infinity, easing: "ease-in-out" });
      a.playbackRate = SM.sp; smAnims.push(a); } }
  const panel = document.createElement("div"); panel.className = "fx-panel"; document.body.append(panel);
  panel.innerHTML = Object.entries(SMR).map(([k, [mn, mx, st, lab]]) => `<label>${lab}<input type="range" min="${mn}" max="${mx}" step="${st}" data-k="${k}" value="${SM[k]}"><b data-v="${k}">${SM[k]}</b></label>`).join("")
    + `<div class="row"><button data-a="reset">сброс</button><button data-a="close">скрыть</button></div>`;
  const urlSm = () => { const u = new URL(location); for (const k in SM) u.searchParams.set("s" + k, SM[k]); history.replaceState(null, "", u); };
  panel.addEventListener("input", e => { const k = e.target.dataset.k; if (!k) return; SM[k] = +e.target.value; panel.querySelector(`[data-v="${k}"]`).textContent = SM[k];
    if (k === "so" && smokeEl) smokeEl.style.opacity = SM.so; else if (k === "bl" && smokeEl) smokeEl.style.filter = `blur(${SM.bl}px)`;
    else if (k === "sp") smAnims.forEach(a => a.playbackRate = SM.sp); else buildSmoke(); urlSm(); });
  panel.addEventListener("click", e => { const a = e.target.dataset.a; if (a === "close") panel.classList.remove("on");
    if (a === "reset") { Object.assign(SM, { so: .45, tn: -.75, sz: 1.15, sp: 1, bl: 24, n: 4 }); panel.querySelectorAll("input").forEach(i => { i.value = SM[i.dataset.k]; panel.querySelector(`[data-v="${i.dataset.k}"]`).textContent = SM[i.dataset.k]; }); buildSmoke(); urlSm(); } });
  const pill3 = document.createElement("div"); pill3.className = "fx-pill fx-pill3"; document.body.append(pill3);
  const p3 = () => { pill3.textContent = "дым · ручки ⚙"; pill3.style.display = cur.smoke ? "" : "none"; if (!cur.smoke) panel.classList.remove("on"); };
  pill3.addEventListener("click", () => panel.classList.toggle("on"));
  const p2 = () => { pill2.textContent = `зерно ${GS} px ▸`; pill2.style.display = cur.grain ? "" : "none"; };
  pill2.addEventListener("click", () => { GS = GSS[(GSS.indexOf(GS) + 1) % GSS.length]; const u = new URL(location); u.searchParams.set("gs", GS); history.replaceState(null, "", u); if (grainCv) { grainCv.remove(); grainInit(); } p2(); });
  pill.addEventListener("click", () => apply(ORDER[(ORDER.indexOf(key) + 1) % ORDER.length]));
  addEventListener("resize", () => { if (cur.sparks) resize(); });   // зерно — плитка, от размера экрана не зависит

  let lastG = 0;
  function loop(t) { if (!document.hidden) { if (gctx && t - lastG > 66) { grainDraw(); lastG = t; } if (sctx) sparkDraw(t); } requestAnimationFrame(loop); }
  apply(key); requestAnimationFrame(loop);
})();
