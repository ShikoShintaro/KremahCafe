/* ── NAV SCROLL & BACK TO TOP ── */
var navbar = document.getElementById('navbar');
window.addEventListener('scroll', function() {
  if (window.scrollY > 60) { navbar.classList.add('scrolled'); }
  else { navbar.classList.remove('scrolled'); }

  var btn = document.getElementById('backTop');
  if (window.scrollY > 400) { btn.classList.add('visible'); }
  else { btn.classList.remove('visible'); }
});

/* ── COLOR THEME ── */
var themeToggle = document.getElementById('themeToggle');
var savedTheme = 'light';
try {
  if (localStorage.getItem('kremah-theme') === 'dark') { savedTheme = 'dark'; }
} catch (error) {
  console.error('Unable to load the saved color theme.', error);
}

function applyTheme(theme) {
  var isDark = theme === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  themeToggle.setAttribute('aria-pressed', String(isDark));
  var label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  themeToggle.setAttribute('aria-label', label);
  themeToggle.setAttribute('title', label);
  themeToggle.firstElementChild.textContent = isDark ? '☀' : '☾';
}

applyTheme(savedTheme);

themeToggle.addEventListener('click', function() {
  var nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  try {
    localStorage.setItem('kremah-theme', nextTheme);
  } catch (error) {
    console.error('Unable to save the color theme preference.', error);
  }
});

/* ── MOBILE DRAWER ── */
document.getElementById('hamburger').addEventListener('click', function() {
  document.getElementById('navDrawer').classList.add('open');
});
document.getElementById('drawerClose').addEventListener('click', function() {
  document.getElementById('navDrawer').classList.remove('open');
});
function closeDrawer() {
  document.getElementById('navDrawer').classList.remove('open');
}

/* ── CATEGORY FILTER ── */
function showCat(cat, btn) {
  var sections = document.querySelectorAll('.cat-section');
  for (var i = 0; i < sections.length; i++) {
    if (cat === 'all' || sections[i].dataset.categoryKey === cat || sections[i].id === 'cat-' + cat) {
      sections[i].className = 'cat-section';
    } else {
      sections[i].className = 'cat-section hidden';
    }
  }
  var tabs = document.querySelectorAll('.cat-tab');
  for (var j = 0; j < tabs.length; j++) {
    tabs[j].className = 'cat-tab';
    tabs[j].setAttribute('aria-selected', 'false');
  }
  if (btn) {
    btn.className = 'cat-tab active';
    btn.setAttribute('aria-selected', 'true');
  }
  document.getElementById('menuSearch').value = '';
  document.getElementById('searchClear').className = 'search-clear';
  document.getElementById('noResults').className = 'no-results';
  showAllCards();
}

/* ── SEARCH ── */
var searchInput = document.getElementById('menuSearch');
var searchClear = document.getElementById('searchClear');

searchInput.addEventListener('input', function() {
  var term = this.value.trim().toLowerCase();
  searchClear.className = term.length ? 'search-clear visible' : 'search-clear';
  filterCards(term);
});

searchClear.addEventListener('click', function() {
  searchInput.value = '';
  this.className = 'search-clear';
  showAllCards();
  document.getElementById('noResults').className = 'no-results';
});

function filterCards(term) {
  var sections = document.querySelectorAll('.cat-section');
  for (var s = 0; s < sections.length; s++) { sections[s].className = 'cat-section'; }
  var tabs = document.querySelectorAll('.cat-tab');
  for (var t = 0; t < tabs.length; t++) { tabs[t].className = 'cat-tab'; }
  tabs[0].className = 'cat-tab active';

  var cards = document.querySelectorAll('.menu-card');
  var found = 0;
  for (var c = 0; c < cards.length; c++) {
    var text = cards[c].innerText.toLowerCase();
    if (!term || text.indexOf(term) !== -1) {
      cards[c].style.display = '';
      found++;
    } else {
      cards[c].style.display = 'none';
    }
  }
  document.getElementById('noResults').className = found ? 'no-results' : 'no-results visible';
}

