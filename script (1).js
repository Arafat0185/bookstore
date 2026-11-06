const grid = document.getElementById("grid");
const filters = document.getElementById("filters");
const cartDialog = document.getElementById("cart");
const cartItems = document.getElementById("cart-items");
let cart = []; // array of book ids
let activeCategory = "All";

const money = n => "£" + n.toFixed(2);

const COLOURS = ["#5a3a26", "#7a4a22", "#3f2a1d", "#8a3f1a", "#4b3321", "#6b4a2b"];

const esc = t => String(t).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

function fallbackCover(b) {
  return `<div class="cover" style="--c:${COLOURS[b.id % COLOURS.length]}"><span>${esc(b.title)}</span></div>`;
}

// Shows the real cover photo; if the image file is missing, a plain brown cover appears instead.
function coverHTML(b) {
  if (!b.image) return fallbackCover(b);
  return `<div class="photo"><img src="${esc(b.image)}" alt="Cover of ${esc(b.title)}" loading="lazy" data-id="${b.id}"></div>`;
}

grid.addEventListener("error", e => {
  if (e.target.tagName !== "IMG") return;
  const book = BOOKS.find(b => b.id === Number(e.target.dataset.id));
  if (book) e.target.parentNode.outerHTML = fallbackCover(book);
}, true);

function renderFilters() {
  const cats = ["All", ...new Set(BOOKS.map(b => b.category))];
  filters.innerHTML = cats.map(c =>
    `<button class="chip ${c === activeCategory ? "on" : ""}" data-cat="${c}" aria-pressed="${c === activeCategory}">${c}</button>`
  ).join("");
}

function renderGrid() {
  const list = activeCategory === "All" ? BOOKS : BOOKS.filter(b => b.category === activeCategory);
  grid.innerHTML = list.map(b => `
    <article class="card ${b.stock < 1 ? "sold" : ""}">
      ${coverHTML(b)}
      <h3>${esc(b.title)}</h3>
      ${b.arabic ? `<p class="ar-title" lang="ar" dir="rtl">${esc(b.arabic)}</p>` : ""}
      <p class="desc">${esc(b.desc)}</p>
      <div class="buy">
        <span class="price">${money(b.price)}</span>
        <button class="btn small" data-add="${b.id}" ${(b.stock < 1 || cart.includes(b.id)) ? "disabled" : ""}>
          ${b.stock < 1 ? "Sold out" : cart.includes(b.id) ? "In basket" : "Add to basket"}
        </button>
      </div>
    </article>`).join("");
}

function renderCart() {
  const items = cart.map(id => BOOKS.find(b => b.id === id));
  document.getElementById("cart-count").textContent = items.length;
  cartItems.innerHTML = items.length
    ? items.map(b => `<li><span>${esc(b.title)}</span><span>${money(b.price)}</span>
        <button class="link-btn" data-remove="${b.id}">Remove</button></li>`).join("")
    : "<li>Your basket is empty. Choose a book from the shelves.</li>";
  document.getElementById("cart-total").textContent = money(items.reduce((s, b) => s + b.price, 0));
}

filters.addEventListener("click", e => {
  const cat = e.target.dataset.cat;
  if (!cat) return;
  activeCategory = cat;
  renderFilters();
  renderGrid();
});

grid.addEventListener("click", e => {
  const id = Number(e.target.dataset.add);
  if (!id) return;
  const book = BOOKS.find(b => b.id === id);
  const inBasket = cart.filter(x => x === id).length;
  if (inBasket >= book.stock) return; // can't add more than we have
  cart.push(id);
  renderGrid();
  renderCart();
});

cartItems.addEventListener("click", e => {
  const id = Number(e.target.dataset.remove);
  if (!id) return;
  cart = cart.filter(x => x !== id);
  renderGrid();
  renderCart();
});

document.getElementById("open-cart").addEventListener("click", () => cartDialog.showModal());
document.getElementById("close-cart").addEventListener("click", () => cartDialog.close());
document.getElementById("year").textContent = new Date().getFullYear();

renderFilters();
renderGrid();
renderCart();
