// Hero: three real covers on a shelf (Explanation of Kitab at-Tawheed, Qawa'id Fiqhiyyah summary, The Disease and the Cure)
const heroBox = document.getElementById("hero-books");
if (heroBox) {
  heroBox.innerHTML = [7, 5, 39].map(id => BOOKS.find(b => b.id === id)).filter(Boolean)
    .map(b => `<a class="hb" href="book.html?id=${b.id}" aria-label="${esc(b.title)}">${coverHTML(b)}</a>`).join("");
}

// Home page: hero covers, subject tiles and featured books
const inStock = BOOKS.filter(b => b.stock > 0);
const withImage = list => list.filter(b => b.image);
const arabicFirst = list => [...list].sort((a, b) => (!!b.arabic) - (!!a.arabic));

// Subject index (like a library catalogue)
const tiles = document.getElementById("tiles");
if (tiles) {
  const counts = {};
  BOOKS.forEach(b => { counts[b.category] = (counts[b.category] || 0) + 1; });
  const cats = Object.keys(counts).sort((a, b) => (a === "Other") - (b === "Other") || counts[b] - counts[a]);
  tiles.innerHTML = cats.map((c, i) => `<a href="shop.html?cat=${encodeURIComponent(c)}"><span class="n">${String(i + 1).padStart(2, "0")}</span><b>${esc(c === "Other" ? "More books" : c)}</b><span class="ct">${counts[c]} ${counts[c] === 1 ? "book" : "books"}</span><span class="ar" aria-hidden="true">→</span></a>`).join("");
}

// Featured books: in stock, with an image and an Arabic title where possible
const feat = document.getElementById("featured");
if (feat) {
  const pool = arabicFirst(withImage(inStock).length >= 8 ? withImage(inStock) : inStock);
  feat.innerHTML = pool.slice(0, 8).map(bookCard).join("");
}
