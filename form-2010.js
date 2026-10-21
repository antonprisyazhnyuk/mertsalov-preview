/* 20.10 · экран 4 — анкета (Figma 74:152467 / 74:151210, состояния ①–④). Отправка — заглушка: сети нет, по нажатию — «Спасибо!» (④).
   Обязательные — поля со звёздочкой; отмечено перекрытие (①) — обязательным становится и фото места («+ ФОТО МЕСТА *»).
   Ошибка (③): подписи пустых обязательных — красным, над кнопкой «Не хватает: …»; исправленное гаснет сразу.
   13:33: та же анкета в попапе «Записаться» (zpop-2010.js) — поведение одно: window.ZFORM.init(рама). */
window.ZFORM = { init: zr => {
  const f = zr && zr.querySelector(".zf"); if (!f || f.__zf) return; f.__zf = 1;
  // «Отправить заявку» — та же ступенчатая кнопка, что «Записаться» (shell.js SBTN): 360 × 72, телефон 316 × 60
  const send = f.querySelector(".send");
  if (send && window.SBTN) { const dk = send.querySelector("svg.dk"), ph = send.querySelector("svg.ph"); if (dk) SBTN.decorate(dk, 360, 72); if (ph) SBTN.decorate(ph, 316, 60); SBTN.hover(send); }
  const err = f.querySelector(".err"), done = zr.querySelector(".zdone");
  const cover = [...f.querySelectorAll('.zc input[type=checkbox]')], hint = f.querySelector(".zc .hint"), phReq = f.querySelector(".ph-req");
  const place = f.querySelector(".zp"), other = place.querySelector(".other"), photo = place.querySelector(".za");
  const plural = (n, a, b, c) => n % 10 === 1 && n % 100 !== 11 ? a : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? b : c;
  let tried = false;

  // кнопки выбора: место — несколько, цвет — одна; «Другое» открывает строку «где именно» (②)
  f.querySelectorAll(".chips").forEach(g => g.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (g.classList.contains("one")) g.querySelectorAll("button").forEach(x => { if (x !== b) { x.classList.remove("on"); x.setAttribute("aria-pressed", "false"); } });
    b.classList.toggle("on"); b.setAttribute("aria-pressed", b.classList.contains("on"));
    if (b.hasAttribute("data-other")) { other.hidden = !b.classList.contains("on"); if (!other.hidden) other.focus(); }
    check();
  }));
  f.querySelectorAll(".chips button").forEach(b => b.setAttribute("aria-pressed", "false"));

  // перекрытие (①): подсказка про фото и звёздочка у «+ ФОТО МЕСТА»
  const onCover = () => { const on = cover.some(c => c.checked); hint.hidden = !on; phReq.hidden = !on; check(); };
  cover.forEach(c => c.addEventListener("change", onCover));

  // вложения: «+ ПРИКРЕПИТЬ ПРИМЕРЫ РАБОТ» → «3 ФАЙЛА ✕» (②); «+ ФОТО МЕСТА» → «2 ФОТО ✕»
  f.querySelectorAll(".za").forEach(z => {
    const inp = z.querySelector("input[type=file]"), add = z.querySelector(".add"), got = z.querySelector(".got"), ph = z.dataset.files === "фото";
    const show = () => { const n = inp.files.length; add.hidden = !!n; got.hidden = !n;
      got.textContent = n ? `${n} ${ph ? "фото" : plural(n, "файл", "файла", "файлов")} ✕` : ""; got.setAttribute("aria-label", "Убрать вложения"); check(); };
    inp.addEventListener("change", show);
    got.addEventListener("click", () => { inp.value = ""; show(); add.focus?.(); });
  });

  // что не заполнено — список слов для строки ошибки
  const missing = () => {
    const out = [];
    f.querySelectorAll("[data-req]").forEach(el => {
      let ok;
      if (el === place) ok = !!place.querySelector(".chips button.on");
      else if (el.classList.contains("cb")) ok = el.querySelector("input").checked;
      else { const v = el.querySelector("input:not([type=file]), textarea"); ok = v.value.trim() !== ""; }
      el.classList.toggle("bad", tried && !ok);
      if (!ok) out.push(el.dataset.req);
    });
    const needPh = cover.some(c => c.checked) && !photo.querySelector("input[type=file]").files.length;
    photo.classList.toggle("bad", tried && needPh);
    if (needPh) out.splice(out.indexOf("согласие") < 0 ? out.length : out.indexOf("согласие"), 0, "фото места");
    return out;
  };
  const check = () => { if (!tried) return; const m = missing(); err.hidden = !m.length; err.textContent = m.length ? "Не хватает: " + m.join(", ") : ""; };
  f.addEventListener("input", check); f.addEventListener("change", check);

  f.addEventListener("submit", e => {
    e.preventDefault(); tried = true;
    const m = missing(); check();
    if (m.length) { const first = f.querySelector(".bad input:not([type=file]), .bad textarea, .bad button"); if (first) first.focus({ preventScroll: false }); return; }
    // заглушка отправки: без сети — сразу «Спасибо!»
    zr.style.setProperty("--zh", f.offsetHeight / parseFloat(getComputedStyle(document.documentElement).fontSize) + "rem");
    zr.classList.add("sent"); done.hidden = false; done.focus({ preventScroll: true });
    const box = zr.closest(".form"); if (!box) return;   // в попапе прокручивать нечего
    const top = box.getBoundingClientRect().top + scrollY - (matchMedia("(max-width: 767px)").matches ? 16 : 120);
    if (zr.getBoundingClientRect().top < 0) scrollTo({ top, behavior: "smooth" });
  });
} };
ZFORM.init(document.querySelector(".zap:not(.zpop) .zr"));
// ?axes=1 — проверка глазом: оси сетки 120 · 960 · 1380 · 1800 (в rem, как вёрстка) поверх страницы, на любой ширине окна
if (new URLSearchParams(location.search).get("axes") === "1") addEventListener("DOMContentLoaded", () => {
  const o = document.createElement("div"); o.setAttribute("aria-hidden", "true");
  o.style.cssText = "position:fixed;inset:0;z-index:2000;pointer-events:none";
  o.innerHTML = [120, 960, 1380, 1800].map(x => `<i style="position:absolute;top:0;bottom:0;left:${x / 16}rem;width:1px;background:rgba(255,60,60,.8)"></i><b style="position:absolute;top:6rem;left:calc(${x / 16}rem + 4px);font:12px/1 monospace;color:#ff5a5a">${x}</b>`).join("");
  document.body.appendChild(o);
});