function showAllCards() {
  var cards = document.querySelectorAll('.menu-card');
  for (var i = 0; i < cards.length; i++) { cards[i].style.display = ''; }
}

/* ── ITEM MODAL & CART SYSTEM ── */
var currentModalItem = null;
var cart = [];

var menuProductImages = {
  'Biscoff Frappe': 'photo-1572490122747-3968b75cc699',
  'Ube Frappe': 'photo-1551024709-8f23befc6f87',
  'Salted Caramel Frappe': 'photo-1461023058943-07fcbe16d735',
  'Choco Java Chip Frappe': 'photo-1541658016709-82535e94bc69',
  'Cookies & Cream Frappe': 'photo-1572490122747-3968b75cc699',
  'Mango Frappe': 'photo-1623065422902-30a2d299bbe4',
  'Strawberry Frappe': 'photo-1579954115545-a95591f28bfc',
  'Matcha Frappe': 'photo-1749104028327-a33087ea4f47',
  'Unicorn Frappe': 'photo-1541658016709-82535e94bc69',
  'Sea Salt Matcha': 'photo-1749104028327-a33087ea4f47',
  'Matcha Banana Pudding': 'photo-1571877227200-a0d98ea607e9',
  'Strawberry Matcha': 'photo-1553530666-ba11a7da3888',
  'Ube Matcha': 'photo-1542518392-13317b1ee2a2',
  'Dirty Matcha': 'photo-1717603545758-88cc454db69b',
  'Matcha Latte': 'photo-1536256263959-770b48d82b0a',
  'Strawberry Milk': 'photo-1579954115545-a95591f28bfc',
  'Hot Chocolate': 'photo-1542990253-0d0f5be5f0ed',
  'Biscoff Milk': 'photo-1626816039720-9660b001f74e',
  'Caramel Macchiato': 'photo-1604298458655-ae6e04213678',
  'Sea Salt Latte': 'photo-1461023058943-07fcbe16d735',
  'Vanilla Latte': 'photo-1541167760496-1628856ab772',
  'Hazelnut Latte': 'photo-1461023058943-07fcbe16d735',
  'White Mocha': 'photo-1517256064527-09c73fc73e38',
  'Caramel Latte': 'photo-1541167760496-1628856ab772',
  'Amerikano': 'photo-1514432324607-a09d9b4aefdd',
  'Spanish Latte': 'photo-1541167760496-1628856ab772',
  'Cappuccino': 'photo-1517256064527-09c73fc73e38',
  'Mocha': 'photo-1461023058943-07fcbe16d735',
  'Carrot Cake': 'photo-1621303837174-89787a7d4729',
  'Red Velvet Cake': 'photo-1586788680434-30d324b2d46f',
  'Chocolate Cake': 'photo-1606313564200-e75d5e30476c',
  'Banana Pudding': 'photo-1571877227200-a0d98ea607e9',
  'Dubai Chewy Cookie': 'photo-1499636136210-6f4ee915583e',
  'Tiramisu': 'photo-1571877227200-a0d98ea607e9',
  'Cookies & Cream Croffles': 'photo-1562376552-0d160a2f238d',
  'Classic Croffles': 'photo-1680457759468-53634c550489',
  'Biscoff Croffles': 'photo-1680457759468-53634c550489',
  'Truffles Pasta': 'photo-1551183053-bf91a1d81141',
  'Carbonara': 'photo-1612874742237-6526221588e3',
  'Baked Mac': 'photo-1536096119648-4cbab718f351',
  'Lasagna': 'photo-1574894709920-11b28e7367e3',
  'Tuna Aglio e Olio': 'photo-1551183053-bf91a1d81141',
  'Garlic Bread': 'photo-1509440159596-0249088772ff',
  'Sole Fries / Barkada Fries': 'photo-1573080496219-bb080dd4f877',
  'Barkada Nachos': 'photo-1513456852971-30c0b8199d4d'
};

