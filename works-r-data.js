// «Работы» · общие помощники для всех вариантов (?v=anton|rozov|osnova|mix|free|ro-os). Данные работ — works-data.js (window.WORKS, один файл на сайт, 19.10).
// Варианты НЕ правят этот файл: свои стили и раскладка — в works-r-<школа>.css / .js.
// 19.10: прежние три списка (свежие · призовые · прежние, с дублями кадров одной работы) заменены одним — работа = карточка, у неё кадры (w.f).
(() => {
const CATW = { real: "реализм", port: "портрет", deco: "ар-деко", orn: "орнамент" };
// для вариантов: n — название в строку, r/src/th/video — обложка (кадр cv, нет — первый). 20.10: у перекрытий кадры идут «до → процесс → готовая»,
//   обложка — готовая; на карточке она первой, дальше остальные кадры по порядку (открытая работа — WORKS как есть, с «до»)
const ALL = window.WORKS.map(w => { const k = w.cv || 0, f = k ? [w.f[k], ...w.f.filter((_, i) => i !== k)] : w.f, c = f[0];
  return { ...w, f, n: w.t.replace(/\n/g, " "), r: c.r, src: c.src, mid: c.mid, big: c.big, th: c.th, video: c.video }; });
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const styles = w => w.c.map(k => CATW[k]).join(", ");
const cap = w => [w.y, styles(w)].filter(Boolean).join(" · ");
const badge = w => window.WO ? WO.awardTag(w) : "";
// картинка целиком, в своей пропорции: обёртка с aspect-ratio, без обрезки
const img = (w, sizes = "25vw") => `<span class="r-ph" style="aspect-ratio:${w.r.toFixed(4)}"><img src="${w.src}" srcset="${w.mid ? w.mid + " 560w, " : ""}${w.src} 800w, ${w.big} 1600w" sizes="${sizes}" alt="${esc("Татуировка — " + w.n + (cap(w) ? " · " + cap(w) : ""))}" loading="lazy" decoding="async"></span>`;
// открыть работу — общий модуль каркаса (shell.js, window.WO): одна открытая работа на весь сайт
const open = i => window.WO && WO.open(ALL[(i + ALL.length) % ALL.length].id);
const close = () => window.WO && WO.close();
addEventListener("scroll", () => document.body.classList.toggle("scrolled", scrollY > 40), { passive: true });
window.R = { ALL, CATW, esc, styles, cap, badge, img, open, close };
})();
