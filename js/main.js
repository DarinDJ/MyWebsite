(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  const ART = { purkinje: "assets/img/cajal-purkinje.jpg", hippo: "assets/img/cajal-hippocampus.jpg" };

  /* ---------- content ---------- */
  const projects = $("#projects");
  DATA.projects.forEach((p, i) => {
    const [img, x, y] = (p.art || "purkinje 50% 0%").split(" ");
    const li = el("li", "card");
    li.innerHTML =
      `<div class="card-art" style="background-image:url(${ART[img]});background-position:${x} ${y}"></div>` +
      `<span class="num">0${i + 1}</span><span class="stack-s">${esc(p.year)} · ${p.stack.map(esc).join(", ")}</span>` +
      `<h3>${esc(p.title)}</h3><p>${esc(p.text)}</p>` +
      (p.link ? `<a href="${p.link}" target="_blank" rel="noopener">${esc(p.linkLabel || "Open")}</a>` : "");
    projects.appendChild(li);
  });

  const pathList = $("#pathList");
  DATA.path.forEach((p, i) => {
    const li = el("li", "pcard");
    li.style.setProperty("--n", i);
    li.innerHTML = `<span class="when">${esc(p.when)}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p>`;
    pathList.appendChild(li);
  });

  const tools = $("#tools");
  Object.entries(DATA.toolkit).forEach(([group, items]) => {
    const li = el("li", "", `<small>${esc(group)}</small>` + items.map((s) => `<span>${esc(s)}</span>`).join(""));
    tools.appendChild(li);
  });

  const mail = $("#mail");
  mail.href = $("#floatMail").href = "mailto:" + DATA.email;
  mail.textContent = DATA.email;
  const social = $("#social");
  DATA.links.forEach((l) => {
    const li = el("li");
    li.innerHTML = `<a href="${l.href}" target="_blank" rel="noopener">${esc(l.label)}</a>`;
    social.appendChild(li);
  });
  $("#heroResume").href = DATA.resume;

  /* statement: words light up with scroll */
  const sweep = $("#sweep");
  sweep.innerHTML = sweep.textContent.trim().split(/\s+/).map((w) => `<span class="w">${esc(w)}</span>`).join(" ");
  const words = [...sweep.querySelectorAll(".w")];
  const tickSweep = () => {
    const r = sweep.closest("section").getBoundingClientRect();
    const p = reduced ? 1 : clamp((innerHeight * 0.85 - r.top) / (r.height * 0.9));
    const n = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle("lit", i < n));
  };

  /* toolkit: the line nearest the centre of the screen lights up */
  const lines = [...tools.children];
  const tickLines = () => {
    if (reduced) return lines.forEach((l) => l.classList.add("on"));
    const mid = innerHeight / 2; let best = null, bd = 1e9;
    lines.forEach((l) => { const r = l.getBoundingClientRect(); const d = Math.abs(r.top + r.height / 2 - mid); if (d < bd) { bd = d; best = l; } });
    lines.forEach((l) => l.classList.toggle("on", l === best && bd < innerHeight * 0.45));
  };

  /* ---------- reveal ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add("ready")));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach((n) => io.observe(n));

  /* ---------- horizontal projects ---------- */
  const hs = $("#work"), htrack = $("#projects");
  const pinOn = () => !reduced && innerWidth > 860;
  let travel = 0;
  function layoutH() {
    hs.style.height = ""; htrack.style.transform = "";
    if (!pinOn()) return;
    travel = Math.max(0, htrack.scrollWidth - innerWidth);
    hs.style.height = innerHeight + travel + "px";
    tickH();
  }
  function tickH() {
    if (!pinOn() || !hs.style.height) return;
    const r = hs.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight));
    htrack.style.transform = `translate3d(${-p * travel}px,0,0)`;
  }

  /* ---------- hero panel parallax + cursor dot ---------- */
  const panel = $("#panel");
  const dot = $("#dot");
  if (!reduced && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let dx = 0, dy = 0, cx = 0, cy = 0, run = 0;
    const loop = () => {
      cx += (dx - cx) * 0.22; cy += (dy - cy) * 0.22;
      dot.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      run = Math.abs(dx - cx) + Math.abs(dy - cy) > 0.1 ? requestAnimationFrame(loop) : 0;
    };
    addEventListener("pointermove", (e) => {
      dx = e.clientX; dy = e.clientY; if (!run) run = requestAnimationFrame(loop);
      const r = panel.getBoundingClientRect();
      if (e.clientY > r.top - 100 && e.clientY < r.bottom + 100) {
        panel.style.setProperty("--px", ((e.clientX / innerWidth - 0.5) * -28).toFixed(1) + "px");
        panel.style.setProperty("--py", (((e.clientY - r.top) / r.height - 0.5) * -18).toFixed(1) + "px");
      }
    }, { passive: true });
    document.addEventListener("pointerover", (e) => dot.classList.toggle("big", !!e.target.closest("a, .card, button")));
  }

  /* ---------- scroll ticks ---------- */
  let queued = false;
  const nav = $(".nav"), darks = [...document.querySelectorAll(".dark")];
  const tickNav = () => nav.classList.toggle("on-dark", darks.some((d) => { const r = d.getBoundingClientRect(); return r.top < 36 && r.bottom > 36; }));
  const tick = () => { queued = false; tickH(); tickSweep(); tickLines(); tickNav(); };
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(tick); } };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", () => { layoutH(); onScroll(); });
  document.fonts && document.fonts.ready.then(() => { layoutH(); tick(); });
  layoutH(); tick();
})();
