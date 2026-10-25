const INITIAL_KREMAH_DATA = {
    categories: [
        { key: 'frappe', name: 'Frappe' },
        { key: 'matcha', name: 'Matcha Series' },
        { key: 'noncoffee', name: 'Non-Coffee' },
        { key: 'coffee', name: 'Coffee' },
        { key: 'pastries', name: 'Pastries & Desserts' },
        { key: 'snacks', name: 'Snacks & Pasta' }
    ],
    store: {
        monFri: '2:00 PM – 9:00 PM',
        sat: '2:00 PM – 10:00 PM',
        sun: '2:00 PM – 8:00 PM',
        phone: '+63 924 121 6120',
        email: 'kremahcafe@gmail.com',
        address: 'Unit C, Building 2, VS Building, 84 General Luna Street, Guitnang Bayan 1, San Mateo, Rizal, Philippines',
        mapsUrl: 'https://maps.app.goo.gl/GbnKkZfuDZRHpf1c8'
    },
    hero: {
        announcement: 'Welcome to Kremah Cafè! Enjoy our new Dubai Chewy Cookie and Fresh Matcha Series.',
        tag: '☕ Good Drinks. Good Food. Good Vibes.',
        title: 'Kremah',
        sub: 'Cafè',
        desc: 'Handcrafted frappes, specialty coffee, matcha drinks, croffles, and more — made with love in every cup.'
    },
    items: [
        /* Frappe */
        { id: '1', name: 'Biscoff Frappe', category: 'frappe', price: '₱200', emoji: '🥐', badge: 'Bestseller', desc: 'Rich Biscoff cookie blended into a creamy, ice-cold frappe topped with whipped cream.' },
        { id: '2', name: 'Ube Frappe', category: 'frappe', price: '₱170', emoji: '💜', badge: 'Fan Fave', desc: 'Vibrant purple ube blended into a silky frappe, topped with whipped cream and ube crumbles.' },
        { id: '3', name: 'Salted Caramel Frappe', category: 'frappe', price: '₱170', emoji: '🍯', badge: 'Classic', desc: 'Sweet, buttery caramel perfectly balanced with a pinch of salt in every icy sip.' },
        { id: '4', name: 'Choco Java Chip Frappe', category: 'frappe', price: '₱190', emoji: '☕', badge: 'Rich', desc: 'Dark chocolate frappe loaded with java chip pieces for a bold mocha crunch.' },
        { id: '5', name: 'Cookies & Cream Frappe', category: 'frappe', price: '₱170', emoji: '🍪', badge: 'Creamy', desc: 'Oreo-blended icy frappe crowned with crushed cookie pieces and whipped cream.' },
        { id: '6', name: 'Mango Frappe', category: 'frappe', price: '₱170', emoji: '🥭', badge: 'Fruity', desc: 'Fresh sweet mango blended into a tropical, sun-kissed icy drink.' },
        { id: '7', name: 'Strawberry Frappe', category: 'frappe', price: '₱170', emoji: '🍓', badge: 'Sweet', desc: 'Sweet ripe strawberry blended with milk and ice into a refreshing pink drink.' },
        { id: '8', name: 'Matcha Frappe', category: 'frappe', price: '₱175', emoji: '🍵', badge: 'Earthy', desc: 'Premium earthy matcha blended smooth with milk and ice — a green tea lover\'s dream.' },
        { id: '9', name: 'Unicorn Frappe', category: 'frappe', price: '₱190', emoji: '🦄', badge: 'Colorful', desc: 'A magical colorful frappe bursting with playful sweet flavor — too pretty to drink.' },

        /* Matcha Series */
        { id: '10', name: 'Sea Salt Matcha', category: 'matcha', price: '₱175', emoji: '🍵', badge: 'Savory-Sweet', desc: 'Premium matcha topped with a velvety salted cream foam — savory meets sweet.' },
        { id: '11', name: 'Matcha Banana Pudding', category: 'matcha', price: '₱200', emoji: '🍌', badge: 'Indulgent', desc: 'Layered matcha drink with a creamy banana pudding base — rich and indulgent.' },
        { id: '12', name: 'Strawberry Matcha', category: 'matcha', price: '₱170', emoji: '🍓', badge: 'Fruity', desc: 'Bright strawberry layered over earthy matcha for a stunning two-tone drink.' },
        { id: '13', name: 'Ube Matcha', category: 'matcha', price: '₱175', emoji: '💜', badge: 'Unique', desc: 'Purple ube and green matcha meet in one vibrant, flavor-packed layered drink.' },
        { id: '14', name: 'Dirty Matcha', category: 'matcha', price: '₱165', emoji: '☕', badge: 'Bold', desc: 'Classic matcha with an espresso shot pulled through — earthy, bold, and energizing.' },
        { id: '15', name: 'Matcha Latte', category: 'matcha', price: '₱150', emoji: '🍵', badge: 'Classic', desc: 'Ceremonial grade matcha whisked smooth with warm steamed milk. Simple and perfect.' },

        /* Non-Coffee */
        { id: '16', name: 'Strawberry Milk', category: 'noncoffee', price: '₱149', emoji: '🍓', badge: 'Sweet', desc: 'Fresh strawberry syrup swirled into cold creamy milk. Sweet, simple, and refreshing.' },
        { id: '17', name: 'Hot Chocolate', category: 'noncoffee', price: '₱159', emoji: '🍫', badge: 'Warm', desc: 'Warm, rich, velvety dark hot chocolate served in a cozy mug. A hug in a cup.' },
        { id: '18', name: 'Biscoff Milk', category: 'noncoffee', price: '₱159', emoji: '🥐', badge: 'Creamy', desc: 'Creamy cold milk infused with the unmistakable caramelized spice of Biscoff cookies.' },

        /* Coffee */
        { id: '19', name: 'Caramel Macchiato', category: 'coffee', price: '₱159', emoji: '☕', badge: 'Bestseller', desc: 'Espresso with vanilla-infused milk and a generous caramel drizzle on top.' },
        { id: '20', name: 'Sea Salt Latte', category: 'coffee', price: '₱149', emoji: '☕', badge: 'Savory-Sweet', desc: 'Smooth espresso latte crowned with a savory salted cream foam layer.' },
        { id: '21', name: 'Vanilla Latte', category: 'coffee', price: '₱159', emoji: '☕', badge: 'Classic', desc: 'Espresso pulled over steamed milk sweetened with a house-made vanilla syrup.' },
        { id: '22', name: 'Hazelnut Latte', category: 'coffee', price: '₱159', emoji: '☕', badge: 'Nutty', desc: 'Rich espresso blended with hazelnut syrup and velvety steamed milk.' },
        { id: '23', name: 'White Mocha', category: 'coffee', price: '₱179', emoji: '☕', badge: 'Sweet', desc: 'Espresso with white chocolate sauce and creamy steamed milk for a sweet, smooth sip.' },
        { id: '24', name: 'Caramel Latte', category: 'coffee', price: '₱159', emoji: '☕', badge: 'Smooth', desc: 'Silky espresso with caramel syrup and creamy milk. Smooth, sweet, and satisfying.' },
        { id: '25', name: 'Amerikano', category: 'coffee', price: '₱98', emoji: '☕', badge: 'Bold', desc: 'Pure bold espresso diluted with hot water. Simple, clean, and strong.' },
        { id: '26', name: 'Spanish Latte', category: 'coffee', price: '₱139', emoji: '☕', badge: 'Sweet', desc: 'Espresso poured over condensed milk and steamed milk for a sweet, indulgent drink.' },
        { id: '27', name: 'Cappuccino', category: 'coffee', price: '₱129', emoji: '☕', badge: 'Classic', desc: 'Espresso with equal parts steamed milk and thick, velvety foam on top.' },
        { id: '28', name: 'Mocha', category: 'coffee', price: '₱152', emoji: '☕', badge: 'Rich', desc: 'Espresso with rich chocolate syrup and steamed milk. Coffee and chocolate in one.' },

        /* Pastries & Desserts */
        { id: '29', name: 'Carrot Cake', category: 'pastries', price: '₱120', emoji: '🥕', badge: 'Homemade', desc: 'Moist, spiced carrot cake layered with smooth cream cheese frosting.' },
        { id: '30', name: 'Red Velvet Cake', category: 'pastries', price: '₱125', emoji: '🍰', badge: 'Classic', desc: 'Classic velvety red layers with rich cream cheese filling and a smooth finish.' },
        { id: '31', name: 'Chocolate Cake', category: 'pastries', price: '₱132', emoji: '🍫', badge: 'Indulgent', desc: 'Decadent, deeply moist chocolate cake. Rich and unapologetically indulgent.' },
        { id: '32', name: 'Banana Pudding', category: 'pastries', price: '₱200', emoji: '🍌', badge: 'Creamy', desc: 'Layers of creamy pudding, fresh banana slices, vanilla wafers, and whipped cream.' },
        { id: '33', name: 'Dubai Chewy Cookie', category: 'pastries', price: '₱129', emoji: '🍪', badge: 'Trending', desc: 'Thick, gooey cookie inspired by the viral Dubai chocolate trend. Chewy in the middle, crisp on the edges.' },
        { id: '34', name: 'Tiramisu', category: 'pastries', price: '₱200', emoji: '🍮', badge: 'Italian', desc: 'Italian classic made with mascarpone, espresso-soaked ladyfingers, and dusted cocoa.' },
        { id: '35', name: 'Cookies & Cream Croffles', category: 'pastries', price: '₱170', emoji: '🧇', badge: 'Crispy', desc: 'Golden croissant pressed into a crispy waffle, loaded with cookies and cream topping.' },
        { id: '36', name: 'Classic Croffles', category: 'pastries', price: '₱160', emoji: '🧇', badge: 'Buttery', desc: 'Buttery croissant pressed flat on a waffle iron until golden and shatteringly crisp.' },
        { id: '37', name: 'Biscoff Croffles', category: 'pastries', price: '₱180', emoji: '🥐', badge: 'Bestseller', desc: 'A crispy croissant waffle generously drizzled with warm Biscoff caramelized spread.' },

        /* Snacks & Pasta */
        { id: '38', name: 'Truffles Pasta', category: 'snacks', price: '₱199', emoji: '🍝', badge: 'Savory', desc: 'Al dente pasta tossed in a rich, earthy truffle cream sauce. Luxurious and aromatic.' },
        { id: '39', name: 'Carbonara', category: 'snacks', price: '₱199', emoji: '🍝', badge: 'Classic', desc: 'Classic creamy pasta with crispy bacon bits, egg yolk sauce, and a dusting of pepper.' },
        { id: '40', name: 'Baked Mac', category: 'snacks', price: '₱199', emoji: '🧀', badge: 'Cheesy', desc: 'Cheesy baked macaroni with a perfectly golden, bubbly crust on top.' },
        { id: '41', name: 'Lasagna', category: 'snacks', price: '₱210', emoji: '🧀', badge: 'Hearty', desc: 'Hearty layers of pasta sheets, savory meat sauce, and melted cheese baked to perfection.' },
        { id: '42', name: 'Tuna Aglio e Olio', category: 'snacks', price: '₱189', emoji: '🍝', badge: 'Light', desc: 'Light garlic and olive oil pasta tossed with chunky tuna and a kick of chili flakes.' },
        { id: '43', name: 'Garlic Bread', category: 'snacks', price: '₱75', emoji: '🍞', badge: 'Snack', desc: 'Thick-cut bread slathered generously with garlic butter and toasted until golden.' },
        { id: '44', name: 'Sole Fries / Barkada Fries', category: 'snacks', price: '₱150', emoji: '🍟', badge: 'Shareable', desc: 'Crispy golden seasoned fries available in solo or barkada sharing size.' },
        { id: '45', name: 'Barkada Nachos', category: 'snacks', price: '₱280', emoji: '🌮', badge: 'Shareable', desc: 'Loaded tortilla chips smothered in melted cheese and toppings. Made for the whole barkada.' }
    ]
};

