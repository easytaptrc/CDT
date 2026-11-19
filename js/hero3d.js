/* =========================================================
   HERO 3D — pasillo infinito de luces ámbar, inspirado en
   las instalaciones de CDT (techo con barras de luz, líneas
   en el piso y aros de neón en las paredes).
   ========================================================= */
(function () {
  const canvas = document.getElementById("hero3d");
  const hero = document.querySelector(".hero");
  const api = { intro() {}, setProgress() {}, ready: false };
  window.Hero3D = api;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canvas || typeof THREE === "undefined") { hero && hero.classList.add("no-webgl"); return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  } catch (e) { hero.classList.add("no-webgl"); return; }

  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 1.75));
  renderer.setClearColor(0x0a0a0a, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a0a0a, 6, 64);

  const camera = new THREE.PerspectiveCamera(isMobile ? 72 : 60, 1, 0.1, 140);
  camera.position.set(0, 1.7, 6);

  const AMBER = 0xffa24a, AMBER_HOT = 0xffc27a, RED = 0xd2152f, WHITE = 0xf3efe8;

  const W = 11, H = 4.6, N = 26, S = 4;
  const segments = [];

  const barGeo = new THREE.BoxGeometry(W, 0.06, 0.16);
  const barMat = new THREE.MeshBasicMaterial({ color: AMBER_HOT });
  const glowGeo = new THREE.PlaneGeometry(W + 0.6, 1.1);
  const glowMat = new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.11, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const beamGeo = new THREE.BoxGeometry(W + 1, 0.35, 0.35);
  const beamMat = new THREE.MeshBasicMaterial({ color: 0x141414 });
  const stripGeo = new THREE.BoxGeometry(0.05, 3.4, 0.05);
  const stripMat = new THREE.MeshBasicMaterial({ color: AMBER });
  const ringGeo = new THREE.TorusGeometry(0.5, 0.028, 8, 48);
  const ringMat = new THREE.MeshBasicMaterial({ color: WHITE });
  const redMat = new THREE.MeshBasicMaterial({ color: RED });

  for (let i = 0; i < N; i++) {
    const g = new THREE.Group();
    const bar = new THREE.Mesh(barGeo, barMat); bar.position.y = H; g.add(bar);
    const glow = new THREE.Mesh(glowGeo, glowMat); glow.rotation.x = Math.PI / 2; glow.position.y = H - 0.05; g.add(glow);
    if (i % 2 === 0) { const beam = new THREE.Mesh(beamGeo, beamMat); beam.position.set(0, H + 0.35, -S / 2); g.add(beam); }
    if (i % 2 === 1) {
      [-1, 1].forEach((side) => {
        const s = new THREE.Mesh(stripGeo, i % 6 === 1 ? redMat : stripMat);
        s.position.set(side * (W / 2 + 0.2), 2.1, 0); g.add(s);
      });
    }
    if (i % 4 === 2) {
      [-1, 1].forEach((side) => {
        const r = new THREE.Mesh(ringGeo, ringMat);
        r.scale.set(1, 1.7, 1); r.rotation.y = Math.PI / 2;
        r.position.set(side * (W / 2 - 0.1), 3.1, 0); g.add(r);
      });
    }
    g.position.z = -i * S;
    scene.add(g); segments.push(g);
  }

  // walls (subtle dark planes so the corridor reads in 3D)
  const wallMat = new THREE.MeshBasicMaterial({ color: 0x0f0f0f, side: THREE.DoubleSide });
  const wallGeo = new THREE.PlaneGeometry(N * S + 40, 6);
  [-1, 1].forEach((side) => {
    const w = new THREE.Mesh(wallGeo, wallMat);
    w.rotation.y = Math.PI / 2; w.position.set(side * (W / 2 + 0.4), 2.4, -N * S / 2 + 10); scene.add(w);
  });

  // floor + amber lanes (like the floor lines in their photos)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 260), new THREE.MeshBasicMaterial({ color: 0x0b0b0b }));
  floor.rotation.x = -Math.PI / 2; floor.position.z = -100; scene.add(floor);
  const laneMat = new THREE.MeshBasicMaterial({ color: AMBER });
  const laneDim = new THREE.MeshBasicMaterial({ color: 0x7a4718 });
  [[-1.5, laneMat], [1.5, laneMat], [-4.2, laneDim], [4.2, laneDim]].forEach(([x, m]) => {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.01, 260), m);
    l.position.set(x, 0.01, -100); scene.add(l);
  });
  // floor reflection of ceiling bars (soft)
  const refl = [];
  const reflMat = new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false });
  segments.forEach((seg) => {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.8, 0.5), reflMat);
    r.rotation.x = -Math.PI / 2; r.position.y = 0.02; seg.add(r); refl.push(r);
  });

  // dust particles
  const DUST = isMobile ? 260 : 600;
  const dGeo = new THREE.BufferGeometry();
  const dPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    dPos[i * 3] = (Math.random() - 0.5) * W;
    dPos[i * 3 + 1] = Math.random() * H;
    dPos[i * 3 + 2] = -Math.random() * N * S;
  }
  dGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
  const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({ color: 0xffd2a0, size: 0.035, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(dust);

  // logo at the end of the corridor (only over http; file:// would taint WebGL)
  let logo = null, halo = null;
  const haloTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const x = c.getContext("2d"); const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(210,21,47,0.9)"); gr.addColorStop(0.4, "rgba(210,21,47,0.25)"); gr.addColorStop(1, "rgba(210,21,47,0)");
    x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
  })();
  halo = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: 0 }));
  halo.position.set(0, 2.4, -78); scene.add(halo);
  // the logo sits behind the hero headline; on narrow screens it would clash with the text
  if (location.protocol !== "file:" && !isMobile) {
    new THREE.TextureLoader().load("img/logo.jpg", (tex) => {
      logo = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: 0 }));
      logo.position.set(0, 2.4, -76); scene.add(logo);
    });
  }

  // state
  let speed = reduce ? 0 : 2.2, baseSpeed = reduce ? 0 : 2.2, boost = 0;
  let progress = 0, logoAlpha = 0;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let running = true, visible = true, last = performance.now();

  window.addEventListener("pointermove", (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  function resize() {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  function tick(now) {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (running && visible) {
      const target = baseSpeed + boost + progress * 26;
      speed += (target - speed) * Math.min(1, dt * 3);
      const dz = speed * dt;
      for (const g of segments) {
        g.position.z += dz;
        if (g.position.z > camera.position.z + 2) g.position.z -= N * S;
      }
      const p = dust.geometry.attributes.position;
      for (let i = 0; i < DUST; i++) {
        let z = p.array[i * 3 + 2] + dz * 0.9;
        if (z > camera.position.z + 1) z -= N * S;
        p.array[i * 3 + 2] = z;
        p.array[i * 3 + 1] += Math.sin(now * 0.0005 + i) * 0.0008;
      }
      p.needsUpdate = true;

      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      camera.position.x = mouse.x * 0.9;
      camera.position.y = 1.7 - mouse.y * 0.35 + progress * 0.6;
      camera.lookAt(mouse.x * 0.4, 2.0 - mouse.y * 0.2, -30);
      camera.rotation.z += (-mouse.x * 0.05 - camera.rotation.z) * 0.1;
      const fov = (isMobile ? 72 : 60) + progress * 28;
      if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }

      const pulse = 0.85 + Math.sin(now * 0.0015) * 0.15;
      if (logo) logo.material.opacity = logoAlpha * pulse;
      halo.material.opacity = logoAlpha * 0.7 * pulse;

      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // pause when off-screen / tab hidden
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; last = performance.now(); }, { threshold: 0 }).observe(hero);
  }
  document.addEventListener("visibilitychange", () => { running = !document.hidden; last = performance.now(); });

  api.ready = true;
  api.intro = function () {
    // warp-in: fast, then settle
    if (reduce) { logoAlpha = 1; return; }
    if (window.gsap) {
      boost = 70;
      gsap.to({ v: 70 }, { v: 0, duration: 2.6, ease: "power3.out", onUpdate() { boost = this.targets()[0].v; } });
      gsap.to({ a: 0 }, { a: 1, duration: 2, delay: 0.8, ease: "power2.out", onUpdate() { logoAlpha = this.targets()[0].a; } });
    } else { logoAlpha = 1; }
  };
  api.setProgress = function (p) { progress = p; };
  api.kick = function (v) { boost = Math.max(boost, v); setTimeout(() => (boost = 0), 300); };
})();
