import { useEffect, useMemo, useState } from "react";
import { api } from "./lib/api";
import "./legacy.css";

import KremahAdmin from "./pages/KremahAdmin";

const money = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(value) || 0);

const categoryName = (category) =>
  category.name ?? category.title ?? "Other";

const productPrice = (product) =>
  Number(product.price ?? Number(product.price_cents ?? 0) / 100);

const socialPosts = [
  {
    image:
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80",
    alt: "Coffee and cafe treats",
    badge: "Instagram Highlight",
    text: "The ultimate comfort combo: good drinks, delicious treats, and a little moment to slow down.",
    url: "https://www.instagram.com/kremahcafe/",
    link: "Visit Instagram",
  },
  {
    image:
      "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80",
    alt: "Matcha drink",
    badge: "Matcha Favorites",
    text: "Discover your next favorite drink, from earthy matcha to sweet and creamy cafe classics.",
    url: "https://www.tiktok.com/@kremah.cafe",
    link: "Visit TikTok",
  },
  {
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    alt: "Cozy cafe atmosphere",
    badge: "Cafe Moments",
    text: "Good drinks, good food, and great company. There's always room for another good moment.",
    url: "https://www.facebook.com/profile.php?id=61590309185437",
    link: "Visit Facebook",
  },
];


function CustomerAuthModal({ onClose, onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = mode === "register"
        ? await api.customerRegister({ fullName, email, phone, password })
        : await api.customerLogin({ email, password });
      onAuthenticated(result.data);
    } catch (err) {
      setError(err.message || "Unable to authenticate. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay open" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={mode === "login" ? "Customer login" : "Create customer account"}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close">×</button>
        <span className="section-tag">KREMAH CAFÉ ACCOUNT</span>
        <h2 className="modal-title">{mode === "login" ? "Welcome back." : "Join the Kremah family."}</h2>
        <p className="modal-desc">{mode === "login" ? "Sign in to view your account and keep your orders close." : "Create an account to manage your details and orders."}</p>
        <form onSubmit={submit} className="kc-auth-form">
          {mode === "register" && <>
            <label>Full name<input autoComplete="name" required minLength={2} maxLength={120} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" /></label>
            <label>Phone number<input autoComplete="tel" maxLength={40} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09XX XXX XXXX" /></label>
          </>}
          <label>Email address<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>
          <label>Password<span className="kc-password-field"><input type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "register" ? 8 : 1} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "register" ? "At least 8 characters" : "Your password"} /><button type="button" onClick={() => setShowPassword((v) => !v)}>{showPassword ? "Hide" : "Show"}</button></span></label>
          {error && <p className="kc-auth-error" role="alert">{error}</p>}
          <button className="btn-primary" type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}</button>
        </form>
        <p className="kc-auth-switch">{mode === "login" ? "New to KremahCafe?" : "Already have an account?"} <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Create an account" : "Sign in"}</button></p>
      </section>
    </div>
  );
}