/* Global State */
let kremahData = loadState();
let isAuthenticated = false;
let activePubCategory = 'ALL';
let adminOrders = [];

async function apiRequest(url, options) {
    if (window.location.protocol === 'file:') {
        throw new Error('This page is open as a local file. Start the website server, then open http://localhost:3000/Kremah%20Admin/.');
    }
    const response = await fetch(url, {
        credentials: 'same-origin',
        ...options,
        headers: {
            ...(options && options.headers ? options.headers : {})
        }
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || `Request failed (${response.status}).`);
    return result;
}

/* Local Storage Logic */
function loadState() {
    try {
        const saved = localStorage.getItem('kremah_cafe_cms_data');
        if (saved) return JSON.parse(saved);
    } catch (error) {
        console.error('Unable to read saved Kremah CMS data.', error);
        window.addEventListener('DOMContentLoaded', () => showToast('Saved CMS data could not be read. Using the built-in menu.'));
    }
    return JSON.parse(JSON.stringify(INITIAL_KREMAH_DATA));
}

async function saveState(previousData) {
    try {
        await apiRequest('/api/site-data', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(kremahData)
        });
    } catch (error) {
        console.error('Unable to save Kremah CMS data to the server.', error);
        kremahData = previousData;
        showToast(error.message || 'Unable to save changes to the server.');
        return false;
    }
    try {
        localStorage.setItem('kremah_cafe_cms_data', JSON.stringify(kremahData));
    } catch (error) {
        console.error('Unable to cache saved Kremah CMS data in this browser.', error);
    }
    renderPublicView();
    renderAdminView();
    return true;
}

