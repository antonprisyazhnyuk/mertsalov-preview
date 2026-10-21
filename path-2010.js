/* 20.10 · экран 3 «Мой путь» — варианты ?path=a24 (по умолчанию) | freshman | loco | buro (стили path-2010.css).
   Десктоп: наведение на строку — кадр/ролик вехи (a24 — квадрат справа, freshman — два окна у краёв, loco — кадр раскрывается между словами строки; buro — не наведение, а лента вбок от прокрутки).
   Телефон: тап по строке — кадр под строкой, открыта одна. Ролики без звука, грузятся только при показе. */
(() => {
  const sec = document.querySelector(".path"); if (!sec) return;
  const V = ["v3", "a24", "freshman", "buro", "loco"], q = new URLSearchParams(location.search).get("path");
  const v = V.includes(q) ? q : "v3"; sec.dataset.v = v;   // 20.10 09:19: по умолчанию — v3 по кадру Антона (path-v3.js)
  const rows = [...sec.querySelectorAll(".pl li")], DESK = matchMedia("(min-width: 768px)");

  const media = li => { const d = li.dataset;
    if (d.video) { const el = document.createElement("video"); Object.assign(el, { muted: true, loop: true, playsInline: true, autoplay: true, preload: "none", poster: d.poster });
      el.setAttribute("muted", ""); el.setAttribute("playsinline", ""); el.src = d.video; return el; }
    const im = new Image(); im.src = d.src; im.alt = li.querySelector("q").textContent; im.decoding = "async"; return im; };
  const put = (box, li) => { box.replaceChildren(media(li)); const vd = box.querySelector("video"); if (vd) vd.play().catch(() => {}); };

  // ── десктоп: окна наведения
  const win = cls => { const w = document.createElement("div"); w.className = "pw " + cls; w.setAttribute("aria-hidden", "true"); sec.appendChild(w); return w; };
  const R = win("r"), L = win("l"), slot = sec.querySelector(".slot .pic"), cap = sec.querySelector(".slot .cap");
  let cur = null;
  const show = li => {
    if (!DESK.matches || li === cur || v === "buro") return; cur = li;
    rows.forEach(r => r.classList.toggle("hov", r === li));
    if (v === "loco") { const ins = li.querySelector(".ins"); if (ins && !ins.firstChild) put(ins, li); else if (ins) { const vd = ins.querySelector("video"); if (vd) vd.play().catch(() => {}); } return; }
    put(R, li); R.classList.add("on");
    if (v === "freshman") { put(L, li); L.classList.add("on"); }
    sec.classList.add("hov-on");
  };
  const hide = () => {
    if (v === "buro") return;
    if (v === "loco") { cur = null; rows.forEach(r => { r.classList.remove("hov"); const vd = r.querySelector(".ins video"); if (vd) vd.pause(); }); return; }
    cur = null; rows.forEach(r => r.classList.remove("hov")); sec.classList.remove("hov-on");
    [R, L].forEach(w => { w.classList.remove("on"); const vd = w.querySelector("video"); if (vd) vd.pause(); });
  };
  rows.forEach(li => li.addEventListener("mouseenter", () => show(li)));
  sec.querySelector(".pl").addEventListener("mouseleave", hide);
  addEventListener("scroll", () => { if (cur && v !== "buro") { const b = sec.querySelector(".pl").getBoundingClientRect(); if (b.bottom < 0 || b.top > innerHeight) hide(); } }, { passive: true });
  // loco: кадр встаёт между словами — в середине строки по числу букв (у Locomotive — между словами названия)
  if (v === "loco") rows.forEach(li => {
    const qq = li.querySelector("q"), words = qq.textContent.split(" "), half = qq.textContent.length / 2;
    let acc = 0, at = 1; for (let i = 0; i < words.length - 1; i++) { acc += words[i].length + 1; if (acc >= half) { at = i + 1; break; } at = i + 1; }
    const ins = document.createElement("span"); ins.className = "ins"; ins.setAttribute("aria-hidden", "true");
    qq.replaceChildren(document.createTextNode(words.slice(0, at).join(" ")), ins, document.createTextNode(words.slice(at).join(" ")));   // пробел между словами — поля кадра
  });

  // ── buro (≥1024) · версия 2 (Антон 06:54–06:58; контент — design/path-content-2010.md «Версия 2»).
  //    Колесо вниз — лента едет слева направо; одна прямая линия с годами; ритм веха: год — цитата — рассказ Коли (видео) — работа.
  //    Снято по слову Антона: столбики лет, контурные года, счётчик, подписи «из хайлайта», золотая плашка, наклоны и косая линия.
  //    Звук: кнопка «Смотреть со звуком» в начале ленты — после неё рассказ у центра экрана играет со звуком; без неё — без звука.
  if (v === "buro") {
    const W = matchMedia("(min-width: 1024px)"), rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
    const P = "p/v2/";
    const V2 = [   // q — слова Коли подряд (И — текст истории, Г — голос), m — блоки после цитаты
      { y: "2002", q: "В приоритете была музыка", m: [{ i: "p/2002.webp", w: 677, h: 435 }] },
      { y: "2007", q: "…по одному пути и выбрал татуировки", m: [{ v: P + "j07.mp4", p: P + "j07.webp", t: "Коля рассказывает, как начинал · 0:31", top: 1 }, { i: "p/2007.webp", w: 663, h: 662 }] },
      { y: "2012", q: "Мы вместе с Яриком Волковым открываем студию", m: [{ i: "p/2012.webp", w: 496, h: 398, k: .8 }] },   // J09 — исходник 496 px, лучше в истории нет: показ мельче родного
      { y: "2015", q: "Занимаю 1 место", m: [{ i: P + "thompson.webp", w: 520, h: 640, c: "Хантер Томпсон · Best of Second Day, Татумо" }, { i: "p/2015.webp", w: 720, h: 935, s: .55 }] },
      { y: "2016", q: "", pq: "Было очень много топовых артистов со всей России, но все получилось", m: [{ v: P + "j24.mp4", p: P + "j24.webp", t: "Коля рассказывает про 2016 · 0:39" }, { i: P + "moto.webp", w: 1000, h: 1000, c: "Мотогонщики · 2 место, Moscow Tattoo Convention" }] },
      { y: "2019", q: "Конвенция это вообще лютая штука, очень заряжает", m: [{ v: P + "j28.mp4", p: P + "j28.webp", t: "Коля рассказывает про 2019 · 0:58" }, { i: P + "beavis.webp", w: 1200, h: 1200, c: "Бивис и Баттхед · 2 место, Moscow Tattoo Convention" }] },
      { y: "Сегодня", q: "Сейчас работаю в Москве и продолжаю активно татуировать", tbd: 1, m: [{ i: P + "devil.webp", w: 800, h: 1000, c: "Уничтожение культа солнца" }] } ];
    let built = false, st, tr, els = [], vids = [], trackW = 0, sound = false;
    const mk = (cls, html, par) => { const e = document.createElement("div"); e.className = cls; if (html != null) e.innerHTML = html; (par || tr).appendChild(e); return e; };
    const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    const oct = (c, rr) => Array.from({ length: 8 }, (_, i) => { const a = (22.5 + 45 * i) * Math.PI / 180; return `${(c + rr * Math.cos(a)).toFixed(1)},${(c + rr * Math.sin(a)).toFixed(1)}`; }).join(" ");   // как в прототипе design/proto
    const build = () => {
      built = true; const r = rem(), H = innerHeight, LY = Math.round(H * .58), MH = Math.round(H * .62), GAP = 5 * r;
      st = document.createElement("div"); st.className = "bst"; sec.appendChild(st);
      tr = mk("btr", null, st);
      const ln = mk("bln2"); ln.style.top = LY + "px";
      let x = 12 * r;
      // начало ленты: заголовок и кнопка звука
      const h = mk("bx b2-ttl", "Мой путь"); h.style.cssText = `left:${x}px;top:${LY - 15.5 * r}px`;
      const btn = mk("bx b2-snd", '<button type="button" aria-pressed="false">Смотреть со звуком</button>'); btn.style.cssText = `left:${x}px;top:${LY + 2.5 * r}px`;
      btn.querySelector("button").addEventListener("click", e => { sound = !sound; e.currentTarget.setAttribute("aria-pressed", sound); e.currentTarget.textContent = sound ? "Звук включён · выключить" : "Смотреть со звуком"; tick(); });
      x += Math.max(h.offsetWidth, btn.offsetWidth) + 14 * r;
      V2.forEach(it => {
        // год — восьмиугольный медальон на линии (концепт Р6 «Лента по центру», Figma 39:233630): двойной контур, год внутри, засечки над и под
        const g0 = x, MD = (it.y.length > 4 ? 13 : 11) * r;
        const yr = mk("bx b2-y", `<svg viewBox="0 0 100 100" aria-hidden="true"><polygon class="o1" points="${oct(50, 48)}"/><polygon class="o2" points="${oct(50, 42)}"/></svg><b${it.y.length > 4 ? ' class="w"' : ""}>${esc(it.y)}</b>`);
        yr.style.cssText = `left:${x}px;top:${LY - MD / 2}px;width:${MD}px;height:${MD}px`;
        x += MD + GAP;
        if (it.q) { const q = mk("bx b2-q" + (it.tbd ? " tbd" : ""), esc(it.q)); q.style.cssText = `left:${x}px;bottom:${H - LY + 2 * r}px`; x += q.offsetWidth + GAP; }
        it.m.forEach(m => {
          const hh = Math.round(Math.min(MH * (m.s || 1), m.h || 1e9) * (m.k || 1)), ww = m.v ? Math.round(hh * 9 / 16) : Math.round(hh * m.w / m.h), top = m.s ? LY + MH / 2 - hh : LY - MH / 2;
          const box = mk("bx b2-m" + (m.top ? " cut-top" : "")); box.style.cssText = `left:${x}px;top:${top}px;width:${ww}px;height:${hh}px`;
          if (m.v) { const vd = document.createElement("video"); Object.assign(vd, { muted: true, loop: true, playsInline: true, preload: "none", poster: m.p }); vd.setAttribute("muted", ""); vd.setAttribute("playsinline", ""); vd.src = m.v; box.appendChild(vd); vids.push({ vd, box }); }
          else { const im = new Image(); im.src = m.i; im.alt = m.c || it.q || it.y; im.decoding = "async"; im.loading = "lazy"; box.appendChild(im); }
          const cap = m.t || m.c; if (cap) { const c = mk("bx b2-c", esc(cap)); c.style.cssText = `left:${x}px;top:${top + hh + .75 * r}px;width:${Math.max(ww, 16 * r)}px`; }
          x += ww + GAP;
        });
        x = Math.max(x + 3 * r, g0 + innerWidth * .86);   // веха — почти экран: пока она по центру, медальон следующей выглядывает у правого края (Р6)
      });
      trackW = x + 8 * r; ln.style.width = trackW + "px";
      tr.style.width = trackW + "px"; els = [...tr.querySelectorAll(".bx")];
      sec.style.setProperty("--buro-h", (trackW - innerWidth + innerHeight) + "px");
    };
    let raf = 0;
    const tick = () => { raf = 0; if (!built) return;
      const b = sec.getBoundingClientRect(), p = Math.min(1, Math.max(0, -b.top / Math.max(1, b.height - innerHeight))), tx = p * (trackW - innerWidth), vw = innerWidth;
      const onScreen = b.top < innerHeight && b.bottom > 0;
      tr.style.transform = `translate3d(${-tx}px,0,0)`;
      els.forEach(e => { const cx = e.offsetLeft + e.offsetWidth / 2 - tx, d = Math.abs(cx - vw / 2) / vw; e.style.opacity = Math.max(0, Math.min(1, 1.6 - d * 1.6)); });   // только проявление у края, без сдвигов и наклонов
      let best = null, bd = 1e9;
      vids.forEach(o => { const cx = o.box.offsetLeft + o.box.offsetWidth / 2 - tx, d = Math.abs(cx - vw / 2); o.d = d; if (d < bd) { bd = d; best = o; } });
      vids.forEach(o => { const near = onScreen && o.d < vw * .45;
        if (near) { o.vd.muted = !(sound && o === best && o.d < vw * .3); o.vd.play().catch(() => {}); } else { o.vd.muted = true; o.vd.pause(); } });
    };
    const ask = () => { if (!raf) raf = requestAnimationFrame(tick); };
    // уже 1024 (телефон, планшет) — простой список, но с тем же контентом версии 2: 7 строк, тап — рассказ Коли или работа
    if (!W.matches) rows.forEach((li, i) => { const it = V2[i]; if (!it) return; const m = it.m.find(x => x.v) || it.m[it.m.length - 1];
      ["src", "video", "poster", "ct", "body"].forEach(k => delete li.dataset[k]);
      if (m.v) { li.dataset.video = m.v; li.dataset.poster = m.p; } else li.dataset.src = m.i;
      li.querySelector(".y").textContent = it.y; li.querySelector("q").textContent = it.q || it.pq || "—"; li.querySelector(".k").textContent = m.v ? "Видео" : "Фото";
      li.classList.toggle("tbd", !!it.tbd); });
    if (W.matches) (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { build(); tick(); });   // ширины блоков — после шрифта, иначе «Сегодня» наезжает на цитату
    W.addEventListener("change", () => location.reload());
    addEventListener("scroll", ask, { passive: true }); addEventListener("resize", () => { if (built) location.reload(); });
  }

  // ── телефон: тап — кадр под строкой
  rows.forEach(li => li.addEventListener("click", () => {
    if (DESK.matches) return;
    const open = !li.classList.contains("open");
    rows.forEach(r => { if (r !== li && r.classList.contains("open")) { r.classList.remove("open"); const vd = r.querySelector("video"); if (vd) vd.pause(); } });
    li.classList.toggle("open", open);
    const f = li.querySelector(".mf");
    if (open) { if (!f.firstChild) put(f, li); else { const vd = f.querySelector("video"); if (vd) vd.play().catch(() => {}); } }
    else { const vd = f.querySelector("video"); if (vd) vd.pause(); }
  }));
})();
