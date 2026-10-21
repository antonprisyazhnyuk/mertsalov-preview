// 16.10 16:12 Антон: «появление текста что на десктопе, что на мобилке, а переход при скролле?»
// Варианты на выбор адресом, без библиотек:
//   ?ta=a — строки выезжают из-под маски · ?ta=b — нарезка полосами (реф Codrops Sliced Text) · ?ta=c — строки собираются из размытия и разрядки
//   ?tr=1 — шторка: первый экран стоит, галерея наезжает, портрет отстаёт и гаснет · ?tr=2 — параллакс: экран уходит, портрет медленнее текста
// Без параметров — как было. «Уменьшить движение» в системе — всё сразу на месте.
(() => {
  const Q = new URLSearchParams(location.search), TA = Q.get("ta"), TR = Q.get("tr");
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.querySelector(".hero"); if (!hero) return;
  const name = hero.querySelector(".name"), formula = hero.querySelector(".formula"), portrait = hero.querySelector(".portrait");
  const css = document.createElement("style"); document.head.append(css);
  const ease = "cubic-bezier(.2,.7,.2,1)";

  // ── появление текста ───────────────────────────────────────────────
  // строки: текст элемента режется по переводу строки в блоки .ln (на телефоне имя переносится само — тогда по словам)
  function lines(el, byWord) {
    const parts = byWord ? el.textContent.trim().split(/\s+/) : el.textContent.split("\n").map(s => s.trim()).filter(Boolean);
    el.textContent = ""; return parts.map(t => { const s = document.createElement("span"); s.className = "ln"; s.textContent = t; el.append(s); return s; });
  }
  if (TA && !calm && ["a", "b", "c"].includes(TA)) {
    const mob = matchMedia("(max-width: 767px)").matches;
    const nl = lines(name, mob), fl = lines(formula, false);
    css.textContent += `.hero .ln { display: block; } .hero.ta-wait .ln { visibility: hidden; }`;
    hero.classList.add("ta-wait");
    const NAME_T = 1100, STEP = 160;
    if (TA === "a") css.textContent += `
      .hero .ln { clip-path: inset(-.4em -.2em -.4em -.2em); }
      .hero.ta-go .name .ln, .hero.ta-go .formula .ln { animation: taA ${NAME_T}ms ${ease} both; }
      @keyframes taA { from { clip-path: inset(-.4em -.2em 100% -.2em); transform: translateY(.45em); } to { clip-path: inset(-.4em -.2em -.4em -.2em); transform: none; } }`;
    if (TA === "c") css.textContent += `
      .hero.ta-go .name .ln { animation: taC 1400ms ${ease} both; }
      .hero.ta-go .formula .ln { animation: taF 900ms ${ease} both; }
      @keyframes taC { from { opacity: 0; filter: blur(14px); letter-spacing: .18em; } to { opacity: 1; filter: none; letter-spacing: 0; } }`;
    if (TA !== "c") css.textContent += ``;
    css.textContent += `@keyframes taF { from { opacity: 0; transform: translateY(.6em); } to { opacity: 1; transform: none; } }
      .hero.ta-go .formula .ln { animation-name: taF; animation-duration: 900ms; animation-timing-function: ${ease}; animation-fill-mode: both; }`;
    if (TA === "b") {
      // нарезка: у каждой строки 6 копий-полос, каждая со своим сдвигом вбок, съезжаются в слово; потом копии убираются
      const N = 6;
      css.textContent += `
        .hero .name .ln { position: relative; }
        .hero .name .ln > .sl { position: absolute; left: 0; right: 0; top: 0; white-space: nowrap; pointer-events: none; }
        .hero.ta-go .name .ln.cut { color: transparent; }
        .hero.ta-go .name .ln > .sl { animation: taB 1300ms ${ease} both; }
        @keyframes taB { from { transform: translateX(var(--dx)); opacity: 0; } 35% { opacity: 1; } to { transform: none; opacity: 1; } }`;
      nl.forEach((ln, li) => {
        ln.classList.add("cut");
        for (let i = 0; i < N; i++) {
          const s = document.createElement("span"); s.className = "sl"; s.setAttribute("aria-hidden", "true"); s.textContent = ln.textContent;
          const top = i / N * 100, bot = (N - 1 - i) / N * 100;
          s.style.clipPath = `inset(calc(${top}% - ${i ? 0 : .4}em) -.2em calc(${bot}% - ${i === N - 1 ? .4 : 0}em) -.2em)`;
          s.style.setProperty("--dx", `${(i % 2 ? 1 : -1) * (40 + 30 * ((i * 7 + li * 3) % 4))}px`);
          s.style.animationDelay = `${li * STEP + i * 40}ms`;
          s.style.color = "var(--warm)"; ln.append(s);
        }
        setTimeout(() => { ln.classList.remove("cut"); ln.querySelectorAll(".sl").forEach(x => x.remove()); }, 1300 + li * STEP + N * 40 + 60);
      });
    }
    // задержки: имя по строкам, формула после имени
    nl.forEach((ln, i) => { if (!ln.style.animationDelay) ln.style.animationDelay = `${i * STEP}ms`; });
    fl.forEach((ln, i) => { ln.style.animationDelay = `${nl.length * STEP + 450 + i * 110}ms`; });
    const go = () => { hero.classList.remove("ta-wait"); hero.classList.add("ta-go"); };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(go, 150));
  }

  // ── переход прокруткой с первого экрана на второй ────────────────────
  if (TR && !calm && ["1", "2"].includes(TR)) {
    document.body.classList.add("tr-" + TR);
    css.textContent += `
      .tr-1 .hero, .tr-2 .hero { will-change: transform; }
      .tr-1 .hero { transform: translate3d(0, calc(var(--p, 0) * var(--hh, 0px)), 0); z-index: 0; }
      .tr-1 .gal { z-index: 2; }
      .tr-1 .hero .portrait { translate: 0 calc(var(--p, 0) * -6%); scale: calc(1 - var(--p, 0) * .06); transform-origin: 70% 100%; opacity: calc(1 - var(--p, 0) * 1.1); }   /* translate/scale отдельными свойствами — телефонный transform портрета не перебиваем */
      .tr-1 .gal { background: var(--bg); box-shadow: 0 -2rem 3rem rgba(0,0,0,.45); }   /* шторка непрозрачная: сквозь неё не просвечивает первый экран */
      .tr-1 .hero .name, .tr-1 .hero .formula { opacity: calc(1 - var(--p, 0) * 1.6); }
      .tr-1 .hero .shade-bot { opacity: calc(1 - var(--p, 0) * 1.4); }
      .tr-2 .hero .portrait { translate: 0 calc(var(--p, 0) * var(--hh, 0px) * .35); opacity: calc(1 - var(--p, 0) * .9); }
      .tr-2 .hero .name { translate: 0 calc(var(--p, 0) * var(--hh, 0px) * -.18); opacity: calc(1 - var(--p, 0) * 1.4); }
      .tr-2 .hero .formula { translate: 0 calc(var(--p, 0) * var(--hh, 0px) * -.08); opacity: calc(1 - var(--p, 0) * 1.8); }`;
    // 16.10 16:26 Антон: «старую версию уберём, чтобы понять, как работает переход с 1 на 2» — вместо нынешней галереи
    // нейтральный второй экран (заголовок + 4 работы целиком); нынешняя галерея прячется, код не тронут. &g2=old — с ней.
    if (Q.get("g2") !== "old") {
      const g = document.querySelector(".gal");
      if (g) {
        g.style.display = "none";
        const ph = document.createElement("section"); ph.className = "gal gal-ph"; ph.setAttribute("aria-label", "Работы (заглушка для перехода)");
        ph.innerHTML = `<h2>Избранные работы</h2><div class="ph-grid">${["a/2015.webp", "w/01.webp", "a/2016.webp", "w/02.webp"].map(src => `<img src="${src}" alt="">`).join("")}</div>`;
        g.after(ph);
        css.textContent += `
          .gal-ph { position: relative; min-height: 100svh; padding: 8.5rem 7.5rem 6rem; box-sizing: border-box; scroll-snap-align: start; }
          .gal-ph h2 { margin: 0 0 2.5rem; font: 400 3.5rem/1 Foglihten, serif; color: var(--warm); }
          .gal-ph .ph-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; align-items: end; }
          .gal-ph img { width: 100%; height: auto; display: block; }
          @media (max-width: 767px) { .gal-ph { padding: 2.5rem 1rem 6rem; } .gal-ph h2 { font-size: 2.25rem; margin-bottom: 1.5rem; } .gal-ph .ph-grid { grid-template-columns: 1fr 1fr; gap: 1rem; } }`;
      }
    }
    let raf = 0;
    const upd = () => { raf = 0; const h = hero.offsetHeight, p = Math.max(0, Math.min(1, scrollY / h));
      hero.style.setProperty("--hh", h + "px"); hero.style.setProperty("--p", p.toFixed(4)); };
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    addEventListener("resize", upd); upd();
  }
})();