/* Views Switcher */
function switchView(view) {
    if (view === 'admin' && !isAuthenticated) {
        showLoginScreen();
        return;
    }

    const pub = document.getElementById('publicView');
    const adm = document.getElementById('adminView');
    const btnPub = document.getElementById('viewBtnPublic');
    const btnAdm = document.getElementById('viewBtnAdmin');

    if (view === 'public') {
        pub.classList.remove('hidden');
        adm.classList.add('hidden');
        btnPub.className = 'px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 text-gold2 bg-brown shadow';
        btnAdm.className = 'px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 text-cream/70 hover:text-cream';
        renderPublicView();
    } else {
        pub.classList.add('hidden');
        adm.classList.remove('hidden');
        btnAdm.className = 'px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 text-gold2 bg-brown shadow';
        btnPub.className = 'px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 text-cream/70 hover:text-cream';
        renderAdminView();
    }
}

/* Server-backed admin authentication */
function toggleAdminLock() {
    signOutAdmin();
}

function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    updateAdminAuthMode();
}

function updateAdminAuthMode() {
    document.getElementById('loginTitle').textContent = 'Welcome back';
    document.getElementById('loginDescription').textContent = 'Sign in with the admin credentials configured on the website server.';
    document.getElementById('adminPassword').autocomplete = 'current-password';
    document.getElementById('adminPassword').minLength = 1;
    document.getElementById('authSubmitBtn').textContent = 'Sign in';
    document.getElementById('authModeHint').textContent = 'Admin access is managed securely by the website server.';
}

