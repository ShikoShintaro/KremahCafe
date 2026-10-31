import { useEffect, useMemo, useState } from "react";
import { api } from "./lib/api";
import "./pages/admin.css"
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

function CustomerHome() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
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

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0,
  );

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

  return (
    <>
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
            onClick={() => setLoginOpen(true)}
          >
            Login
            {loginOpen && (
              <div
                className="modal-overlay open login-overlay"
                role="presentation"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) {
                    setLoginOpen(false);
                  }
                }}
              >
                <section
                  className="modal login-modal"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="login-title"
                >
                  <button
                    className="modal-close"
                    type="button"
                    aria-label="Close login"
                    onClick={() => setLoginOpen(false)}
                  >
                    ×
                  </button>

                  onMouseDown={(event) => {
                    if (event.target === event.currentTarget) {
                      setLoginOpen(false);
                    }
                  }}

                  <div className="login-heading">
                    <span className="login-brand-mark">K</span>
                    <span className="section-tag">WELCOME BACK</span>
                    <h2 id="login-title" className="modal-title">
                      Welcome to <em>Kremah Café</em>
                    </h2>
                    <p className="modal-desc">
                      Sign in to continue your KremahCafe experience.
                    </p>
                  </div>

                  <form
                    className="login-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      setNotice("Login authentication is not connected yet.");
                    }}
                  >
                    <label htmlFor="login-email">Email Address</label>
                    <input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      value={loginEmail}
                      onChange={(event) => setLoginEmail(event.target.value)}
                      required
                    />

                    <label htmlFor="login-password">Password</label>
                    <div className="login-password-wrap">
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        value={loginPassword}
                        onChange={(event) => setLoginPassword(event.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>

                    <button className="btn-primary login-submit" type="submit">
                      Sign In
                    </button>
                  </form>

                  <p className="login-register">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setNotice("Registration will be available soon.")}
                    >
                      Create an account
                    </button>
                  </p>
                </section>
              </div>
            )}
          </button>

          <a href="#menu" className="nav-cta">
            View Full Menu
          </a>
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

          <h1>
            Kremah <em>Café</em>
          </h1>

          <p className="hero-desc">
            Handcrafted frappes, specialty coffee, matcha drinks, croffles,
            and treats made with love in San Mateo, Rizal.
          </p>

          <div className="hero-btns">
            <a href="#menu" className="btn-primary">
              Browse Full Menu
            </a>

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
            style={{
              color: "var(--gold)",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            @kremahcafe
          </a>.
        </p>

        <div className="social-grid">
          {socialPosts.map((post) => (
            <article className="social-card" key={post.badge}>
              <img
                className="social-card-img"
                src={post.image}
                alt={post.alt}
              />

              <div className="social-card-body">
                <div>
                  <span className="social-platform-badge">
                    {post.badge}
                  </span>
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

          <h2 className="section-title">
            Our Full <em>Menu</em>
          </h2>

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

          <div
            className="cat-tabs"
            role="tablist"
            aria-label="Menu Categories"
          >
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
            <div className="no-results visible">
              Loading the KremahCafe menu...
            </div>
          ) : error ? (
            <div className="no-results visible">
              Unable to load the menu: {error}
              <br />
              <button
                className="cat-tab"
                type="button"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="no-results visible">
              No items found. Try a different keyword or category.
              <br />
              <button
                className="cat-tab"
                type="button"
                onClick={resetFilters}
              >
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
                      onClick={(event) =>
                        toggleFavorite(event, product.id)
                      }
                    >
                      {favorite ? "♥" : "♡"}
                    </button>

                    <div className="menu-img-wrap">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          loading="lazy"
                        />
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
                          {product.badge ||
                            product.category_name ||
                            product.category ||
                            "Cafe Favorite"}
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

            <h2 className="section-title">
              A little comfort in every <em>cup.</em>
            </h2>

            <p
              className="section-sub"
              style={{ textAlign: "left", marginBottom: 20 }}
            >
              KremahCafe is a place for handcrafted drinks, delicious bites,
              and everyday moments worth sharing.
            </p>

            <div className="about-list">
              <div className="about-list-item">
                <div className="about-icon">☕</div>
                <div>
                  <h4>Made with care</h4>
                  <p>
                    Thoughtfully prepared drinks and treats for your daily
                    coffee break.
                  </p>
                </div>
              </div>

              <div className="about-list-item">
                <div className="about-icon">♡</div>
                <div>
                  <h4>A welcoming cafe</h4>
                  <p>
                    Your spot for catch-ups, study sessions, and little
                    celebrations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="hours-section" id="hours">
          <div>
            <span className="section-tag">Come Say Hello</span>

            <h2
              className="section-title"
              style={{ color: "var(--gold)" }}
            >
              Visit <em>Us</em>
            </h2>

            <p style={{ marginBottom: 24 }}>
              Drop by KremahCafe in San Mateo, Rizal, and find your new
              favorite.
            </p>

            <div className="hours-table">
              <div className="hours-row">
                <span className="hours-day">Location</span>
                <span className="hours-time">San Mateo, Rizal</span>
              </div>

              <div className="hours-row">
                <span className="hours-day">Instagram</span>
                <span className="hours-time">
                  <a
                    href="https://www.instagram.com/kremahcafe/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    @kremahcafe
                  </a>
                </span>
              </div>

              <div className="hours-row">
                <span className="hours-day">Facebook</span>
                <span className="hours-time">
                  <a
                    href="https://www.facebook.com/profile.php?id=61590309185437"
                    target="_blank"
                    rel="noreferrer"
                  >
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
          <span
            className="section-tag"
            style={{ color: "var(--gold)" }}
          >
            YOUR NEXT FAVORITE IS WAITING
          </span>

          <h2
            className="section-title"
            style={{ color: "var(--cream)" }}
          >
            Your coffee break starts here.
          </h2>

          <p>
            Find a drink, pick a treat, and make a little time for yourself.
          </p>

          <a href="#menu" className="btn-primary">
            Explore the Menu
          </a>
        </section>

        <div className="social-strip">
          <span className="social-strip-label">
            Follow the KremahCafe moments
          </span>

          <div className="social-icons">
            <a
              className="social-pill"
              href="https://www.instagram.com/kremahcafe/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>

            <a
              className="social-pill"
              href="https://www.tiktok.com/@kremah.cafe"
              target="_blank"
              rel="noreferrer"
            >
              TikTok
            </a>

            <a
              className="social-pill"
              href="https://www.facebook.com/profile.php?id=61590309185437"
              target="_blank"
              rel="noreferrer"
            >
              Facebook
            </a>
          </div>
        </div>
      </main>

      <footer>
        <a href="#home" className="footer-logo">
          Kremah <span>Café</span>
        </a>

        <p>Good Drinks. Good Food. Good Vibes.</p>
        <p>Made with care in San Mateo, Rizal.</p>
        <p>
          © {new Date().getFullYear()} KremahCafe. All rights reserved.
        </p>
      </footer>

      <button
        className="back-top"
        type="button"
        aria-label="Back to top"
        onClick={() =>
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
        style={{ display: "flex" }}
      >
        ↑
      </button>

      <div className="float-actions">
        <button
          className="float-btn cart-btn"
          type="button"
          onClick={() => setCartOpen(true)}
        >
          🛒 Cart ({cartCount})
        </button>
      </div>

      {notice && (
        <div className="toast show" role="status">
          {notice}
        </div>
      )}

      {selectedProduct && (
        <div
          className="modal-overlay open"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedProduct(null);
            }
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={selectedProduct.name}
          >
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
                src={
                  selectedProduct.image_url || selectedProduct.image
                }
                alt={selectedProduct.name}
              />
            )}

            <h2 className="modal-title">{selectedProduct.name}</h2>

            <p className="modal-desc">
              {selectedProduct.description ||
                "A KremahCafe favorite, prepared with care."}
            </p>

            <p className="modal-price">
              {money(productPrice(selectedProduct))}
            </p>

            <button
              className="btn-primary"
              type="button"
              onClick={() => addToCart(selectedProduct)}
            >
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
            if (event.target === event.currentTarget) {
              setCartOpen(false);
            }
          }}
        >
          <section
            className="modal cart-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            <button
              className="modal-close"
              type="button"
              onClick={() => setCartOpen(false)}
              aria-label="Close cart"
            >
              ×
            </button>

            <h2 className="modal-title">
              Your Cart ({cartCount})
            </h2>

            {cart.length === 0 ? (
              <p className="modal-desc">
                Your cart is empty. Browse the menu to add something
                delicious.
              </p>
            ) : (
              <div className="cart-lines">
                {cart.map(({ product, quantity }) => (
                  <div className="hours-row" key={product.id}>
                    <span>
                      {product.name}
                      <br />

                      <button
                        className="text-button"
                        type="button"
                        onClick={() =>
                          changeQuantity(product.id, -1)
                        }
                      >
                        −
                      </button>

                      {" "}{quantity}{" "}

                      <button
                        className="text-button"
                        type="button"
                        onClick={() =>
                          changeQuantity(product.id, 1)
                        }
                      >
                        +
                      </button>
                    </span>

                    <strong>
                      {money(productPrice(product) * quantity)}
                    </strong>
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
              onClick={() =>
                setNotice(
                  "Checkout will be connected after the order API is implemented.",
                )
              }
            >
              Continue to Checkout
            </button>
          </section>
        </div>
      )}
    </>
  );
}

export default function App() {
  const isAdmin =
    window.location.pathname.replace(/\/$/, "") === "/admin";

  if (isAdmin) {
    return <KremahAdmin />;
  }

  return (
    <div className="customer-site">
      <CustomerHome />
    </div>
  );
}