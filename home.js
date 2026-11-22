// Home page: subject spines and the book of the week

// Set this to a book's id to choose the book of the week yourself.
// Leave it as null and the first in-stock book with a cover and description is used.
const BOOK_OF_THE_WEEK_ID = null;

// ----- Subjects, drawn as book spines on a shelf -----
const counts = {};
BOOKS.forEach(b => { counts[b.category] = (counts[b.category] || 0) + 1; });
const cats = Object.keys(counts).filter(c => c !== "Other").sort((a, b) => counts[b] - counts[a]);
const SPINE_COLOURS = ["#5a3a26", "#7a2e1c", "#3f2a1d", "#8a3f1a", "#2f3a2c", "#6b4a2b", "#6d2f2f", "#4b3321"];
const SPINE_HEIGHTS = [15, 12.5, 14, 11.5, 15.5, 13];   // rem, so the shelf looks uneven like a real one

document.getElementById("spines").innerHTML =
  `<a class="spine all" style="--h:15.5rem" href="shop.html"><b>All books</b><small>${BOOKS.length}</small></a>` +
  cats.map((c, i) => `<a class="spine" data-cat="${esc(c)}" style="--h:${SPINE_HEIGHTS[i % SPINE_HEIGHTS.length]}rem; --c:${SPINE_COLOURS[i % SPINE_COLOURS.length]}" href="shop.html?cat=${encodeURIComponent(c)}"><b>${esc(c)}</b><small>${counts[c]}</small></a>`).join("") +
  // Plain spines to fill out the shelf. They are decoration only.
  Array.from({ length: 18 }, (_, i) => `<div class="spine filler" aria-hidden="true" style="--h:${10 + (i * 7) % 6}rem; --w:${2.2 + (i * 5) % 3 * .5}rem; --c:${SPINE_COLOURS[(i * 3 + 1) % SPINE_COLOURS.length]}"></div>`).join("");

// ----- Book of the week -----
// A description that just repeats the title is no use, so those books are skipped
const norm = t => t.toLowerCase().replace(/[^a-z0-9 ]/g, "");
const repeatsTitle = b => norm(b.desc).startsWith(norm(b.title).slice(0, 25));
const pick =
  BOOKS.find(b => b.id === BOOK_OF_THE_WEEK_ID) ||
  BOOKS.find(b => b.stock > 0 && b.arabic && b.desc.length > 40 && !repeatsTitle(b)) ||
  BOOKS.find(b => b.stock > 0);

if (pick) {
  document.getElementById("spot").innerHTML = `
    <div class="spot-cover">${coverHTML(pick)}</div>
    <div class="spot-text">
      <h3>${esc(pick.title)}</h3>
      ${pick.arabic ? `<p class="ar-title" lang="ar" dir="rtl">${esc(pick.arabic)}</p>` : ""}
      ${pick.desc && !repeatsTitle(pick) ? `<p>${esc(pick.desc)}</p>` : ""}
      <div class="spot-actions">
        <span class="price big">${money(pick.price)}</span>
        ${addButton(pick)}
        <a href="book.html?id=${pick.id}">View this book</a>
      </div>
    </div>`;
} else {
  document.getElementById("spotlight").remove();
}

// ----- Peek: hover (or focus) a spine and its cover flips open above it -----
(function () {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const peek = document.createElement("div");
  peek.id = "peek"; peek.setAttribute("aria-hidden", "true");
  document.body.appendChild(peek);
  const coverFor = cat => {
    const list = BOOKS.filter(b => b.category === cat && b.image);
    return list.find(b => b.stock > 0) || list[0];
  };
  const show = el => {
    const b = coverFor(el.dataset.cat);
    if (!b) return;
    peek.innerHTML = `<img src="${esc(b.image)}" alt="">`;
    const r = el.getBoundingClientRect(), w = peek.offsetWidth, hgt = peek.offsetHeight;
    peek.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + "px";
    peek.style.top = Math.max(70, r.top - hgt - 28) + "px";
    peek.classList.add("on");
  };
  const hide = () => peek.classList.remove("on");
  document.querySelectorAll(".spine[data-cat]").forEach(el => {
    el.addEventListener("pointerenter", () => show(el));
    el.addEventListener("pointerleave", hide);
    el.addEventListener("focus", () => show(el));
    el.addEventListener("blur", hide);
  });
})();