async function handleAdminAuth(e) {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value.trim().toLowerCase();
    const password = document.getElementById('adminPassword').value;
    const errorEl = document.getElementById('authError');
    const submitButton = document.getElementById('authSubmitBtn');
    errorEl.classList.add('hidden');
    submitButton.disabled = true;
    submitButton.textContent = 'Please wait…';
    let sessionStarted = false;

    try {
        await apiRequest('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        sessionStarted = true;
        isAuthenticated = true;
        await loadServerSiteData(true);
        document.getElementById('loginScreen').classList.add('hidden');
        updateLockUI();
        switchView('admin');
        showToast('Signed in to the Kremah admin portal.');
    } catch (error) {
        console.error('Admin sign-in failed.', error);
        if (sessionStarted) {
            try {
                await apiRequest('/api/auth/logout', { method: 'POST' });
            } catch (logoutError) {
                console.error('Unable to clear the admin session after sign-in failed.', logoutError);
            }
        }
        isAuthenticated = false;
        updateLockUI();
        errorEl.textContent = error.message || 'Unable to sign in. Check browser storage and try again.';
        errorEl.classList.remove('hidden');
        updateAdminAuthMode();
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Sign in';
    }
}

async function loadServerSiteData(initializeIfMissing) {
    const result = await apiRequest('/api/site-data');
    if (result.data) {
        kremahData = result.data;
        try {
            localStorage.setItem('kremah_cafe_cms_data', JSON.stringify(kremahData));
        } catch (error) {
            console.error('Unable to cache server CMS data in this browser.', error);
        }
        renderPublicView();
        renderAdminView();
    } else if (initializeIfMissing) {
        const initialData = JSON.parse(JSON.stringify(kremahData));
        if (!await saveState(initialData)) throw new Error('Unable to initialize website data in the database.');
    }
}

async function signOutAdmin() {
    try {
        await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error('Unable to end the server admin session.', error);
        showToast(error.message || 'Unable to sign out. Check the server connection.');
        return;
    }
    isAuthenticated = false;
    switchView('public');
    updateLockUI();
    showLoginScreen();
}

function updateLockUI() {
    const badge = document.getElementById('lockBadge');
    const text = document.getElementById('lockStateText');
    const btn = document.getElementById('lockBtn');
    if (!isAuthenticated) {
        badge.className = 'inline-block w-2 h-2 rounded-full bg-rose-400';
        text.textContent = 'Signed out';
        btn.textContent = 'Sign in';
        btn.title = 'Sign in to admin';
    } else {
        badge.className = 'inline-block w-2 h-2 rounded-full bg-emerald-400';
        text.textContent = 'Signed in';
        btn.textContent = 'Sign out';
        btn.title = 'Sign out of admin';
    }
}

/* Admin Tabs Switching */
function switchAdminTab(tabKey) {
    const tabs = ['overview', 'orders', 'menu', 'categories', 'store', 'announcement', 'backup'];
    tabs.forEach(t => {
        const content = document.getElementById('adminTab-' + t);
        const btn = document.getElementById('adminTabBtn-' + t);
        if (t === tabKey) {
            content.classList.remove('hidden');
            btn.className = 'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-left transition bg-gold text-brown font-semibold shadow';
        } else {
            content.classList.add('hidden');
            btn.className = 'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-left transition hover:bg-cream/10 text-cream/80';
        }
    });

    if (tabKey === 'overview') renderAdminOverview();
    if (tabKey === 'orders') loadAdminOrders();
    if (tabKey === 'menu') renderAdminMenuTable();
    if (tabKey === 'categories') renderAdminCategoryList();
    if (tabKey === 'store') populateStoreForm();
    if (tabKey === 'announcement') populateHeroForm();
}

function escapeAdminHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

async function loadAdminOrders() {
    const errorEl = document.getElementById('ordersLoadError');
    const listEl = document.getElementById('adminOrdersList');
    const emptyEl = document.getElementById('ordersEmptyState');
    errorEl.classList.add('hidden');
    listEl.innerHTML = '<p class="rounded-2xl bg-white p-6 text-sm text-brown3">Loading customer orders…</p>';
    emptyEl.classList.add('hidden');
    try {
        const result = await apiRequest('/api/orders');
        adminOrders = result.orders;
        renderAdminOrders();
    } catch (error) {
        console.error('Unable to load customer orders.', error);
        listEl.innerHTML = '';
        errorEl.textContent = error.message || 'Unable to load orders from the server.';
        errorEl.classList.remove('hidden');
    }
}

function renderAdminOrders() {
    const listEl = document.getElementById('adminOrdersList');
    const emptyEl = document.getElementById('ordersEmptyState');
    emptyEl.classList.toggle('hidden', adminOrders.length > 0);
    if (!adminOrders.length) {
        listEl.innerHTML = '';
        return;
    }

    const statuses = ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];
    listEl.innerHTML = adminOrders.map(order => {
        const date = new Date(order.created_at).toLocaleString();
        const email = order.customer_email
            ? `<a class="text-brown underline hover:text-gold" href="mailto:${escapeAdminHtml(order.customer_email)}">${escapeAdminHtml(order.customer_email)}</a>`
            : '<span class="text-brown3/70">No email provided</span>';
        const items = order.items.map(item => `
          <li class="flex flex-wrap justify-between gap-2 border-b border-brown3/10 py-2 last:border-0">
            <span>${escapeAdminHtml(item.item_name)} × ${item.quantity}</span>
            <span class="font-semibold">₱${(Number(item.price) * Number(item.quantity)).toFixed(2)}</span>
          </li>
        `).join('');
        return `
          <article class="rounded-2xl border border-brown3/15 bg-white p-5 shadow-sm sm:p-6">
            <div class="flex flex-wrap items-start justify-between gap-4 border-b border-brown3/10 pb-4">
              <div>
                <h2 class="font-serif text-xl font-bold text-brown">Order #${order.id} · ${escapeAdminHtml(order.customer_name)}</h2>
                <p class="mt-1 text-xs text-brown3">${escapeAdminHtml(date)}</p>
              </div>
              <label class="flex items-center gap-2 text-xs font-semibold text-brown">
                Status
                <select data-order-status="${order.id}" onchange="updateOrderStatus(event)" class="rounded-lg border border-brown3/20 bg-cream/30 px-2.5 py-2 text-xs capitalize">
                  ${statuses.map(status => `<option value="${status}" ${status === order.status ? 'selected' : ''}>${status}</option>`).join('')}
                </select>
              </label>
            </div>
            <div class="grid gap-5 pt-4 md:grid-cols-2">
              <div>
                <h3 class="mb-2 text-xs font-bold uppercase tracking-wider text-brown3">Customer contact</h3>
                <p class="mb-1 text-sm"><a class="font-semibold text-brown underline hover:text-gold" href="tel:${escapeAdminHtml(order.phone)}">${escapeAdminHtml(order.phone)}</a></p>
                <p class="mb-2 text-sm">${email}</p>
                <p class="whitespace-pre-wrap text-xs leading-relaxed text-brown3">${escapeAdminHtml(order.address)}</p>
              </div>
              <div>
                <div class="mb-2 flex items-center justify-between gap-3">
                  <h3 class="text-xs font-bold uppercase tracking-wider text-brown3">Items</h3>
                  <strong class="font-serif text-lg text-brown">₱${Number(order.total_price).toFixed(2)}</strong>
                </div>
                <ul class="text-xs text-brown">${items}</ul>
              </div>
            </div>
          </article>
        `;
    }).join('');
}

