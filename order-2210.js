/* 22.10 18:09 Антон: «да, верстай окно „Заказ“» (17:36 «да, отдельная форма» — не анкета записи). Кадры Figma 238:169260 / 238:173443, «Спасибо» 238:171370 / 238:173599.
   Подключает shop-2210.js по первому «Заказать»; ORDER.open(товар, размер, opener, onSize). Окно — как «Сотрудничество» (coop-2110.js): затемнение,
   рама прорисовывается от ромба, крестик, Esc, клик по фону, фокус внутри; на телефоне — на весь экран над полосой, с рамой (класс .zco — общие правила окна).
   Классы рамы, полей, галочки, кнопки и «Спасибо» — общие (form-2010.css, zpop-2010.css, coop-2110.css); своё — order-2210.css.
   Сверху — что заказываешь: миниатюра, тип, название, цена; у мерча — размер кнопками (меняется тут же и уходит в карточку), у вещи без размеров — строкой.
   Отправка — заглушка, как у анкеты: проверка обязательных полей → «Спасибо!». В заявку идут скрытые поля order-item · order-type · order-size · order-price. */
(() => {
  if (window.ORDER) return;
  const BASE = (document.currentScript && document.currentScript.src || "").replace(/[^/]*$/, "");
  const load = (tag, url) => new Promise(res => { const e = document.createElement(tag);
    if (tag === "link") { e.rel = "stylesheet"; e.href = BASE + url; } else e.src = BASE + url;
    e.onload = e.onerror = res; document.head.appendChild(e); });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const rub = n => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}&nbsp;<span class="rub">₽</span>`;
  const TPL = `<div class="zr">
<span class="dm t"></span><span class="dm r"></span><span class="dm b"></span><span class="dm l"></span>
<header class="zhd"><h2>Заказ</h2></header>
<form class="zf" novalidate>
<div class="or-it"></div>
<div class="or-ln" aria-hidden="true"></div>
<div class="z3">
<label class="zi" data-req="имя"><span class="zk">Имя <i>*</i></span><input name="name" placeholder="как к тебе обращаться" autocomplete="name"></label>
<label class="zi zs2" data-req="связь"><span class="zk">Telegram или телефон <i>*</i></span><input name="contact" placeholder="@ник или +7…" autocomplete="tel"></label>
</div>
<label class="zi"><span class="zk">Комментарий</span><input name="comment" placeholder="доставка, сроки, вопросы — всё, что важно"></label>
<label class="cb zok" data-req="согласие"><input type="checkbox" name="consent"><span class="sq"></span><span>Согласен на обработку персональных данных и принимаю <a href="#policy">политику обработки</a></span></label>
<p class="err" role="alert" hidden></p>
<input type="hidden" name="order-type" value="покупка"><input type="hidden" name="order-item"><input type="hidden" name="order-size"><input type="hidden" name="order-price">
<button class="b send" type="submit"><svg class="dk" viewBox="0 0 360 72" aria-hidden="true"><path class="o"/><path class="i"/></svg><svg class="ph" viewBox="0 0 316 60" aria-hidden="true"><path class="o"/><path class="i"/></svg><span>Отправить заказ</span></button>
</form>
<div class="zdone" hidden tabindex="-1"><h3>Спасибо!</h3><p>Заказ у меня. Напишу, как всё подготовлю.</p></div>
</div>`;
  let ready = null, api = null;
  const build = async () => {
    if (!document.querySelector('link[href*="form-2010.css"]')) await load("link", "form-2010.css?v=2110b");
    if (!document.querySelector('link[href*="zpop-2010.css"]')) await load("link", "zpop-2010.css?v=2210b");
    if (!document.querySelector('link[href*="coop-2110.css"]')) await load("link", "coop-2110.css?v=2110c");
    if (!document.querySelector('link[href*="order-2210.css"]')) await load("link", "order-2210.css?v=2210a");
    const ov = document.createElement("div"); ov.className = "zpov zco zor"; ov.hidden = true;
    ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Заказ");
    ov.innerHTML = `<div class="zpbg"></div><div class="zap zpop zm"><button class="zpx" type="button" aria-label="Закрыть"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 3L17 17M17 3L3 17"/></svg></button>${TPL}</div>`;
    document.body.appendChild(ov);
    const zr = ov.querySelector(".zr"), f = zr.querySelector(".zf"), done = zr.querySelector(".zdone"), err = f.querySelector(".err"), it = f.querySelector(".or-it");
    const send = f.querySelector(".send");
    if (window.SBTN) { SBTN.decorate(send.querySelector("svg.dk"), 360, 72); SBTN.decorate(send.querySelector("svg.ph"), 316, 60); SBTN.hover(send); }

    // что заказываешь
    let cur = null, size = null, onSize = null;
    const fill = (x, s) => {
      cur = x; size = s || null;
      const sizeRow = x.sizes
        ? `<div class="or-sz"><span class="pr-k" id="or-szk">Размер</span><div class="pr-sz" role="radiogroup" aria-labelledby="or-szk">${x.sizes.map(v =>
            `<button type="button" role="radio" aria-checked="${v === size}" data-s="${v}">${v}</button>`).join("")}</div></div>`
        : x.size ? `<dl class="or-sz"><dt class="pr-k">Размер</dt><dd>${esc(x.size)}</dd></dl>`   // вещь без размеров (шоппер) — строкой, как «Цвет»
        : x.rows ? `<dl class="or-sz"><dt class="pr-k">${esc(x.rows[x.k === "print" ? 1 : 0][0])}</dt><dd>${esc(x.rows[x.k === "print" ? 1 : 0][1])}</dd></dl>` : "";
      it.innerHTML = `<span class="or-ph${x.plate || x.k === "orig" ? " pl" : ""}"><img src="${x.img800 || x.img}" alt="" width="${x.w}" height="${x.h}"></span>
<div><span class="or-ty">${esc(x.type)}</span><p class="or-nm">${esc(x.tt || x.t).replace("\n", " <br>")}</p></div>
<p class="or-pr">${rub(x.price)}</p>${sizeRow}`;
      f.elements["order-item"].value = `${x.t} · ${x.type}`;
      f.elements["order-price"].value = `${String(x.price).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₽`;
      f.elements["order-size"].value = size || x.size || "";
    };
    it.addEventListener("click", e => { const b = e.target.closest(".pr-sz button[data-s]"); if (!b) return; size = b.dataset.s;
      it.querySelectorAll(".pr-sz button").forEach(o => o.setAttribute("aria-checked", o === b)); f.elements["order-size"].value = size;
      if (onSize) onSize(size); });

    // обязательные поля — как у «Сотрудничества»
    let tried = false;
    const missing = () => { const out = [];
      f.querySelectorAll("[data-req]").forEach(el => {
        const ok = el.classList.contains("cb") ? el.querySelector("input").checked : el.querySelector("input").value.trim() !== "";
        el.classList.toggle("bad", tried && !ok); if (!ok) out.push(el.dataset.req); });
      return out; };
    const check = () => { if (!tried) return; const m = missing(); err.hidden = !m.length; err.textContent = m.length ? "Не хватает: " + m.join(", ") : ""; };
    f.addEventListener("input", check); f.addEventListener("change", check);
    f.addEventListener("submit", e => {
      e.preventDefault(); tried = true;
      const m = missing(); check();
      if (m.length) { const first = f.querySelector(".bad input"); if (first) first.focus(); return; }
      zr.classList.add("sent"); done.hidden = false; geom(); done.focus({ preventScroll: true });   // отправка — заглушка, как у анкеты
    });

    // рама линиями — та же геометрия, что у окон записи и «Сотрудничества» (zpop-2010.js, coop-2110.js)
    const NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS, "svg"), halves = [];
    svg.setAttribute("class", "zframe"); svg.setAttribute("aria-hidden", "true");
    [[1.6, .0625], [.7, .365625]].forEach(([sw, ins]) => [0, 1].forEach(side => { const p = document.createElementNS(NS, "path"); p.setAttribute("pathLength", "1"); p.style.strokeWidth = sw; svg.appendChild(p); halves.push({ p, ins, side }); }));
    zr.prepend(svg);
    function geom() {
      if (!zr.offsetWidth) return;
      const w = zr.offsetWidth, h = zr.offsetHeight, rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      halves.forEach(({ p, ins, side }) => { const o = ins * rem, x = side ? w - o : o; p.setAttribute("d", `M${w / 2} ${o}H${x}V${h - o}H${w / 2}`); });
    }
    if ("ResizeObserver" in window) new ResizeObserver(geom).observe(zr);

    let last = null;
    const open = (x, s, opener, cb) => {
      last = opener || document.activeElement; onSize = cb || null;
      if (zr.classList.contains("sent")) { zr.classList.remove("sent"); done.hidden = true; f.reset(); }
      tried = false; err.hidden = true; f.querySelectorAll(".bad").forEach(el => el.classList.remove("bad"));
      fill(x, s);
      document.documentElement.classList.add("zp-on");
      ov.hidden = false; ov.scrollTop = 0; geom();
      requestAnimationFrame(() => requestAnimationFrame(() => ov.classList.add("in")));
      setTimeout(() => f.elements.name.focus({ preventScroll: true }), 60);
    };
    const close = () => {
      if (ov.hidden) return;
      ov.classList.remove("in"); document.documentElement.classList.remove("zp-on");
      setTimeout(() => { ov.hidden = true; }, 260);
      if (last && last.focus) last.focus({ preventScroll: true });
    };
    ov.querySelector(".zpx").addEventListener("click", close);
    ov.addEventListener("click", e => { if (e.target === ov || e.target.classList.contains("zpbg")) close(); });
    // на документе, а не на окне: после тапа (iOS) фокус остаётся на body — Esc и Tab иначе мимо окна
    document.addEventListener("keydown", e => {
      if (ov.hidden || !ov.classList.contains("in")) return;
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab") return;
      const fs = [...ov.querySelectorAll("button, [href], input:not([type=hidden]):not([hidden]), [tabindex]:not([tabindex='-1'])")].filter(x => x.offsetParent !== null);
      const a = fs[0], z = fs[fs.length - 1];
      if (!ov.contains(document.activeElement)) { e.preventDefault(); (e.shiftKey ? z : a).focus(); return; }
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    });
    ["touchmove", "wheel"].forEach(t => ov.addEventListener(t, e => e.stopPropagation(), { passive: true }));   // как у окон: жесты внутри — не к прокрутке страницы
    // «Запись» и «Меню» в полосе телефона — окно заказа уступает им место (как «Сотрудничество», shell.js coopOff)
    document.addEventListener("zpop", e => { if (e.detail) close(); });
    const menu = document.getElementById("menuBtn"); if (menu) menu.addEventListener("click", close, true);
    return { open, close, isOpen: () => !ov.hidden && ov.classList.contains("in") };
  };
  const open = async (x, s, opener, cb) => { if (!ready) ready = build(); api = await ready; api.open(x, s, opener, cb); };
  window.ORDER = { open, close: () => api && api.close(), isOpen: () => !!api && api.isOpen() };
})();
