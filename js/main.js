(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR = Math.min(window.devicePixelRatio || 1, 2);

/* ---------- bands: each section is a brain-wave band ---------- */
const BANDS = {
  hero:  { name: 'awake', freq: 2,   hz: 0,  acc: [124, 255, 178] },
  delta: { name: 'delta', freq: 1.2, hz: 2,  acc: [129, 140, 248] },
  theta: { name: 'theta', freq: 2.6, hz: 6,  acc: [56, 189, 248] },
  alpha: { name: 'alpha', freq: 4.5, hz: 10, acc: [74, 222, 128] },
  beta:  { name: 'beta',  freq: 7,   hz: 20, acc: [251, 191, 36] },
  gamma: { name: 'gamma', freq: 11,  hz: 40, acc: [244, 114, 182] },
};
let band = BANDS.hero;
let acc = [...band.acc];
let hzShown = 0;
let burstUntil = 0;

function sizeCanvas(c, w, h) {
  c.width = Math.round(w * DPR); c.height = Math.round(h * DPR);
  const x = c.getContext('2d'); x.setTransform(DPR, 0, 0, DPR, 0, 0); return x;
}
const accRGBA = a => `rgba(${acc[0] | 0},${acc[1] | 0},${acc[2] | 0},${a})`;

let started = false;
function start() {
  if (started) return; started = true;
  document.body.classList.add('cur');
  $$('.hero-top').forEach(e => e.classList.add('in'));
  typer(); initHero(); initReveal();
}

/* ---------- build DOM from data ---------- */
$('#facts').innerHTML = DATA.facts.map(f => `<li>${f}</li>`).join('');
$('#timeline').innerHTML = DATA.timeline.map(t =>
  `<li><span class="when">${t.when}</span><h3>${t.title}</h3><p>${t.text}</p></li>`).join('');
$('#cards').innerHTML = DATA.projects.map((p, i) => {
  const tag = p.link ? 'a' : 'div', href = p.link ? ` href="${p.link}" target="_blank" rel="noopener"` : '';
  return `<${tag} class="card rv"${href}><span class="tag">${p.tag}</span>${p.link ? '<span class="go">↗</span>' : ''}<h3>${p.title}</h3><p>${p.text}</p>${p.stack.length ? `<ul class="stack">${p.stack.map(t => `<li>${t}</li>`).join('')}</ul>` : ''}${spark(p.title)}</${tag}>`;
}).join('');
$('#links').innerHTML = DATA.links.map(l => `<a class="btn${l.primary ? ' primary' : ''}" href="${l.href}" target="_blank" rel="noopener">${l.label}</a>`).join('');
$('#principles').innerHTML = DATA.principles.map(p => `<div class="pr rv"><b>${p.n}</b><h3>${p.title}</h3><p>${p.text}</p></div>`).join('');
$('#skillList').innerHTML = Object.entries(DATA.skills).map(([g, l]) => `<div><h3>${g}</h3><p>${l.join(' · ')}</p></div>`).join('');
['#resumeTop', '#resumeHero'].forEach(id => { $(id).href = DATA.resume; });
$('#year').textContent = new Date().getFullYear();

function spark(seed) { // deterministic "EEG" squiggle per project
  let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const r = () => (h = (h * 1664525 + 1013904223) >>> 0) / 4294967296;
  let d = 'M0 27'; for (let x = 8; x <= 400; x += 8) d += ` L${x} ${27 + (r() - .5) * (8 + 34 * Math.sin(x / 400 * Math.PI) * r())}`;
  return `<svg viewBox="0 0 400 54" preserveAspectRatio="none" aria-hidden="true"><path d="${d}"/></svg>`;
}

/* ---------- typewriter ---------- */
function typer() {
  const el = $('#typed'); let r = 0, c = 0, del = false;
  if (reduced) { el.textContent = DATA.roles[0]; return; }
  (function tick() {
    const s = DATA.roles[r];
    c += del ? -1 : 1; el.textContent = s.slice(0, c);
    let t = del ? 28 : 65;
    if (!del && c === s.length) { del = true; t = 1700; }
    else if (del && c === 0) { del = false; r = (r + 1) % DATA.roles.length; t = 350; }
    setTimeout(tick, t);
  })();
}

/* ---------- mouse / cursor ---------- */
const mouse = { x: -999, y: -999, rx: 0, ry: 0 };
addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
const dot = $('#cur-dot'), ring = $('#cur-ring');
document.addEventListener('pointerover', e => ring.classList.toggle('big', !!e.target.closest('a,button,input,.card,canvas#graphCanvas')));
(function curLoop() {
  mouse.rx = lerp(mouse.rx, mouse.x, .18); mouse.ry = lerp(mouse.ry, mouse.y, .18);
  dot.style.transform = `translate(${mouse.x}px,${mouse.y}px)`;
  ring.style.transform = `translate(${mouse.rx}px,${mouse.ry}px)`;
  requestAnimationFrame(curLoop);
})();

/* ---------- background signal + ripples ---------- */
const bg = $('#bg'); let bctx, BW, BH;
function sizeBg() { BW = innerWidth; BH = innerHeight; bctx = sizeCanvas(bg, BW, BH); }
sizeBg();
const ripples = [];
addEventListener('pointerdown', e => ripples.push({ x: e.clientX, y: e.clientY, r: 0, a: .7 }));
let lastScroll = scrollY, scrollVel = 0, freq = 2, amp = 1, tt = 0, prevT = performance.now();
function bgLoop(now) {
  const dt = Math.min((now - prevT) / 1000, .05); prevT = now;
  const bursting = now < burstUntil;
  scrollVel = lerp(scrollVel, Math.abs(scrollY - lastScroll), .1); lastScroll = scrollY;
  for (let i = 0; i < 3; i++) acc[i] = lerp(acc[i], band.acc[i], .05);
  document.documentElement.style.setProperty('--acc', acc.map(v => v | 0).join(' '));
  freq = lerp(freq, bursting ? 28 : band.freq, .04);
  amp = lerp(amp, 1 + clamp(scrollVel / 18, 0, 2.2) + (bursting ? 3 : 0), .08);
  tt += dt * (reduced ? .15 : 1);
  hzShown = lerp(hzShown, bursting ? 99 : band.hz, .06);

  bctx.clearRect(0, 0, BW, BH);
  const mid = BH * .5, mx = mouse.x / BW;
  for (let l = 0; l < 3; l++) {
    bctx.beginPath();
    for (let x = 0; x <= BW; x += 5) {
      const u = x / BW, near = Math.exp(-Math.pow((u - mx) * 5, 2));
      const y = mid + (l - 1) * 46
        + Math.sin(u * freq * 6.283 + tt * (1.2 + l * .5) + l) * (26 + near * 38) * amp
        + Math.sin(u * freq * 17 + tt * 3) * 7 * amp * (band === BANDS.gamma ? 2 : 1)
        + Math.sin(u * 53 + tt * 7 + l * 9) * 2.4;
      x ? bctx.lineTo(x, y) : bctx.moveTo(x, y);
    }
    bctx.strokeStyle = accRGBA([.22, .12, .06][l] * (bursting ? 2.6 : 1)); bctx.lineWidth = 1.5 - l * .3; bctx.stroke();
  }
  for (let i = ripples.length - 1; i >= 0; i--) {
    const p = ripples[i]; p.r += 340 * dt; p.a -= dt * .7;
    if (p.a <= 0) { ripples.splice(i, 1); continue; }
    bctx.beginPath(); bctx.arc(p.x, p.y, p.r, 0, 6.283); bctx.strokeStyle = accRGBA(p.a * .6); bctx.lineWidth = 1.5; bctx.stroke();
  }
  $('#roHz').textContent = hzShown.toFixed(1);
  requestAnimationFrame(bgLoop);
}
requestAnimationFrame(bgLoop);
setInterval(() => { $('#roClock').textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit' }); }, 1000);

/* ---------- section tracking -> band ---------- */
const navLinks = $$('#topnav a');
const secObs = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const k = e.target.dataset.band; band = BANDS[k];
  $('#roBand').textContent = band.name;
  navLinks.forEach(a => a.classList.toggle('on', a.dataset.band === k));
}), { rootMargin: '-45% 0px -45% 0px' });
$$('section[data-band]').forEach(s => secObs.observe(s));
$('#roBand').textContent = 'awake';

