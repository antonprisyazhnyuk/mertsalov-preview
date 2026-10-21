/* 20.10 11:30 · движение ленты «Мой путь» v3 по рефам (разбор — design/path-motion-2010.md).
   Всё привязано к прокрутке, таймеров нет. Подсказку и счётчик внизу (Büro) сняла 11:57: Антон отклонял их 06:58 («счётчик и подписи»).
   ≥1024: ход ленты догоняет колесо (≈0.1 за кадр, как Lenis у Büro и Locomotive у Venus) · острова едут с разной скоростью (параллакс ±3–6 %,
   не ближе половины зазора до соседа) · работы и ролики открываются маской слева направо и садятся с увеличения, изображение плывёт внутри рамки (Venus) ·
   фразы и цитаты выезжают по строкам из-под маски (Büro) · линия времени тянется от года к году по ходу колеса (конец линии — середина окна),
   год зажигается, когда линия до него дошла · «Сейчас» приезжает на своей поверхности прямым краем (Venus EPOCHS).
   Уже 1024 — только классы для лёгкого проявления (path-motion-2010.css). «Уменьшить движение» и ?motion=0 — этот файл ничего не делает. */
(() => {
  const sec = document.querySelector('.path[data-v="v3"]'); if (!sec) return;
  const RM = matchMedia("(prefers-reduced-motion: reduce)");
  if (RM.matches || new URLSearchParams(location.search).get("motion") === "0") return;
  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const out3 = t => 1 - (1 - t) ** 3;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;   // 21.10: отъезд вступления — плавно с обоих концов                       // power3.out — кривая строк у Büro и Venus
  const put = (el, k, v) => { const c = el.__mo || (el.__mo = {}); if (c[k] !== v) { c[k] = v; el.style[k] = v; } };
  const FACT = { img: 1, vid: 1, big: 1.04, q: 1.06, sm: .96, aw: 1, end: 1, go: 1 };   // заголовок и стрелка конца стоят на оси, куда приходит линия — без параллакса   // скорость слоя относительно ленты
  const PDELAY = Math.max(0, +(new URLSearchParams(location.search).get("pdelay") ?? 900) || 0);   // пауза между «Мой путь» и вехой 2002, мс
  const GSPEED = Math.max(20, +(new URLSearchParams(location.search).get("gspeed") ?? 700) || 700);   // px кадра/с: отрезок год → год (840–1260) за 1.2–1.8 с
  let gdt = 1 / 60;
  const glide = (g, tip, far) => { if (g === null || tip <= g) return tip; g = Math.max(g + GSPEED * S * gdt, tip - far); return Math.min(g, tip); };
  const TEXT = ["v3-big", "v3-q", "v3-sm", "v3-end", "v3-ttl"];
  // 21.10 14:25 Антон (раскадровка 210:1482): «сначала кружок по центру с подписью — Коля проговаривает всю фразу — потом отъезжает влево, и дальше по накатанной»
  // intro: "center" — круг и «Мой путь» по центру окна (ось 960), лента стоит; приветствие договорило (ended) или человек крутит вперёд (не ждём молча 12 с) →
  // "move" — 0.9 с отъезд на свои места (круг 121, «Мой путь» 120) → дальше веха 2002 по времени, как было. Один раз за загрузку: вернулся — уже по местам.
  // 14:39 Антон: на входе по центру только круг (+ подсказка звука); «Мой путь» проявляется на своём месте после отъезда, за ним — таймлайн (2002)
  const MOVE = 900, DXC = 526, DXT = 0;   // сдвиг круга к центру, px кадра (центр 434.5 → 960.5); заголовок не едет
  let intro = RM.matches ? "done" : "wait", mv0 = 0, bpT0 = null, tT0 = null, greetV = null, usedIntro = false;
  const startMove = now => { if (intro !== "center") return; intro = "move"; if (sec.v3hintGone) sec.v3hintGone(); mv0 = now; tT0 = now + MOVE * .55; bpT0 = now + MOVE + 700; kick(); };
  let glH = null, glV = null, gpH = null, gpV = null, GWd = 280, arrived = false, endShone = false, tl = 0, K = 1, S = 1, M = 0, TY = 0, finX = 0, warm = null, it0 = null, bp = 0, hp = 0, items = [], line = null, lineL = 0, lineW = 1, years = [], trackW = 0, wide = false, cur = 0, last = 0, raf = 0, still = 0, n = 0;

  // слова в маски: <span class="mw"><span class="mi">слово</span></span>; ссылки внутри остаются ссылками
  const split = el => {
    if (el.__split) return; el.__split = 1;
    const walk = node => [...node.childNodes].forEach(ch => {
      if (ch.nodeType === 3) {
        const f = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach(t => { if (!t) return; if (/^\s+$/.test(t)) { f.appendChild(document.createTextNode(t)); return; }
          const w = document.createElement("span"); w.className = "mw"; const i = document.createElement("span"); i.className = "mi"; i.textContent = t; w.appendChild(i); f.appendChild(w); });
        ch.replaceWith(f);
      } else if (ch.nodeType === 1 && !ch.classList.contains("mw")) walk(ch);
    });
    walk(el);
  };

  const build = () => {
    wide = sec.classList.contains("v3-wide");
    sec.dataset.motion = wide ? "1" : ""; sec.classList.add("mo"); sec.classList.toggle("mo-on", wide);
    items = []; years = []; line = null;
    const track = sec.querySelector(".v3-track"), stage = sec.querySelector(".v3-stage");
    if (!wide || !track) return;
    // 12:31 Антон: «Сейчас» без своей панели и шва — к последнему экрану фон плавно теплеет слева направо (переход на ширину экрана),
    // тёплый оттенок прозрачный — зерно остаётся; к низу сцены сходит на нет, стык с блоком ниже без смены цвета. ?warm=0 — общий фон без тепла
    stage.querySelectorAll(".v3-warm").forEach(w => w.remove()); warm = null;
    if (new URLSearchParams(location.search).get("warm") !== "0") { warm = document.createElement("div"); warm.className = "v3-warm"; warm.setAttribute("aria-hidden", "true"); stage.prepend(warm); }
    const F = sec.v3fitFn ? sec.v3fitFn() : { k: 1, ty: 0, s: innerWidth / 1920 }; K = F.k; TY = F.ty; S = F.s; M = Math.max(0, (innerWidth - 1920 * S) / 2);   // 12:37: лента мельче окна — каждый экран кадра встаёт по центру (поля M слева и справа)   // 12:23: лента вписана под шапку — все x в экранных px (× K)
    line = track.querySelector(".v3-line");
    greetV = track.querySelector(".v3-greet video");
    if (greetV) greetV.addEventListener("ended", () => startMove(performance.now()));
    // 14:14 Антон: «лёгкий отблеск по линии, когда она рисуется, как на ховере у кнопки» — блик 60 px (кнопка «Записаться»: белый, пик .95, полоса 60 px) едет на кончике
    // 21.10 08:22 Антон: блик «топорный, сильно концентрированный, по годам проходит линией, а не переливом» → свет идёт по самой линии (фон отрезков и вертикали,
    // как перелив по рамке кнопки): мягкая полоса GWd = 280 px кадра с плавным краем с обеих сторон; по цифрам года и «Дальше — твоя история» — та же ширина
    glH = glV = null; gpH = gpV = null; GWd = 280 * S;
    sec.querySelectorAll(".v3-glint").forEach(g => g.remove());
    if (line && !RM.matches) { glH = line; line.style.setProperty("--gw", (GWd / K).toFixed(1) + "px"); }
    const dn0 = sec.querySelector(".v3-down"); if (dn0 && !RM.matches) { glV = dn0; dn0.style.setProperty("--gw", GWd.toFixed(1) + "px"); }
    sec.style.setProperty("--gwt", GWd.toFixed(1) + "px");
    if (line) { lineL = line.offsetLeft * K; lineW = (line.offsetWidth || 1) * K; }
    const els = [...track.querySelectorAll(".v3-b > *:not(.v3-y), .v3-head > *")];   // 12:34: «Смотреть со звуком» входит вместе с «Мой путь»
    els.forEach(el => { if (TEXT.some(c => el.classList.contains(c)) || el.classList.contains("v3-snd")) split(el); });
    trackW = track.offsetWidth * K; const b1 = track.querySelector(".v3-b");
    const R = els.map(el => ({ el, x: el.offsetLeft * K, y: el.offsetTop, w: el.offsetWidth * K, h: el.offsetHeight }));
    R.forEach(r => {
      const el = r.el, k = (el.className.match(/v3-(img|vid|big|q|sm|aw|end|go|ttl|snd)/) || [])[1];
      const media = k === "img" || k === "vid", head = !!el.closest(".v3-head");
      // скорость слоя; маленький ролик рядом с работой — дальний план; подпись или награда под работой — едет с работой
      let f = FACT[k] || 1;
      if (k === "vid" && r.w > 300) f = 1;
      if (k === "vid" && el.classList.contains("round")) f = FACT.img || 1;   // 21.10: кружок Коли стоит низом/верхом по работе — едет с работой, не дальним планом
      const anchor = R.find(o => o !== r && /v3-(img|vid)/.test(o.el.className) && Math.abs(o.x - r.x) < 4 && o.el.parentElement === el.parentElement);
      if ((k === "aw" || k === "sm") && anchor) f = FACT[(anchor.el.className.match(/v3-(img|vid)/) || [])[1]] || 1;
      if (head) f = 1;
      // 13:23 Антон «год съехал»: элемент, стоящий на оси своего года (левым краем или серединой), едет со скоростью линии — всегда на оси
      const yl = el.parentElement && el.parentElement.querySelector(":scope > .v3-y"), axx = yl ? +yl.dataset.ax * S : NaN;
      if (Math.abs(r.x - axx) < 6 || Math.abs(r.x + r.w / 2 - axx) < 6) f = 1;
      if ((k === "aw" || k === "sm") && anchor && (Math.abs(anchor.x - axx) < 6)) f = 1;
      // зазор до соседей по высоте — параллакс не съедает больше половины (острова не налезают друг на друга)
      let gl = 1e9, gr = 1e9;
      R.forEach(o => { if (o === r || o.y > r.y + r.h || o.y + o.h < r.y) return; if (o.x + o.w <= r.x) gl = Math.min(gl, r.x - o.x - o.w); else if (o.x >= r.x + r.w) gr = Math.min(gr, o.x - r.x - r.w); });
      const it = { el, k, x: r.x, w: r.w, f, home: r.x + 1 >= trackW - 1920 * S ? trackW - innerWidth + M : Math.floor((r.x + 1) / (1920 * S)) * 1920 * S - M, gl: gl * .45, gr: gr * .45, head, b1: el.parentElement === b1, media, inner: media ? el.querySelector("img,video") : null,
        st: el.querySelector(".v3-as"), hd: el.querySelector(".v3-ah"), a: el.querySelector("a"),
        cut: !!el.querySelector("video.cut"), ln: TEXT.some(c => el.classList.contains(c)) || k === "snd" ? [...el.querySelectorAll(".mi")] : null,
        B: 13 * parseFloat(getComputedStyle(el).fontSize) / 80 };   // 12:46 Антон «как и везде»: тексты — из размытия, как фраза экрана 2 (эффект blur в gal-3d-1810.js: размытие 13 px при кегле 80)
      items.push(it);
    });
    track.querySelectorAll(".v3-y").forEach(y => { years.push({ el: y, x: y.offsetLeft * K, w: y.offsetWidth * K, t: y.textContent }); });
    const fin = track.querySelector(".v3-end"); finX = fin ? fin.offsetLeft * K : 0;
    cur = target(); last = 0; still = 0; go();
  };

  // 12:11 Антон: в конце ленты — хвост прокрутки (0.8 экрана), лента уже стоит: линия доехала → проявляется «Дальше — твоя история» → растёт стрелка вниз
  const TAIL = () => innerHeight * .8;
  const prog = b => { const tail = wide ? TAIL() : 0, lane = Math.max(1, b.height - innerHeight - tail); return [clamp(-b.top / lane), tail ? clamp((-b.top - lane) / tail) : 0]; };
  const target = () => { const t = sec.querySelector(".v3-track"); if (!t) return 0; return -M + prog(sec.getBoundingClientRect())[0] * (t.offsetWidth * K - innerWidth + 2 * M); };


  const frame = now => {
    raf = 0;
    if (!wide) return;
    const track = sec.querySelector(".v3-track"); if (!track) return;
    const vw = innerWidth, vh = innerHeight, b = sec.getBoundingClientRect(), [pl, pt] = prog(b), cEnd = trackW - vw + M; let tgt = -M + pl * (trackW - vw + 2 * M);   // ход от «экран 1 по центру» до «экран 8 по центру»
    const dt = last ? Math.min(.05, (now - last) / 1000) : 1 / 60; last = now;
    gdt = dt;
    // 12:34 / 13:17 Антон: при любом приходе на экран 3 сначала «Мой путь» и «Смотреть со звуком» (0.7 с), через ?pdelay мс — веха 2002 (1.1 с);
    // пока пауза не прошла — лента вбок не едет и колесо вперёд не крутит страницу. Ушёл назад на экран 2 — вход повторится
    if (b.top > vh * .6) { it0 = null; hp = 0; bp = 0; if (intro === "center") intro = "wait"; }
    else if (it0 === null && b.top <= 2) {
      if (b.top < -vh * .5) { it0 = now - 1e5; if (intro !== "done") intro = "done"; bpT0 = it0; tT0 = it0; }   // пришёл сразу вглубь ленты (якорь, полоса прокрутки) — без входа
      else { it0 = now; if (b.top < -1) scrollTo({ top: scrollY + b.top, behavior: "instant" });   // перелёт колеса — назад к верху экрана 3
        if (intro === "wait") { intro = "center"; usedIntro = true; if (greetV) { try { greetV.currentTime = 0; } catch (e) {} } setTimeout(() => startMove(performance.now()), 15000); }   // страховка: ролик не заиграл — через 15 с всё равно отъезд
        else { bpT0 = now + 700 + PDELAY; tT0 = now; } }
    }
    if (held(now)) { tgt = -M;               // пауза: лента стоит, страница держится у верха экрана 3 (инерция колеса и плавная прокрутка клавиш не уносят)
      if ((b.top < -1 && b.top > -vh * .5) || (b.top > 1 && b.top < 48)) scrollTo({ top: scrollY + b.top, behavior: "instant" }); }   // недолёт до 48 px тоже доводится (назад колесом — уходит)
    if (it0 !== null) { const t = now - it0; hp = out3(clamp(t / 700)); bp = bpT0 === null ? 0 : out3(clamp((now - bpT0) / 1100)); }
    // вступление: круг и «Мой путь» стоят по центру, во время отъезда — едут на свои места
    let ik = 1; if (intro === "center" || intro === "wait") ik = 0; else if (intro === "move") { ik = ease(clamp((now - mv0) / MOVE)); if (ik >= 1) intro = "done"; }
    const dxk = 1 - ik, tp = tT0 === null ? 0 : out3(clamp((now - tT0) / 900));
    sec.classList.toggle("intro-c", intro === "center" || intro === "wait");
    cur += (tgt - cur) * (1 - Math.exp(-dt * 6.6));            // ≈ 0.105 за кадр при 60 к/с — мягко и без «залипания»: страница крутится родным ходом
    if (Math.abs(tgt - cur) < .3) cur = tgt;
    tl += (pt - tl) * (1 - Math.exp(-dt * 6.6)); if (Math.abs(pt - tl) < .001) tl = pt;   // ход хвоста — той же мягкой кривой
    const atEnd = cur >= cEnd - 1;
    put(track, "transform", `translate3d(${(-cur).toFixed(1)}px,${TY.toFixed(1)}px,0) scale(${K.toFixed(5)})`);
    // вход секции снизу: первый экран ленты проявляется, пока секция поднимается
    const ev = clamp((vh - b.top) / (vh * .75));
    items.forEach(it => {
      const sx = it.x - cur, cx = sx + it.w / 2;
      if (sx > vw * 1.25 || sx + it.w < -vw * .25) return;      // далеко за кадром — не трогаем
      let eh = clamp((vw * .98 - sx) / (vw * .36));
      if (it.k === "end") { eh = atEnd ? clamp((tl - .04) / .4) : 0;   // заголовок — после доезда линии, по строкам из маски
        if (eh > .85 && !endShone && !RM.matches) { endShone = true; it.el.classList.remove("v3-shine"); void it.el.offsetWidth; it.el.classList.add("v3-shine"); }   // блик по буквам один раз
        if (eh < .05) { endShone = false; it.el.classList.remove("v3-shine"); } }
      const e = it.head ? (it.k === "ttl" ? tp : hp) : it.b1 ? bp : Math.min(eh, ev), ee = out3(e);
      if (it.head && (it.k === "vid" || it.k === "ttl")) put(it.el, "translate", `${((it.k === "vid" ? DXC : DXT) * dxk / 16).toFixed(3)}rem ${(it.el.__dy || 0).toFixed(1)}px`);   // вступление: по центру → на место; y-сдвиг вписывания (fit) сохраняется — 14:31 Антон: «Мой путь» уходил под край на окне ниже 1080   // веха 2002 стоит на первом экране — её вход только по времени
      // 12:37: параллакс считается от «дома» элемента — положения, когда его экран кадра стоит по центру; в покое на первом и последнем экране всё точно по кадру
      const rel = cur - it.home, off = clamp(-rel * (it.f - 1), -it.gl, it.gr);
      if (it.f !== 1) put(it.el, "translate", `${(off / K).toFixed(1)}px ${(it.el.__dy || 0).toFixed(1)}px`);   // 13:20: y-сдвиг вписывания (path-v3.js fit) сохраняется
      if (it.media) {                                          // маска открывается по ходу въезда + картинка садится с увеличения и плывёт внутри рамки
        put(it.el, "clipPath", ee >= .999 ? "none" : `inset(0 ${((1 - ee) * 100).toFixed(2)}% 0 0)`);
        const s = (1.06 + .08 * (1 - ee)) * (it.cut ? 1.12 : 1), d = clamp(rel / (vw / 2), -1.2, 1.2) * it.w * .024;
        if (it.inner) put(it.inner, "transform", `translate3d(${(d / K).toFixed(1)}px,0,0) scale(${s.toFixed(4)})`);
      } else if (it.k === "go") {                              // стрелка: стержень растёт вниз от заголовка, в конце — наконечник, потом качается
        const ps = atEnd ? out3(clamp((tl - .5) / .38)) : 0, ph = atEnd ? clamp((tl - .86) / .1) : 0;
        put(it.st, "transform", `scaleY(${ps.toFixed(4)})`); put(it.hd, "opacity", ph.toFixed(3)); it.a.classList.toggle("done", ph >= 1);
        put(it.el, "visibility", ps > 0 ? "visible" : "hidden");
      } else if (it.ln) {                                      // по словам из размытия: слово 0.5, шаг 0.04 (доли хода), кривая sine — как фраза экрана 2
        const T = (it.ln.length - 1) * .04 + .5;
        it.ln.forEach((w, i) => { const t = Math.sin(clamp((e * T - i * .04) / .5) * Math.PI / 2);
          if (t >= .999) { put(w, "opacity", "1"); put(w, "transform", "none"); put(w, "filter", "none"); return; }
          put(w, "opacity", t.toFixed(3)); put(w, "transform", `skewX(${(-20 * (1 - t)).toFixed(2)}deg)`); put(w, "filter", `blur(${(it.B * (1 - t)).toFixed(2)}px)`); });
      } else {                                                 // награды, кнопка — прозрачность и подъём
        put(it.el, "opacity", ee.toFixed(3)); put(it.el, "transform", ee >= .999 ? "none" : `translate3d(0,${((1 - ee) * 1.5).toFixed(3)}rem,0)`);
      }
    });
    // 12:02 Антон «лента должна от года ехать к году» — про линию: конец линии = ход ленты (середина окна); линия тянется от года к году по колесу,
    // назад убирается; отрезок впереди не виден. Год зажигается, когда линия до него дошла (первый — с начала)
    const end = Math.max(cur - cEnd + finX, lineL + bp * (vw - M - lineL));   // со входом 2002 — начало линии от 2002 до края первого экрана   // кончик линии — там, где в конце ленты встаёт заголовок (при 1920×1080 — середина окна)
    if (line) put(line, "clipPath", `inset(0 ${((1 - clamp((end - lineL) / lineW)) * 100).toFixed(3)}% 0 0)`);   // дорисовка обрезкой — зазоры у годов не плывут
    // 15:19 Антон «перелив ещё медленнее, как на ховерах кнопок»: блик идёт своей скоростью ?gspeed (px кадра в секунду) по уже нарисованной линии,
    // отстаёт, сколько отстанет; линия встала — доходит до кончика и гаснет; отстал больше чем на экран — перескакивает вперёд; назад кончик не обгоняет
    if (glH) { const tip = clamp(end - lineL, 0, lineW); gpH = glide(gpH, tip, vw);
      if (tip - gpH < .5) gpH = tip; glH.style.setProperty("--gx", ((gpH - GWd) / K).toFixed(1) + "px"); glH.classList.toggle("gl", tip - gpH > 3);
      // 15:20 Антон «и цифры годов тоже должны переливаться»: блик, проходя год, переливается по его цифрам (полоса той же ширины, слева направо)
      const gc = lineL + gpH - GWd, gOn = tip - gpH > 3;   // левый край полосы
      years.forEach(y => { const gx = gc - (y.x - y.w / 2), v = gOn && gx > -GWd && gx < y.w ? gx.toFixed(1) + "px" : "-999px";
        if (y.el.__gx !== v) { y.el.__gx = v; y.el.style.setProperty("--gx", v); } }); }
    // 12:09 Антон «год съехал»: года впереди не видно — он появляется, когда линия подходит к нему (последние 0.5rem + 2rem), на годе — полностью; первый — с начала
    years.forEach((y, i) => { const p = i === 0 ? bp : out3(clamp((end - y.x + y.w / 2 + 40) / (y.w / 2 + 40)));
      put(y.el, "opacity", p.toFixed(3)); put(y.el, "transform", `translate(-50%, calc(-50% + ${((1 - p) * .25).toFixed(3)}rem))`); });
    // «Сейчас» — панель наезжает быстрее ленты (≈1.5×) и встаёт на место
    if (warm) { const w0 = trackW - 1920 * S - cur, wa = (w0 - 1920 * S).toFixed(0) + "px", wb = w0.toFixed(0) + "px";   // тепло: от экрана перед последним до начала последнего
      if (warm.__w !== wa) { warm.__w = wa; warm.style.setProperty("--wa", wa); warm.style.setProperty("--wb", wb); } }
    if (++n % 4 === 0 || cur === tgt) sec.v3tick && sec.v3tick();   // ролики: играть то, что в кадре
    // линия вниз от заголовка: по хвосту растёт от заголовка до низа окна, дальше прокрутка страницы дорисовывает её до шагов
    let dnL = 0;
    const dn = sec.querySelector(".v3-down"); if (dn && !dn.hidden) { const r = dn.getBoundingClientRect(), L = clamp((vh * .65 - r.top) * clamp((tl - .5) / .4), 0, r.height);   // 13:50 Антон «слишком быстро рисуется»: кончик идёт за взглядом — на 65 % высоты окна, растёт ровно со скоростью прокрутки
      dnL = L;
      put(dn, "clipPath", `inset(0 0 ${Math.max(0, r.height - L).toFixed(1)}px 0)`);
      if (glV) { gpV = glide(gpV, L, vh); if (L - gpV < .5) gpV = L;
        glV.style.setProperty("--gy", (gpV - GWd).toFixed(1) + "px"); glV.classList.toggle("gl", L - gpV > 3); }
      // блик сам дошёл до ромба — передаётся раме анкеты: событие line:arrive на #form-top (раму рисует merts-form)
      const ft = document.getElementById("form-top"), inD = r.height > 0 && L >= r.height - .5 && (!glV || gpV >= r.height - 1);
      if (inD && !arrived && ft) ft.dispatchEvent(new Event("line:arrive", { bubbles: true })); arrived = inD;
      // линия дошла до ромба — знак для рамы анкеты (merts-form): html.path-down-done + событие path:down на document
      const done = r.height > 0 && L >= r.height - .5; if (done !== dn.__done) { dn.__done = done; document.documentElement.classList.toggle("path-down-done", done); document.dispatchEvent(new CustomEvent("path:down", { detail: { done } })); } }
    if (intro === "move" || (tT0 !== null && now - tT0 < 950) || cur !== tgt || tl !== pt || (it0 !== null && bp < 1) || (glH && gpH !== null && Math.abs(clamp(end - lineL, 0, lineW) - gpH) > .5) || (glV && gpV !== null && dnL - gpV > .5)) go(); else if (still++ < 2) go();            // доехала — ещё пара кадров и стоп
  };
  const go = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const kick = () => { still = 0; go(); };

  // пауза входа: колесо и клавиши вперёд не двигают страницу, пока «Мой путь» не постоял ?pdelay
  // держим ленту: пока круг по центру и пока отъезжает; без вступления — прежняя пауза «Мой путь» → 2002 (?pdelay)
  function held(now) { return it0 !== null && (intro === "center" || intro === "move" || (bpT0 !== null && now < bpT0 && (usedIntro || now - it0 < 700 + PDELAY + 50))); }
  const locked = () => wide && held(performance.now()) && sec.getBoundingClientRect().top > -innerHeight * .5;
  // крутит вперёд, пока Коля говорит, — не ждём: отъезд сразу (шаг колеса съедается, лента не прыгает)
  addEventListener("wheel", e => { if (e.deltaY > 0 && locked()) { e.preventDefault(); if (intro === "center" && performance.now() - it0 > 700) startMove(performance.now()); } }, { passive: false });
  addEventListener("keydown", e => { if (locked() && ["ArrowDown", "PageDown", "End", " "].includes(e.key) && !e.shiftKey) { e.preventDefault(); if (intro === "center") startMove(performance.now()); } });
  sec.addEventListener("v3:build", build);
  addEventListener("scroll", kick, { passive: true });
  addEventListener("resize", () => { if (wide) build(); });
  RM.addEventListener("change", () => location.reload());
  build();
})();
