// ===== Effects: loaded on every page, after shared.js =====
// Everything here is decoration. If this file fails, the shop still works.

const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));

// ----- 1. Header gets a shadow once you scroll -----
(function () {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const check = () => header.classList.toggle("solid", scrollY > 10);
  addEventListener("scroll", check, { passive: true });
  check();
})();

// ----- 2. Reveal on scroll: things fade up as they come into view -----
const FXIO = RM ? null : new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    FXIO.unobserve(en.target);
    en.target.classList.remove("fx-pre");
    en.target.classList.add("fx-in");
  });
}, { threshold: 0, rootMargin: "0px 0px -6% 0px" });
function fxWatch(el, delay) {
  if (!FXIO || el.dataset.fx) return;
  el.dataset.fx = "1";
  if (delay) el.style.setProperty("--d", delay + "ms");
  el.classList.add("fx-pre");
  FXIO.observe(el);
}
document.querySelectorAll(".section-head, .ledger a, .usps .wrap > div, .split > *, .page h1, .detail > *, .basket-list").forEach((el, i) => fxWatch(el, (i % 4) * 90));
(function () {
  if (RM) return;
  const seen = new WeakSet();
  function scan(root) {
    [...root.querySelectorAll(".card")].filter(c => !seen.has(c)).forEach((c, i) => { seen.add(c); fxWatch(c, (i % 4) * 90); });
  }
  document.querySelectorAll(".grid").forEach(g => { scan(g); new MutationObserver(() => scan(g)).observe(g, { childList: true }); });
})();

// ----- 3. The hero wood and verse drift at different speeds as you scroll -----
(function () {
  const hero = document.querySelector(".hero3");
  if (!hero || RM) return;
  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { const y = Math.min(scrollY, 700); hero.style.setProperty("--sy", y); ticking = false; });
  }, { passive: true });
})();

// ----- 4. The quote lights up word by word as you scroll -----
(function () {
  const p = document.querySelector("[data-split]");
  if (!p) return;
  const words = p.textContent.trim().split(/\s+/);
  p.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(" ");
  const spans = [...p.querySelectorAll(".w")];
  if (RM) { spans.forEach(s => s.classList.add("on")); return; }
  let ticking = false;
  function update() {
    ticking = false;
    const top = p.getBoundingClientRect().top;
    const t = clamp((innerHeight * .85 - top) / (innerHeight * .4));
    const n = Math.round(t * spans.length);
    spans.forEach((s, i) => s.classList.toggle("on", i < n));
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();

// ----- 5. The catalogue card tilts a little towards the pointer -----
(function () {
  const hero = document.querySelector(".hero3"), card = document.querySelector(".catcard");
  if (!hero || !card || RM || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  hero.addEventListener("pointermove", e => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    card.style.setProperty("--ry", (x * 7).toFixed(2) + "deg");
    card.style.setProperty("--rx", (-y * 6).toFixed(2) + "deg");
  });
  hero.addEventListener("pointerleave", () => { card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg"); });
})();
