// Book page: shows one book, chosen by the address (book.html?id=5)
const book = byId(new URLSearchParams(location.search).get("id"));
const el = document.getElementById("book");

if (!book) {
  el.innerHTML = `<h1>Book not found</h1><p><a href="shop.html">Back to the shop</a></p>`;
} else {
  document.title = `${book.title} | Maktabatul Ilm`;
  const stockText = book.stock < 1 ? "Sold out" : book.stock === 1 ? "1 copy available" : `${book.stock} in stock`;
  el.innerHTML = `
    <p class="crumbs"><a href="shop.html">Shop</a> / <a href="shop.html?cat=${encodeURIComponent(book.category)}">${esc(book.category)}</a></p>
    <div class="detail ${book.stock < 1 ? "sold" : ""}">
      ${coverHTML(book)}
      <div>
        <h1>${esc(book.title)}</h1>
        ${book.arabic ? `<p class="ar-title big" lang="ar" dir="rtl">${esc(book.arabic)}</p>` : ""}
        <p class="price big">${money(book.price)}</p>
        <p class="stock-note">${stockText}</p>
        <p>${esc(book.desc)}</p>
        <p>${addButton(book)} &nbsp; <a href="basket.html">View basket</a></p>
        <p class="small-print">Posted by Royal Mail. See <a href="delivery.html">delivery &amp; returns</a>.</p>
      </div>
    </div>
    <h2 class="related-title">More like this</h2>
    <div class="grid" id="related"></div>`;

  const related = BOOKS.filter(b => b.category === book.category && b.id !== book.id)
    .sort((a, b) => (b.stock > 0) - (a.stock > 0)).slice(0, 4);
  document.getElementById("related").innerHTML = related.length ? related.map(bookCard).join("") : "";
  if (!related.length) document.querySelector(".related-title").remove();

  // Structured data helps Google show price and stock in search results
  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org", "@type": "Product", name: book.title, description: book.desc,
    offers: { "@type": "Offer", priceCurrency: "GBP", price: book.price.toFixed(2),
      availability: book.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" }
  });
  document.head.appendChild(ld);
}
