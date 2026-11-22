// ===== Effects: loaded on every page, after shared.js =====
// Everything here is decoration. If this file fails, the shop still works.

const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));

// ----- 1. Header turns solid once you scroll away from the top of the home page -----
(function () {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const check = () => header.classList.toggle("solid", scrollY > 40);
  addEventListener("scroll", check, { passive: true });
  check();
})();

// ----- 2. Hero: parallax with the mouse, camera push-in as you scroll, drifting dust -----
(function () {
  const hero = document.querySelector(".hero");
  if (!hero || RM) return;
  const wrap = hero.parentElement;
  let tx = 0, ty = 0, cx = 0, cy = 0, lastP = -1, visible = true;

  if (FINE) {
    addEventListener("pointermove", e => {
      tx = (e.clientX / innerWidth - .5) * 2;
      ty = (e.clientY / innerHeight - .5) * 2;
    }, { passive: true });
  }

  // Dust motes: small glowing dots drifting up through the light
  const canvas = hero.querySelector(".dust");
  const ctx = canvas && canvas.getContext("2d");
  let motes = [], W = 0, H = 0, dpr = 1;
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 32;
  const sctx = sprite.getContext("2d");
  const g = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, "rgba(255,225,170,1)");
  g.addColorStop(.4, "rgba(255,190,110,.35)");
  g.addColorStop(1, "rgba(255,190,110,0)");
  sctx.fillStyle = g; sctx.fillRect(0, 0, 32, 32);

  function resize() {
    if (!canvas) return;
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const n = W < 720 ? 22 : 46;
    motes = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H, s: 2 + Math.random() * 5,
      vy: .1 + Math.random() * .3, vx: (Math.random() - .5) * .15,
      a: .25 + Math.random() * .6, ph: Math.random() * 6.28
    }));
  }
  function draw(t) {
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    for (const m of motes) {
      m.y -= m.vy; m.x += m.vx + Math.sin(t * .0006 + m.ph) * .12;
      if (m.y < -10) { m.y = H + 10; m.x = Math.random() * W; }
      const tw = .55 + .45 * Math.sin(t * .0015 + m.ph);
      ctx.globalAlpha = m.a * tw;
      ctx.drawImage(sprite, m.x - m.s * 2, m.y - m.s * 2, m.s * 4, m.s * 4);
    }
    ctx.globalAlpha = 1;
  }
  resize();
  addEventListener("resize", resize);

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); }).observe(wrap);
  let running = false;
  function loop(t = 0) {
    if (!visible || document.hidden) { running = false; return; }
    running = true;
    // Phones have no mouse, so the camera sways gently by itself
    if (!FINE) { tx = Math.sin(t * .0003) * .6; ty = Math.cos(t * .00024) * .3; }
    cx += (tx - cx) * .06; cy += (ty - cy) * .06;
    const range = wrap.offsetHeight - innerHeight;
    const p = clamp(range > 0 ? -wrap.getBoundingClientRect().top / range : 0);
    hero.style.setProperty("--mx", cx.toFixed(3));
    hero.style.setProperty("--my", cy.toFixed(3));
    if (Math.abs(p - lastP) > .001) { hero.style.setProperty("--p", p.toFixed(4)); lastP = p; }
    draw(t);
    requestAnimationFrame(loop);
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden && visible && !running) loop(); });
  loop();
})();

