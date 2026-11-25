// Hero: three real covers on a shelf (Explanation of Kitab at-Tawheed, Qawa'id Fiqhiyyah summary, The Disease and the Cure).
// The cover photos have white borders, so each one is trimmed in the browser to just the book before it is shown.
function trimCover(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      try {
        const s = Math.min(1, 700 / img.naturalWidth), w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s);
        const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
        const cx = cv.getContext("2d", { willReadFrequently: true }); cx.drawImage(img, 0, 0, w, h);
        const d = cx.getImageData(0, 0, w, h).data;
        const ink = (x, y) => { const i = (y * w + x) * 4; return d[i + 3] > 20 && Math.min(d[i], d[i + 1], d[i + 2]) < 232; };
        const rowHas = y => { let n = 0; for (let x = 0; x < w; x++) if (ink(x, y)) n++; return n > w * .02; };
        const colHas = x => { let n = 0; for (let y = 0; y < h; y++) if (ink(x, y)) n++; return n > h * .02; };
        let t = 0, bt = h - 1, l = 0, r = w - 1;
        while (t < h - 1 && !rowHas(t)) t++; while (bt > t && !rowHas(bt)) bt--;
        while (l < w - 1 && !colHas(l)) l++; while (r > l && !colHas(r)) r--;
        const cw = r - l + 1, ch = bt - t + 1;
        if (cw < w * .3 || ch < h * .3) return resolve({ url: src, ar: img.naturalWidth / img.naturalHeight });
        const out = document.createElement("canvas"); out.width = cw; out.height = ch;
        out.getContext("2d").drawImage(cv, l, t, cw, ch, 0, 0, cw, ch);
        resolve({ url: out.toDataURL("image/png"), ar: cw / ch });
      } catch (e) { resolve({ url: src, ar: img.naturalWidth / img.naturalHeight }); }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
const heroBox = document.getElementById("hero-books");
if (heroBox) {
  Promise.all([5, 7, 39].map(id => BOOKS.find(b => b.id === id)).filter(Boolean).map(async b => {
    const c = b.image ? await trimCover(b.image) : null;
    const face = c ? `<img src="${c.url}" alt="Cover of ${esc(b.title)}">` : fallbackCover(b);
    return `<a class="hb" style="--ar:${c ? c.ar.toFixed(3) : .7}" href="book.html?id=${b.id}" aria-label="${esc(b.title)}"><div class="bk"><div class="bk-front">${face}</div><div class="bk-spine"></div><div class="bk-pages"></div><div class="bk-back"></div></div><i class="bk-shadow"></i></a>`;
  })).then(html => { heroBox.innerHTML = html.join(""); });
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
