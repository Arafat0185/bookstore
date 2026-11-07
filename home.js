// Home page: featured books and category tiles
const featured = BOOKS.filter(b => b.stock > 0).slice(0, 4);
document.getElementById("featured").innerHTML = featured.map(bookCard).join("");

const counts = {};
BOOKS.forEach(b => { counts[b.category] = (counts[b.category] || 0) + 1; });
const cats = Object.keys(counts).filter(c => c !== "Other").sort((a, b) => counts[b] - counts[a]);
document.getElementById("tiles").innerHTML =
  `<a class="tile" href="shop.html">All books<small>${BOOKS.length} titles</small></a>` +
  cats.map(c => `<a class="tile" href="shop.html?cat=${encodeURIComponent(c)}">${esc(c)}<small>${counts[c]} titles</small></a>`).join("");
