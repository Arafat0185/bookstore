const grid = document.getElementById("grid");
const filters = document.getElementById("filters");
const cartDialog = document.getElementById("cart");
const cartItems = document.getElementById("cart-items");
let cart = []; // array of book ids
let activeCategory = "All";

const money = n => "£" + n.toFixed(2);

function coverHTML(b) {
  return `<div class="cover" style="--c:${b.colour}"><span>${b.title}</span></div>`;
}

function renderFilters() {
  const cats = ["All", ...new Set(BOOKS.map(b => b.category))];
  filters.innerHTML = cats.map(c =>
    `<button class="chip ${c === activeCategory ? "on" : ""}" data-cat="${c}" aria-pressed="${c === activeCategory}">${c}</button>`
  ).join("");
}

function renderGrid() {
  const list = activeCategory === "All" ? BOOKS : BOOKS.filter(b => b.category === activeCategory);
  grid.innerHTML = list.map(b => `
    <article class="card">
      ${coverHTML(b)}
      <h3>${b.title}</h3>
      <p class="author">${b.author}</p>
      <p class="desc">${b.desc}</p>
      <div class="buy">
        <span class="price">${money(b.price)}</span>
        <button class="btn small" data-add="${b.id}" ${cart.includes(b.id) ? "disabled" : ""}>
          ${cart.includes(b.id) ? "In basket" : "Add to basket"}
        </button>
      </div>
    </article>`).join("");
}

function renderCart() {
  const items = cart.map(id => BOOKS.find(b => b.id === id));
  document.getElementById("cart-count").textContent = items.length;
  cartItems.innerHTML = items.length
    ? items.map(b => `<li><span>${b.title}</span><span>${money(b.price)}</span>
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
  cart.push(id); // one-off books: each can only be added once
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