// ----- 3. Hadith: the words light up one by one as you scroll -----
(function () {
  const p = document.querySelector("[data-split]");
  if (!p) return;
  const words = p.textContent.trim().split(/\s+/);
  p.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(" ");
  if (RM) { p.querySelectorAll(".w").forEach(s => s.classList.add("on")); return; }
  const spans = [...p.querySelectorAll(".w")];
  let ticking = false;
  function update() {
    ticking = false;
    const top = p.getBoundingClientRect().top;
    const t = clamp((innerHeight * .9 - top) / (innerHeight * .5));
    const n = Math.round(t * spans.length);
    spans.forEach((s, i) => s.classList.toggle("on", i < n));
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();

// ----- 4. Book covers tilt towards the pointer, with a soft sheen -----
(function () {
  if (RM || !FINE) return;
  let active = null;
  const reset = el => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); el.style.setProperty("--so", "0"); };
  document.addEventListener("pointermove", e => {
    const el = e.target.closest && e.target.closest(".photo, .cover");
    if (active && active !== el) { reset(active); active = null; }
    if (!el) return;
    active = el;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", ((x - .5) * 12).toFixed(2) + "deg");
    el.style.setProperty("--rx", (-(y - .5) * 12).toFixed(2) + "deg");
    el.style.setProperty("--sx", (x * 100).toFixed(1) + "%");
    el.style.setProperty("--sy", (y * 100).toFixed(1) + "%");
    el.style.setProperty("--so", "1");
  }, { passive: true });
})();

// ----- 5. Page transition: the book covers close, the next page opens -----
(function () {
  const root = document.documentElement;
  addEventListener("pageshow", e => { if (e.persisted) root.classList.remove("cv-leave"); });
  if (RM) return;
  document.addEventListener("click", e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin) return;
    if (u.pathname === location.pathname && u.search === location.search) return; // same page, just a #link
    e.preventDefault();
    root.classList.remove("cv-intro", "cv-quick");
    root.classList.add("cv-leave");
    setTimeout(() => { location.href = a.href; }, 380);
  });
})();

// ----- 6. Optional room sound: a soft hush with the odd crackle. Off until you press the button. -----
(function () {
  const header = document.querySelector(".site-header");
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!header || !AC) return;

  const btn = document.createElement("button");
  btn.className = "sound-btn";
  btn.setAttribute("aria-label", "Room sound");
  btn.setAttribute("aria-pressed", "false");
  btn.title = "Room sound";
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path class="off-slash" d="M3 3l18 18"/></svg>';
  header.insertBefore(btn, header.querySelector(".cart-btn"));

  let ctx = null, master = null, timer = null, on = false;
  function build() {
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    // warm room tone: brown noise through a low-pass filter
    const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 420;
    const bed = ctx.createGain(); bed.gain.value = .55;
    src.connect(lp); lp.connect(bed); bed.connect(master); src.start();
    // a faint low hum
    const o = ctx.createOscillator(); o.frequency.value = 82; const og = ctx.createGain(); og.gain.value = .035;
    o.connect(og); og.connect(master); o.start();
  }
  function crackle() {
    if (!on) return;
    const n = ctx.sampleRate * .03, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ctx.createBufferSource(); s.buffer = b;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1800 + Math.random() * 2500;
    const gn = ctx.createGain(); gn.gain.value = .05 + Math.random() * .12;
    s.connect(bp); bp.connect(gn); gn.connect(master); s.start();
    timer = setTimeout(crackle, 400 + Math.random() * 2600);
  }
  function set(next) {
    on = next;
    btn.setAttribute("aria-pressed", String(on));
    try { localStorage.setItem("sound", on ? "on" : "off"); } catch (e) { /* storage blocked */ }
    if (on) {
      if (!ctx) build();
      ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(.16, ctx.currentTime + 1.5);
      crackle();
    } else if (ctx) {
      clearTimeout(timer);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + .6);
    }
  }
  btn.addEventListener("click", () => set(!on));

  // Browsers block sound until you interact, so if you had it on, it resumes on your first click or key press
  let wanted = false;
  try { wanted = localStorage.getItem("sound") === "on"; } catch (e) { /* storage blocked */ }
  if (wanted) {
    btn.setAttribute("aria-pressed", "true");
    const resume = () => { removeEventListener("pointerdown", resume); removeEventListener("keydown", resume); if (!on) set(true); };
    addEventListener("pointerdown", resume); addEventListener("keydown", resume);
  }
})();
