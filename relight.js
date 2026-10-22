// 16.10 — свет на портрете (прототип по демо Codrops «Relighting Images», слово Антона 13:51).
// Карта глубины (Depth Anything V2, локально) запечена в relight/ndepth.png: R,G — нормаль, B — высота.
// 22.10 19:15 скорость: на сайт идёт relight/ndepth.webp — тот же PNG без потерь (190 → 141 КБ, пиксель в пиксель)
// Тёплый точечный свет идёт за курсором / пальцем, без них медленно ходит сам; мягкая тень — ray-march по высоте.
// Подключение: <script src="relight.js"></script> после .hero .portrait — канвас ложится поверх фона элемента.
// «Уменьшить движение» или нет WebGL — остаётся обычная картинка. ?relight=0 — выключить; ?rlui — ручки;
// ?map=s — карта с маленькой модели (по умолчанию — Large, подробнее: глазницы, губы, пряди).
(() => {
  const Q = new URLSearchParams(location.search);
  if (Q.get("relight") === "0" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const host = document.querySelector("[data-relight], .hero .portrait");
  if (!host) return;

  // ручки: значения по умолчанию — тёплый мягкий свет, не прожектор
  // 14:45 Антон подобрал ручками: «вот так прикольно» — нейтральный свет без блика, низкий и дальний, тени слабые
  // (до этого 14:39 «на треть мягче»: amb .67 pow .9 lz .38 warm .7 shadow .65 spec .12 reach 1.1)
  const K = { amb: .94, pow: .54, lz: .19, warm: 0, shadow: .25, spec: 0, reach: 1.87, sway: +(Q.get("rla") || .25), spd: +(Q.get("rls") || 1) };   // sway/spd — 16.10 16:09 телефон: качание света у места покоя
  // 19.10 11:43 Антон: «прям точка при свечении не очень нравится» — горячее ядро под мышью: свет висел на высоте .19, а рельеф лица (скула) до .22 —
  // лампа почти лежала на коже и давала острый пик. Теперь свет выше рельефа, спад задаёт дальность (reach), светлое не выгорает (мягкий потолок knee).
  // Варианты ?pl= (страница задаёт свой по умолчанию — <html data-pl="…">; без него — как было). Прибавка света у мыши · в 110 px · в 275 px · в 425 px (1920, щека):
  // 0 — как было 16.10: 1.35 · 1.04 · 0.97 · 0.98, ядро, 53 выгоревших пикс. · 1 — 1.24 · 1.20 · 1.07 · 0.98 · 2 — 1.21 · 1.19 · 1.09 · 0.98 (чуть шире и тише) · 3 — 1.23 · 1.21 · 1.13 · 1.00 (самый широкий)
  const PL = { 0: {}, 1: { lz: .45, pow: .9, reach: .35, knee: .8 }, 2: { lz: .52, pow: 1.1, reach: .35, knee: .8 }, 3: { lz: .6, pow: 1.3, reach: .4, knee: .8 } };
  Object.assign(K, { knee: 1 }, PL[Q.get("pl") || document.documentElement.dataset.pl || 0] || {});
  const C = document.createElement("canvas");
  C.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;opacity:0;transition:opacity .9s ease";
  const gl = C.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return;
  // 21.10 08:28 Антон «глюкануло»: на десктопе вместо портрета — серый силуэт (у меня не повторилось). Страховка: видеокарта отняла контекст —
  // холст убираем, под ним снова обычный портрет-картинка (фон элемента), без серой маски
  C.addEventListener("webglcontextlost", e => { e.preventDefault(); C.remove(); host.style.backgroundImage = ""; console.warn("relight: контекст WebGL потерян — обычный портрет"); });

  const VS = `attribute vec2 p; varying vec2 uv; void main(){ uv = vec2(p.x*.5+.5, .5-p.y*.5); gl_Position = vec4(p,0.,1.); }`;
  const FS = `precision mediump float;
  varying vec2 uv;
  uniform sampler2D tC, tN;
  uniform vec3 uL;          // свет: x,y в ширинах картинки (y вниз), z — высота над плоскостью
  uniform float uAsp, uAmb, uPow, uWarm, uSh, uSpec, uRelief, uReach, uKnee;
  vec3 P(vec2 q){ return vec3(q.x, q.y*uAsp, texture2D(tN, q).b*uRelief); }
  void main(){
    vec4 c = texture2D(tC, uv);
    if (c.a < .003) { gl_FragColor = vec4(0.); return; }
    vec4 nd = texture2D(tN, uv);
    vec2 nxy = nd.rg*2.-1.;
    vec3 n = vec3(nxy, sqrt(max(1.-dot(nxy,nxy), 0.)));
    vec3 p = P(uv);
    vec3 Lv = uL - p; float dist = length(Lv); vec3 l = Lv/dist;
    float lam = max(dot(n,l), 0.);
    // мягкая тень: шаги от точки к свету по карте высот
    float vis = 1.;
    vec2 dir = (uL.xy - p.xy); float len2 = length(dir);
    if (uSh > 0. && len2 > .001) {
      vec2 st = dir / len2; float slope = (uL.z - p.z) / len2;
      for (int i = 1; i <= 14; i++) {
        float t = float(i) * .018;
        if (t > len2) break;
        vec2 q = p.xy + st*t; q.y /= uAsp;
        if (q.x < 0. || q.x > 1. || q.y < 0. || q.y > 1.) break;
        float hh = texture2D(tN, q).b*uRelief;
        float ray = p.z + slope*t;
        vis = min(vis, clamp(1. - (hh - ray) * 18. / (1. + t*6.), 0., 1.));
      }
      vis = mix(1., vis, uSh);
    }
    float att = 1. / (1. + pow(dist / uReach, 2.) * 2.2);
    vec3 warm = mix(vec3(1.), vec3(1., .80, .56), uWarm);
    vec3 h = normalize(l + vec3(0.,0.,1.));
    float sp = pow(max(dot(n,h),0.), 28.) * uSpec * vis * att;
    vec3 lit = vec3(uAmb) + warm * (lam * vis * att * uPow);
    vec3 o = c.rgb * lit + warm * sp * c.a;
    if (uKnee < 1.) { vec3 e = max(o - uKnee * c.a, 0.); o = min(o, vec3(uKnee * c.a)) + (1. - uKnee) * c.a * (1. - exp(-e / max((1. - uKnee) * c.a, .001))); }   // мягкий потолок: светлое не выгорает в белое
    gl_FragColor = vec4(o, c.a);
  }`.replace("gl_FragColor = vec4(o, c.a);", Q.get("rltest") === "flat" ? "gl_FragColor = vec4(vec3(.8) * c.a, c.a);" : "gl_FragColor = vec4(o, c.a);");   // ?rltest=flat — приманка для проверки: ровная серая заливка
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o);
    if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  const pr = gl.createProgram();
  try { gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); } catch (e) { console.warn("relight:", e); return; }
  gl.linkProgram(pr); gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aP = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ["tC","tN","uL","uAsp","uAmb","uPow","uWarm","uSh","uSpec","uRelief","uReach","uKnee"].forEach(k => U[k] = gl.getUniformLocation(pr, k));

  // 21.10 15:03 Антон: «каждый раз при первой загрузке» серый силуэт вместо портрета → картинку сначала полностью декодируем, потом в текстуру
  const load = (src, unit, premul) => new Promise((ok, no) => { const im = new Image(); im.onload = () => (im.decode ? im.decode() : Promise.resolve()).catch(() => {}).then(() => {
    const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premul);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(w => gl.texParameteri(gl.TEXTURE_2D, w, gl.CLAMP_TO_EDGE));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    ok(im); }); im.onerror = no; im.src = src; });

  const base = (document.currentScript && document.currentScript.src) ? new URL(".", document.currentScript.src).href : "";
  const RELIEF = .22, ASP = 983 / 1080;
  // 21.10 скорость: карта глубины (195 КБ) и свет — после загрузки страницы, первый экран рисуется без них (до того виден обычный портрет)
  const after = f => document.readyState === "complete" ? f() : addEventListener("load", f, { once: true });
  after(() => Promise.all([load(base + "portrait.webp", 0, true), load(base + (Q.get("map") === "s" ? "relight/ndepth-small.png" : "relight/ndepth.webp"), 1, false)]).then(() => {
    gl.uniform1i(U.tC, 0); gl.uniform1i(U.tN, 1); gl.uniform1f(U.uAsp, ASP); gl.uniform1f(U.uRelief, RELIEF);
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    host.append(C);   // фон-картинку снимаем, когда холст проявился: пока он гаснет-проявляется, под ним обычный портрет
    C.addEventListener("transitionend", () => { host.style.backgroundImage = "none"; }, { once: true });
    start();
  }).catch(e => console.warn("relight: textures", e)));

  // ── свет: цель от курсора/пальца, плавное догоняние; без ввода — медленная орбита
  // 16.10 16:04 Антон: на телефоне при загрузке «отстойная точка» — свет стартовал внутри портрета и полз к орбите.
  // Телефон (нет наведения): свет стоит за правым краем кадра, без орбиты; палец ведёт, потом свет возвращается. ?rlm=orbit — как было.
  const REST = matchMedia("(hover: none)").matches && Q.get("rlm") !== "orbit" ? { x: 1.1, y: .25 } : null;
  const L = REST ? { ...REST } : { x: .2, y: .25 }, T = { ...L };
  let lastInput = -1e9, visible = true, raf = 0, shown = false;
  const toLocal = (cx, cy) => { const r = C.getBoundingClientRect(); return { x: (cx - r.left) / r.width, y: (cy - r.top) / r.width }; };
  const aim = (cx, cy) => { const q = toLocal(cx, cy); T.x = q.x; T.y = q.y; lastInput = performance.now(); kick(); };
  addEventListener("pointermove", e => { if (e.pointerType === "mouse") aim(e.clientX, e.clientY); }, { passive: true });
  addEventListener("touchstart", e => aim(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  addEventListener("touchmove", e => aim(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) kick(); }).observe(host);

  function size() {
    const r = host.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.min(Math.round(r.width * dpr), 1080), h = Math.round(w * ASP);
    if (C.width !== w || C.height !== h) { C.width = w; C.height = h; gl.viewport(0, 0, w, h); }
  }
  function frame(now) {
    raf = 0; if (!visible || dead) return;
    const idle = now - lastInput > 2500;
    if (idle) { if (REST) { const t = now / 1000 * K.spd; T.x = REST.x - K.sway * (.5 + .5 * Math.sin(t * .45)); T.y = REST.y + K.sway * .9 * Math.sin(t * .31); } else { const t = now / 1000; T.x = .5 + .62 * Math.cos(t * .23); T.y = .3 + .16 * Math.sin(t * .31); } }
    const k = idle ? .03 : .09;
    L.x += (T.x - L.x) * k; L.y += (T.y - L.y) * k;
    size();
    gl.uniform3f(U.uL, L.x, L.y, K.lz);
    gl.uniform1f(U.uAmb, K.amb); gl.uniform1f(U.uPow, K.pow); gl.uniform1f(U.uWarm, K.warm);
    gl.uniform1f(U.uSh, K.shadow); gl.uniform1f(U.uSpec, K.spec); gl.uniform1f(U.uReach, K.reach); gl.uniform1f(U.uKnee, K.knee);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // плавное проявление вместо рывка — но только когда портрет реально нарисован: первые кадры после загрузки текстуры бывают ровной заливкой
    // (у нас чёрной, у Антона — серой, 15:03 «каждый раз при первой загрузке»); ждём до 40 кадров, не дорисовался — обычная картинка
    if (!shown) { const v = sane();
      if (v === "ok") { shown = true; requestAnimationFrame(() => { C.style.opacity = "1"; }); }
      else if (++tries < 40) kick();
      else { dead = true; console.warn("relight: портрет так и не нарисовался — обычная картинка"); C.remove(); host.style.backgroundImage = ""; return; } }
    if ((idle && (!REST || K.sway > 0)) || Math.abs(T.x - L.x) + Math.abs(T.y - L.y) > .001) kick();
  }
  function kick() { if (!raf && visible) raf = requestAnimationFrame(frame); }
  // проверка кадра: 7×7 точек в середине холста; у живого портрета яркость в силуэте разная (лицо, волосы, тень), у сбоя — одна на всех
  let tries = 0, dead = false;
  function sane() { const w = C.width, h = C.height, px = new Uint8Array(4), L = [];
    for (let i = 1; i <= 7; i++) for (let j = 1; j <= 7; j++) { gl.readPixels(Math.round(w * (.15 + .7 * i / 8)), Math.round(h * (.2 + .7 * j / 8)), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
      if (px[3] > 200) L.push((px[0] + px[1] + px[2]) / 3); }
    if (L.length < 8) return "wait";
    const m = L.reduce((a, c) => a + c, 0) / L.length, sd = Math.sqrt(L.reduce((a, c) => a + (c - m) ** 2, 0) / L.length);
    if (Q.has("rldbg")) console.log("relight: проверка", L.length, m.toFixed(1), sd.toFixed(1));
    return sd < 6 ? "wait" : "ok"; }
  function start() { kick(); if (Q.has("rlui")) ui(); }

  // ── ?rlui — ручки для подбора на лету
  function ui() {
    const names = { amb: ["тень", 0, 1], pow: ["сила", 0, 3], lz: ["высота", .05, 1], warm: ["тепло", 0, 1], shadow: ["тени", 0, 1], spec: ["блик", 0, 1], reach: ["дальность", .3, 3], sway: ["качание", 0, .6], spd: ["скорость", 0, 3] };
    const p = document.createElement("div");
    p.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:99;width:260px;padding:10px 12px;background:rgba(24,24,24,.94);border:1px solid rgba(203,184,143,.5);color:#e6e5e1;font:12px/1.2 Jost,sans-serif";
    for (const k in names) {
      const [lab, lo, hi] = names[k], row = document.createElement("label");
      row.style.cssText = "display:grid;grid-template-columns:64px 1fr 34px;gap:8px;align-items:center;margin:4px 0";
      row.innerHTML = `<span>${lab}</span><input type="range" min="${lo}" max="${hi}" step=".01" value="${K[k]}" style="accent-color:#cbb88f"><b style="font-weight:400;color:#cbb88f;text-align:right">${K[k]}</b>`;
      row.querySelector("input").oninput = e => { K[k] = +e.target.value; row.querySelector("b").textContent = K[k]; kick(); };
      p.append(row);
    }
    document.body.append(p);
  }
})();
