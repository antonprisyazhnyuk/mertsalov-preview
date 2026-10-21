/* 20.10 13:33 Антон: «Записаться» не прыгает к анкете — «просто попап должен появиться» (решение 18.10, design/site-logic-1810.md:
   «Кнопка „Записаться“ — хедер и нижняя полоса; открывает анкету поверх страницы»). Подключает shell.js по первому нажатию — на всех страницах стенда.
   Десктоп: затемнённый фон с зерном, рама анкеты по центру (840, как на главной), рама прорисовывается от ромба ~0.5 с, поля сразу.
   Телефон: анкета на весь экран над нижней полосой (полоса видна — закон). Закрыть — крестик, Esc, клик по фону; фокус внутри; страница под попапом не крутится.
   Поля, состояния и «Спасибо!» — та же анкета (form-2010.css / form-2010.js, ZFORM.init). Разметка рамы — копия рамы на главной (index.html, .zap .zr): менять парой. */
(() => {
  if (window.ZPOP) return;
  const BASE = (document.currentScript && document.currentScript.src || "").replace(/[^/]*$/, "");
  const load = (tag, url) => new Promise(res => { const e = document.createElement(tag);
    if (tag === "link") { e.rel = "stylesheet"; e.href = BASE + url; } else e.src = BASE + url;
    e.onload = e.onerror = res; document.head.appendChild(e); });
  const TPL = `<div class="zr">
<span class="dm t"></span><span class="dm r"></span><span class="dm b"></span><span class="dm l"></span>
<form class="zf" novalidate>
<div class="z3">
<label class="zi" data-req="имя"><span class="zk">Имя <i>*</i></span><input name="name" autocomplete="name"></label>
<label class="zi" data-req="связь"><span class="zk">Telegram или телефон <i>*</i></span><input name="contact" placeholder="@ник или +7…" autocomplete="tel"></label>
</div>
<div class="zi zt" data-req="идея">
<div class="zh"><label class="zk" for="zp-idea">Идея <i>*</i></label><span class="za" data-files="примеры"><label class="add">+ Прикрепить примеры работ<input type="file" name="refs" accept="image/*,video/*" multiple hidden></label><button class="got" type="button" hidden></button></span></div>
<textarea id="zp-idea" name="idea" placeholder="Что хочется и что это для тебя значит. Детали обсудим на эскизе"></textarea>
</div>
<div class="zc">
<label class="cb"><input type="checkbox" name="cover-tattoo"><span class="sq"></span>Перекрытие старой татуировки</label>
<label class="cb"><input type="checkbox" name="cover-scar"><span class="sq"></span>Перекрытие шрама</label>
<p class="hint" hidden>Сфотографируй старую татуировку или шрам целиком, при дневном свете</p>
</div>
<div class="zi zp" role="group" aria-label="Место на теле" data-req="место">
<div class="zh"><span class="zk">Место на теле <i>*</i></span><span class="za" data-files="фото"><label class="add">+ Фото места<i class="ph-req" hidden> *</i><input type="file" name="place-photo" accept="image/*" multiple hidden></label><button class="got" type="button" hidden></button></span></div>
<div class="chips multi"><button type="button">Шея</button><button type="button">Плечо</button><button type="button">Рука</button><button type="button">Грудь</button><button type="button">Живот</button><button type="button">Бок</button><button type="button">Спина</button><button type="button">Нога</button><button type="button" data-other>Другое</button></div>
<input class="other" name="place-other" placeholder="где именно" hidden>
</div>
<div class="z2">
<label class="zi"><span class="zk">Примерный размер</span><input name="size" placeholder="например: с ладонь или на всё предплечье"></label>
<div class="zi" role="group" aria-label="Цветовая гамма"><span class="zk">Цветовая гамма</span><div class="chips one"><button type="button">Чёрно-белая</button><button type="button">Цветная</button><button type="button">Не знаю</button></div></div>
</div>
<label class="zi"><span class="zk">Комментарий</span><input name="comment" placeholder="сроки, вопросы — всё, что ещё важно"></label>
<label class="cb zok" data-req="согласие"><input type="checkbox" name="consent"><span class="sq"></span><span>Согласен на обработку персональных данных и принимаю <a href="#policy">политику обработки</a></span></label>
<p class="err" role="alert" hidden></p>
<button class="b send" type="submit"><svg class="dk" viewBox="0 0 360 72" aria-hidden="true"><path class="o"/><path class="i"/></svg><svg class="ph" viewBox="0 0 316 60" aria-hidden="true"><path class="o"/><path class="i"/></svg><span>Отправить заявку</span></button>
</form>
<div class="zdone" hidden tabindex="-1"><h3>Спасибо!</h3><p>Уже интересно — скоро обсудим твой проект.</p></div>
</div>`;
  const X = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 3L17 17M17 3L3 17"/></svg>';
  let ov, zr, svg, halves = [], last = null, ready = null;

  const geom = () => {
    if (!svg || !zr.offsetWidth) return;
    const w = zr.offsetWidth, h = zr.offsetHeight, rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    halves.forEach(({ p, ins, side }) => { const o = ins * rem, x = side ? w - o : o; p.setAttribute("d", `M${w / 2} ${o}H${x}V${h - o}H${w / 2}`); });
  };
  const focusables = () => [...ov.querySelectorAll('button, [href], input:not([type=file]):not([hidden]), textarea, [tabindex]:not([tabindex="-1"])')].filter(e => e.offsetParent !== null && !e.disabled);

  const build = async () => {
    if (!document.querySelector('link[href*="form-2010.css"]')) await load("link", "form-2010.css?v=2110b");
    if (!document.querySelector('link[href*="zpop-2010.css"]')) await load("link", "zpop-2010.css?v=2010");
    if (!window.ZFORM) await load("script", "form-2010.js?v=2010");
    ov = document.createElement("div"); ov.className = "zpov"; ov.hidden = true;
    ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Заявка на сеанс");
    ov.innerHTML = `<div class="zpbg"></div><div class="zap zpop zm"><button class="zpx" type="button" aria-label="Закрыть">${X}</button>${TPL}</div>`;
    document.body.appendChild(ov);
    zr = ov.querySelector(".zr");
    // рама линиями: наружная 1.6, внутренняя 0.7 — две половины от верхнего ромба до середины низа
    const NS = "http://www.w3.org/2000/svg"; svg = document.createElementNS(NS, "svg"); svg.setAttribute("class", "zframe"); svg.setAttribute("aria-hidden", "true");
    [[1.6, .0625], [.7, .365625]].forEach(([sw, ins]) => [0, 1].forEach(side => { const p = document.createElementNS(NS, "path"); p.setAttribute("pathLength", "1"); p.style.strokeWidth = sw; svg.appendChild(p); halves.push({ p, ins, side }); }));
    zr.prepend(svg);
    if ("ResizeObserver" in window) new ResizeObserver(geom).observe(zr);
    window.ZFORM && ZFORM.init(zr);
    ov.querySelector(".zpx").addEventListener("click", close);
    ov.addEventListener("click", e => { if (e.target === ov || e.target.classList.contains("zpbg")) close(); });
    ov.addEventListener("keydown", e => {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab") return;
      const f = focusables(); if (!f.length) return; const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    });
    // жесты и колесо внутри попапа — не доходят до прокрутки страницы (шаги экранов на главной, лента)
    ["touchmove", "wheel"].forEach(t => ov.addEventListener(t, e => e.stopPropagation(), { passive: true }));
  };

  const open = async opener => {
    if (!ready) ready = build(); await ready;
    if (!ov.hidden) return;
    last = opener || document.activeElement;
    document.documentElement.classList.add("zp-on");
    ov.hidden = false; ov.scrollTop = 0; geom();
    requestAnimationFrame(() => requestAnimationFrame(() => ov.classList.add("in")));
    setTimeout(() => { const i = zr.querySelector(".zf:not([hidden]) input:not([type=file]), .zdone:not([hidden])"); i && i.focus({ preventScroll: true }); }, 60);
  };
  const close = () => {
    if (!ov || ov.hidden) return;
    ov.classList.remove("in"); document.documentElement.classList.remove("zp-on");
    setTimeout(() => { ov.hidden = true; }, 260);
    if (last && last.focus) last.focus({ preventScroll: true });
  };
  window.ZPOP = { open, close };
})();
