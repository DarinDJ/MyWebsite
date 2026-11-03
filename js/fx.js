/* Visual effects: a 3D neural network (three.js) and a chrome liquid-metal "DJ" mark
   (Paper Design shaders, Apache-2.0). Everything here is optional: if a library fails
   to load, the page still works with the static design. */
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------------------------------------- 3D network */
async function network() {
  const canvas = document.getElementById("net");
  const panel = document.getElementById("panel");
  if (!canvas || !panel) return;
  const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js");

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 2, 0.1, 100);

  scene.add(new THREE.AmbientLight(0xffffff, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(4, 6, 8); scene.add(key);

  // seeded layout so the network is the same every visit
  let seed = 11; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const layers = [4, 6, 6, 3];
  const nodes = [];
  layers.forEach((n, l) => {
    for (let i = 0; i < n; i++) {
      nodes.push({ l, p: new THREE.Vector3((l - (layers.length - 1) / 2) * 2.7, ((i - (n - 1) / 2) * 1.35) + (rnd() - 0.5) * 0.4, (rnd() - 0.5) * 2.4) });
    }
  });

  const group = new THREE.Group(); scene.add(group);
  const sphere = new THREE.SphereGeometry(0.2, 32, 24);
  const ink = new THREE.MeshStandardMaterial({ color: 0x0d0d0f, roughness: 0.28, metalness: 0.1 });
  const hot = new THREE.MeshStandardMaterial({ color: 0x7a5cf0, roughness: 0.3, metalness: 0.1, emissive: 0x2a1a80, emissiveIntensity: 0.5 });
  nodes.forEach((n, i) => {
    const m = new THREE.Mesh(sphere, i % 5 === 2 ? hot : ink);
    m.position.copy(n.p); group.add(m);
  });

  // edges between neighbouring layers
  const edges = [];
  nodes.forEach((a) => nodes.forEach((b) => { if (b.l === a.l + 1) edges.push([a.p, b.p]); }));
  const pos = new Float32Array(edges.length * 6);
  edges.forEach(([a, b], i) => { pos.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6); });
  const eg = new THREE.BufferGeometry(); eg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  group.add(new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ color: 0x0d0d0f, transparent: true, opacity: 0.2 })));

  // signals travelling along the edges
  const PULSES = 28;
  const pulses = Array.from({ length: PULSES }, () => ({ e: Math.floor(rnd() * edges.length), t: rnd(), s: 0.18 + rnd() * 0.22 }));
  const pg = new THREE.BufferGeometry(); const pp = new Float32Array(PULSES * 3); pg.setAttribute("position", new THREE.BufferAttribute(pp, 3));
  const dotTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d"); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, "#fff"); g.addColorStop(0.45, "#fff"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const points = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0x7a5cf0, size: 0.34, map: dotTex, transparent: true, depthWrite: false, sizeAttenuation: true }));
  group.add(points);

  function placePulses(dt) {
    pulses.forEach((p, i) => {
      p.t += p.s * dt;
      if (p.t > 1) { p.t = 0; p.e = Math.floor(rnd() * edges.length); }
      const [a, b] = edges[p.e];
      pp[i * 3] = a.x + (b.x - a.x) * p.t; pp[i * 3 + 1] = a.y + (b.y - a.y) * p.t; pp[i * 3 + 2] = a.z + (b.z - a.z) * p.t;
    });
    pg.attributes.position.needsUpdate = true;
  }

  let W = 0, H = 0;
  function size() {
    W = panel.clientWidth; H = panel.clientHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    const half = Math.tan((camera.fov * Math.PI) / 360);
    const needW = 10.4, needH = 9.4;
    camera.position.set(0, 0, Math.max(needW / (2 * half * camera.aspect), needH / (2 * half)));
    camera.updateProjectionMatrix();
  }
  size();
  new ResizeObserver(() => { size(); if (!running) render(0); }).observe(panel);

  let tx = 0, ty = 0, rx = 0, ry = 0;
  addEventListener("pointermove", (e) => {
    const r = panel.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2; ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    tx = Math.max(-1.2, Math.min(1.2, tx)); ty = Math.max(-1.2, Math.min(1.2, ty));
  }, { passive: true });

  let running = false, last = 0, time = 0;
  function render(dt) {
    time += dt;
    rx += (ty * 0.25 - rx) * 0.06; ry += (tx * 0.55 - ry) * 0.06;
    group.rotation.y = Math.sin(time * 0.25) * 0.28 + ry;
    group.rotation.x = rx;
    placePulses(dt);
    renderer.render(scene, camera);
  }
  function loop(t) {
    if (!running) return;
    const dt = Math.min((t - last) / 1000, 0.05); last = t;
    render(dt);
    requestAnimationFrame(loop);
  }
  render(0.4);
  document.documentElement.classList.add("fx-net");
  if (reduced) return;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; last = performance.now(); requestAnimationFrame(loop); }
    else if (!e.isIntersecting) running = false;
  }).observe(panel);
}

/* ------------------------------------------------------- chrome liquid-metal mark */
async function marks() {
  const hosts = [...document.querySelectorAll("[data-mark]")];
  if (!hosts.length) return;
  const S = await import("https://cdn.jsdelivr.net/npm/@paper-design/shaders@0.0.82/+esm");
  await document.fonts.ready;

  // draw "DJ" as a black shape on transparent, which the shader turns into chrome
  const c = document.createElement("canvas"); c.width = c.height = 600;
  const x = c.getContext("2d");
  x.fillStyle = "#000"; x.textAlign = "center"; x.textBaseline = "middle";
  x.font = '700 400px "Plus Jakarta Sans", Arial, sans-serif';
  x.fillText("DJ", 300, 322);
  const blob = await new Promise((r) => c.toBlob(r, "image/png"));
  const { pngBlob } = await S.toProcessedLiquidMetal(new File([blob], "mark.png", { type: "image/png" }));
  const img = new Image(); img.src = URL.createObjectURL(pngBlob);
  await img.decode();

  const sizing = S.defaultObjectSizing;
  const uniforms = {
    u_image: img, u_isImage: true, u_shape: 0,
    u_colorBack: [0, 0, 0, 0], u_colorTint: S.getShaderColorFromString("#ffffff"),
    u_repetition: 2, u_softness: 0.1, u_shiftRed: 0.3, u_shiftBlue: 0.3, u_distortion: 0.07, u_contour: 0.4, u_angle: 70,
    u_imageAspectRatio: img.naturalWidth / img.naturalHeight,
    u_fit: S.ShaderFitOptions[sizing.fit], u_scale: sizing.scale, u_rotation: sizing.rotation,
    u_originX: sizing.originX, u_originY: sizing.originY, u_offsetX: sizing.offsetX, u_offsetY: sizing.offsetY,
    u_worldWidth: sizing.worldWidth, u_worldHeight: sizing.worldHeight,
  };
  hosts.forEach((h) => {
    const m = new S.ShaderMount(h, S.liquidMetalFragmentShader, uniforms, { alpha: true, premultipliedAlpha: true }, reduced ? 0 : 0.6, 0, 2, undefined, ["u_image"]);
    h.classList.add("mark-ready");
  });
}

network().catch((e) => console.warn("3D network unavailable:", e));
marks().catch((e) => console.warn("Chrome mark unavailable:", e));
