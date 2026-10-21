// 16.10 13:30 — пробы «шиммера» на заднике (слово Антона: зерно + золотые искры + вспышки под пальцем/курсором, варианты и их сочетания).
// Подключается только с ?fx=… (без параметра сайт как был). Плашка внизу слева — тап переключает вариант по кругу.
// Всё на заднике (z-index -1, как обои), под фото и текстом. «Уменьшить движение» — эффектов нет.
(() => {
  const P = new URLSearchParams(location.search), PRESETS = {   // 13:49 Антон: «искорки всякие сносим точно» — остались зерно и дым
    A: { name: "зерно", grain: 1 },
    W: { name: "дым-волны + зерно", smoke: 1, grain: 1 },
  }, ORDER = Object.keys(PRESETS);
  let key = "W";   // 14:06 Антон: пятна (fx.js, ?fx=G) нравились больше; волны — запасной вариант ?fx=W
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const GOLD = [216, 183, 122], mobile = () => matchMedia("(max-width: 767px)").matches;
  const css = document.createElement("style");
  css.textContent = `
  .fx-l { position: fixed; inset: 0; z-index: -1; pointer-events: none; }
  .fx-grain { opacity: var(--go, .08); mix-blend-mode: screen; image-rendering: pixelated; background-repeat: repeat; }
  .fx-smoke { width: 100vw; height: 100vh; }   /* 13:51 Антон: дым темнее фона, не золото; больше гибкости — панель ручек */
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
    gframes = []; for (let f = 0; f < 6; f++) { const d = im.data; for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255 | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
      x.putImageData(im, 0, 0); gframes.push(`url(${c.toDataURL()})`); }
    grainCv.style.backgroundSize = T + "px " + T + "px"; gctx = true; }
  let gf = 0;
  function grainDraw() { gf = (gf + 1) % gframes.length; grainCv.style.backgroundImage = gframes[gf];
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
    [smokeEl, grainCv, sparkCv].forEach(e => e && e.remove()); smokeEl = grainCv = sparkCv = null; sctx = gctx = null; sgl = null; bursts = [];
    if (cur.smoke) { smokeEl = document.createElement("canvas"); smokeEl.className = "fx-l fx-smoke"; document.body.prepend(smokeEl); sgl = null; buildSmoke(); }
    if (cur.grain) grainInit();
    pill.textContent = `FX ${k} · ${cur.name}  ▸`; p2(); p3();
    const u = new URL(location); u.searchParams.set("fx", k); history.replaceState(null, "", u); }
  const pill = document.createElement("div"); pill.className = "fx-pill"; document.body.append(pill);
  const pill2 = document.createElement("div"); pill2.className = "fx-pill fx-pill2"; document.body.append(pill2);
  // ── панель ручек дыма; значения живут в адресе (их можно прислать одной строкой)
  // 14:02 Антон: «на рефе дым идёт рандомно и волнами — докрутить» → дым-шейдер: шум, закрученный сам собой (domain warp), как у Valeran
  const SM0 = { so: .45, tn: -.75, sz: 1.15, sp: 1, bl: 24, wv: 1.2, st: 1.6 };   // сила · тон · масштаб · скорость · мягкость · волны · вытянутость
  const SM = { ...SM0 };
  const SMR = { so: [0, 1, .05, "сила"], tn: [-1, 1, .05, "тон"], sz: [.4, 3, .05, "масштаб"], sp: [0, 4, .1, "скорость"], bl: [0, 60, 2, "мягкость"], wv: [0, 3, .1, "волны"], st: [.5, 4, .1, "вытянутость"] };
  for (const k in SM) if (P.has("s" + k)) SM[k] = +P.get("s" + k);
  let smAnims = [], sgl = null, sprog = null, sU = {}, sT0 = performance.now();
  const VS = "attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }";
  const FS = `precision mediump float; uniform vec2 R; uniform float T, SC, WV, ST, TN;
  float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
    return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
  float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++) { v += a * n(p); p = p * 2.03 + vec2(1.7, 9.2); a *= .5; } return v; }
  void main(){ vec2 uv = gl_FragCoord.xy / R.y; uv = mat2(.8, -.6, .6, .8) * uv; uv.y *= ST; vec2 p = uv * SC * 1.6; float t = T;
    vec2 q = vec2(fbm(p + vec2(0., t * .07)), fbm(p + vec2(5.2, 1.3) - t * .05));
    vec2 r = vec2(fbm(p + WV * q + vec2(1.7, 9.2) + t * .04), fbm(p + WV * q + vec2(8.3, 2.8) - t * .03));
    float f = fbm(p + WV * r);
    float m = smoothstep(.35, .95, f);
    vec3 c = TN < 0. ? vec3(.03) : vec3(.59, .41, .19);
    float al = m * abs(TN);
    gl_FragColor = vec4(c * al, al); }`;
  function buildSmoke() { if (!smokeEl) return;
    smokeEl.style.opacity = SM.so; smokeEl.style.filter = `blur(${SM.bl}px)`;
    if (!sgl) { const g = smokeEl.getContext("webgl", { premultipliedAlpha: true, alpha: true }); if (!g) return; sgl = g;
      const sh = (ty, src) => { const o = g.createShader(ty); g.shaderSource(o, src); g.compileShader(o); return o; };
      sprog = g.createProgram(); g.attachShader(sprog, sh(g.VERTEX_SHADER, VS)); g.attachShader(sprog, sh(g.FRAGMENT_SHADER, FS)); g.linkProgram(sprog); g.useProgram(sprog);
      const b = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, b); g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
      const loc = g.getAttribLocation(sprog, "a"); g.enableVertexAttribArray(loc); g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
      ["R", "T", "SC", "WV", "ST", "TN"].forEach(k => sU[k] = g.getUniformLocation(sprog, k)); }
    const w = 200, hh = Math.round(200 * innerHeight / innerWidth); smokeEl.width = w; smokeEl.height = hh; sgl.viewport(0, 0, w, hh); }
  let sTime = 0, sLast = performance.now();
  function smokeDraw(now) { if (!sgl) return; sTime += (now - sLast) / 1000 * SM.sp; sLast = now; const g = sgl;
    g.uniform2f(sU.R, smokeEl.width, smokeEl.height); g.uniform1f(sU.T, sTime); g.uniform1f(sU.SC, SM.sz); g.uniform1f(sU.WV, SM.wv); g.uniform1f(sU.ST, SM.st); g.uniform1f(sU.TN, SM.tn);
    g.clearColor(0, 0, 0, 0); g.clear(g.COLOR_BUFFER_BIT); g.drawArrays(g.TRIANGLES, 0, 3); }
  const panel = document.createElement("div"); panel.className = "fx-panel"; document.body.append(panel);
  panel.innerHTML = Object.entries(SMR).map(([k, [mn, mx, st, lab]]) => `<label>${lab}<input type="range" min="${mn}" max="${mx}" step="${st}" data-k="${k}" value="${SM[k]}"><b data-v="${k}">${SM[k]}</b></label>`).join("")
    + `<div class="row"><button data-a="reset">сброс</button><button data-a="close">скрыть</button></div>`;
  const urlSm = () => { const u = new URL(location); for (const k in SM) u.searchParams.set("s" + k, SM[k]); history.replaceState(null, "", u); };
  panel.addEventListener("input", e => { const k = e.target.dataset.k; if (!k) return; SM[k] = +e.target.value; panel.querySelector(`[data-v="${k}"]`).textContent = SM[k];
    if (k === "so" && smokeEl) smokeEl.style.opacity = SM.so; else if (k === "bl" && smokeEl) smokeEl.style.filter = `blur(${SM.bl}px)`;
    urlSm(); });   // остальные ручки шейдер читает каждый кадр
  panel.addEventListener("click", e => { const a = e.target.dataset.a; if (a === "close") panel.classList.remove("on");
    if (a === "reset") { Object.assign(SM, SM0); panel.querySelectorAll("input").forEach(i => { i.value = SM[i.dataset.k]; panel.querySelector(`[data-v="${i.dataset.k}"]`).textContent = SM[i.dataset.k]; }); buildSmoke(); urlSm(); } });
  const pill3 = document.createElement("div"); pill3.className = "fx-pill fx-pill3"; document.body.append(pill3);
  const p3 = () => { pill3.textContent = "дым · ручки ⚙"; pill3.style.display = cur.smoke ? "" : "none"; if (!cur.smoke) panel.classList.remove("on"); };
  pill3.addEventListener("click", () => panel.classList.toggle("on"));
  const p2 = () => { pill2.textContent = `зерно ${GS} px ▸`; pill2.style.display = cur.grain ? "" : "none"; };
  pill2.addEventListener("click", () => { GS = GSS[(GSS.indexOf(GS) + 1) % GSS.length]; const u = new URL(location); u.searchParams.set("gs", GS); history.replaceState(null, "", u); if (grainCv) { grainCv.remove(); grainInit(); } p2(); });
  pill.addEventListener("click", () => apply(ORDER[(ORDER.indexOf(key) + 1) % ORDER.length]));
  addEventListener("resize", () => { if (cur.sparks) resize(); if (sgl) buildSmoke(); });   // зерно — плитка, от размера экрана не зависит

  let lastG = 0;
  let lastS = 0;
  function loop(t) { if (!document.hidden) { if (gctx && t - lastG > 66) { grainDraw(); lastG = t; } if (sgl && t - lastS > 33) { smokeDraw(t); lastS = t; } else if (!sgl) sLast = t; if (sctx) sparkDraw(t); } requestAnimationFrame(loop); }
  apply(key); requestAnimationFrame(loop);
})();