async function updateOrderStatus(event) {
    const select = event.target;
    const orderId = select.dataset.orderStatus;
    const order = adminOrders.find(item => String(item.id) === orderId);
    if (!order) return;
    const previousStatus = order.status;
    select.disabled = true;
    try {
        await apiRequest(`/api/orders/${encodeURIComponent(orderId)}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: select.value })
        });
        order.status = select.value;
        showToast(`Order #${orderId} updated.`);
    } catch (error) {
        console.error('Unable to update customer order status.', error);
        select.value = previousStatus;
        showToast(error.message || 'Unable to update order status.');
    } finally {
        select.disabled = false;
    }
}


/* ==========================================
   PUBLIC SITE RENDERING
   ========================================== */
function renderPublicView() {
    /* Hero & Announcement Data */
    document.getElementById('pubAnnouncementText').textContent = kremahData.hero.announcement;
    document.getElementById('pubHeroTag').textContent = kremahData.hero.tag;
    document.getElementById('pubHeroTitle').textContent = kremahData.hero.title;
    document.getElementById('pubHeroSub').textContent = kremahData.hero.sub;
    document.getElementById('pubHeroDesc').textContent = kremahData.hero.desc;

    /* Store Hours & Contacts */
    document.getElementById('pubHoursMonFri').textContent = kremahData.store.monFri;
    document.getElementById('pubHoursSat').textContent = kremahData.store.sat;
    document.getElementById('pubHoursSun').textContent = kremahData.store.sun;
    document.getElementById('pubPhone').textContent = kremahData.store.phone;
    document.getElementById('pubEmail').textContent = kremahData.store.email;
    document.getElementById('pubAddress').textContent = kremahData.store.address;
    const mapsUrl = String(kremahData.store.mapsUrl || '');
    try { const parsedMapsUrl = new URL(mapsUrl, window.location.origin); if (['https:', 'http:'].includes(parsedMapsUrl.protocol)) document.getElementById('pubMapsLink').href = parsedMapsUrl.href; } catch (error) { console.warn('Ignoring invalid maps URL.'); }

    /* Stats */
    document.getElementById('statCatCount').textContent = kremahData.categories.length;
    document.getElementById('statItemCount').textContent = kremahData.items.length;

    /* Category Pills */
    const pillsContainer = document.getElementById('pubCatPills');
    pillsContainer.innerHTML = `
        <button onclick="setPubCategory('ALL')" class="px-4 py-1.5 rounded-full text-xs font-semibold transition ${activePubCategory === 'ALL' ? 'bg-gold text-brown shadow' : 'bg-white/80 text-brown border border-brown3/20 hover:bg-gold/10'}">
          All
        </button>
      ` + kremahData.categories.map(c => `
        <button onclick="setPubCategory('${escapeAdminHtml(c.key)}')" class="px-4 py-1.5 rounded-full text-xs font-semibold transition ${activePubCategory === c.key ? 'bg-gold text-brown shadow' : 'bg-white/80 text-brown border border-brown3/20 hover:bg-gold/10'}">
          ${escapeAdminHtml(c.name)}
        </button>
      `).join('');

    /* Render Menu Grid Items */
    renderPublicMenuItems();

    /* Footer Socials */
    const socials = [
        { name: 'Instagram', icon: '📷' },
        { name: 'TikTok', icon: '🎵' },
        { name: 'Facebook', icon: '👤' },
        { name: 'Foodpanda', icon: '🐼' },
        { name: 'GrabFood', icon: '🚗' }
    ];
    document.getElementById('pubSocialPills').innerHTML = socials.map(s => `
        <a href="#" onclick="showToast('Opening ${s.name}...'); return false;" class="bg-white/5 hover:bg-gold/10 border border-white/10 hover:border-gold/30 px-3.5 py-1.5 rounded-full text-xs text-cream/70 hover:text-gold transition flex items-center gap-1.5">
          <span>${s.icon}</span> ${s.name}
        </a>
      `).join('');
}

function setPubCategory(key) {
    activePubCategory = key;
    renderPublicView();
}

function filterPublicMenu() {
    renderPublicMenuItems();
}

function clearPubSearch() {
    document.getElementById('pubSearchInput').value = '';
    document.getElementById('pubClearSearchBtn').classList.add('hidden');
    renderPublicMenuItems();
}

function renderPublicMenuItems() {
    const searchTerm = (document.getElementById('pubSearchInput').value || '').toLowerCase().trim();
    const clearBtn = document.getElementById('pubClearSearchBtn');
    if (searchTerm) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');

    const container = document.getElementById('pubMenuContainer');
    const noResults = document.getElementById('pubNoResults');

    // Filter Categories
    const activeCats = activePubCategory === 'ALL'
        ? kremahData.categories
        : kremahData.categories.filter(c => c.key === activePubCategory);

    let totalMatchedItems = 0;
    let html = '';

    activeCats.forEach(cat => {
        const catItems = kremahData.items.filter(item => {
            const matchCat = item.category === cat.key;
            const matchSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm) || item.desc.toLowerCase().includes(searchTerm);
            return matchCat && matchSearch;
        });

        if (catItems.length > 0) {
            totalMatchedItems += catItems.length;
            html += `
            <div class="space-y-4">
              <div class="flex items-center gap-3 border-b border-brown3/15 pb-2">
                <h3 class="font-serif text-2xl font-bold text-brown">${cat.name}</h3>
                <span class="text-[10px] bg-gold/10 text-gold border border-gold/30 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">${catItems.length} Items</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                ${catItems.map(item => `
                  <div onclick="openPubDetailModal('${item.id}')" class="bg-white rounded-2xl border border-brown3/15 p-5 hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between group">
                    <div>
                      <div class="flex items-start justify-between mb-3">
                        <div class="w-12 h-12 rounded-xl bg-cream/50 flex items-center justify-center text-3xl group-hover:scale-110 transition">
                          ${escapeAdminHtml(item.emoji || "")}
                        </div>
                        ${item.badge ? `<span class="text-[10px] font-bold uppercase tracking-wider bg-gold/10 text-gold border border-gold/30 px-2.5 py-0.5 rounded-full">${escapeAdminHtml(item.badge)}</span>` : ''}
                      </div>

                      <h4 class="font-serif text-lg font-bold text-brown group-hover:text-gold transition">${escapeAdminHtml(item.name)}</h4>
                      <p class="text-xs text-brown3/80 font-light mt-1 line-clamp-2 leading-relaxed">${escapeAdminHtml(item.desc)}</p>
                    </div>

                    <div class="flex items-center justify-between pt-4 mt-4 border-t border-brown3/10">
                      <span class="font-serif text-xl font-bold text-gold">${escapeAdminHtml(item.price)}</span>
                      <span class="text-xs text-brown font-semibold group-hover:translate-x-1 transition flex items-center gap-1">View →</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }
    });

    if (totalMatchedItems === 0) {
        container.innerHTML = '';
        noResults.classList.remove('hidden');
    } else {
        container.innerHTML = html;
        noResults.classList.add('hidden');
    }
}