/* ---------- top bar ---------- */
const topBar = $('#top');
addEventListener('scroll', () => topBar.classList.toggle('stuck', scrollY > 30), { passive: true });
$('#menuBtn').addEventListener('click', () => { const o = document.body.classList.toggle('menu'); $('#menuBtn').setAttribute('aria-expanded', o); });
$$('#topnav a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu')));

/* ---------- reveal on scroll ---------- */
function initReveal() {
  const obs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
  }), { threshold: .15 });
  $$('.rv, .timeline li').forEach(el => obs.observe(el));
  const tl = $('#timeline');
  const upd = () => { const r = tl.getBoundingClientRect(); tl.style.setProperty('--p', clamp((innerHeight * .6 - r.top) / r.height, 0, 1)); };
  addEventListener('scroll', upd, { passive: true }); upd();
}

/* ---------- hero: name made of particles ---------- */
let hero;
function initHero() {
  const cv = $('#heroCanvas'), sec = $('#hero'); let ctx, W, H, P = [], visible = true, built = false;
  const build = async () => {
    try { await document.fonts.load('700 200px "Space Grotesk"'); } catch (e) {}
    W = sec.clientWidth; H = sec.clientHeight; ctx = sizeCanvas(cv, W, H);
    const size = Math.min(W * .9 / 3.7, H * .33), step = Math.max(4, Math.round(size / 42));
    const off = document.createElement('canvas'); off.width = W; off.height = H;
    const o = off.getContext('2d'); o.fillStyle = '#fff'; o.font = `700 ${size}px "Space Grotesk",sans-serif`;
    o.textAlign = 'center'; o.textBaseline = 'middle'; o.fillText('DARIN', W / 2, H * .34);
    const d = o.getImageData(0, 0, W, H).data, old = P; P = [];
    for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step)
      if (d[(y * W + x) * 4 + 3] > 128) {
        const i = P.length, prev = old[i];
        P.push({ hx: x, hy: y, x: prev ? prev.x : Math.random() * W, y: prev ? prev.y : Math.random() * H, vx: 0, vy: 0, s: step * .62 });
      }
    hero = { step }; built = true;
  };
  build(); let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { sizeBg(); build(); }, 150); });
  new IntersectionObserver(e => visible = e[0].isIntersecting).observe(sec);
  addEventListener('pointerdown', e => { // click = shockwave
    if (!visible) return; const r = cv.getBoundingClientRect(), cx = e.clientX - r.left, cy = e.clientY - r.top;
    P.forEach(p => { const dx = p.x - cx, dy = p.y - cy, dd = Math.hypot(dx, dy) || 1, f = 900 / (dd + 40); p.vx += dx / dd * f; p.vy += dy / dd * f; });
  });
  (function loop() {
    requestAnimationFrame(loop); if (!visible || !built) return;
    const r = cv.getBoundingClientRect(), mx = mouse.x - r.left, my = mouse.y - r.top, R = 120;
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = accRGBA(.95);
    for (const p of P) {
      if (!reduced) {
        const dx = p.x - mx, dy = p.y - my, dd = Math.hypot(dx, dy);
        if (dd < R) { const f = (1 - dd / R) * 2.4; p.vx += dx / (dd || 1) * f * 3; p.vy += dy / (dd || 1) * f * 3; }
        p.vx += (p.hx - p.x) * .055; p.vy += (p.hy - p.y) * .055; p.vx *= .84; p.vy *= .84; p.x += p.vx; p.y += p.vy;
      } else { p.x = p.hx; p.y = p.hy; }
      ctx.fillRect(p.x, p.y, p.s, p.s);
    }
  })();
}