function getMenuProductImage(name) {
  return 'https://images.unsplash.com/' + menuProductImages[name] + '?auto=format&fit=crop&w=600&q=80';
}

var cmsStorageKey = 'kremah_cafe_cms_data';

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function(character) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[character];
  });
}

function renderCmsMenu(data) {
  if (!data || !Array.isArray(data.categories) || !Array.isArray(data.items)) return false;
  if (!data.categories.every(function(category) {
    return category && typeof category.key === 'string' && typeof category.name === 'string';
  }) || !data.items.every(function(item) {
    return item && typeof item.name === 'string' && typeof item.category === 'string' &&
      typeof item.price === 'string' && typeof item.desc === 'string';
  })) {
    console.error('Saved Kremah CMS menu has an invalid shape; showing the built-in storefront menu.');
    return false;
  }

  var menu = document.getElementById('menu');
  var categoryTabs = menu.querySelector('.cat-tabs');
  var oldSections = menu.querySelectorAll('.cat-section');
  for (var i = 0; i < oldSections.length; i++) oldSections[i].remove();

  categoryTabs.innerHTML = '';
  var allButton = document.createElement('button');
  allButton.type = 'button';
  allButton.className = 'cat-tab active';
  allButton.setAttribute('role', 'tab');
  allButton.setAttribute('aria-selected', 'true');
  allButton.textContent = 'All';
  allButton.addEventListener('click', function() { showCat('all', allButton); });
  categoryTabs.appendChild(allButton);

  data.categories.forEach(function(category) {
    var categoryButton = document.createElement('button');
    categoryButton.type = 'button';
    categoryButton.className = 'cat-tab';
    categoryButton.setAttribute('role', 'tab');
    categoryButton.setAttribute('aria-selected', 'false');
    categoryButton.textContent = category.name;
    categoryButton.addEventListener('click', function() { showCat(category.key, categoryButton); });
    categoryTabs.appendChild(categoryButton);

    var items = data.items.filter(function(item) { return item.category === category.key; });
    var section = document.createElement('div');
    section.className = 'cat-section';
    section.id = 'cat-' + category.key.replace(/[^a-z0-9_-]/gi, '-');
    section.dataset.categoryKey = category.key;

    var cards = items.map(function(item) {
      var image = menuProductImages[item.name]
        ? getMenuProductImage(item.name)
        : 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80';
      var badge = item.badge ? '<span class="menu-badge-tag">' + escapeHtml(item.badge) + '</span>' : '';
      return '<div class="menu-card">' +
        '<button class="menu-fav" type="button" aria-label="Favourite ' + escapeHtml(item.name) + '">♡</button>' +
        '<div class="menu-img-wrap"><img src="' + escapeHtml(image) + '" alt="' + escapeHtml(item.name) + '" loading="lazy"></div>' +
        '<div class="menu-info"><h4>' + escapeHtml(item.name) + '</h4><p>' + escapeHtml(item.desc) + '</p>' +
        '<div class="menu-foot"><span class="menu-price">' + escapeHtml(item.price) + '</span>' + badge + '</div></div>' +
        '</div>';
    }).join('');

    section.innerHTML = '<div class="cat-header"><h3>' + escapeHtml(category.name) +
      '</h3><div class="cat-line" aria-hidden="true"></div><span class="cat-badge">' +
      items.length + ' Items</span></div><div class="menu-grid">' + cards + '</div>';

    section.querySelectorAll('.menu-card').forEach(function(card, itemIndex) {
      var item = items[itemIndex];
      var image = menuProductImages[item.name]
        ? getMenuProductImage(item.name)
        : 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80';
      card.addEventListener('click', function() {
        openModal(item.name, item.desc, image, item.price, item.badge || '');
      });
      card.querySelector('.menu-fav').addEventListener('click', function(event) {
        toggleFav(event, this);
      });
    });
    menu.appendChild(section);
  });

  var stats = document.querySelectorAll('.strip-num');
  if (stats.length >= 2) {
    stats[0].textContent = data.categories.length;
    stats[1].textContent = data.items.length + (data.items.length >= 46 ? '+' : '');
  }
  if (data.items.length) {
    var prices = data.items.map(function(item) {
      return parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;
    }).filter(Boolean);
    if (prices.length && stats.length >= 3) {
      stats[2].textContent = '₱' + Math.min.apply(Math, prices);
    }
  }
  return true;
}