function CustomerDashboard({ customer, onLogout, onBackToStore }) {
  const [section, setSection] = useState("overview");
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const displayName = customer?.fullName || customer?.full_name || "Customer";
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("");

  async function logout() {
    setLoggingOut(true);
    setLogoutError("");
    try { await api.customerLogout(); onLogout(); }
    catch (err) { setLogoutError(err.message || "Unable to sign out."); setLoggingOut(false); }
  }

  const sections = [
    ["overview", "Overview", "⌂"],
    ["orders", "My Orders", "▤"],
    ["tracking", "Track Delivery", "⌖"],
    ["payments", "Payments", "₱"],
    ["profile", "My Profile", "♡"],
  ];

  return <div className="kc-dashboard">
    <style>{`
        .kc-auth-form{display:grid;gap:14px;margin-top:22px}.kc-auth-form label{display:grid;gap:7px;font-size:13px;font-weight:700;color:var(--brown,#4b3025)}.kc-auth-form input{width:100%;box-sizing:border-box;border:1px solid rgba(90,60,40,.2);border-radius:12px;padding:13px 14px;background:var(--cream,#fffaf2);color:var(--brown,#4b3025);font:inherit}.kc-password-field{display:flex;gap:8px}.kc-password-field button,.kc-auth-switch button{border:0;background:none;color:var(--gold,#b58a45);font-weight:700;cursor:pointer}.kc-auth-error{color:#a83232;background:#fff0ed;padding:10px 12px;border-radius:10px;font-size:13px}.kc-auth-switch{font-size:13px;text-align:center;margin-top:18px}.kc-dashboard{min-height:100vh;background:var(--cream,#fbf7ef);color:var(--brown,#4b3025)}.kc-dashboard-header{height:78px;padding:0 clamp(18px,5vw,72px);display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(90,60,40,.12);background:var(--cream,#fbf7ef)}.kc-dashboard-header-actions{display:flex;align-items:center;gap:12px}.kc-welcome{font-size:13px;color:var(--brown3,#806b5b)}.kc-dashboard-shell{max-width:1440px;margin:auto;padding:38px clamp(18px,5vw,72px);display:grid;grid-template-columns:260px minmax(0,1fr);gap:42px}.kc-dashboard-sidebar{border-right:1px solid rgba(90,60,40,.12);padding-right:24px}.kc-customer-card{display:flex;align-items:center;gap:12px;padding:0 0 26px;border-bottom:1px solid rgba(90,60,40,.12)}.kc-avatar{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--brown,#4b3025);color:var(--gold,#d6b16e);font-weight:800}.kc-customer-card strong,.kc-customer-card small{display:block}.kc-customer-card strong{font-size:14px}.kc-customer-card small{font-size:11px;color:var(--brown3,#806b5b);margin-top:4px;overflow-wrap:anywhere}.kc-dashboard-sidebar nav{display:grid;gap:7px;padding-top:22px}.kc-dashboard-sidebar nav button{display:flex;align-items:center;gap:12px;text-align:left;border:0;background:transparent;border-radius:12px;padding:13px 14px;color:var(--brown3,#806b5b);font:inherit;cursor:pointer}.kc-dashboard-sidebar nav button span{width:20px;text-align:center;font-size:18px}.kc-dashboard-sidebar nav button.active,.kc-dashboard-sidebar nav button:hover{background:rgba(181,138,69,.13);color:var(--brown,#4b3025);font-weight:700}.kc-sidebar-note{font-family:Georgia,serif;font-style:italic;color:var(--gold,#b58a45);font-size:13px;margin-top:42px}.kc-dashboard-main{min-width:0}.kc-dashboard-title{font-family:Georgia,serif;font-size:clamp(32px,4vw,52px);font-weight:500;line-height:1.12;margin:14px 0}.kc-dashboard-title em,.kc-dashboard-feature h2 em{color:var(--gold,#b58a45);font-weight:400}.kc-dashboard-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:30px}.kc-dashboard-cards button{display:grid;gap:9px;text-align:left;padding:24px;border:1px solid rgba(90,60,40,.12);border-radius:18px;background:rgba(255,255,255,.58);color:var(--brown,#4b3025);cursor:pointer}.kc-dashboard-cards button:hover{border-color:var(--gold,#b58a45);transform:translateY(-2px)}.kc-dashboard-cards button span{font-size:23px;color:var(--gold,#b58a45)}.kc-dashboard-cards button strong{font-family:Georgia,serif;font-size:20px;font-weight:500}.kc-dashboard-cards button small{color:var(--brown3,#806b5b)}.kc-dashboard-feature{margin-top:26px;padding:30px;border-radius:20px;background:var(--brown,#4b3025);color:var(--cream,#fffaf2);display:flex;align-items:center;justify-content:space-between;gap:20px}.kc-dashboard-feature h2{font:500 30px Georgia,serif;margin:10px 0}.kc-dashboard-feature p{color:rgba(255,250,242,.75)}.kc-feature-mark{font:italic 100px Georgia,serif;color:rgba(214,177,110,.65)}.kc-feature-mark span{font-size:28px;vertical-align:top}.kc-empty-state{margin-top:28px;padding:48px 24px;text-align:center;border:1px dashed rgba(90,60,40,.22);border-radius:20px;background:rgba(255,255,255,.45)}.kc-empty-state>span{font-size:34px;color:var(--gold,#b58a45)}.kc-empty-state h2{font:500 25px Georgia,serif}.kc-empty-state p{max-width:560px;margin:0 auto 22px;color:var(--brown3,#806b5b);line-height:1.7}.kc-profile-panel{margin-top:25px;padding:28px;border-radius:18px;background:rgba(255,255,255,.6);border:1px solid rgba(90,60,40,.12);display:grid;gap:20px}.kc-profile-panel div{display:grid;gap:6px}.kc-profile-panel small{font-size:10px;letter-spacing:1.2px;color:var(--gold,#a77b35);font-weight:800}.kc-profile-panel strong{font-size:16px}.kc-profile-panel p{margin:0;color:var(--brown3,#806b5b);font-size:13px}@media(max-width:760px){.kc-dashboard-header{height:auto;min-height:72px;gap:10px;flex-wrap:wrap;padding-top:12px;padding-bottom:12px}.kc-welcome{display:none}.kc-dashboard-shell{grid-template-columns:1fr;gap:24px;padding-top:22px}.kc-dashboard-sidebar{border-right:0;border-bottom:1px solid rgba(90,60,40,.12);padding:0 0 16px}.kc-dashboard-sidebar nav{display:flex;overflow-x:auto;padding-top:16px}.kc-dashboard-sidebar nav button{white-space:nowrap;padding:10px}.kc-sidebar-note{display:none}.kc-dashboard-cards{grid-template-columns:1fr}.kc-feature-mark{display:none}.kc-dashboard-feature{padding:24px}.kc-dashboard-header-actions{gap:7px}.kc-dashboard-header-actions .nav-cta,.kc-dashboard-header-actions .nav-login-btn{font-size:12px;padding:10px}}
      `}</style>
    <header className="kc-dashboard-header">
      <a href="#home" className="nav-logo" onClick={(e) => { e.preventDefault(); onBackToStore(); }}><span className="nav-logo-dot" />Kremah <span>Café</span></a>
      <div className="kc-dashboard-header-actions"><span className="kc-welcome">Hello, {displayName.split(" ")[0]}</span><button className="nav-cta" type="button" onClick={onBackToStore}>Back to Store</button><button className="nav-login-btn" type="button" onClick={logout} disabled={loggingOut}>{loggingOut ? "Signing out…" : "Sign Out"}</button></div>
    </header>
    <div className="kc-dashboard-shell">
      <aside className="kc-dashboard-sidebar">
        <div className="kc-customer-card"><div className="kc-avatar">{initials || "K"}</div><div><strong>{displayName}</strong><small>{customer?.email}</small></div></div>
        <nav aria-label="Customer dashboard">{sections.map(([id, label, icon]) => <button key={id} type="button" className={section === id ? "active" : ""} onClick={() => setSection(id)}><span>{icon}</span>{label}</button>)}</nav>
        <p className="kc-sidebar-note">Good drinks. Good food. Good vibes.</p>
      </aside>
      <main className="kc-dashboard-main">
        <span className="section-tag">YOUR KREMAH ACCOUNT</span>
        {section === "overview" && <>
          <h1 className="kc-dashboard-title">A little comfort, <em>all in one place.</em></h1>
          <p className="section-sub">Welcome to your customer space. Manage your account and keep up with your KremahCafe experience.</p>
          <div className="kc-dashboard-cards">
            <button type="button" onClick={() => setSection("orders")}><span>▤</span><strong>My Orders</strong><small>View your order history and status</small></button>
            <button type="button" onClick={() => setSection("tracking")}><span>⌖</span><strong>Track Delivery</strong><small>Check delivery progress when available</small></button>
            <button type="button" onClick={() => setSection("payments")}><span>₱</span><strong>Payments</strong><small>Review payment information</small></button>
            <button type="button" onClick={() => setSection("profile")}><span>♡</span><strong>My Profile</strong><small>Your account details</small></button>
          </div>
          <section className="kc-dashboard-feature"><div><span className="section-tag">READY FOR A TREAT?</span><h2>Find your next <em>favorite.</em></h2><p>Browse handcrafted drinks, matcha, croffles, and cafe treats.</p><button className="btn-primary" type="button" onClick={onBackToStore}>Explore the Menu</button></div><div className="kc-feature-mark">K<span>✳</span></div></section>
        </>}
        {section === "orders" && <><h1 className="kc-dashboard-title">My <em>Orders</em></h1><div className="kc-empty-state"><span>▤</span><h2>Your order history will appear here.</h2><p>Customer order retrieval is not connected yet. Your account is ready; we'll connect this section once the customer orders API is available.</p><button className="btn-primary" type="button" onClick={onBackToStore}>Browse Menu</button></div></>}
        {section === "tracking" && <><h1 className="kc-dashboard-title">Track <em>Delivery</em></h1><div className="kc-empty-state"><span>⌖</span><h2>No active delivery to track.</h2><p>Live delivery tracking will appear here once order dispatch and delivery updates are connected.</p></div></>}
        {section === "payments" && <><h1 className="kc-dashboard-title">Payment <em>History</em></h1><div className="kc-empty-state"><span>₱</span><h2>Your payments will appear here.</h2><p>Payment history is not connected yet. No payment records are being displayed as real until the payment API is integrated.</p></div></>}
        {section === "profile" && <><h1 className="kc-dashboard-title">My <em>Profile</em></h1><div className="kc-profile-panel"><div><small>FULL NAME</small><strong>{displayName}</strong></div><div><small>EMAIL ADDRESS</small><strong>{customer?.email || "—"}</strong></div><div><small>PHONE NUMBER</small><strong>{customer?.phone || "Not provided"}</strong></div><p>Profile editing and saved addresses will be enabled after the customer profile API is added.</p></div></>}
        {logoutError && <p className="kc-auth-error" role="alert">{logoutError}</p>}
      </main>
    </div>
  </div>;
}

export default function App() {
  const isAdminPortal = window.location.pathname.startsWith("/management-portal");

  return isAdminPortal ? <KremahAdmin/> : <StorefrontApp/>;
}

export function StorefrontApp() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notice, setNotice] = useState("");
  const [customer, setCustomer] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.customerMe()
      .then((result) => { if (!cancelled) { setCustomer(result.data ?? null); setDashboardOpen(Boolean(result.data)); } })
      .catch(() => { if (!cancelled) setCustomer(null); })
      ;
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadMenu() {
      try {
        const [categoryResult, productResult] = await Promise.all([
          api.getCategories(),
          api.getProducts(),
        ]);

        if (cancelled) return;

        setCategories(categoryResult.data ?? []);
        setProducts(productResult.data ?? []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load the menu.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMenu();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, [darkMode]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setCartOpen(false);
        setSelectedProduct(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const productCategoryId = String(
        product.category_id ?? product.categoryId ?? "",
      );

      const productCategoryName = String(
        product.category_name ?? product.category ?? "",
      );

      const categoryMatches =
        activeCategory === "all" ||
        productCategoryId === activeCategory ||
        productCategoryName.toLowerCase() === activeCategory.toLowerCase();

      const searchMatches =
        !term ||
        [product.name, product.description, productCategoryName]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));

      return categoryMatches && searchMatches;
    });
  }, [products, activeCategory, search]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce(
    (total, item) =>
      total + productPrice(item.product) * item.quantity,
    0,
  );

  function addToCart(product) {
    setCart((current) => {
      const found = current.find(
        (item) => String(item.product.id) === String(product.id),
      );

      if (found) {
        return current.map((item) =>
          String(item.product.id) === String(product.id)
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...current, { product, quantity: 1 }];
    });

    setSelectedProduct(null);
    setNotice(`${product.name} added to your cart.`);
  }

  function changeQuantity(productId, delta) {
    setCart((current) =>
      current
        .map((item) =>
          String(item.product.id) === String(productId)
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function toggleFavorite(event, productId) {
    event.stopPropagation();

    setFavorites((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  function resetFilters() {
    setActiveCategory("all");
    setSearch("");
  }

  if (customer && dashboardOpen) {
    return <CustomerDashboard customer={customer} onLogout={() => { setCustomer(null); setDashboardOpen(false); }} onBackToStore={() => setDashboardOpen(false)} />;
  }

  return (
    <>
      <style>{`
        .kc-auth-form{display:grid;gap:14px;margin-top:22px}.kc-auth-form label{display:grid;gap:7px;font-size:13px;font-weight:700;color:var(--brown,#4b3025)}.kc-auth-form input{width:100%;box-sizing:border-box;border:1px solid rgba(90,60,40,.2);border-radius:12px;padding:13px 14px;background:var(--cream,#fffaf2);color:var(--brown,#4b3025);font:inherit}.kc-password-field{display:flex;gap:8px}.kc-password-field button,.kc-auth-switch button{border:0;background:none;color:var(--gold,#b58a45);font-weight:700;cursor:pointer}.kc-auth-error{color:#a83232;background:#fff0ed;padding:10px 12px;border-radius:10px;font-size:13px}.kc-auth-switch{font-size:13px;text-align:center;margin-top:18px}.kc-dashboard{min-height:100vh;background:var(--cream,#fbf7ef);color:var(--brown,#4b3025)}.kc-dashboard-header{height:78px;padding:0 clamp(18px,5vw,72px);display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(90,60,40,.12);background:var(--cream,#fbf7ef)}.kc-dashboard-header-actions{display:flex;align-items:center;gap:12px}.kc-welcome{font-size:13px;color:var(--brown3,#806b5b)}.kc-dashboard-shell{max-width:1440px;margin:auto;padding:38px clamp(18px,5vw,72px);display:grid;grid-template-columns:260px minmax(0,1fr);gap:42px}.kc-dashboard-sidebar{border-right:1px solid rgba(90,60,40,.12);padding-right:24px}.kc-customer-card{display:flex;align-items:center;gap:12px;padding:0 0 26px;border-bottom:1px solid rgba(90,60,40,.12)}.kc-avatar{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--brown,#4b3025);color:var(--gold,#d6b16e);font-weight:800}.kc-customer-card strong,.kc-customer-card small{display:block}.kc-customer-card strong{font-size:14px}.kc-customer-card small{font-size:11px;color:var(--brown3,#806b5b);margin-top:4px;overflow-wrap:anywhere}.kc-dashboard-sidebar nav{display:grid;gap:7px;padding-top:22px}.kc-dashboard-sidebar nav button{display:flex;align-items:center;gap:12px;text-align:left;border:0;background:transparent;border-radius:12px;padding:13px 14px;color:var(--brown3,#806b5b);font:inherit;cursor:pointer}.kc-dashboard-sidebar nav button span{width:20px;text-align:center;font-size:18px}.kc-dashboard-sidebar nav button.active,.kc-dashboard-sidebar nav button:hover{background:rgba(181,138,69,.13);color:var(--brown,#4b3025);font-weight:700}.kc-sidebar-note{font-family:Georgia,serif;font-style:italic;color:var(--gold,#b58a45);font-size:13px;margin-top:42px}.kc-dashboard-main{min-width:0}.kc-dashboard-title{font-family:Georgia,serif;font-size:clamp(32px,4vw,52px);font-weight:500;line-height:1.12;margin:14px 0}.kc-dashboard-title em,.kc-dashboard-feature h2 em{color:var(--gold,#b58a45);font-weight:400}.kc-dashboard-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:30px}.kc-dashboard-cards button{display:grid;gap:9px;text-align:left;padding:24px;border:1px solid rgba(90,60,40,.12);border-radius:18px;background:rgba(255,255,255,.58);color:var(--brown,#4b3025);cursor:pointer}.kc-dashboard-cards button:hover{border-color:var(--gold,#b58a45);transform:translateY(-2px)}.kc-dashboard-cards button span{font-size:23px;color:var(--gold,#b58a45)}.kc-dashboard-cards button strong{font-family:Georgia,serif;font-size:20px;font-weight:500}.kc-dashboard-cards button small{color:var(--brown3,#806b5b)}.kc-dashboard-feature{margin-top:26px;padding:30px;border-radius:20px;background:var(--brown,#4b3025);color:var(--cream,#fffaf2);display:flex;align-items:center;justify-content:space-between;gap:20px}.kc-dashboard-feature h2{font:500 30px Georgia,serif;margin:10px 0}.kc-dashboard-feature p{color:rgba(255,250,242,.75)}.kc-feature-mark{font:italic 100px Georgia,serif;color:rgba(214,177,110,.65)}.kc-feature-mark span{font-size:28px;vertical-align:top}.kc-empty-state{margin-top:28px;padding:48px 24px;text-align:center;border:1px dashed rgba(90,60,40,.22);border-radius:20px;background:rgba(255,255,255,.45)}.kc-empty-state>span{font-size:34px;color:var(--gold,#b58a45)}.kc-empty-state h2{font:500 25px Georgia,serif}.kc-empty-state p{max-width:560px;margin:0 auto 22px;color:var(--brown3,#806b5b);line-height:1.7}.kc-profile-panel{margin-top:25px;padding:28px;border-radius:18px;background:rgba(255,255,255,.6);border:1px solid rgba(90,60,40,.12);display:grid;gap:20px}.kc-profile-panel div{display:grid;gap:6px}.kc-profile-panel small{font-size:10px;letter-spacing:1.2px;color:var(--gold,#a77b35);font-weight:800}.kc-profile-panel strong{font-size:16px}.kc-profile-panel p{margin:0;color:var(--brown3,#806b5b);font-size:13px}@media(max-width:760px){.kc-dashboard-header{height:auto;min-height:72px;gap:10px;flex-wrap:wrap;padding-top:12px;padding-bottom:12px}.kc-welcome{display:none}.kc-dashboard-shell{grid-template-columns:1fr;gap:24px;padding-top:22px}.kc-dashboard-sidebar{border-right:0;border-bottom:1px solid rgba(90,60,40,.12);padding:0 0 16px}.kc-dashboard-sidebar nav{display:flex;overflow-x:auto;padding-top:16px}.kc-dashboard-sidebar nav button{white-space:nowrap;padding:10px}.kc-sidebar-note{display:none}.kc-dashboard-cards{grid-template-columns:1fr}.kc-feature-mark{display:none}.kc-dashboard-feature{padding:24px}.kc-dashboard-header-actions{gap:7px}.kc-dashboard-header-actions .nav-cta,.kc-dashboard-header-actions .nav-login-btn{font-size:12px;padding:10px}}
      `}</style>
      <nav id="navbar" aria-label="Main Navigation">
        <a href="#home" className="nav-logo">
          <span className="nav-logo-dot" aria-hidden="true" />
          Kremah <span>Café</span>
        </a>

        <ul className="nav-links">
          <li><a href="#highlights">Social Highlights</a></li>
          <li><a href="#menu">Menu</a></li>
          <li><a href="#about">Our Story</a></li>
          <li><a href="#hours">Visit Us</a></li>
        </ul>

        <div className="nav-actions-group">
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setDarkMode((value) => !value)}
            aria-label="Toggle dark mode"
            aria-pressed={darkMode}
          >
            {darkMode ? "☀" : "☾"}
          </button>

          <button
            className="nav-login-btn"
            type="button"
            onClick={() => customer ? setDashboardOpen(true) : setAuthOpen(true)}
          >
            {customer ? "My Account" : "Login"}
          </button>

          <a href="#menu" className="nav-cta">View Full Menu</a>
        </div>

        <button
          className="hamburger"
          type="button"
          aria-label="Open navigation menu"
          onClick={() =>
            document.getElementById("navDrawer")?.classList.add("open")
          }
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <div className="nav-drawer" id="navDrawer" aria-hidden="true">
        <button
          className="nav-drawer-close"
          type="button"
          aria-label="Close navigation menu"
          onClick={() =>
            document.getElementById("navDrawer")?.classList.remove("open")
          }
        >
          ×
        </button>

        {[
          ["Social Highlights", "#highlights"],
          ["Menu", "#menu"],
          ["Our Story", "#about"],
          ["Visit Us", "#hours"],
        ].map(([label, href]) => (
          <a
            key={href}
            href={href}
            onClick={() =>
              document.getElementById("navDrawer")?.classList.remove("open")
            }
          >
            {label}
          </a>
        ))}
      </div>

      <header className="hero" id="home">
        <div className="hero-content">
          <span className="hero-tag">
            ☕ Good Drinks. Good Food. Good Vibes.
          </span>
          <h1>Kremah <em>Café</em></h1>
          <p className="hero-desc">
            Handcrafted frappes, specialty coffee, matcha drinks, croffles,
            and treats made with love in San Mateo, Rizal.
          </p>
          <div className="hero-btns">
            <a href="#menu" className="btn-primary">Browse Full Menu</a>
            <a href="#highlights" className="btn-outline">
              Explore Social Highlights
            </a>
          </div>
        </div>
      </header>

      <section className="strip" aria-label="Cafe Statistics">
        <div className="strip-item">
          <div className="strip-num">{categories.length}</div>
          <div className="strip-lbl">Menu Categories</div>
        </div>
        <div className="strip-item">
          <div className="strip-num">{products.length}</div>
          <div className="strip-lbl">Menu Items</div>
        </div>
        <div className="strip-item">
          <div className="strip-num">
            {products.length
              ? money(Math.min(...products.map(productPrice)))
              : "₱—"}
          </div>
          <div className="strip-lbl">Starts At</div>
        </div>
        <div className="strip-item">
          <div className="strip-num">5★</div>
          <div className="strip-lbl">San Mateo Favorite</div>
        </div>
      </section>

      <section className="social-highlights" id="highlights">
        <span className="section-tag">Community &amp; Socials</span>
        <h2 className="section-title">
          As Seen on <em>Instagram &amp; TikTok</em>
        </h2>
        <p className="section-sub">
          Follow our cafe moments and latest treats at{" "}
          <a
            href="https://www.instagram.com/kremahcafe/"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--gold)", fontWeight: 700, textDecoration: "none" }}
          >
            @kremahcafe
          </a>.
        </p>

        <div className="social-grid">
          {socialPosts.map((post) => (
            <article className="social-card" key={post.badge}>
              <img className="social-card-img" src={post.image} alt={post.alt} />
              <div className="social-card-body">
                <div>
                  <span className="social-platform-badge">{post.badge}</span>
                  <p>{post.text}</p>
                </div>
                <a
                  className="social-link-btn"
                  href={post.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {post.link} →
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <main>
        <section className="menu-section" id="menu">
          <span className="section-tag">What We Serve</span>
          <h2 className="section-title">Our Full <em>Menu</em></h2>
          <p className="section-sub">
            From frappes and matcha to coffee, pastries, snacks, and desserts.
          </p>

          <div className="menu-search-wrap">
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              className="menu-search"
              type="search"
              placeholder="Search menu items..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search menu items"
            />
            {search && (
              <button
                className="search-clear visible"
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </div>

          <div className="cat-tabs" role="tablist" aria-label="Menu Categories">
            <button
              className={`cat-tab ${activeCategory === "all" ? "active" : ""}`}
              type="button"
              role="tab"
              aria-selected={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
            >
              All
            </button>

            {categories.map((category) => {
              const id = String(category.id ?? categoryName(category));

              return (
                <button
                  key={id}
                  className={`cat-tab ${activeCategory === id ? "active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === id}
                  onClick={() => setActiveCategory(id)}
                >
                  {categoryName(category)}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="no-results visible">Loading the KremahCafe menu...</div>
          ) : error ? (
            <div className="no-results visible">
              Unable to load the menu: {error}
              <br />
              <button className="cat-tab" type="button" onClick={() => window.location.reload()}>
                Try again
              </button>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="no-results visible">
              No items found. Try a different keyword or category.
              <br />
              <button className="cat-tab" type="button" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="menu-grid">
              {visibleProducts.map((product) => {
                const image = product.image_url || product.image || "";
                const favorite = favorites.includes(product.id);

                return (
                  <article
                    className="menu-card"
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <button
                      className={`menu-fav ${favorite ? "active" : ""}`}
                      type="button"
                      aria-label={`${favorite ? "Remove" : "Add"} ${product.name} ${favorite ? "from" : "to"} favorites`}
                      onClick={(event) => toggleFavorite(event, product.id)}
                    >
                      {favorite ? "♥" : "♡"}
                    </button>

                    <div className="menu-img-wrap">
                      {image ? (
                        <img src={image} alt={product.name} loading="lazy" />
                      ) : (
                        <div
                          className="product-placeholder"
                          aria-label={`${product.name} image placeholder`}
                        >
                          {product.emoji || "☕"}
                        </div>
                      )}
                    </div>

                    <div className="menu-info">
                      <div>
                        <h4>{product.name}</h4>
                        <p>
                          {product.description ||
                            "A KremahCafe favorite, prepared with care."}
                        </p>
                      </div>
                      <div className="menu-foot">
                        <span className="menu-price">
                          {money(productPrice(product))}
                        </span>
                        <span className="menu-badge-tag">
                          {product.badge || product.category_name || product.category || "Cafe Favorite"}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="about-section" id="about">
          <div className="about-img-grid">
            <img
              src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80"
              alt="Freshly brewed coffee"
              loading="lazy"
            />
            <img
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80"
              alt="Coffee being prepared"
              loading="lazy"
            />
          </div>
          <div>
            <span className="section-tag">Our Story</span>
            <h2 className="section-title">A little comfort in every <em>cup.</em></h2>
            <p className="section-sub" style={{ textAlign: "left", marginBottom: 20 }}>
              KremahCafe is a place for handcrafted drinks, delicious bites,
              and everyday moments worth sharing.
            </p>
            <div className="about-list">
              <div className="about-list-item">
                <div className="about-icon">☕</div>
                <div>
                  <h4>Made with care</h4>
                  <p>Thoughtfully prepared drinks and treats for your daily coffee break.</p>
                </div>
              </div>
              <div className="about-list-item">
                <div className="about-icon">♡</div>
                <div>
                  <h4>A welcoming cafe</h4>
                  <p>Your spot for catch-ups, study sessions, and little celebrations.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="hours-section" id="hours">
          <div>
            <span className="section-tag">Come Say Hello</span>
            <h2 className="section-title" style={{ color: "var(--gold)" }}>
              Visit <em>Us</em>
            </h2>
            <p style={{ marginBottom: 24 }}>
              Drop by KremahCafe in San Mateo, Rizal, and find your new favorite.
            </p>
            <div className="hours-table">
              <div className="hours-row">
                <span className="hours-day">Location</span>
                <span className="hours-time">San Mateo, Rizal</span>
              </div>
              <div className="hours-row">
                <span className="hours-day">Instagram</span>
                <span className="hours-time">
                  <a href="https://www.instagram.com/kremahcafe/" target="_blank" rel="noreferrer">
                    @kremahcafe
                  </a>
                </span>
              </div>
              <div className="hours-row">
                <span className="hours-day">Facebook</span>
                <span className="hours-time">
                  <a href="https://www.facebook.com/profile.php?id=61590309185437" target="_blank" rel="noreferrer">
                    KremahCafe
                  </a>
                </span>
              </div>
            </div>
          </div>

          <div className="map-container">
            <iframe
              title="Map of San Mateo, Rizal"
              src="https://maps.google.com/maps?q=San%20Mateo%2C%20Rizal%2C%20Philippines&t=&z=13&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>

        <section className="cta-section">
          <span className="section-tag" style={{ color: "var(--gold)" }}>
            YOUR NEXT FAVORITE IS WAITING
          </span>
          <h2 className="section-title" style={{ color: "var(--cream)" }}>
            Your coffee break starts here.
          </h2>
          <p>Find a drink, pick a treat, and make a little time for yourself.</p>
          <a href="#menu" className="btn-primary">Explore the Menu</a>
        </section>

        <div className="social-strip">
          <span className="social-strip-label">Follow the KremahCafe moments</span>
          <div className="social-icons">
            <a className="social-pill" href="https://www.instagram.com/kremahcafe/" target="_blank" rel="noreferrer">Instagram</a>
            <a className="social-pill" href="https://www.tiktok.com/@kremah.cafe" target="_blank" rel="noreferrer">TikTok</a>
            <a className="social-pill" href="https://www.facebook.com/profile.php?id=61590309185437" target="_blank" rel="noreferrer">Facebook</a>
          </div>
        </div>
      </main>

      <footer>
        <a href="#home" className="footer-logo">Kremah <span>Café</span></a>
        <p>Good Drinks. Good Food. Good Vibes.</p>
        <p>Made with care in San Mateo, Rizal.</p>
        <p>© {new Date().getFullYear()} KremahCafe. All rights reserved.</p>
      </footer>

      <button
        className="back-top"
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        style={{ display: "flex" }}
      >
        ↑
      </button>

      <div className="float-actions">
        <button className="float-btn cart-btn" type="button" onClick={() => setCartOpen(true)}>
          🛒 Cart ({cartCount})
        </button>
      </div>

      {authOpen && <CustomerAuthModal onClose={() => setAuthOpen(false)} onAuthenticated={(profile) => { setCustomer(profile); setDashboardOpen(true); setAuthOpen(false); setCartOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} />}
      {notice && <div className="toast show" role="status">{notice}</div>}

      {selectedProduct && (
        <div
          className="modal-overlay open"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedProduct(null);
          }}
        >
          <section className="modal" role="dialog" aria-modal="true" aria-label={selectedProduct.name}>
            <button
              className="modal-close"
              type="button"
              aria-label="Close product details"
              onClick={() => setSelectedProduct(null)}
            >
              ×
            </button>
            {(selectedProduct.image_url || selectedProduct.image) && (
              <img
                className="modal-img"
                src={selectedProduct.image_url || selectedProduct.image}
                alt={selectedProduct.name}
              />
            )}
            <h2 className="modal-title">{selectedProduct.name}</h2>
            <p className="modal-desc">
              {selectedProduct.description || "A KremahCafe favorite, prepared with care."}
            </p>
            <p className="modal-price">{money(productPrice(selectedProduct))}</p>
            <button className="btn-primary" type="button" onClick={() => addToCart(selectedProduct)}>
              Add to Cart
            </button>
          </section>
        </div>
      )}

      {cartOpen && (
        <div
          className="modal-overlay open"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCartOpen(false);
          }}
        >
          <section className="modal cart-modal" role="dialog" aria-modal="true" aria-label="Shopping cart">
            <button className="modal-close" type="button" onClick={() => setCartOpen(false)} aria-label="Close cart">
              ×
            </button>
            <h2 className="modal-title">Your Cart ({cartCount})</h2>

            {cart.length === 0 ? (
              <p className="modal-desc">Your cart is empty. Browse the menu to add something delicious.</p>
            ) : (
              <div className="cart-lines">
                {cart.map(({ product, quantity }) => (
                  <div className="hours-row" key={product.id}>
                    <span>
                      {product.name}
                      <br />
                      <button className="text-button" type="button" onClick={() => changeQuantity(product.id, -1)}>−</button>
                      {" "}{quantity}{" "}
                      <button className="text-button" type="button" onClick={() => changeQuantity(product.id, 1)}>+</button>
                    </span>
                    <strong>{money(productPrice(product) * quantity)}</strong>
                  </div>
                ))}
                <div className="hours-row">
                  <strong>Total</strong>
                  <strong>{money(cartTotal)}</strong>
                </div>
              </div>
            )}

            <button
              className="btn-primary"
              type="button"
              onClick={() => setNotice("Checkout will be connected after the order API is implemented.")}
            >
              Continue to Checkout
            </button>
          </section>
        </div>
      )}
    </>
  );
}