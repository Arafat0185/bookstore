# Maktabatul Ilm

A custom online bookstore built with HTML, CSS and JavaScript, hosted on Cloudflare Pages.

## Pages
- `index.html` – home
- `shop.html` – all books, search and filters
- `book.html?id=5` – one page per book (chosen by the id in the address)
- `basket.html` – the basket
- `about.html`, `delivery.html`, `privacy.html`, `terms.html`

## Code
- `style.css` – the design
- `books.js` – the book data
- `shared.js` – header, footer, basket and book cards used on every page
- `home.js`, `shop.js`, `book.js`, `basket.js` – code for one page each

## Cover images
Run `python download_images.py` once to save the covers into `images/`.

## Roadmap
- [ ] Stripe Checkout and webhooks
- [ ] Domain connected
- [ ] Finish and check the policy pages
