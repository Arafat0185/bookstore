// ===== Shared code: loaded on every page =====

// ----- Small helpers -----
const money = n => "£" + n.toFixed(2);
const esc = t => String(t).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
const COLOURS = ["#5a3a26", "#7a4a22", "#3f2a1d", "#8a3f1a", "#4b3321", "#6b4a2b"];
const byId = id => (typeof BOOKS === "undefined" ? null : BOOKS.find(b => b.id === Number(id)));

// ----- Basket: saved in the browser (localStorage) so it survives page changes -----
// Stored as an object of { bookId: quantity }
function getCart() {
  try { return JSON.parse(localStorage.getItem("cart")) || {}; } catch (e) { return {}; }
}
function saveCart(cart) {
  try { localStorage.setItem("cart", JSON.stringify(cart)); } catch (e) { /* storage blocked */ }
  updateCount();
}
function addToCart(id) {
  const cart = getCart(), book = byId(id);
  if (!book || (cart[id] || 0) >= book.stock) return false; // never more than we have
  cart[id] = (cart[id] || 0) + 1;
  saveCart(cart);
  return true;
}
function removeFromCart(id) {
  const cart = getCart();
  delete cart[id];
  saveCart(cart);
}
function cartCount() { return Object.values(getCart()).reduce((a, b) => a + b, 0); }
function cartLines() {
  const cart = getCart();
  return Object.keys(cart).map(id => ({ book: byId(id), qty: cart[id] })).filter(l => l.book);
}
function updateCount() {
  const el = document.getElementById("cart-count");
  if (el) el.textContent = cartCount();
}

// ----- Pieces of HTML used on several pages -----
function fallbackCover(b) {
  return `<div class="cover" style="--c:${COLOURS[b.id % COLOURS.length]}"><span>${esc(b.title)}</span></div>`;
}
function coverHTML(b) {
  if (!b.image) return fallbackCover(b);
  return `<div class="photo"><img src="${esc(b.image)}" alt="Cover of ${esc(b.title)}" loading="lazy" data-id="${b.id}"></div>`;
}
function addButton(b) {
  const full = (getCart()[b.id] || 0) >= b.stock;
  const label = b.stock < 1 ? "Sold out" : full ? "In basket" : "Add to basket";
  return `<button class="btn small" data-add="${b.id}" ${b.stock < 1 || full ? "disabled" : ""}>${label}</button>`;
}
function bookCard(b) {
  return `<article class="card ${b.stock < 1 ? "sold" : ""}">
    <a class="card-link" href="book.html?id=${b.id}">
      ${coverHTML(b)}
      <h3>${esc(b.title)}</h3>
      ${b.arabic ? `<p class="ar-title" lang="ar" dir="rtl">${esc(b.arabic)}</p>` : ""}
    </a>
    <div class="buy"><span class="price">${money(b.price)}</span>${addButton(b)}</div>
  </article>`;
}

// ----- Header and footer (written once here, shown on every page) -----
const NAV = [["shop", "Shop"], ["about", "About"], ["delivery", "Delivery & returns"]];
const here = location.pathname.split("/").pop().replace(".html", "") || "index";

document.getElementById("site-header").outerHTML = `
  <header class="site-header">
    <a class="brand" href="index.html"><img src="images/logo.png" alt="" class="logo" onerror="this.remove()">Maktabatul Ilm</a>
    <nav aria-label="Main">
      ${NAV.map(([key, label]) => `<a href="${key}.html" class="${here === key || (key === "shop" && here === "book") ? "active" : ""}">${label}</a>`).join("")}
    </nav>
    <a class="cart-btn" href="basket.html">Basket (<span id="cart-count">0</span>)</a>
  </header>`;

document.getElementById("site-footer").outerHTML = `
  <footer class="site-footer">
    <p lang="ar" dir="rtl" class="foot-ar">وقل رب زدني علما</p>
    <p class="social"><a href="https://www.instagram.com/maktabatul_ilm">Instagram</a> &nbsp; <a href="https://www.tiktok.com/@maktabatulilm">TikTok</a> &nbsp; <a href="https://chat.whatsapp.com/LgUagiQaG9V6Nr91ijIy6c?mode=wwc">WhatsApp</a></p>
    <p><a href="privacy.html">Privacy</a> &nbsp; <a href="terms.html">Terms</a> &nbsp; <a href="delivery.html">Delivery & returns</a></p>
    <p>&copy; ${new Date().getFullYear()} Maktabatul Ilm. All rights reserved.</p>
  </footer>`;

updateCount();

// ----- Events that work on every page -----
// "Add to basket" buttons (event delegation: one listener handles every button)
document.addEventListener("click", e => {
  const btn = e.target.closest("[data-add]");
  if (!btn) return;
  if (addToCart(btn.dataset.add)) {
    const full = (getCart()[btn.dataset.add] || 0) >= byId(btn.dataset.add).stock;
    btn.textContent = full ? "In basket" : "Added ✓";
    btn.disabled = full;
  }
});
// If a cover photo is missing, swap in a plain brown cover
document.addEventListener("error", e => {
  if (e.target.tagName !== "IMG" || !e.target.dataset.id) return;
  const book = byId(e.target.dataset.id);
  if (book) e.target.parentNode.outerHTML = fallbackCover(book);
}, true);
