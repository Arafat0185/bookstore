// Basket page
const box = document.getElementById("basket");

function renderBasket() {
  const lines = cartLines();
  if (!lines.length) {
    box.innerHTML = `<p>Your basket is empty.</p><p><a class="btn" href="shop.html">Browse the shelves</a></p>`;
    return;
  }
  const total = lines.reduce((s, l) => s + l.book.price * l.qty, 0);
  box.innerHTML = `
    <ul class="basket-list">
      ${lines.map(l => `<li>
        <a href="book.html?id=${l.book.id}">${esc(l.book.title)}</a>
        <span>${l.qty} × ${money(l.book.price)}</span>
        <button class="link-btn" data-remove="${l.book.id}">Remove</button>
      </li>`).join("")}
    </ul>
    <p class="cart-total">Subtotal: <strong>${money(total)}</strong></p>
    <p class="small-print">Delivery is calculated at checkout.</p>
    <button class="btn" disabled>Checkout opens soon</button>`;
}

box.addEventListener("click", e => {
  if (!e.target.dataset.remove) return;
  removeFromCart(e.target.dataset.remove);
  renderBasket();
});
renderBasket();
