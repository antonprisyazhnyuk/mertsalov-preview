/* 20.10 · футер — плашка cookie и Метрики (187:17 / 187:52): пока нет ответа — видна; «Принять» / «Отказаться» запоминаются в браузере.
   Метрика стартует только после «Принять» — счётчика ещё нет, место отмечено ниже. ?ck=1 — показать плашку заново.
   21.10 18:09 · футер 43 (Figma 214:112324): карта ушла в FAQ «Где ты работаешь?»; год в © — текущий; блик проходит по линии один раз, когда футер показался. */
(() => {
  const ft = document.querySelector(".ft");
  if (ft) {
    const yr = ft.querySelector(".yr"); if (yr) yr.textContent = new Date().getFullYear();
    // 21.10 20:35 · зерно футера — как у сайта (fx.js / шторка shell.js): плитка шума 256 → 128 px (зерно 0.5 px), сдвиг ~15 раз в секунду, пока футер на экране
    const g = ft.querySelector(".ftg");
    if (g && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const n = 256, c = document.createElement("canvas"); c.width = c.height = n;
      const x = c.getContext("2d"), im = x.createImageData(n, n), d = im.data;
      for (let i = 0; i < d.length; i += 4) { d[i] = d[i + 1] = d[i + 2] = Math.random() * 255 | 0; d[i + 3] = 255; }
      x.putImageData(im, 0, 0); g.style.backgroundImage = `url(${c.toDataURL()})`;
      let t = 0; const run = on => { clearInterval(t); if (on) t = setInterval(() => g.style.backgroundPosition = `${Math.random() * 128 | 0}px ${Math.random() * 128 | 0}px`, 66); };
      if ("IntersectionObserver" in window) new IntersectionObserver(es => run(es.some(e => e.isIntersecting))).observe(ft);
    }
  }

  // 21.10 20:56 Антон: «„Написать“ не открывает форму» → окно «Сотрудничество» поверх страницы (coop-2110.js — по первому нажатию)
  const BASE = (document.currentScript && document.currentScript.src || "").replace(/[^/]*$/, "");
  let coopLoad = null;
  document.querySelectorAll("[data-coop]").forEach(b => b.addEventListener("click", async e => {
    e.preventDefault();
    if (!window.COOP) coopLoad = coopLoad || new Promise(res => { const s = document.createElement("script"); s.src = BASE + "coop-2110.js?v=2110c"; s.onload = s.onerror = res; document.head.appendChild(s); });
    await coopLoad; if (window.COOP) COOP.open(b);
  }));

  const ck = document.querySelector(".ck"); if (!ck) return;
  const KEY = "mz-consent", get = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const put = v => { try { localStorage.setItem(KEY, v); } catch (e) {} };
  const startMetrika = () => { /* сюда — код счётчика Яндекс Метрики, когда он будет */ };
  if (new URLSearchParams(location.search).get("ck") === "1") put("");
  // 21.10 19:30 Антон: плашка как у vc.ru — «Сайт использует cookie» + «ОК», без «Отказаться» и крестика → уведомление, Метрика стартует сразу
  //   (⚠ формально это не согласие — вопрос 25 Коле в kolya-questions-2010.md)
  startMetrika();
  const v = get();
  if (v !== "yes") {
    // 21.10 18:39–19:09 Антон: ступенчатая «Принять» в плашке — «забирает кучу места и выглядит несуразно» → текстовая ссылка капсом золотом рядом с «Отказаться» (кадры 214:113315 / 214:113710, его правка: между ними 24 на десктопе)
    const b = ck.querySelector(".ok");
    // 19:15 Антон: текст — «Сайт использует cookie и всё», ссылкой на политику — «cookie» (19:16 «или на cookie, как ты сказала»; index.html), одинаково на обеих ширинах
    ck.hidden = false;
    b.addEventListener("click", () => { put("yes"); ck.hidden = true; });
  }
})();