/* ---------- delta: denoise slider ---------- */
(function denoise() {
  const cv = $('#noiseCanvas'), slider = $('#denoise'), facts = $$('#facts li'); let ctx, W, H, v = 0, vis = false;
  const size = () => { W = cv.clientWidth; H = cv.clientHeight; ctx = sizeCanvas(cv, W, H); };
  size(); addEventListener('resize', size);
  new IntersectionObserver(e => vis = e[0].isIntersecting).observe(cv);
  const apply = () => {
    v = +slider.value / 100;
    facts.forEach((li, i) => { const t = clamp((v * 100 - i * 17) / 17, 0, 1); li.style.opacity = t; li.style.filter = `blur(${(1 - t) * 7}px)`; });
  };
  slider.addEventListener('input', apply); apply();
  // gentle demo sweep so people realise it's interactive
  let hinted = false; // on first view: start noisy, then clean up on its own
  new IntersectionObserver(([e]) => { if (e.isIntersecting && !hinted && !reduced) { hinted = true; let s = 0; slider.value = 0; apply(); const id = setInterval(() => { s += 1.4; slider.value = Math.min(s, 100); apply(); if (s >= 100) clearInterval(id); }, 22); } }, { threshold: .6 }).observe(slider);
  let t = 0;
  (function loop() {
    requestAnimationFrame(loop); if (!vis) return; t += .03;
    ctx.clearRect(0, 0, W, H); ctx.beginPath();
    for (let x = 0; x <= W; x += 3) {
      const u = x / W, clean = Math.sin(u * 14 + t) * H * .28 * Math.sin(u * 3 + t * .3);
      const n = (Math.sin(x * 12.9898 + t * 40) * 43758.5453 % 1) * H * .42 * (1 - v);
      const y = H / 2 + clean + n; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.strokeStyle = accRGBA(.35 + v * .65); ctx.lineWidth = 1 + v * 1.6; ctx.shadowColor = accRGBA(1); ctx.shadowBlur = v * 16; ctx.stroke(); ctx.shadowBlur = 0;
  })();
})();

/* ---------- cards: spotlight + tilt ---------- */
$$('.card').forEach(c => {
  c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px');
    if (!reduced) c.style.transform = `perspective(900px) rotateY(${(x / r.width - .5) * 8}deg) rotateX(${-(y / r.height - .5) * 8}deg) translateZ(0)`;
  });
  c.addEventListener('pointerleave', () => c.style.transform = '');
});

