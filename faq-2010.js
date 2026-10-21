/* 14:37 Антон: карта студии в «Где ты работаешь?». Десктоп (≥768) — живая Яндекс Карта, грузится только при первом раскрытии вопроса
   (не раньше — скорость); телефон — снимок карты, карту не грузим. Высота блока карты задана заранее — раскрытие не дёргает страницу.
   15:03 Антон «метку бы человеческую, хотя бы цвета D8B77A»: вместо виджета — JS API 2.1, тёмная только подложка (тот же фильтр, что был
   у футера), метка — своя: ромб в ромбе #d8b77a, как ромбы сайта, 40 px, центр ромба = студия; фильтр её не трогает.
   Ключ API — в data-key у .fqm (без ключа API работает, но пишет в консоль «Invalid API key»; к выкладке ключ получить).
   API не загрузился — остаётся снимок карты фоном. Колесо мыши карту не зумит (прокрутка страницы важнее). */
(() => {
  const m = document.querySelector(".faq .fqm"), d = m && m.closest("details");
  if (!d) return;
  const WIDE = matchMedia("(min-width: 768px)"), [lon, lat] = m.dataset.ll.split(",").map(Number), AT = [lat, lon];
  const PIN = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">' +
    '<path d="M20 1.5 38.5 20 20 38.5 1.5 20Z" fill="#1a1a1a" fill-opacity=".6" stroke="#d8b77a" stroke-width="1.4"/>' +
    '<path d="M20 6.5 33.5 20 20 33.5 6.5 20Z" fill="none" stroke="#d8b77a" stroke-width=".7"/>' +
    '<path d="M20 12.5 27.5 20 20 27.5 12.5 20Z" fill="#d8b77a"/></svg>');
  let started = false;
  const api = () => new Promise((ok, no) => {
    if (window.ymaps) return ymaps.ready(ok, no);
    const s = document.createElement("script");
    s.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU" + (m.dataset.key ? "&apikey=" + encodeURIComponent(m.dataset.key) : "");
    s.onload = () => ymaps.ready(ok, no); s.onerror = no;
    document.head.appendChild(s);
  });
  const load = () => {
    if (started || !d.open || !WIDE.matches) return;
    started = true;
    api().then(() => {
      const box = document.createElement("div"); box.className = "ymap"; m.appendChild(box);
      const map = new ymaps.Map(box, { center: AT, zoom: 15, controls: ["zoomControl"] });
      map.behaviors.disable("scrollZoom");
      map.panes.get("ground").getElement().style.filter = "grayscale(1) invert(.9) sepia(.22) brightness(.82) contrast(.92)";
      map.geoObjects.add(new ymaps.Placemark(AT, { hintContent: "Студия «Локация»" },
        { iconLayout: "default#image", iconImageHref: PIN, iconImageSize: [40, 40], iconImageOffset: [-20, -20] }));
      requestAnimationFrame(() => box.classList.add("on"));
    }).catch(() => { started = false; });
  };
  d.addEventListener("toggle", load);
  WIDE.addEventListener("change", load);
  load();
})();

/* 20.10 · «Частые вопросы» проявляются по прокрутке — тем же языком, что анкета и шаги (zap-motion-2010.js):
   всё привязано к прокрутке, таймеров нет; заголовок — по словам из размытия со скосом, вопросы — по очереди сверху вниз
   (прозрачность и подъём на 1.5rem). Проявившееся остаётся. Раскрытие — сам details, этот файл его не трогает.
   «Уменьшить движение», ?motion=0 и приход якорем #voprosy — блок сразу целиком. */
(() => {
  const faq = document.querySelector(".faq");
  if (!faq || matchMedia("(prefers-reduced-motion: reduce)").matches || new URLSearchParams(location.search).get("motion") === "0" || location.hash === "#voprosy") return;
  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const out3 = t => 1 - (1 - t) ** 3;
  const span = (p, a, d) => clamp((p - a) / d);
  const put = (el, k, v) => { const c = el.__fm || (el.__fm = {}); if (c[k] !== v) { c[k] = v; el.style[k] = v; } };

  // слова заголовка — единицы входа из размытия (как в ленте: размытие 13 px на кегль 80, слово 0.5 хода, шаг 0.04)
  const h = faq.querySelector(".fqt");
  [...h.childNodes].forEach(ch => { if (ch.nodeType !== 3) return;
    const f = document.createDocumentFragment();
    ch.textContent.split(/(\s+)/).forEach(t => { if (!t) return; if (/^\s+$/.test(t)) { f.appendChild(document.createTextNode(t)); return; }
      const w = document.createElement("span"); w.className = "zw"; w.textContent = t; f.appendChild(w); });
    ch.replaceWith(f); });
  const ws = [...h.querySelectorAll(".zw")], B = 13 * parseFloat(getComputedStyle(h).fontSize) / 80;
  const words = e => { const T = (ws.length - 1) * .04 + .5;
    ws.forEach((w, i) => { const k = Math.sin(clamp((e * T - i * .04) / .5) * Math.PI / 2);
      if (k >= .999) { put(w, "opacity", "1"); put(w, "transform", "none"); put(w, "filter", "none"); return; }
      put(w, "opacity", k.toFixed(3)); put(w, "transform", `skewX(${(-20 * (1 - k)).toFixed(2)}deg)`); put(w, "filter", `blur(${(B * (1 - k)).toFixed(2)}px)`); }); };
  const rise = (el, e) => { const k = out3(e);
    put(el, "opacity", k >= .999 ? "" : k.toFixed(3)); put(el, "transform", k >= .999 ? "" : `translate3d(0,${((1 - k) * 1.5).toFixed(3)}rem,0)`); };

  const items = [...faq.querySelectorAll(".fql > details")];
  let done = false, raf = 0;
  const frame = () => {
    raf = 0;
    if (done) return;
    const vh = innerHeight, Q = clamp((vh - faq.getBoundingClientRect().top) / (vh * .7));
    words(span(Q, 0, .35));
    // вопрос — когда сам дошёл до низа окна, но не раньше своей очереди
    items.forEach((d, i) => { const own = clamp((vh * .97 - d.getBoundingClientRect().top) / (vh * .14)); rise(d, Math.min(own, span(Q, .12 + i * .06, .3))); });
    if (Q >= 1 && items.every(d => d.getBoundingClientRect().top < vh * .83)) { done = true; words(1); items.forEach(d => rise(d, 1)); removeEventListener("scroll", go); }
  };
  const go = () => { if (!raf) raf = requestAnimationFrame(frame); };
  frame();
  addEventListener("scroll", go, { passive: true });
  addEventListener("resize", go);
})();
