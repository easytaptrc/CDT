/* =========================================================
   CDT TRAINING CENTER — interacciones y transiciones
   ========================================================= */
(function () {
  const CFG = window.CDT || { whatsapp: "528712509390", timeZone: "America/Monterrey" };
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);

  /* ---------- WhatsApp links ---------- */
  const waURL = (msg) => `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(msg || "Hola CDT Training Center")}`;
  $$("[data-wa]").forEach((a) => { a.href = waURL(a.dataset.wa); });

  $$(".year").forEach((y) => (y.textContent = new Date().getFullYear()));

  /* ---------- smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    if (hasGSAP) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const scrollToTarget = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else (typeof target === "string" ? $(target) : target)?.scrollIntoView({ behavior: "smooth" });
  };

  /* ---------- menu ---------- */
  const burger = $(".burger");
  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    $(".menu").setAttribute("aria-hidden", String(!open));
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));

  /* ---------- anchor links ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2 || !$(id)) return;
      e.preventDefault();
      if (document.body.classList.contains("menu-open")) { setMenu(false); setTimeout(() => scrollToTarget(id), 350); }
      else scrollToTarget(id);
    });
  });

  /* ---------- WhatsApp form ---------- */
  const form = $(".wa-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = form.nombre.value.trim();
    if (!nombre) { form.nombre.classList.add("err"); form.nombre.focus(); return; }
    form.nombre.classList.remove("err");
    let msg = `Hola CDT Training Center 👋\nSoy ${nombre}.\nMe interesa: ${form.paquete.value}.`;
    if (form.mensaje.value.trim()) msg += `\n${form.mensaje.value.trim()}`;
    window.open(waURL(msg), "_blank", "noopener");
  });

  /* ---------- hours: ticks, live clock, today ---------- */
  const ring = $(".clock-ring");
  const nowHour = () => Number(new Intl.DateTimeFormat("es-MX", { hour: "numeric", hourCycle: "h23", timeZone: CFG.timeZone }).format(new Date()));
  for (let i = 0; i < 48; i++) {
    const t = document.createElement("i");
    t.style.transform = `translateX(-50%) rotate(${i * 7.5}deg)`;
    if (i % 2 === 0) t.className = (i / 2) % 6 === 0 ? "major" : "";
    t.dataset.h = i % 2 === 0 ? i / 2 : "";
    ring.appendChild(t);
  }
  const clockNow = $(".clock-now");
  const updateClock = () => {
    try {
      clockNow.textContent = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: CFG.timeZone }).format(new Date()) + " h";
      const h = nowHour();
      $$(".clock-ring i").forEach((t) => t.classList.toggle("now", t.dataset.h !== "" && Number(t.dataset.h) === h));
    } catch (e) { clockNow.textContent = ""; }
  };
  updateClock(); setInterval(updateClock, 15000);
  try {
    const wd = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: CFG.timeZone }).format(new Date());
    const idx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
    const li = $(`.days li[data-d="${idx}"]`); li && li.classList.add("today");
  } catch (e) {}

  /* ---------- flip cards (touch) ---------- */
  $$(".flip").forEach((c) => {
    c.addEventListener("click", (e) => { if (e.target.closest(".btn")) return; if (!finePointer) c.classList.toggle("flipped"); });
    c.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); c.classList.toggle("flipped"); } });
  });

  /* ---------- lightbox ---------- */
  const lb = $(".lightbox"), lbImg = $("img", lb);
  const openLB = (src, alt) => { lbImg.src = src; lbImg.alt = alt || ""; lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); lenis && lenis.stop(); };
  const closeLB = () => { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); lenis && lenis.start(); };
  lb.addEventListener("click", (e) => { if (e.target !== lbImg) closeLB(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeLB(); if (document.body.classList.contains("menu-open")) setMenu(false); } });

  /* ---------- 3D carousel ---------- */
  const carousel = $(".carousel"), cRing = $(".carousel-ring"), figs = $$("figure", cRing);
  const C = { angle: 0, vel: 0, radius: 500, step: 360 / figs.length, drag: false, sx: 0, moved: 0, last: 0, auto: reduce ? 0 : -0.06 };
  const layoutCarousel = () => {
    const cw = Math.round(Math.min(280, Math.max(170, window.innerWidth * 0.36)));
    carousel.style.setProperty("--cw", cw + "px");
    C.radius = Math.round((cw / 2) / Math.tan(Math.PI / figs.length) * 1.14);
    figs.forEach((f, i) => { f.style.transform = `rotateY(${i * C.step}deg) translateZ(${C.radius}px)`; });
  };
  layoutCarousel(); window.addEventListener("resize", layoutCarousel);
  let downFig = null;
  carousel.addEventListener("pointerdown", (e) => {
    C.drag = true; C.sx = e.clientX; C.last = e.clientX; C.moved = 0; downFig = e.target.closest("figure");
    carousel.classList.add("dragging");
  });
  window.addEventListener("pointermove", (e) => {
    if (!C.drag) return;
    const dx = e.clientX - C.last; C.last = e.clientX; C.moved += Math.abs(dx);
    C.angle += dx * 0.25; C.vel = dx * 0.25;
  }, { passive: true });
  window.addEventListener("pointerup", () => {
    if (!C.drag) return;
    C.drag = false; carousel.classList.remove("dragging");
    if (C.moved < 6 && downFig) { const im = $("img", downFig); openLB(im.currentSrc || im.src, im.alt); }
    downFig = null;
  });
  const carouselTick = () => {
    if (!C.drag) { C.vel *= 0.94; C.angle += C.vel + C.auto + (lenis ? lenis.velocity * -0.04 : 0); }
    cRing.style.transform = `translateZ(${-C.radius}px) rotateX(-6deg) rotateY(${C.angle}deg)`;
    requestAnimationFrame(carouselTick);
  };
  requestAnimationFrame(carouselTick);

  /* ---------- custom cursor + magnetic + tilt ---------- */
  if (finePointer && !reduce) {
    const cur = $(".cursor"), dot = $(".cursor-dot"), ringEl = $(".cursor-ring");
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`; }, { passive: true });
    (function loop() { rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16; ringEl.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
    document.addEventListener("pointerover", (e) => { cur.classList.toggle("hover", !!e.target.closest("a, button, .flip, .carousel figure, input, select, textarea")); });

    $$(".magnetic").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.3, y = (e.clientY - r.top - r.height / 2) * 0.4;
        b.style.transition = "transform .25s ease-out";
        b.style.transform = `translate(${x}px, ${y}px)`;
      });
      b.addEventListener("pointerleave", () => { b.style.transition = "transform .7s cubic-bezier(.22,1,.36,1)"; b.style.transform = ""; });
    });

    $$("[data-tilt]").forEach((el) => {
      const max = el.classList.contains("stack") ? 12 : 9;
      // transition is only set while interacting, so it never interferes with GSAP measuring
      el.addEventListener("transitionend", (e) => { if (e.target === el && e.propertyName === "transform" && !el.matches(":hover")) el.style.transition = ""; });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = "transform .15s ease-out";
        el.style.transform = `perspective(1100px) rotateX(${-py * max}deg) rotateY(${px * max}deg) translateZ(0)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transition = "transform .9s cubic-bezier(.22,1,.36,1)"; el.style.transform = ""; });
    });
  }

  /* ---------- nav state ---------- */
  const nav = $(".nav");
  let lastY = 0;
  const onScroll = (y) => {
    nav.classList.toggle("scrolled", y > 40);
    if (!document.body.classList.contains("menu-open")) nav.classList.toggle("hidden", y > lastY && y > 500);
    lastY = y;
  };
  if (lenis) lenis.on("scroll", (l) => onScroll(l.scroll)); else window.addEventListener("scroll", () => onScroll(scrollY), { passive: true });

  /* ===================================================================
     Everything below needs GSAP. Without it the page still works and
     every piece of content stays visible.
     =================================================================== */
  const preloader = $(".preloader");
  if (!hasGSAP || reduce) {
    preloader && preloader.remove();
    document.body.classList.remove("loading");
    window.Hero3D && window.Hero3D.intro();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add("loading");
  lenis && lenis.stop();

  /* ---------- split text ---------- */
  const splitChars = (el) => {
    const text = el.textContent.trim();
    el.setAttribute("aria-label", text);
    el.innerHTML = text.split(/\s+/).map((w) =>
      `<span class="w" aria-hidden="true">${[...w].map((ch) => `<span class="c">${ch}</span>`).join("")}</span>`
    ).join(" ");
    return $$(".c", el);
  };
  $$(".split").forEach((el) => {
    const chars = splitChars(el);
    gsap.set(chars, { yPercent: 115, rotateX: -95, opacity: 0 });
    ScrollTrigger.create({
      trigger: el, start: "top 88%", once: true,
      onEnter: () => gsap.to(chars, { yPercent: 0, rotateX: 0, opacity: 1, duration: 1.1, ease: "power4.out", stagger: 0.018 }),
    });
  });
  $$(".reveal-words").forEach((el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="rw">${w}</span>`).join(" ");
    gsap.fromTo($$(".rw", el), { opacity: 0.12 }, { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 55%", scrub: true } });
  });

  /* ---------- preloader → intro ---------- */
  const preNum = $(".pre-num"), preBar = $(".pre-bar span");
  const critical = $$('img:not([loading="lazy"])');
  let loaded = 0;
  const total = critical.length + 1; // +1 for fonts
  const counter = { v: 0 };
  const bump = () => { loaded++; gsap.to(counter, { v: Math.round((loaded / total) * 100), duration: 0.6, ease: "power2.out", overwrite: true, onUpdate: renderCount }); };
  const renderCount = () => { preNum.textContent = Math.round(counter.v); preBar.style.width = counter.v + "%"; };
  critical.forEach((img) => { if (img.complete) bump(); else { img.addEventListener("load", bump, { once: true }); img.addEventListener("error", bump, { once: true }); } });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(bump);

  let introDone = false;
  const start = performance.now();
  const tryIntro = () => {
    if (introDone) return;
    const elapsed = performance.now() - start;
    if ((loaded >= total && elapsed > 1300) || elapsed > 5500) {
      introDone = true;
      gsap.to(counter, { v: 100, duration: 0.4, onUpdate: renderCount, onComplete: intro });
    } else setTimeout(tryIntro, 120);
  };
  tryIntro();

  function intro() {
    const tl = gsap.timeline({
      onComplete: () => { preloader.remove(); document.body.classList.remove("loading"); lenis && lenis.start(); ScrollTrigger.refresh(); },
    });
    tl.to(".pre-inner", { scale: 0.85, opacity: 0, duration: 0.6, ease: "power3.in" })
      .add(() => window.Hero3D && window.Hero3D.intro(), "-=0.1")
      .to(".pre-top", { rotateX: 90, yPercent: -30, duration: 1.2, ease: "power4.inOut" }, "-=0.05")
      .to(".pre-bottom", { rotateX: -90, yPercent: 30, duration: 1.2, ease: "power4.inOut" }, "<")
      .from(".nav", { yPercent: -120, opacity: 0, duration: 1, ease: "power3.out", clearProps: "all" }, "-=0.5")
      .from(".hero-eyebrow", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.8")
      .from(".ht-word", { yPercent: 110, rotateX: -80, transformOrigin: "50% 100% -60px", duration: 1.4, stagger: 0.12, ease: "expo.out" }, "-=0.8")
      .from(".hero-tag", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.9")
      .from(".hero-actions .btn", { y: 26, opacity: 0, rotateX: -60, duration: 0.9, stagger: 0.08, ease: "power3.out" }, "-=0.7")
      .from(".hero-foot > div", { y: 40, opacity: 0, duration: 0.9, stagger: 0.08, ease: "power3.out" }, "-=0.7")
      .from(".scroll-hint, .wa-float", { opacity: 0, scale: 0.6, duration: 0.6, ease: "back.out(2)", clearProps: "all" }, "-=0.5");
  }

  /* ---------- progress bar ---------- */
  gsap.to(".progress span", { scaleX: 1, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 } });

  /* ---------- hero scroll-out (3D tunnel warp) ---------- */
  ScrollTrigger.create({
    trigger: ".hero", start: "top top", end: "bottom top", scrub: true,
    onUpdate: (s) => window.Hero3D && window.Hero3D.setProgress(s.progress),
  });
  gsap.to(".hero-content", { yPercent: -35, z: 200, rotateX: 18, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "80% top", scrub: true } });
  gsap.to(".hero-foot", { opacity: 0, y: 40, ease: "none", scrollTrigger: { trigger: ".hero", start: "10% top", end: "50% top", scrub: true } });

  /* ---------- marquee reacts to scroll velocity ---------- */
  const mTrack = $(".marquee-track");
  let mx = 0, mBase = -0.6;
  gsap.ticker.add(() => {
    const v = lenis ? lenis.velocity : 0;
    mx += mBase - Math.abs(v) * 0.25;
    const half = mTrack.scrollWidth / 2;
    if (mx <= -half) mx += half;
    mTrack.style.transform = `translateX(${mx}px) skewX(${gsap.utils.clamp(-12, 12, -v * 0.4)}deg)`;
  });
  mTrack.style.animation = "none";

  /* ---------- about ---------- */
  gsap.from(".features li", { y: 40, opacity: 0, rotateX: -40, transformOrigin: "50% 0", duration: 1, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: ".features", start: "top 85%" } });
  gsap.fromTo(".stack", { rotateY: -28, rotateX: 10, z: -200 }, { rotateY: 8, rotateX: -4, z: 0, ease: "none", scrollTrigger: { trigger: ".about-visual", start: "top bottom", end: "bottom top", scrub: 1 } });
  gsap.from(".sc-front", { clipPath: "inset(100% 0 0 0 round 18px)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: ".about-visual", start: "top 75%" } });
  gsap.from(".sc-back", { clipPath: "inset(0 100% 0 0 round 18px)", duration: 1.6, delay: 0.2, ease: "expo.inOut", scrollTrigger: { trigger: ".about-visual", start: "top 75%" } });
  gsap.from(".stack-badge", { opacity: 0, scale: 0.6, rotateY: -90, duration: 1.2, delay: 0.8, ease: "back.out(1.6)", scrollTrigger: { trigger: ".about-visual", start: "top 75%" } });
  $$("[data-count]").forEach((el) => {
    const end = Number(el.dataset.count), o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => gsap.to(o, { v: end, duration: 2, ease: "power3.out", onUpdate: () => (el.textContent = Math.round(o.v)) }) });
  });
  gsap.from(".stat", { y: 50, opacity: 0, duration: 1, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: ".stats", start: "top 88%" } });

  /* ---------- facilities: pinned horizontal coverflow ---------- */
  const track = $(".fac-track"), vp = $(".fac-viewport"), cards = $$(".fac-card");
  const facDist = () => Math.max(0, track.scrollWidth - window.innerWidth);
  gsap.to(track, {
    x: () => -facDist(), ease: "none",
    scrollTrigger: { trigger: vp, start: "top top", end: () => "+=" + facDist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 },
  });
  const coverflow = () => {
    const vw = window.innerWidth, half = vw / 2;
    for (const c of cards) {
      const r = c.getBoundingClientRect();
      const d = (r.left + r.width / 2 - half) / half;
      const ad = Math.min(Math.abs(d), 1.6);
      const ry = gsap.utils.clamp(-48, 48, -d * 38);
      c.style.transform = `translateZ(${-ad * 260}px) rotateY(${ry}deg) scale(${1 - ad * 0.08})`;
      c.style.opacity = String(1 - Math.max(0, ad - 0.9) * 0.9);
      const img = c.querySelector("img");
      img.style.transform = `scale(${img.dataset.z || 1.18}) translateX(${d * -6}%)`;
    }
  };
  gsap.ticker.add(coverflow);
  gsap.from(".fac-img", { clipPath: "inset(100% 0% 0% 0% round 18px)", duration: 1.5, stagger: 0.1, ease: "expo.inOut", scrollTrigger: { trigger: vp, start: "top 75%" } });
  gsap.from(".fac-meta", { y: 40, opacity: 0, duration: 1, stagger: 0.1, delay: 0.4, ease: "power3.out", scrollTrigger: { trigger: vp, start: "top 75%" } });

  /* ---------- team: cards dealt in 3D ---------- */
  gsap.from(".flip", { y: 120, rotateY: -70, rotateX: 20, opacity: 0, transformOrigin: "0% 50%", duration: 1.4, stagger: 0.12, ease: "expo.out", scrollTrigger: { trigger: ".team-grid", start: "top 82%" } });

  /* ---------- pricing ---------- */
  gsap.from(".enroll", { rotateX: -70, y: 60, opacity: 0, transformOrigin: "50% 0%", duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".enroll", start: "top 85%" } });
  gsap.from(".price", { rotateY: 90, z: -200, opacity: 0, transformOrigin: "50% 50%", duration: 1.3, stagger: 0.12, ease: "expo.out", scrollTrigger: { trigger: ".price-grid", start: "top 85%" } });

  /* ---------- hours ---------- */
  gsap.from(".clock3d", { scale: 0.6, rotateX: 60, opacity: 0, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".hours", start: "top 70%" } });
  gsap.from(".days li", { x: 60, opacity: 0, duration: 0.8, stagger: 0.06, ease: "power3.out", scrollTrigger: { trigger: ".days", start: "top 85%" } });
  gsap.from(".open-now", { scale: 0.7, opacity: 0, duration: 0.8, ease: "back.out(2)", scrollTrigger: { trigger: ".open-now", start: "top 90%" } });

  /* ---------- gallery ---------- */
  gsap.from(".carousel", { rotateX: 50, scale: 0.7, opacity: 0, y: 80, duration: 1.8, ease: "expo.out", scrollTrigger: { trigger: ".carousel", start: "top 85%" } });
  ScrollTrigger.create({ trigger: ".carousel", start: "top 85%", once: true, onEnter: () => { C.vel = -14; } });

  /* ---------- CTA: 3D text tilts up as you scroll ---------- */
  gsap.fromTo(".cta-title", { rotateX: 65, scale: 0.75, opacity: 0.2, y: 80 }, { rotateX: 0, scale: 1, opacity: 1, y: 0, ease: "none", scrollTrigger: { trigger: ".cta", start: "top bottom", end: "center 55%", scrub: 1 } });
  gsap.from(".cta-sub, .cta .btn", { y: 30, opacity: 0, duration: 0.9, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: ".cta-sub", start: "top 90%" } });

  /* ---------- contact ---------- */
  gsap.from(".c-card", { x: -60, rotateY: 30, opacity: 0, duration: 1, stagger: 0.1, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: ".contact-cards", start: "top 85%" } });
  gsap.from(".wa-form, .map", { y: 80, rotateX: -20, opacity: 0, duration: 1.2, stagger: 0.15, ease: "expo.out", scrollTrigger: { trigger: ".contact-right", start: "top 85%" } });

  /* ---------- footer ---------- */
  gsap.from(".footer-big", { yPercent: 60, rotateX: -60, opacity: 0, ease: "none", scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: 1 } });

  /* ---------- active nav link ---------- */
  $$(".nav-links a").forEach((a) => {
    const sec = $(a.getAttribute("href"));
    if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onToggle: (s) => a.classList.toggle("active", s.isActive) });
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