/* ---------- beta: draggable skill constellation ---------- */
(function graph() {
  const cv = $('#graphCanvas'); let ctx, W, H, vis = false, hover = null, drag = null;
  const size = () => { W = cv.clientWidth; H = cv.clientHeight; ctx = sizeCanvas(cv, W, H); };
  size(); addEventListener('resize', size);
  new IntersectionObserver(e => vis = e[0].isIntersecting).observe(cv);
  const hubCols = [[129, 140, 248], [56, 189, 248], [248, 113, 113], [74, 222, 128], [244, 114, 182]];
  const nodes = [], links = [];
  const core = { label: 'Darin', r: 26, x: 0, y: 0, vx: 0, vy: 0, core: true, col: [255, 255, 255], fixed: false };
  nodes.push(core);
  Object.entries(DATA.skills).forEach(([g, list], gi) => {
    const hub = { label: g, r: 30, x: 0, y: 0, vx: 0, vy: 0, hub: true, col: hubCols[gi % 5] }; nodes.push(hub); links.push([core, hub, 140]);
    list.forEach(s => { const n = { label: s, r: 10, x: 0, y: 0, vx: 0, vy: 0, col: hubCols[gi % 5] }; nodes.push(n); links.push([hub, n, 90]); });
  });
  nodes.forEach((n, i) => { const a = i * 2.4; n.x = Math.cos(a) * (40 + i * 6) + 400; n.y = Math.sin(a) * (40 + i * 5) + 250; });
  const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const pick = (x, y) => nodes.find(n => Math.hypot(n.x - x, n.y - y) < n.r + 8);
  cv.addEventListener('pointerdown', e => { const [x, y] = pos(e); drag = pick(x, y) || null; if (drag) cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { const [x, y] = pos(e); hover = pick(x, y) || null; if (drag) { drag.x = x; drag.y = y; drag.vx = drag.vy = 0; } });
  cv.addEventListener('pointerup', () => drag = null); cv.addEventListener('pointerleave', () => { hover = null; });
  const near = n => hover && (n === hover || links.some(([a, b]) => (a === hover && b === n) || (b === hover && a === n)));
  (function loop() {
    requestAnimationFrame(loop); if (!vis) return;
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j]; let dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy + .01, d = Math.sqrt(d2);
      const f = 2600 / d2; dx /= d; dy /= d; a.vx -= dx * f; a.vy -= dy * f; b.vx += dx * f; b.vy += dy * f;
    }
    links.forEach(([a, b, len]) => { const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, f = (d - len) * .02; a.vx += dx / d * f; a.vy += dy / d * f; b.vx -= dx / d * f; b.vy -= dy / d * f; });
    nodes.forEach(n => {
      n.vx += (W / 2 - n.x) * .003; n.vy += (H / 2 - n.y) * .003; n.vx *= .88; n.vy *= .88;
      if (n !== drag) { n.x = clamp(n.x + n.vx, n.r, W - n.r); n.y = clamp(n.y + n.vy, n.r, H - n.r); }
    });
    ctx.clearRect(0, 0, W, H);
    links.forEach(([a, b]) => { const lit = hover && (a === hover || b === hover); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.strokeStyle = lit ? accRGBA(.9) : 'rgba(255,255,255,.12)'; ctx.lineWidth = lit ? 1.6 : 1; ctx.stroke(); });
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    nodes.forEach(n => {
      const dim = hover && !near(n), c = n.col.join(',');
      ctx.globalAlpha = dim ? .3 : 1; ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 6.283);
      ctx.fillStyle = n.core ? accRGBA(1) : `rgba(${c},${n.hub ? .9 : .2})`; ctx.shadowColor = `rgb(${n.core ? acc.map(v => v | 0) : c})`; ctx.shadowBlur = n.hub || n.core ? 22 : 8; ctx.fill(); ctx.shadowBlur = 0;
      if (!n.hub && !n.core) { ctx.strokeStyle = `rgb(${c})`; ctx.lineWidth = 1.2; ctx.stroke(); }
      ctx.fillStyle = n.core || n.hub ? '#000' : '#e8eef5'; ctx.font = n.core ? '700 12px "JetBrains Mono",monospace' : n.hub ? '600 10px "JetBrains Mono",monospace' : '12px "JetBrains Mono",monospace';
      if (n.core || n.hub) ctx.fillText(n.label, n.x, n.y); else { ctx.textAlign = 'left'; ctx.fillText(n.label, n.x + n.r + 6, n.y); ctx.textAlign = 'center'; }
      ctx.globalAlpha = 1;
    });
  })();
})();

