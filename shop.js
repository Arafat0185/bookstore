// Shop page: search, category filter and "in stock only"
const grid = document.getElementById("grid");
const filters = document.getElementById("filters");
const search = document.getElementById("search");
const stockOnly = document.getElementById("stock-only");
const count = document.getElementById("count");

const categories = ["All", ...new Set(BOOKS.map(b => b.category))];
let cat = new URLSearchParams(location.search).get("cat"); // e.g. shop.html?cat=Fiqh
if (!categories.includes(cat)) cat = "All";

function renderFilters() {
  filters.innerHTML = categories.map(c =>
    `<button class="chip ${c === cat ? "on" : ""}" data-cat="${esc(c)}" aria-pressed="${c === cat}">${esc(c)}</button>`).join("");
}

function render() {
  const q = search.value.trim().toLowerCase();
  const list = BOOKS.filter(b =>
    (cat === "All" || b.category === cat) &&
    (!stockOnly.checked || b.stock > 0) &&
    (b.title + " " + b.arabic + " " + b.desc).toLowerCase().includes(q));
  grid.innerHTML = list.length ? list.map(bookCard).join("") : "<p>No books match your search. Try fewer words or another category.</p>";
  count.textContent = `${list.length} ${list.length === 1 ? "book" : "books"}`;
}

filters.addEventListener("click", e => {
  if (!e.target.dataset.cat) return;
  cat = e.target.dataset.cat;
  renderFilters();
  render();
});
search.addEventListener("input", render);
stockOnly.addEventListener("change", render);

renderFilters();
render();
