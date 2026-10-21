// 16.10 14:39 — ручки обоев (слово Антона: «для всего, что перечислила, сделай крутилки и посмотрим»). Только с ?wpui.
// Значения пишутся в адрес (w… параметры) — адрес можно прислать одной строкой.
(() => {
  const P = new URLSearchParams(location.search), mob = matchMedia("(max-width: 767px)").matches, root = document.documentElement;
  const wall = document.querySelector(".wall"), lit = document.querySelector(".wall-lit"), shade = document.querySelector(".wall-shade");
  const D = { sz: mob ? .7 : 1.25, wb: 1.5, sc: .05, wl: 25, wr: 150, ws: 0, ww: 2, wwr: 400, fade: 0, drift: 0, start: 1 };   // 14:58 Антон — его значения
  const R = {
    sz: ["размер", .3, 1.6, .05, v => Math.round(v * 100) + " %"],
    wb: ["основа", 0, 12, .5, v => v + " %"],
    sc: ["прокрутка", 0, 1, .05, v => v == 0 ? "стоят" : v == 1 ? "едут" : "параллакс " + v],
    wl: ["свет", 0, 70, 1, v => v + " %"],
    wr: ["радиус света", 40, 600, 10, v => v + " px"],
    ws: ["край света", 0, 90, 5, v => v == 0 ? "мягкий" : v + " %"],
    ww: ["тёплое пятно", 0, 20, .5, v => v + " %"],
    wwr: ["его радиус", 60, 700, 10, v => v + " px"],
  };
  const C = { fade: "свет гаснет, когда отпустил", drift: "свет гуляет сам, когда никто не трогает", start: "светить до первого движения" };
  const S = { ...D }; for (const k in S) if (P.has("w" + k)) S[k] = +P.get("w" + k);

  let moved = false, lastAct = performance.now(), fadeT = 0;
  function apply() {
    const bs = `calc(8rem * ${S.sz}) calc(24.375rem * ${S.sz})`;
    wall.style.backgroundSize = lit.style.backgroundSize = bs;
    wall.style.opacity = S.wb / 100;
    const m = `radial-gradient(circle ${S.wr}px at var(--mx) var(--my), #000 0, ${S.ws ? `rgba(0,0,0,.35) ${S.ws}%,` : ""} transparent 100%)`;
    lit.style.webkitMaskImage = lit.style.maskImage = m;
    lit.style.transition = "opacity .6s";
    lit.style.opacity = (!S.start && !moved) ? 0 : S.wl / 100;
    shade.style.background = `radial-gradient(circle ${S.wwr}px at var(--mx) var(--my), rgba(var(--warm-rgb),${S.ww / 100}), transparent 70%)`;
    shade.style.opacity = (!S.start && !moved) ? 0 : 1; shade.style.transition = "opacity .6s";
    onScroll();
  }
  function onScroll() { const y = -scrollY * S.sc + "px"; wall.style.backgroundPositionY = lit.style.backgroundPositionY = y; }
  addEventListener("scroll", onScroll, { passive: true });
  const act = () => { lastAct = performance.now(); if (!moved) { moved = true; apply(); } if (S.fade) { clearTimeout(fadeT); lit.style.opacity = S.wl / 100; shade.style.opacity = 1; } };
  addEventListener("pointermove", act, { passive: true }); addEventListener("touchstart", act, { passive: true }); addEventListener("touchmove", act, { passive: true });
  addEventListener("touchend", () => { if (S.fade) fadeT = setTimeout(() => { lit.style.opacity = 0; shade.style.opacity = 0; }, 250); }, { passive: true });
  // свет гуляет сам: медленная восьмёрка, пока 2 с никто не трогает
  (function drift(t) { if (S.drift && t - lastAct > 2000) { const k = t / 1000;
      root.style.setProperty("--mx", (50 + 32 * Math.sin(k * .21)) + "%"); root.style.setProperty("--my", (45 + 28 * Math.sin(k * .34 + 1)) + "%");
      if (S.fade || (!S.start && !moved)) { lit.style.opacity = S.wl / 100; shade.style.opacity = 1; } }
    requestAnimationFrame(drift); })(0);

  // панель
  const box = document.createElement("div");
  box.style.cssText = "position:fixed;left:8px;right:8px;top:8px;z-index:70;max-height:70vh;overflow:auto;padding:10px 12px;background:rgba(24,24,24,.95);border:1px solid rgba(203,184,143,.5);color:#e6e5e1;font:12px/1.3 Jost,sans-serif";
  if (!mob) box.style.cssText += ";left:auto;right:24px;top:auto;bottom:24px;width:380px";
  const row = (k) => { const [lab, mn, mx, st, f] = R[k]; return `<label style="display:grid;grid-template-columns:96px 1fr 84px;gap:8px;align-items:center;margin-bottom:5px">${lab}<input data-k="${k}" type="range" min="${mn}" max="${mx}" step="${st}" value="${S[k]}" style="accent-color:#cbb88f;width:100%"><b data-v="${k}" style="font-weight:400;color:#cbb88f;text-align:right">${f(S[k])}</b></label>`; };
  box.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="color:#cbb88f;letter-spacing:.08em;text-transform:uppercase">обои · ручки</span><span data-a="min" style="cursor:pointer;color:#a7a294">свернуть ▾</span></div><div data-body>`
    + Object.keys(R).map(row).join("")
    + Object.entries(C).map(([k, lab]) => `<label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input data-c="${k}" type="checkbox" ${S[k] ? "checked" : ""} style="accent-color:#cbb88f">${lab}</label>`).join("")
    + `<label style="display:flex;gap:8px;align-items:center;margin:6px 0;color:#a7a294"><input data-c="peek" type="checkbox" style="accent-color:#cbb88f">показать основу ярче (только для подбора)</label>`
    + `<div style="display:flex;gap:8px;margin-top:6px"><button data-a="reset" style="flex:1;background:none;border:1px solid rgba(203,184,143,.5);color:#cbb88f;font:11px Jost;padding:6px;text-transform:uppercase">сброс</button></div></div>`;
  document.body.append(box);
  const url = () => { const u = new URL(location); for (const k in S) u.searchParams.set("w" + k, S[k]); history.replaceState(null, "", u); };
  box.addEventListener("input", e => { const k = e.target.dataset.k; if (!k) return; S[k] = +e.target.value; box.querySelector(`[data-v="${k}"]`).textContent = R[k][4](S[k]); apply(); url(); });
  box.addEventListener("change", e => { const c = e.target.dataset.c; if (!c) return;
    if (c === "peek") { wall.style.opacity = e.target.checked ? .18 : S.wb / 100; return; }
    S[c] = e.target.checked ? 1 : 0; if (c === "fade" && !S.fade) { lit.style.opacity = S.wl / 100; shade.style.opacity = 1; } apply(); url(); });
  box.addEventListener("click", e => { const a = e.target.dataset.a;
    if (a === "min") { const b = box.querySelector("[data-body]"), on = b.style.display !== "none"; b.style.display = on ? "none" : ""; e.target.textContent = on ? "развернуть ▸" : "свернуть ▾"; }
    if (a === "reset") { Object.assign(S, D); box.querySelectorAll("[data-k]").forEach(i => { i.value = S[i.dataset.k]; box.querySelector(`[data-v="${i.dataset.k}"]`).textContent = R[i.dataset.k][4](S[i.dataset.k]); });
      box.querySelectorAll("[data-c]").forEach(i => { if (i.dataset.c in S) i.checked = !!S[i.dataset.c]; }); apply(); url(); } });
  apply();
})();
