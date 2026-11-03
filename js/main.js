(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ART = { purkinje: "assets/img/cajal-purkinje.jpg", hippo: "assets/img/cajal-hippocampus.jpg" };

  /* ---------- content ---------- */
  const projects = $("#projects");
  DATA.projects.forEach((p, i) => {
    const [img, x, y] = (p.art || "purkinje 50% 0%").split(" ");
    const li = el("li", "poster reveal");
    li.style.setProperty("--i", i);
    li.innerHTML =
      `<div class="poster-art" style="background-image:url(${ART[img]});background-position:${x} ${y}"></div>` +
      `<span class="meta">${esc(p.year)}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p>` +
      `<span class="stack">${p.stack.map(esc).join(", ")}</span>` +
      (p.link ? `<a href="${p.link}" target="_blank" rel="noopener">${esc(p.linkLabel || "Open")}</a>` : "");
    projects.appendChild(li);
  });

  const pathList = $("#pathList");
  [...DATA.path].reverse().forEach((p, i, arr) => {
    const li = el("li", "frame" + (i === arr.length - 1 ? " now" : ""));
    li.innerHTML = `<span class="when">${esc(p.when)}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p>`;
    pathList.appendChild(li);
  });

  const tools = $("#tools");
  Object.entries(DATA.toolkit).forEach(([group, items], i) => {
    const d = el("div", "tool-row reveal");
    d.innerHTML = `<h3>${esc(group)}</h3><ul>${items.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`;
    tools.appendChild(d);
  });

  const mail = $("#mail");
  mail.href = "mailto:" + DATA.email;
  mail.textContent = DATA.email;
  const social = $("#social");
  DATA.links.forEach((l) => {
    const li = el("li");
    li.innerHTML = `<a href="${l.href}" target="_blank" rel="noopener">${esc(l.label)}</a>`;
    social.appendChild(li);
  });
  $("#navResume").href = $("#heroResume").href = DATA.resume;

  /* ---------- reveal ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add("ready")));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach((n) => io.observe(n));

  /* ---------- hero spotlight: the drawing is lit where you look ---------- */
  const hero = $("#hero"), art = $(".art");
  let tx = 72, ty = 40, cx = tx, cy = ty, spot = 0;
  const setSpot = () => {
    spot = 0;
    cx += (tx - cx) * 0.14; cy += (ty - cy) * 0.14;
    art.style.setProperty("--mx", cx + "%"); art.style.setProperty("--my", cy + "%");
    if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.05) spot = requestAnimationFrame(setSpot);
  };
  const aim = (x, y) => { tx = x; ty = y; if (!spot) spot = requestAnimationFrame(setSpot); };
  if (reduced) {
    art.style.setProperty("--mx", "72%"); art.style.setProperty("--my", "40%");
  } else {
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      aim(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
    });
    // touch and idle: the light drifts on its own
    let idle = 0, t0 = 0;
    const drift = (t) => {
      idle = requestAnimationFrame(drift);
      if (matchMedia("(pointer: fine)").matches && hero.matches(":hover")) return;
      t0 = t / 1000;
      aim(62 + Math.sin(t0 * 0.5) * 20, 38 + Math.cos(t0 * 0.37) * 22);
    };
    new IntersectionObserver(([e]) => {
      cancelAnimationFrame(idle);
      if (e.isIntersecting) idle = requestAnimationFrame(drift);
    }).observe(hero);
  }

  /* ---------- path: vertical scroll drives the film strip sideways ---------- */
  const path = $("#path"), strip = $("#strip"), track = $("#pathList");
  const pinOn = () => !reduced && innerWidth > 860;
  let travel = 0;
  function layoutPath() {
    path.classList.remove("pin"); path.style.height = ""; track.style.transform = "";
    if (!pinOn()) return;
    path.classList.add("pin");
    const stick = $(".path-stick");
    travel = Math.max(0, track.scrollWidth + parseFloat(getComputedStyle(strip).paddingInline) * 2 - innerWidth);
    path.style.height = stick.offsetHeight + travel + "px";
    update();
  }
  function update() {
    if (!path.classList.contains("pin")) return;
    const r = path.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
    track.style.transform = `translate3d(${-p * travel}px,0,0)`;
  }
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", layoutPath);
  document.fonts && document.fonts.ready.then(layoutPath);
  layoutPath();
})();