function openPubDetailModal(itemId) {
    const item = kremahData.items.find(i => i.id === itemId);
    if (!item) return;

    document.getElementById('pubDetailEmoji').textContent = item.emoji;
    document.getElementById('pubDetailTitle').textContent = item.name;
    document.getElementById('pubDetailDesc').textContent = item.desc;
    document.getElementById('pubDetailPrice').textContent = item.price;

    const badgeEl = document.getElementById('pubDetailBadge');
    if (item.badge) {
        badgeEl.textContent = item.badge;
        badgeEl.classList.remove('hidden');
    } else {
        badgeEl.classList.add('hidden');
    }

    document.getElementById('pubDetailModal').classList.remove('hidden');
}

function closePubDetailModal() {
    document.getElementById('pubDetailModal').classList.add('hidden');
}


/* ==========================================
   ADMIN PANEL RENDERING
   ========================================== */
function renderAdminView() {
    renderAdminOverview();
    populateCategorySelects();
}

function renderAdminOverview() {
    document.getElementById('dashTotalItems').textContent = kremahData.items.length;
    document.getElementById('dashTotalCats').textContent = kremahData.categories.length;

    const bestsellers = kremahData.items.filter(i => (i.badge || '').toLowerCase().includes('bestseller'));
    document.getElementById('dashTotalBestsellers').textContent = bestsellers.length;

    // Price parse average
    const prices = kremahData.items.map(i => parseFloat(i.price.replace(/[^\d.]/g, '')) || 0);
    const avg = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
    document.getElementById('dashAvgPrice').textContent = '₱' + avg;

    // Category breakdown
    const breakdownEl = document.getElementById('dashCatBreakdown');
    breakdownEl.innerHTML = kremahData.categories.map(c => {
        const count = kremahData.items.filter(i => i.category === c.key).length;
        return `
          <div class="flex items-center justify-between text-xs">
            <span class="text-brown font-medium">${escapeAdminHtml(c.name)}</span>
            <span class="font-mono bg-cream px-2 py-0.5 rounded text-brown3 font-bold">${count} items</span>
          </div>
        `;
    }).join('');
}