function applyCmsData(data) {
  if (!renderCmsMenu(data)) return;

  if (data.hero) {
    document.getElementById('heroTag').textContent = data.hero.tag || '';
    document.getElementById('heroTitleText').textContent = data.hero.title || '';
    document.getElementById('heroSubtitleText').textContent = data.hero.sub || '';
    document.getElementById('heroDescription').textContent = data.hero.desc || '';
    var announcement = document.getElementById('cmsAnnouncementBanner');
    announcement.textContent = data.hero.announcement || '';
    announcement.hidden = !data.hero.announcement;
  }

  if (data.store) {
    var monFri = document.getElementById('storeHoursMonFri');
    if (monFri.firstChild && monFri.firstChild.nodeType === Node.TEXT_NODE) {
      monFri.firstChild.nodeValue = data.store.monFri || '';
    }
    document.getElementById('storeHoursSat').textContent = data.store.sat || '';
    document.getElementById('storeHoursSun').textContent = data.store.sun || '';
    document.getElementById('storeAddress').textContent = data.store.address || '';
    document.getElementById('storePhone').textContent = data.store.phone || '';
    document.getElementById('storeEmail').textContent = data.store.email || '';
    if (data.store.mapsUrl) {
      document.getElementById('storeMapsLink').href = data.store.mapsUrl;
    }
  }
}

function loadCmsData() {
  try {
    var saved = localStorage.getItem(cmsStorageKey);
    if (!saved) return null;
    var data = JSON.parse(saved);
    if (!data || !Array.isArray(data.categories) || !Array.isArray(data.items)) {
      console.error('Saved Kremah CMS data is invalid; showing the built-in storefront.');
      return null;
    }
    return data;
  } catch (error) {
    console.error('Unable to load Kremah CMS data.', error);
    return null;
  }
}

var menuCards = document.querySelectorAll('.menu-card');
for (var i = 0; i < menuCards.length; i++) {
  var productName = menuCards[i].querySelector('h4').textContent.trim();
  if (!menuProductImages[productName]) {
    console.error('No product image configured for "' + productName + '".');
    continue;
  }
  var productImage = menuCards[i].querySelector('.menu-img-wrap img');
  productImage.src = getMenuProductImage(productName);
  productImage.alt = productName;
}

var savedCmsData = loadCmsData();
if (savedCmsData) applyCmsData(savedCmsData);

async function loadPublishedCmsData() {
  try {
    var response = await fetch('/api/site-data');
    var result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Unable to load the cafe menu.');
    if (result.data) {
      applyCmsData(result.data);
      try {
        localStorage.setItem(cmsStorageKey, JSON.stringify(result.data));
      } catch (error) {
        console.error('Unable to cache published Kremah CMS data.', error);
      }
    }
  } catch (error) {
    console.error('Unable to load published Kremah CMS data from the server.', error);
    showToast('Unable to connect to the cafe menu service. Showing the last saved menu.');
  }
}

loadPublishedCmsData();

window.addEventListener('storage', function(event) {
  if (event.key !== cmsStorageKey) return;
  if (event.newValue === null) {
    window.location.reload();
    return;
  }
  try {
    applyCmsData(JSON.parse(event.newValue));
  } catch (error) {
    console.error('Unable to apply updated Kremah CMS data.', error);
  }
});

