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
  g.addColorStop(0, "rgba(232,220,192,.9)");
  g.addColorStop(.4, "rgba(220,205,170,.25)");
  g.addColorStop(1, "rgba(220,205,170,0)");
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
    ctx.globalCompositeOperation = "source-over";
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

// ----- 5. Page transition: a page turns over, and the next page is revealed -----
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
    setTimeout(() => { location.href = a.href; }, 500);
  });
})();

// The sound button was removed. Clear any old saved setting.
try { localStorage.removeItem("sound"); } catch (e) { /* storage blocked */ }

// ----- Helpers for the reveal effects below -----
// Elements get "fx-pre" (hidden state) and then "fx-in" when they scroll into view.
// If this file fails to run, nothing is hidden.
const FXMAP = new Map();   // watched element -> the elements to reveal
const FXIO = RM ? null : new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    FXIO.unobserve(en.target);
    (FXMAP.get(en.target) || []).forEach(el => { el.classList.remove("fx-pre"); el.classList.add("fx-in"); });
  });
}, { threshold: 0, rootMargin: "0px 0px -6% 0px" });

// "watchFor" lets us watch a different element than the one we reveal. A fully clipped
// element (the unrolling scrolls) never counts as visible, so we watch its parent instead.
function fxWatch(el, delay, watchFor) {
  if (!FXIO || el.dataset.fx) return;
  el.dataset.fx = "1";
  if (delay) el.style.setProperty("--d", delay + "ms");
  el.classList.add("fx-pre");
  const target = watchFor || el;
  if (!FXMAP.has(target)) { FXMAP.set(target, []); FXIO.observe(target); }
  FXMAP.get(target).push(el);
}

// ----- 6. Gold ink lines draw themselves under headings -----
document.querySelectorAll(".section h2, .page h1, .related-title, .story-title").forEach(h => { h.classList.add("ink"); fxWatch(h); });

// ----- 7. Parchment unrolls like a scroll, and a wax seal is stamped on the cards -----
const SEAL = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 3c5 0 7 4 11 5s8-1 11 3-1 8 1 12 7 6 6 11-6 6-8 10-1 9-6 11-8-1-12 1-7 5-12 3-6-7-10-9-9-2-11-7 3-8 3-12-4-8-2-12 7-4 10-7 3-9 8-10 4-1 7-1z" fill="#7a2a1c"/><circle cx="32" cy="32" r="19" fill="none" stroke="#a8432e" stroke-width="2"/><path d="M32 17l3.6 9.6 10.2-.5-6.2 8.1 6.2 8.1-10.2-.5L32 51l-3.6-9.6-10.2.5 6.2-8.1-6.2-8.1 10.2.5z" fill="#a8432e" opacity=".85"/></svg>';
document.querySelectorAll(".values .panel, .page.prose, #basket").forEach((el, i) => {
  if (RM) return;
  el.classList.add("unroll");
  el.insertAdjacentHTML("afterbegin", '<span class="rod" aria-hidden="true"></span>');
  if (el.closest(".values")) el.insertAdjacentHTML("beforeend", '<span class="seal" aria-hidden="true">' + SEAL + "</span>");
  fxWatch(el, (i % 3) * 180, el.parentElement);
});

// ----- 8. Subject spines slide out of the shelf -----
document.querySelectorAll(".spines .spine").forEach((el, i) => fxWatch(el, Math.min(i, 24) * 55));

// ----- 9. Covers drop onto the plank and wobble into place (also for books added later by search or filters) -----
(function () {
  if (RM) return;
  const seen = new WeakSet();
  function scan(root) {
    const cards = [...root.querySelectorAll(".card")].filter(c => !seen.has(c));
    cards.forEach((c, i) => { seen.add(c); fxWatch(c, (i % 4) * 120); });
  }
  document.querySelectorAll(".grid").forEach(g => {
    scan(g);
    new MutationObserver(() => scan(g)).observe(g, { childList: true });
  });
  // Stamps on the big book page and the book of the week
  const stampWatch = root => root.querySelectorAll(".stamp").forEach(s => { const p = s.parentElement; if (p && !p.closest(".card")) fxWatch(p); });
  stampWatch(document);
  new MutationObserver(() => stampWatch(document)).observe(document.body, { childList: true, subtree: true });
})();

// ----- 10. The pinned book: pages turn as you scroll -----
(function () {
  const wrap = document.getElementById("story");
  if (!wrap || RM) return;
  const book = wrap.querySelector(".bk-in");
  const leaves = [...wrap.querySelectorAll(".leaf")];
  const n = leaves.length;
  let ticking = false;
  function update() {
    ticking = false;
    const r = wrap.getBoundingClientRect();
    if (r.bottom < -200 || r.top > innerHeight + 200) return;
    const range = wrap.offsetHeight - innerHeight;
    const p = clamp(range > 0 ? -r.top / range : 0);
    const u = clamp((p - .06) / .84) * n;
    leaves.forEach((l, i) => {
      const t = clamp(u - i);
      l.style.setProperty("--e", (t * t * (3 - 2 * t)).toFixed(4));
      l.style.setProperty("--z", ((t < .5 ? n - i : i) * .8).toFixed(1) + "px");
    });
    book.style.setProperty("--s", p.toFixed(3));
  }
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener("scroll", req, { passive: true });
  addEventListener("resize", req);
  update();
})();