/* Admin Menu Table CRUD */
function renderAdminMenuTable() {
    const search = (document.getElementById('adminSearchInput')?.value || '').toLowerCase();
    const catFilter = document.getElementById('adminCatFilter')?.value || 'ALL';
    const badgeFilter = document.getElementById('adminBadgeFilter')?.value || 'ALL';

    const tbody = document.getElementById('adminMenuTableBody');
    const filtered = kremahData.items.filter(item => {
        const matchSearch = !search || item.name.toLowerCase().includes(search) || item.desc.toLowerCase().includes(search);
        const matchCat = catFilter === 'ALL' || item.category === catFilter;
        const matchBadge = badgeFilter === 'ALL' || (item.badge || '').toLowerCase() === badgeFilter.toLowerCase();
        return matchSearch && matchCat && matchBadge;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="py-8 text-center text-brown3">No matching items found.</td>
          </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(item => {
        const catObj = kremahData.categories.find(c => c.key === item.category);
        return `
          <tr class="hover:bg-cream/20 transition border-b border-brown3/5">
            <td class="py-3 px-4 flex items-center gap-3">
              <span class="w-8 h-8 rounded-lg bg-cream/60 flex items-center justify-center text-lg">${escapeAdminHtml(item.emoji || "")}</span>
              <div>
                <strong class="text-brown block font-semibold">${escapeAdminHtml(item.name)}</strong>
                <span class="text-[11px] text-brown3 line-clamp-1 max-w-xs font-light">${escapeAdminHtml(item.desc)}</span>
              </div>
            </td>
            <td class="py-3 px-4 font-medium text-brown2">
              ${escapeAdminHtml(catObj ? catObj.name : item.category)}
            </td>
            <td class="py-3 px-4 font-bold text-gold font-serif text-sm">
              ${escapeAdminHtml(item.price)}
            </td>
            <td class="py-3 px-4">
              ${item.badge ? `<span class="bg-gold/10 text-gold border border-gold/30 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">${escapeAdminHtml(item.badge)}</span>` : '<span class="text-brown3/40">—</span>'}
            </td>
            <td class="py-3 px-4 text-right space-x-2">
              <button onclick="openEditItemModal('${item.id}')" class="px-2.5 py-1 rounded-lg bg-brown text-gold text-[11px] font-semibold hover:bg-brown2 transition">Edit</button>
              <button onclick="deleteMenuItem('${item.id}')" class="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 text-[11px] font-semibold hover:bg-rose-200 transition">Delete</button>
            </td>
          </tr>
        `;
    }).join('');
}

function populateCategorySelects() {
    const catFilter = document.getElementById('adminCatFilter');
    const modalCat = document.getElementById('modalItemCategory');

    if (catFilter) {
        catFilter.innerHTML = '<option value="ALL">All Categories</option>' +
            kremahData.categories.map(c => `<option value="${escapeAdminHtml(c.key)}">${escapeAdminHtml(c.name)}</option>`).join('');
    }

    if (modalCat) {
        modalCat.innerHTML = kremahData.categories.map(c => `<option value="${escapeAdminHtml(c.key)}">${escapeAdminHtml(c.name)}</option>`).join('');
    }
}

/* Modal Form for Create / Edit Item */
function openCreateItemModal() {
    document.getElementById('itemModalTitle').textContent = 'Add New Menu Item';
    document.getElementById('modalItemId').value = '';
    document.getElementById('modalItemTitle').value = '';
    document.getElementById('modalItemPrice').value = '₱';
    document.getElementById('modalItemEmoji').value = '☕';
    document.getElementById('modalItemBadge').value = '';
    document.getElementById('modalItemDesc').value = '';
    populateCategorySelects();
    document.getElementById('itemModal').classList.remove('hidden');
}

function openEditItemModal(itemId) {
    const item = kremahData.items.find(i => i.id === itemId);
    if (!item) return;

    document.getElementById('itemModalTitle').textContent = 'Edit Menu Item';
    document.getElementById('modalItemId').value = item.id;
    document.getElementById('modalItemTitle').value = item.name;
    document.getElementById('modalItemPrice').value = item.price;
    document.getElementById('modalItemEmoji').value = item.emoji;
    document.getElementById('modalItemBadge').value = item.badge || '';
    document.getElementById('modalItemDesc').value = item.desc;
    populateCategorySelects();
    document.getElementById('modalItemCategory').value = item.category;

    document.getElementById('itemModal').classList.remove('hidden');
}

function closeItemModal() {
    document.getElementById('itemModal').classList.add('hidden');
}

async function handleSaveItem(e) {
    e.preventDefault();
    const id = document.getElementById('modalItemId').value;
    const name = document.getElementById('modalItemTitle').value;
    const category = document.getElementById('modalItemCategory').value;
    const price = document.getElementById('modalItemPrice').value;
    const emoji = document.getElementById('modalItemEmoji').value;
    const badge = document.getElementById('modalItemBadge').value;
    const desc = document.getElementById('modalItemDesc').value;
    const previousData = JSON.parse(JSON.stringify(kremahData));
    let successMessage;

    if (id) {
        // Edit existing
        const index = kremahData.items.findIndex(i => i.id === id);
        if (index !== -1) {
            kremahData.items[index] = { id, name, category, price, emoji, badge, desc };
            successMessage = `Updated "${name}"`;
        }
    } else {
        // Create new
        const newId = Date.now().toString();
        kremahData.items.unshift({ id: newId, name, category, price, emoji, badge, desc });
        successMessage = `Created "${name}"`;
    }

    if (!await saveState(previousData)) return;
    closeItemModal();
    renderAdminMenuTable();
    showToast(successMessage);
}

async function deleteMenuItem(itemId) {
    const item = kremahData.items.find(i => i.id === itemId);
    if (!item) return;

    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
        const previousData = JSON.parse(JSON.stringify(kremahData));
        kremahData.items = kremahData.items.filter(i => i.id !== itemId);
        if (!await saveState(previousData)) return;
        renderAdminMenuTable();
        showToast(`Deleted "${item.name}"`);
    }
}


/* Admin Category Manager */
function renderAdminCategoryList() {
    const listEl = document.getElementById('adminCatList');
    listEl.innerHTML = kremahData.categories.map(c => {
        const count = kremahData.items.filter(i => i.category === c.key).length;
        return `
          <div class="flex items-center justify-between p-3.5 bg-cream/20 rounded-xl border border-brown3/10">
            <div>
              <strong class="text-brown block text-sm">${escapeAdminHtml(c.name)}</strong>
              <span class="text-[10px] text-brown3 font-mono">Key: ${escapeAdminHtml(c.key)} • ${count} items</span>
            </div>
            <button onclick="deleteCategory('${escapeAdminHtml(c.key)}')" class="px-2.5 py-1 bg-rose-100 text-rose-700 hover:bg-rose-200 text-xs font-semibold rounded-lg transition">
              Delete
            </button>
          </div>
        `;
    }).join('');
}

async function handleCreateCategory(e) {
    e.preventDefault();
    const key = document.getElementById('newCatKey').value.trim().toLowerCase().replace(/\s+/g, '-');
    const name = document.getElementById('newCatName').value.trim();

    if (kremahData.categories.some(c => c.key === key)) {
        alert('Category key already exists!');
        return;
    }

    const previousData = JSON.parse(JSON.stringify(kremahData));
    kremahData.categories.push({ key, name });
    if (!await saveState(previousData)) return;
    document.getElementById('newCatKey').value = '';
    document.getElementById('newCatName').value = '';
    renderAdminCategoryList();
    showToast(`Added category "${name}"`);
}

async function deleteCategory(key) {
    const cat = kremahData.categories.find(c => c.key === key);
    if (!cat) return;

    const count = kremahData.items.filter(i => i.category === key).length;
    if (count > 0) {
        if (!confirm(`Warning: Category "${cat.name}" contains ${count} items. Deleting it will keep the items unassigned. Continue?`)) {
            return;
        }
    }

    const previousData = JSON.parse(JSON.stringify(kremahData));
    kremahData.categories = kremahData.categories.filter(c => c.key !== key);
    if (!await saveState(previousData)) return;
    renderAdminCategoryList();
    showToast(`Deleted category "${cat.name}"`);
}


/* Store Info Form */
function populateStoreForm() {
    document.getElementById('storeMonFri').value = kremahData.store.monFri;
    document.getElementById('storeSat').value = kremahData.store.sat;
    document.getElementById('storeSun').value = kremahData.store.sun;
    document.getElementById('storePhone').value = kremahData.store.phone;
    document.getElementById('storeEmail').value = kremahData.store.email;
    document.getElementById('storeAddress').value = kremahData.store.address;
    document.getElementById('storeMapsUrl').value = kremahData.store.mapsUrl;
}

async function handleSaveStoreInfo(e) {
    e.preventDefault();
    const previousData = JSON.parse(JSON.stringify(kremahData));
    kremahData.store.monFri = document.getElementById('storeMonFri').value;
    kremahData.store.sat = document.getElementById('storeSat').value;
    kremahData.store.sun = document.getElementById('storeSun').value;
    kremahData.store.phone = document.getElementById('storePhone').value;
    kremahData.store.email = document.getElementById('storeEmail').value;
    kremahData.store.address = document.getElementById('storeAddress').value;
    kremahData.store.mapsUrl = document.getElementById('storeMapsUrl').value;
    if (!await saveState(previousData)) return;
    showToast('Store info saved!');
}


/* Hero & Announcement Form */
function populateHeroForm() {
    document.getElementById('heroAnnouncementInput').value = kremahData.hero.announcement;
    document.getElementById('heroTagInput').value = kremahData.hero.tag;
    document.getElementById('heroTitleInput').value = kremahData.hero.title;
    document.getElementById('heroSubInput').value = kremahData.hero.sub;
    document.getElementById('heroDescInput').value = kremahData.hero.desc;
}

async function handleSaveHeroSettings(e) {
    e.preventDefault();
    const previousData = JSON.parse(JSON.stringify(kremahData));
    kremahData.hero.announcement = document.getElementById('heroAnnouncementInput').value;
    kremahData.hero.tag = document.getElementById('heroTagInput').value;
    kremahData.hero.title = document.getElementById('heroTitleInput').value;
    kremahData.hero.sub = document.getElementById('heroSubInput').value;
    kremahData.hero.desc = document.getElementById('heroDescInput').value;
    if (!await saveState(previousData)) return;
    showToast('Hero settings saved!');
}


/* Excel order report and website reset */
async function downloadOrdersExcel() {
    try {
        const response = await fetch('/api/reports/orders.xlsx', { credentials: 'same-origin' });
        if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            throw new Error(result.message || 'Unable to download the Excel report.');
        }
        const report = await response.blob();
        const downloadUrl = URL.createObjectURL(report);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `kremah-orders-${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(downloadUrl);
        showToast('Downloaded the customer orders Excel report.');
    } catch (error) {
        console.error('Unable to download customer orders report.', error);
        showToast(error.message || 'Unable to download the Excel report.');
    }
}

async function resetToDefaults() {
    if (confirm('Are you sure you want to reset all menu items and settings to factory defaults? All custom additions will be lost.')) {
        const previousData = JSON.parse(JSON.stringify(kremahData));
        kremahData = JSON.parse(JSON.stringify(INITIAL_KREMAH_DATA));
        if (!await saveState(previousData)) return;
        showToast('Reset to Kremah factory defaults');
    }
}


/* Toast Utility */
function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.remove('translate-y-12', 'opacity-0', 'pointer-events-none');

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.add('translate-y-12', 'opacity-0', 'pointer-events-none');
    }, 3000);
}

tailwind.config = {
    theme: {
        extend: {
            colors: {
                cream: '#f5ede0',
                cream2: '#ede0ce',
                cream3: '#dfcfb9',
                brown: '#2c1a0e',
                brown2: '#4a2f1a',
                brown3: '#7a4f2d',
                gold: '#c8902a',
                gold2: '#e8b04a',
                dark: '#0a0401',
                dark2: '#1a0a04'
            },
            fontFamily: {
                serif: ['"Playfair Display"', 'serif'],
                sans: ['"DM Sans"', 'sans-serif']
            }
        }
    }
}

/* Initialize Application on Page Load */
window.addEventListener('DOMContentLoaded', async () => {
    renderPublicView();
    try {
        const sessionResult = await apiRequest('/api/auth/session');
        isAuthenticated = sessionResult.authenticated;
        if (isAuthenticated) await loadServerSiteData(true);
    } catch (error) {
        console.error('Unable to connect to the admin backend.', error);
        const errorEl = document.getElementById('authError');
        errorEl.textContent = error.message || 'Unable to connect to the website backend. Start the server and open this page at http://localhost:3000/Kremah%20Admin/.';
        errorEl.classList.remove('hidden');
    }
    updateLockUI();
    if (isAuthenticated) {
        document.getElementById('loginScreen').classList.add('hidden');
        switchView('admin');
    } else {
        showLoginScreen();
        document.getElementById('adminEmail').focus();
    }
});