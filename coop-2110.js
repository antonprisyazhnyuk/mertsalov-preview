/* 21.10 20:56 Антон: «из футера не работает кнопка „Написать“ — не открывает форму» → окно «Сотрудничество» из прототипа _form-proto-2110.html — в сайт.
   Подключает footer-2010.js по первому нажатию «Написать»; окно — как попап «Записаться» (zpop-2010.js): затемнение, рама прорисовывается, крестик, Esc, клик по фону.
   Поля и поведение — прототипа без изменений (решения Антона 17:25–17:43): один выбор «Что предлагаете», «Хочу учиться» меняет поля, одно «Сообщение». Отправка — заглушка «Спасибо!». */
(() => {
  if (window.COOP) return;
  const BASE = (document.currentScript && document.currentScript.src || "").replace(/[^/]*$/, "");
  const load = (tag, url) => new Promise(res => { const e = document.createElement(tag);
    if (tag === "link") { e.rel = "stylesheet"; e.href = BASE + url; } else e.src = BASE + url;
    e.onload = e.onerror = res; document.head.appendChild(e); });
  const TPL = `<div class="zr">
<span class="dm t"></span><span class="dm r"></span><span class="dm b"></span><span class="dm l"></span>

<header class="zhd">
  <!-- 17:31 Антон: «просто сотрудничество и всё» — надзаголовок и строка «Заявка придёт… Отвечу сам» сняты («отвечу сам» — выдумка, 17.10) -->
  <h2>Сотрудничество</h2>
</header>

<!-- поля — Антон 16:15–16:17; data-for="org" / "learn" — что видно без «Хочу учиться» и с ним -->
<form class="zf" novalidate>
<div class="z3">
<label class="zi" data-req="имя"><span class="zk">Имя <i>*</i></span><input name="name" placeholder="как к вам обращаться" autocomplete="name"></label>
<!-- 17:31 Антон: студия, сайт и город — «необязательные поля как по мне» -->
<label class="zi" data-for="org"><span class="zk">Студия или организация</span><input name="org" placeholder="название"></label>
<label class="zi" data-for="org"><span class="zk">Сайт или Instagram</span><input name="org-link" placeholder="ссылка или @ник"></label>
<label class="zi zs2" data-req="ссылка на работы" data-for="learn" hidden><span class="zk">Ссылка на ваши работы <i>*</i></span><input name="works-link" placeholder="Instagram, портфолио или облако"></label>
</div>
<div class="z3">
<label class="zi zs2" data-req="связь"><span class="zk">Как связаться <i>*</i></span><input name="contact" placeholder="Telegram, WhatsApp или почта"></label>
<label class="zi"><span class="zk">Город</span><input name="city" placeholder="где вы работаете"></label>
</div>
<div class="zi" role="group" aria-label="Что предлагаете" data-req="что предлагаете">
<span class="zk">Что предлагаете <i>*</i></span>
<!-- 17:30 Антон: «почему это протыкивается вместе?» → один выбор (несколько предложений — в «Сообщении») -->
<div class="chips offer one"><button type="button">Гест-спот</button><button type="button">Конвенция</button><button type="button">Мастер-класс</button><button type="button">Коллаборация</button><button type="button" data-learn>Хочу учиться</button><button type="button">Другое</button></div>
<!-- 17:33 Антон: «Другое — зачем ещё поле? ниже уже есть поле для текста» → поле «что именно» снято, суть — в «Сообщении» -->
</div>
<div class="zi" role="group" aria-label="Опыт" data-req="опыт" data-for="learn" hidden>
<span class="zk">Опыт <i>*</i></span>
<div class="chips one"><button type="button">Начинаю</button><button type="button">1–3 года</button><button type="button">3+</button></div>
</div>
<!-- 17:27 Антон про «Когда» и «Подробности и условия»: «просто как будто это лишнее» — вместо них одно свободное поле; подсказка зависит от «Хочу учиться» -->
<!-- 17:29 Антон: «условия, даты и прочее — чтобы писалось всё туда» → подсказка поля говорит об этом -->
<label class="zi zt"><span class="zk">Сообщение</span><textarea name="message" placeholder="Что предлагаете, даты, условия — всё, что важно" data-ph-learn="Что хотите освоить, когда удобно — всё, что важно"></textarea></label>
<label class="cb zok" data-req="согласие"><input type="checkbox" name="consent"><span class="sq"></span><span>Согласен на обработку персональных данных и принимаю <a href="#policy">политику обработки</a></span></label>
<p class="err" role="alert" hidden></p>
<button class="b send" type="submit"><svg class="dk" viewBox="0 0 360 72" aria-hidden="true"><path class="o"/><path class="i"/></svg><svg class="ph" viewBox="0 0 316 60" aria-hidden="true"><path class="o"/><path class="i"/></svg><span>Отправить предложение</span></button>
</form>

<div class="zdone" hidden tabindex="-1"><h3>Спасибо!</h3><p></p></div>
</div>`;
  let ready = null, api = null;
  const build = async () => {
    if (!document.querySelector('link[href*="form-2010.css"]')) await load("link", "form-2010.css?v=2110b");
    if (!document.querySelector('link[href*="zpop-2010.css"]')) await load("link", "zpop-2010.css?v=2010");
    if (!document.querySelector('link[href*="coop-2110.css"]')) await load("link", "coop-2110.css?v=2110c");
    const ov = document.createElement("div"); ov.className = "zpov zco"; ov.hidden = true;
    ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Сотрудничество");
    ov.innerHTML = `<div class="zpbg"></div><div class="zap zpop zm"><button class="zpx" type="button" aria-label="Закрыть"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 3L17 17M17 3L3 17"/></svg></button>${TPL}</div>`;
    document.body.appendChild(ov);
    const zr = ov.querySelector(".zr"), f = zr.querySelector(".zf"), done = zr.querySelector(".zdone"), err = f.querySelector(".err");
    const DONE = { org: "Посмотрю предложение и отвечу.", learn: "Посмотрю работы и отвечу." };

    // «Отправить предложение» — та же ступенчатая кнопка, что «Записаться» (shell.js SBTN)
    const send = f.querySelector(".send");
    if (window.SBTN) { SBTN.decorate(send.querySelector("svg.dk"), 360, 72); SBTN.decorate(send.querySelector("svg.ph"), 316, 60); SBTN.hover(send); }

    const learning = () => !!f.querySelector("[data-learn].on");
    const msg = f.querySelector("textarea[name=message]"), PH = msg.placeholder;
    const learnMode = on => {
      f.querySelectorAll("[data-for]").forEach(el => el.hidden = (el.dataset.for === "learn") !== on);
      msg.placeholder = on ? msg.dataset.phLearn : PH;
    };
    let tried = false;

    f.querySelectorAll(".chips").forEach(g => g.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      const one = g.classList.contains("one"), solo = x => x.hasAttribute("data-learn");
      // «Хочу учиться» исключает остальные: ученик не предлагает гест-спот, студия не учится
      g.querySelectorAll("button").forEach(x => { if (x !== b && (one || solo(b) || solo(x))) { x.classList.remove("on"); x.setAttribute("aria-pressed", "false"); } });
      b.classList.toggle("on"); b.setAttribute("aria-pressed", b.classList.contains("on"));
      if (g.classList.contains("offer")) learnMode(learning());
      check();
    }));
    f.querySelectorAll(".chips button").forEach(b => b.setAttribute("aria-pressed", "false"));

    const missing = () => {
      const out = [];
      f.querySelectorAll("[data-req]").forEach(el => {
        if (el.hidden) { el.classList.remove("bad"); return; }   // спрятанные «Хочу учиться» — не обязательны
        let ok;
        if (el.classList.contains("cb")) ok = el.querySelector("input").checked;
        else if (el.querySelector(".chips")) ok = !!el.querySelector(".chips button.on");
        else ok = el.querySelector("input, textarea").value.trim() !== "";
        el.classList.toggle("bad", tried && !ok);
        if (!ok) out.push(el.dataset.req);
      });
      return out;
    };
    const check = () => { if (!tried) return; const m = missing(); err.hidden = !m.length; err.textContent = m.length ? "Не хватает: " + m.join(", ") : ""; };
    f.addEventListener("input", check); f.addEventListener("change", check);
    f.addEventListener("submit", e => {
      e.preventDefault(); tried = true;
      const m = missing(); check();
      if (m.length) { const first = f.querySelector(".bad input:not([type=file]), .bad button"); if (first) first.focus(); return; }
      zr.style.setProperty("--zh", f.offsetHeight / parseFloat(getComputedStyle(document.documentElement).fontSize) + "rem");
      done.querySelector("p").textContent = DONE[learning() ? "learn" : "org"];
      zr.classList.add("sent"); done.hidden = false; done.focus({ preventScroll: true });
    });

    // ── окно: как попап «Записаться» (zpop-2010.js) — затемнение, крестик, Esc, клик по фону, фокус внутри ──
    // 17:43 Антон: «почему запись появляется с красивой анимацией, а сотрудничество — нет?» → та же рама линиями SVG (zpop-2010.js): прорисовывается от ромба ~0.5 с
    const NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS, "svg"), halves = [];
    svg.setAttribute("class", "zframe"); svg.setAttribute("aria-hidden", "true");
    [[1.6, .0625], [.7, .365625]].forEach(([sw, ins]) => [0, 1].forEach(side => { const p = document.createElementNS(NS, "path"); p.setAttribute("pathLength", "1"); p.style.strokeWidth = sw; svg.appendChild(p); halves.push({ p, ins, side }); }));
    zr.prepend(svg);
    const geom = () => {
      if (!zr.offsetWidth) return;
      const w = zr.offsetWidth, h = zr.offsetHeight, rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      halves.forEach(({ p, ins, side }) => { const o = ins * rem, x = side ? w - o : o; p.setAttribute("d", `M${w / 2} ${o}H${x}V${h - o}H${w / 2}`); });
    };
    if ("ResizeObserver" in window) new ResizeObserver(geom).observe(zr);
    let last = null;
    const open = opener => {
      last = opener || document.activeElement;
      if (zr.classList.contains("sent")) { zr.classList.remove("sent"); done.hidden = true; f.reset(); f.querySelectorAll(".chips button.on").forEach(b => b.click()); tried = false; check(); err.hidden = true; f.querySelectorAll(".bad").forEach(x => x.classList.remove("bad")); }
      document.documentElement.classList.add("zp-on");
      ov.hidden = false; ov.scrollTop = 0; geom();
      requestAnimationFrame(() => requestAnimationFrame(() => ov.classList.add("in")));
      setTimeout(() => f.querySelector("input").focus({ preventScroll: true }), 60);
    };
    const close = () => {
      ov.classList.remove("in"); document.documentElement.classList.remove("zp-on");
      setTimeout(() => { ov.hidden = true; }, 260);
      if (last && last.focus) last.focus({ preventScroll: true });
    };
    ov.querySelector(".zpx").addEventListener("click", close);
    ov.addEventListener("click", e => { if (e.target === ov || e.target.classList.contains("zpbg")) close(); });
    ov.addEventListener("keydown", e => {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab") return;
      const fs = [...ov.querySelectorAll("button, [href], input:not([hidden]), textarea")].filter(x => x.offsetParent !== null);
      const a = fs[0], z = fs[fs.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    });
    ["touchmove", "wheel"].forEach(t => ov.addEventListener(t, e => e.stopPropagation(), { passive: true }));   // как у «Записаться»: жесты внутри окна — не к прокрутке страницы
    return { open, close };
  };
  const open = async opener => { if (!ready) ready = build(); api = await ready; api.open(opener); };
  window.COOP = { open, close: () => api && api.close() };
})();