/* ---------- terminal ---------- */
(function terminal() {
  const term = $('#term'), out = $('#termOut'), inp = $('#termIn'), hist = []; let hi = 0;
  const print = (t, cls = '') => { const d = document.createElement('div'); if (cls) d.className = cls; d.innerHTML = t; out.appendChild(d); out.scrollTop = out.scrollHeight; };
  const open = () => { term.hidden = false; requestAnimationFrame(() => term.classList.add('open')); setTimeout(() => inp.focus(), 50); if (!out.children.length) print("you found the terminal. type <b>help</b>.", 'ok'); };
  const close = () => { term.classList.remove('open'); inp.blur(); };
  const toggle = () => term.classList.contains('open') ? close() : open();
  $('#termBtn').onclick = toggle; $('#termClose').onclick = close;
  const cmds = {
    help: () => 'commands: about · projects · skills · journey · contact · whoami · date · clear · sudo · gamma · exit',
    whoami: () => 'darin davis johnson — 22, student researcher @ KIST, M.S. @ UST.',
    about: () => DATA.facts.map(f => '• ' + f).join('\n'),
    journey: () => DATA.timeline.map(t => `[${t.when}] ${t.title}`).join('\n'),
    projects: () => DATA.projects.map(p => `• ${p.title} (${p.tag})` + (p.link ? `\n  <a href="${p.link}" target="_blank" rel="noopener">${p.link}</a>` : '')).join('\n'),
    skills: () => Object.entries(DATA.skills).map(([g, l]) => `${g.padEnd(10)} ${l.join(', ')}`).join('\n'),
    contact: () => DATA.links.map(l => `${l.label.padEnd(10)} <a href="${l.href}" target="_blank" rel="noopener">${l.href}</a>`).join('\n'),
    date: () => 'Seoul: ' + new Date().toLocaleString('en-GB', { timeZone: 'Asia/Seoul' }),
    ls: () => 'hero/  delta/  theta/  alpha/  beta/  gamma/',
    clear: () => { out.innerHTML = ''; return ''; },
    exit: () => { close(); return ''; },
    gamma: () => { burst(); return 'GAMMA BURST ⚡'; },
    sudo: a => a.join(' ') === 'hire darin' ? 'permission granted. he starts whenever you do. 🚀 → see "contact"' : 'nice try. (hint: sudo hire darin)',
  };
  const form = $('#termForm');
  form.addEventListener('submit', e => {
    e.preventDefault(); const raw = inp.value.trim(); inp.value = ''; if (!raw) return;
    hist.push(raw); hi = hist.length; print('› ' + raw.replace(/</g, '&lt;'), 'cmd');
    const [c, ...a] = raw.toLowerCase().split(/\s+/); const r = cmds[c];
    if (r) { const s = r(a); if (s) print(s); } else print(`command not found: ${c.replace(/</g, '&lt;')} — try <b>help</b>`);
  });
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') { hi = Math.max(0, hi - 1); inp.value = hist[hi] || ''; e.preventDefault(); }
    if (e.key === 'ArrowDown') { hi = Math.min(hist.length, hi + 1); inp.value = hist[hi] || ''; e.preventDefault(); }
  });
  addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
    else if ((e.key === '`' || e.key === '~') && document.activeElement !== inp) { e.preventDefault(); toggle(); }
  });
})();

/* ---------- easter egg: konami -> gamma burst ---------- */
function burst() {
  burstUntil = performance.now() + 3500; document.body.classList.add('burst');
  setTimeout(() => document.body.classList.remove('burst'), 3500);
  for (let i = 0; i < 14; i++) setTimeout(() => ripples.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: 0, a: .9 }), i * 120);
}
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']; let ki = 0;
addEventListener('keydown', e => { ki = (e.key.length === 1 ? e.key.toLowerCase() : e.key) === KONAMI[ki] ? ki + 1 : 0; if (ki === KONAMI.length) { ki = 0; burst(); } });
start();
console.log('%c darin.dev ', 'background:#7CFFB2;color:#000;font-weight:bold', 'psst — try the terminal (`) or the konami code.');
})();
