/* ==========================================
   KREMAH CAFÉ - MAIN FRONTEND SCRIPT
   ========================================== */

let cart = [];
let currentSelectedItem = { name: '', price: 0, desc: '', image: '', qty: 1 };

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const isDark = current === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.innerText = newTheme === 'dark' ? '☾' : '☀️';
  }
}

function toggleDrawer() {
  const drawer = document.getElementById('navDrawer');
  if (drawer) drawer.classList.toggle('open');
}

// Item Detail Modal Handlers
function openItemModal(name, price, desc, image) {
  currentSelectedItem = { name, price, desc, image, qty: 1 };
  document.getElementById('modalItemName').innerText = name;
  document.getElementById('modalItemPrice').innerText = `₱${price}`;
  document.getElementById('modalItemDesc').innerText = desc;
  document.getElementById('modalItemImg').src = image;
  document.getElementById('modalItemQty').innerText = 1;
  document.getElementById('itemModal').classList.add('open');
}

function closeItemModal() {
  document.getElementById('itemModal').classList.remove('open');
}

function adjustModalQty(delta) {
  currentSelectedItem.qty += delta;
  if (currentSelectedItem.qty < 1) {
    currentSelectedItem.qty = 1;
  }
  document.getElementById('modalItemQty').innerText = currentSelectedItem.qty;
}

function addModalItemToCart() {
  const { name, price, qty } = currentSelectedItem;
  const existingItem = cart.find(item => item.name === name);
  if (existingItem) {
    existingItem.qty += qty;
  } else {
    cart.push({ name, price, qty });
  }
  updateCartUI();
  showToast(`Added ${qty} × ${name} to cart!`);
  closeItemModal();
}

// Cart Handlers with Quantity Increments / Decrements
function changeQty(index, delta) {
  if (cart[index]) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
    updateCartUI();
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function updateCartUI() {
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartBtn = document.getElementById('cartFloatBtn');
  if (cartBtn) cartBtn.innerText = `🛒 Cart (${totalCount})`;

  const container = document.getElementById('cartItemsContainer');
  const summary = document.getElementById('cartSummary');
  const checkoutBtn = document.getElementById('checkoutBtn');

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `<p class="modal-desc">Your cart is currently empty. Browse the menu to add something delicious.</p>`;
    if (summary) summary.style.display = 'none';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  let html = '<div style="display: grid; gap: 12px;">';
  let totalPrice = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    totalPrice += itemTotal;
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 8px;">
        <div>
          <strong style="font-size: 14px; display: block;">${item.name}</strong>
          <small style="color: var(--text2);">₱${item.price} each</small>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="cart-qty-ctrl">
            <button type="button" class="cart-qty-btn" onclick="changeQty(${index}, -1)">-</button>
            <span class="cart-qty-num">${item.qty}</span>
            <button type="button" class="cart-qty-btn" onclick="changeQty(${index}, 1)">+</button>
          </div>
          <span style="font-weight: 700; min-width: 50px; text-align: right;">₱${itemTotal}</span>
          <button type="button" onclick="removeFromCart(${index})" style="background: none; border: none; color: #a83232; cursor: pointer; font-size: 16px; margin-left: 4px;">×</button>
        </div>
      </div>
    `;
  });
  html += '</div>';

  container.innerHTML = html;
  if (summary) {
    document.getElementById('cartTotalPrice').innerText = `₱${totalPrice}`;
    summary.style.display = 'block';
  }
  if (checkoutBtn) checkoutBtn.disabled = false;
}

function openCart() {
  document.getElementById('cartModal').classList.add('open');
}

function closeCart() {
  document.getElementById('cartModal').classList.remove('open');
}

function checkoutOrder() {
  if (cart.length === 0) return;
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  alert(`Order placed successfully! Total amount: ₱${totalPrice}. Thank you for ordering from Kremah Café!`);
  cart = [];
  updateCartUI();
  closeCart();
}

function showToast(message) {
  const toast = document.getElementById('toastMsg');
  if (!toast) return;
  toast.innerText = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleFav(event, btn) {
  event.stopPropagation();
  btn.classList.toggle('active');
  btn.innerText = btn.classList.contains('active') ? '♥' : '♡';
}

function filterCategory(category, tabBtn) {
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  tabBtn.classList.add('active');

  const cards = document.querySelectorAll('.menu-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const match = category === 'all' || card.getAttribute('data-category') === category;
    card.style.display = match ? 'flex' : 'none';
    if (match) visibleCount++;
  });

  const noRes = document.getElementById('noResultsMsg');
  if (noRes) noRes.style.display = visibleCount === 0 ? 'block' : 'none';
}

function filterMenu() {
  const searchInput = document.getElementById('menuSearch');
  if (!searchInput) return;
  const query = searchInput.value.toLowerCase();
  const cards = document.querySelectorAll('.menu-card');
  const clearBtn = document.getElementById('searchClear');
  if (clearBtn) clearBtn.classList.toggle('visible', query.length > 0);

  let visibleCount = 0;
  cards.forEach(card => {
    const name = card.getAttribute('data-name').toLowerCase();
    const match = name.includes(query);
    card.style.display = match ? 'flex' : 'none';
    if (match) visibleCount++;
  });

  const noRes = document.getElementById('noResultsMsg');
  if (noRes) noRes.style.display = visibleCount === 0 ? 'block' : 'none';
}

function clearSearch() {
  const searchInput = document.getElementById('menuSearch');
  if (searchInput) searchInput.value = '';
  const clearBtn = document.getElementById('searchClear');
  if (clearBtn) clearBtn.classList.remove('visible');
  filterMenu();
}

window.addEventListener('scroll', () => {
  const topBtn = document.getElementById('backTopBtn');
  if (!topBtn) return;
  if (window.scrollY > 400) {
    topBtn.classList.add('visible');
  } else {
    topBtn.classList.remove('visible');
  }
});