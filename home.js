// Home page: hero covers, subject tiles and featured books
const inStock = BOOKS.filter(b => b.stock > 0);
const withImage = list => list.filter(b => b.image);
const arabicFirst = list => [...list].sort((a, b) => (!!b.arabic) - (!!a.arabic));

// Three covers fanned out in the hero
const heroPick = arabicFirst(withImage(inStock)).slice(0, 3);
const heroBox = document.getElementById("hero-books");
if (heroBox) {
  heroBox.innerHTML = (heroPick.length ? heroPick : arabicFirst(inStock).slice(0, 3))
    .map(b => `<a class="hb" href="book.html?id=${b.id}" aria-label="${esc(b.title)}">${coverHTML(b)}</a>`).join("");
}

// Subject tiles
const tiles = document.getElementById("tiles");
if (tiles) {
  const counts = {};
  BOOKS.forEach(b => { counts[b.category] = (counts[b.category] || 0) + 1; });
  const cats = Object.keys(counts).sort((a, b) => (a === "Other") - (b === "Other") || counts[b] - counts[a]);
  tiles.innerHTML = cats.map((c, i) => `<a class="tile" style="--c:${TILE_COLOURS[i % TILE_COLOURS.length]}" href="shop.html?cat=${encodeURIComponent(c)}"><b>${esc(c === "Other" ? "More books" : c)}</b><small>${counts[c]} ${counts[c] === 1 ? "book" : "books"}</small></a>`).join("");
}

// Featured books: in stock, with an image and an Arabic title where possible
const feat = document.getElementById("featured");
if (feat) {
  const pool = arabicFirst(withImage(inStock).length >= 8 ? withImage(inStock) : inStock);
  feat.innerHTML = pool.slice(0, 8).map(bookCard).join("");
}
