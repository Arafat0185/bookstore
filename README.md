# Maktabatul Ilm

A custom online Islamic and Arabic bookstore, built from scratch with plain HTML, CSS and JavaScript. It replaces a paid Shopify store, so it costs almost nothing to run.

**Live site:** https://maktabatul-ilm.com

Rustic and minimal: bare wood, matte browns, aged paper and brass, with parchment for anything you read closely.

## What it does

- Browse a catalogue of 59 books, with English and Arabic titles, prices and stock levels
- Search by title or keyword, filter by subject, and show in-stock books only
- A page for every book, with a cover, description, stock note and related books
- A basket that is saved in the browser, so it survives moving between pages
- Stops customers adding more copies than are in stock, and marks sold-out books
- Responsive layout for phones, tablets and desktops
- Product data on book pages (schema.org) so search engines can show price and stock

## The look and feel

An old library at night: dark walnut, leather and aged paper, with one orange. The textures (wood grain, leather, paper) are drawn by the browser, so there are no image files to load.

- Header on a walnut strip with a search box, the basket and subject links
- Home page: a hero with your covers standing on a wooden shelf, a subject index laid out like a library catalogue, featured books, a quote on leather, and a cream "bookplate" with how it works
- Book cards with covers, English and Arabic titles, price in orange, and "Last copy" or "Sold out" labels
- Pages you read (About, Delivery, Privacy, Terms, the basket) sit on aged paper
- Movement: the headline slides up line by line, the books stand up onto the shelf, the wood and covers drift at different speeds as you scroll, index lines draw themselves, cards fade up, and the quote lights up word by word
- Pages cross-fade when you move between them (in browsers that support it)
- If your device is set to "reduce motion", the movement is switched off
- Effects are in one file (`fx.js`), so the shop still works if it fails

## Built with

- HTML, CSS and vanilla JavaScript (no frameworks, no build step)
- Hosted free on [Cloudflare Pages](https://pages.cloudflare.com/), deployed automatically from this repo on every push
- [Google Fonts](https://fonts.google.com/): Libre Caslon Text (headings), Source Sans 3 (body) and Mirza (Arabic)
- There are no stock photos; the hero uses your own book covers
- Payments will use [Stripe Checkout](https://stripe.com/gb/payments/checkout) (not connected yet)

## Pages

| File | What it is |
|---|---|
| `index.html` | Home: pinned hero, subject spines, book of the week, hadith, why shop here |
| `shop.html` | All books with search and filters. `shop.html?cat=Fiqh` opens one subject |
| `book.html?id=5` | One book. The page is filled in from the `id` in the address |
| `basket.html` | The basket |
| `about.html` | About the shop and contact details |
| `delivery.html` | Delivery and returns |
| `privacy.html`, `terms.html` | Legal pages |

## How the code is organised

Every page loads its scripts in this order, because each one depends on the one before:

1. `books.js`: the book data (a list called `BOOKS`)
2. `shared.js`: code used on every page
3. The page's own script (`home.js`, `shop.js`, `book.js` or `basket.js`)
4. `fx.js`: the effects

| File | Job |
|---|---|
| `style.css` | The whole design. Colours, fonts and textures are variables at the top (`--night`, `--brass`, `--ember` and so on) |
| `books.js` | The catalogue as data. Change a book here and it changes everywhere |
| `shared.js` | Header (with search and subject links), footer, basket functions (saved in `localStorage`) and the book card layout |
| `fx.js` | Header shadow, fade-up on scroll, hero cover drift, quote highlight |
| `home.js` | Hero covers, subject tiles and featured books |
| `shop.js` | Search, subject filters and the in-stock checkbox |
| `book.js` | Builds a single book page and its related books |
| `basket.js` | Shows the basket and lets customers remove items |
| `download_images.py` | One-off script that saves the book covers from Shopify into `images/` |
| `images/` | Logo, favicon and book covers |

```
bookstore/
├── index.html  shop.html  book.html  basket.html
├── about.html  delivery.html  privacy.html  terms.html
├── style.css
├── books.js  shared.js  fx.js  home.js  shop.js  book.js  basket.js
├── download_images.py
└── images/
    ├── logo.png
    ├── favicon.svg
    └── book-1.webp ... book-59.png
```

## Run it on your computer

1. Install [VS Code](https://code.visualstudio.com/) and its **Live Server** extension
2. Clone the repo and open the folder in VS Code
3. Right-click `index.html` and choose **Open with Live Server**
4. The site opens at `http://127.0.0.1:5500/` and refreshes when you save a file

## Add or change books

Each book in `books.js` looks like this:

```js
{
  "id": 1,
  "title": "Description of the Prophet's Prayer",
  "arabic": "",
  "author": "",
  "price": 4.99,
  "stock": 1,
  "category": "Fiqh",
  "image": "images/book-1.webp",
  "desc": "A short description."
}
```

- `id` must be unique, and book pages use it (`book.html?id=1`)
- `stock: 0` shows the book as sold out
- `category` creates the subject filter and the home page spines automatically
- Covers are 1200 x 1500 pixels (4:5). Save new ones in `images/` and point `image` at them

The home page picks featured books automatically. To choose them yourself, edit `home.js`.

## Change the look

- **Colours:** edit the variables at the top of `style.css`
- **Hero covers:** they are picked automatically from your in-stock books
- **Turn an effect off:** remove its numbered section from `fx.js`
- **Hadith:** the quote is in `index.html` inside the `data-split` paragraph

## Book covers

The original covers are links to Shopify's servers, which may stop working once the store is fully closed. Run this once to save them locally:

```
python download_images.py
```

If `python` is not found, use `python3`. If a cover file is missing, the site shows a plain cover with the title instead.

## Publish changes

Pushing to GitHub updates the live site automatically:

```
git add .
git commit -m "Describe what you changed"
git push
```

Wait a minute or two, then hard refresh the live site (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac). If the live site looks different from Live Server, a file probably has not been pushed. Check `git status` and the file list on GitHub.

## To do

- [x] Connect the custom domain
- [x] Move email to free forwarding
- [ ] Replace the [bracketed] placeholders in the delivery, privacy and terms pages, and have them checked
- [x] Contact email set to info@maktabatul-ilm.com
- [ ] Check prices and stock against the real shelves (the data came from an older export)
- [ ] Review the auto-assigned categories and add authors
- [ ] Add Stripe Checkout, with a serverless function and webhook to mark one-off books as sold
- [ ] Add shipping costs
- [x] Favicon, share previews, sitemap and `robots.txt` added
- [ ] Give each book its own static page for better search engine visibility

## Notes

- The basket lives in the visitor's browser, not on a server. Stock is not reserved until checkout is built.
- Never commit secret keys (such as a Stripe secret key) to this repo. Use environment variables.
- The product data came from a Shopify export. The site needs no Shopify account.

## Licence

All rights reserved. Book covers and product descriptions belong to their respective publishers and authors.
