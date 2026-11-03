(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- content ---------- */
  const projects = $("#projects");
  DATA.projects.forEach((p, i) => {
    const li = el("li", "row reveal");
    li.style.setProperty("--i", i % 3);
    li.innerHTML =
      `<h3>${esc(p.title)}<span class="meta">${esc(p.year)}</span></h3>` +
      `<p>${esc(p.text)}</p>` +
      `<div class="side"><span>${p.stack.map(esc).join(", ")}</span>` +
      (p.link ? `<a href="${p.link}" target="_blank" rel="noopener">${esc(p.linkLabel || "Open")}</a>` : "") + `</div>`;
    projects.appendChild(li);
  });

  const pathList = $("#pathList");
  DATA.path.forEach((p, i) => {
    const li = el("li", "row reveal");
    li.style.setProperty("--i", i % 3);
    li.innerHTML = `<h3>${esc(p.title)}<span class="meta">${esc(p.when)}</span></h3><p>${esc(p.text)}</p><div></div>`;
    pathList.appendChild(li);
  });

  const tools = $("#tools");
  Object.entries(DATA.toolkit).forEach(([group, items], i) => {
    const d = el("div", "reveal");
    d.style.setProperty("--i", i);
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

  /* ---------- reveal + nav ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add("ready")));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach((n) => io.observe(n));

  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Burst lab: synthetic trace + envelope detector ---------- */
  const canvas = $("#trace");
  const ctx = canvas.getContext("2d");
  const thr = $("#thr");
  const out = $("#count");
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  // seeded RNG so every visitor sees the same recording
  let seed = 7;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const gauss = () => { let s = 0; for (let i = 0; i < 6; i++) s += rnd(); return (s - 3) / 0.7; };

  const FS = 250;                    // samples per second
  const N = FS * 40;                 // 40 s loop
  const sig = new Float32Array(N);
  let slow = 0;
  for (let i = 0; i < N; i++) {      // 1/f-ish background
    slow = slow * 0.985 + gauss() * 0.06;
    sig[i] = slow + gauss() * 0.11;
  }
  // beta bursts (~20 Hz) with Gaussian envelopes, varied strength
  for (let c = 1.2 * FS; c < N - FS; c += (0.9 + rnd() * 2.2) * FS) {
    const amp = 0.25 + rnd() * 0.9, w = (0.12 + rnd() * 0.18) * FS, f = 16 + rnd() * 10;
    for (let k = -Math.ceil(w * 3); k <= w * 3; k++) {
      const i = Math.round(c + k);
      if (i >= 0 && i < N) sig[i] += amp * Math.exp(-(k * k) / (2 * w * w)) * Math.sin((2 * Math.PI * f * i) / FS);
    }
  }
  // envelope: remove slow drift, rectify, smooth
  const env = new Float32Array(N);
  (() => {
    const hp = new Float32Array(N); let m = 0;
    for (let i = 0; i < N; i++) { m += (sig[i] - m) * 0.08; hp[i] = sig[i] - m; }
    let e = 0;
    for (let i = 0; i < N; i++) { e += (Math.abs(hp[i]) - e) * 0.06; env[i] = e; }
  })();
  const ENV_MAX = 0.55;

  let W = 0, H = 0, dpr = 1;
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const WINDOW = 6 * FS;             // 6 s visible
  let pos = 3 * FS;                  // start at a nice stretch

  function detect(from, to, level) {
    const runs = []; let start = -1;
    for (let i = from; i < to; i++) {
      const on = env[i % N] > level;
      if (on && start < 0) start = i;
      if (!on && start >= 0) { if (i - start > FS * 0.1) runs.push([start, i]); start = -1; }
    }
    if (start >= 0) runs.push([start, to]);
    return runs;
  }

  function draw() {
    const level = parseFloat(thr.value) * ENV_MAX;
    const from = Math.floor(pos), to = from + WINDOW;
    const mid = H * 0.5, gain = H * 0.34;
    ctx.clearRect(0, 0, W, H);
    const xOf = (i) => ((i - pos) / WINDOW) * W;

    const runs = detect(from, to, level);
    ctx.fillStyle = css("--accent");
    ctx.globalAlpha = 0.14;
    runs.forEach(([a, b]) => ctx.fillRect(xOf(a), 0, xOf(b) - xOf(a), H));
    ctx.globalAlpha = 1;

    // threshold line (in envelope space, mapped to the trace's amplitude scale)
    ctx.strokeStyle = css("--accent"); ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    const ty = mid - level * gain * 2.2;
    ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(W, ty); ctx.stroke(); ctx.setLineDash([]);

    // envelope
    ctx.strokeStyle = css("--muted"); ctx.globalAlpha = 0.55; ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 2) {
      const i = from + (x / W) * WINDOW; const y = mid - env[Math.floor(i) % N] * gain * 2.2;
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke(); ctx.globalAlpha = 1;

    // raw signal
    ctx.strokeStyle = css("--ink"); ctx.lineWidth = 1.2; ctx.beginPath();
    for (let x = 0; x <= W; x++) {
      const i = from + (x / W) * WINDOW; const y = mid - sig[Math.floor(i) % N] * gain;
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();

    const n = runs.length;
    out.textContent = `${n} burst${n === 1 ? "" : "s"}`;
  }

  let visible = false, last = 0, raf = 0;
  function frame(t) {
    raf = 0;
    if (!visible) return;
    const dt = Math.min(t - last, 50); last = t;
    pos = (pos + (dt / 1000) * FS * 0.9) % N;
    draw();
    raf = requestAnimationFrame(frame);
  }
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !reduced && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }).observe(canvas);

  addEventListener("resize", () => { size(); draw(); });
  thr.addEventListener("input", draw);
  size(); draw();
})();