function openModal(title, desc, img, price, badge) {
  var productImage = menuProductImages[title] ? getMenuProductImage(title) : img;
  currentModalItem = { name: title, price: price, desc: desc, img: productImage };
  document.getElementById('mTitle').textContent = title;
  document.getElementById('mDesc').textContent = desc;
  document.getElementById('mImg').src = productImage;
  document.getElementById('mImg').alt = title;
  document.getElementById('mPrice').textContent = price;
  
  var overlay = document.getElementById('modalOverlay');
  overlay.className = 'modal-overlay open';
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  var overlay = document.getElementById('modalOverlay');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function closeModalOnBg(e) {
  if (e.target === document.getElementById('modalOverlay')) { closeModal(); }
}

/* ── LOGIN MODAL LOGIC ── */
function openLoginModal() {
  var overlay = document.getElementById('loginModalOverlay');
  overlay.className = 'modal-overlay open';
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
  var overlay = document.getElementById('loginModalOverlay');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function closeLoginModalOnBg(e) {
  if (e.target === document.getElementById('loginModalOverlay')) { closeLoginModal(); }
}

function submitLogin(e) {
  e.preventDefault();
  var email = document.getElementById('loginEmail').value;
  showToast('Welcome back, ' + email.split('@')[0] + '! Successfully signed in ✨');
  closeLoginModal();
  document.getElementById('loginForm').reset();
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') { 
    closeModal(); 
    closeLoginModal();
  }
});

function addCurrentItemToCart() {
  if (!currentModalItem) return;
  var numericPrice = parseInt(currentModalItem.price.replace(/[^0-9]/g, ''));
  
  var existing = cart.find(item => item.name === currentModalItem.name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      name: currentModalItem.name,
      price: numericPrice,
      qty: 1
    });
  }
  updateCartUI();
  closeModal();
  showToast(currentModalItem.name + ' added to cart! 🛒');
}

function toggleCartDrawer() {
  var drawer = document.getElementById('cartDrawer');
  drawer.style.display = drawer.style.display === 'flex' ? 'none' : 'flex';
}

function updateCartUI() {
  var totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cartCount').textContent = totalCount;
  
  var listContainer = document.getElementById('cartItemsList');
  var checkoutSec = document.getElementById('checkoutSection');
  
  if (cart.length === 0) {
    listContainer.innerHTML = '<p style="color:var(--text2); text-align:center; margin-top:60px;">Your cart is currently empty.</p>';
    checkoutSec.style.display = 'none';
    return;
  }
  
  checkoutSec.style.display = 'block';
  var html = '';
  var totalPrice = 0;
  
  cart.forEach((item, index) => {
    var itemTotal = item.price * item.qty;
    totalPrice += itemTotal;
    html += `
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--cream2); padding:12px; border-radius:8px;">
        <div>
          <h4 style="font-size:14px; margin:0 0 4px 0; color:var(--brown);">${item.name}</h4>
          <span style="font-size:12px; color:var(--text2);">₱${item.price} x ${item.qty} = <b>₱${itemTotal}</b></span>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button type="button" onclick="changeQty(${index}, 1)" style="background:var(--gold); border:none; width:24px; height:24px; border-radius:50%; cursor:pointer; font-weight:bold;">+</button>
          <span style="font-size:13px; font-weight:bold;">${item.qty}</span>
          <button type="button" onclick="changeQty(${index}, -1)" style="background:var(--white); border:none; width:24px; height:24px; border-radius:50%; cursor:pointer; font-weight:bold;">-</button>
        </div>
      </div>
    `;
  });
  
  listContainer.innerHTML = html;
  document.getElementById('cartTotalPrice').textContent = '₱' + totalPrice;
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  updateCartUI();
}

/* ── DATABASE-READY SUBMIT ORDER FUNCTION ── */
async function submitOrder(e) {
  e.preventDefault();
  if (!cart.length) {
    showToast('Add at least one menu item before placing your order.');
    return;
  }

  var submitButton = document.querySelector('#checkoutForm button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Placing order…';
  var customerData = {
    name: document.getElementById('custName').value,
    email: document.getElementById('custEmail').value.trim(),
    phone: document.getElementById('custPhone').value,
    address: document.getElementById('custAddress').value,
    items: cart.map(function(item) {
      return { name: item.name, qty: item.qty };
    })
  };

  try {
    var response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData)
    });
    var result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Order submission failed.');
    showToast('Thank you, ' + customerData.name + '! Order #' + result.orderId + ' was placed successfully 🎉');
    cart = [];
    updateCartUI();
    toggleCartDrawer();
    document.getElementById('checkoutForm').reset();
  } catch (error) {
    console.error('Unable to place customer order:', error);
    showToast(error.message || 'Unable to place your order. Please try again.');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Place Order Now';
  }
}

/* ── FAVOURITE TOGGLE ── */
function toggleFav(e, btn) {
  e.stopPropagation();
  if (btn.classList.contains('active')) {
    btn.classList.remove('active');
    btn.innerHTML = '♡';
    showToast('Removed from favourites');
  } else {
    btn.classList.add('active');
    btn.innerHTML = '♥';
    showToast('Added to favourites ♥');
  }
}

/* ── TOAST ── */
function showToast(msg) {
  var t = document.getElementById('toast');
  t.innerHTML = msg;
  t.className = 'toast show';
  clearTimeout(t._timer);
  t._timer = setTimeout(function() { t.className = 'toast'; }, 2500);
}

/* ── CHATBOT LOGIC ── */
function toggleChat() {
  var box = document.getElementById('chatBox');
  box.style.display = box.style.display === 'flex' ? 'none' : 'flex';
}

function handleChatEnter(e) {
  if (e.key === 'Enter') { sendChatMessage(); }
}

function sendChatMessage() {
  var input = document.getElementById('chatInput');
  var text = input.value.trim().toLowerCase();
  if (!text) return;

  var msgArea = document.getElementById('chatMessages');
  msgArea.innerHTML += '<div style="background:var(--gold); color:var(--brown); padding:8px 12px; border-radius:8px; align-self:flex-end; max-width:85%;">'+ input.value + '</div>';
  
  var reply = "I'm not quite sure about that! Try asking about 'coffee', 'matcha', 'hours', 'location', or 'croffles'.";

  if (text.includes('hour') || text.includes('open') || text.includes('time') || text.includes('schedule')) {
    reply = "🕒 We are open <b>Monday–Friday</b> (2:00 PM – 9:00 PM), <b>Saturday</b> (2:00 PM – 10:00 PM), and <b>Sunday</b> (2:00 PM – 8:00 PM).";
  } else if (text.includes('location') || text.includes('address') || text.includes('where') || text.includes('map')) {
    reply = "📍 We are located at Unit C, Building 2, VS Building, 84 General Luna Street, Guitnang Bayan 1, San Mateo, Rizal.";
  } else if (text.includes('matcha')) {
    reply = "🍵 Our Matcha series uses ceremonial-grade matcha! Favorites include <b>Sea Salt Matcha</b> (₱175), <b>Matcha Banana Pudding</b> (₱200), and <b>Dirty Matcha</b> (₱165).";
  } else if (text.includes('coffee') || text.includes('latte') || text.includes('espresso')) {
    reply = "☕ Our coffee ranges from bold <b>Amerikano</b> (₱98) to sweet favorites like the <b>Spanish Latte</b> (₱139) and <b>Caramel Macchiato</b> (₱159).";
  } else if (text.includes('biscoff') || text.includes('cookie') || text.includes('croffle')) {
    reply = "🍪 Our top viral treats include the **Biscoff Frappe** (₱200), **Dubai Chewy Cookie** (₱129), and **Biscoff Croffles** (₱180)!";
  }

  setTimeout(function() {
    msgArea.innerHTML += '<div style="background:var(--white); padding:8px 12px; border-radius:8px; align-self:flex-start; max-width:85%;">'+ reply + '</div>';
    msgArea.scrollTop = msgArea.scrollHeight;
  }, 300);

  input.value = '';
  msgArea.scrollTop = msgArea.scrollHeight;
}