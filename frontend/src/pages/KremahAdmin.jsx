
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import "./KremahAdmin.css";

const peso = (cents) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format((Number(cents) || 0) / 100);

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.adminLogin({
        email: email.trim().toLowerCase(),
        password,
      });

      const result = await api.adminMe();
      onLogin(result.data);
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ka-login">
      <section className="ka-login-card">
        <div className="ka-mark">K</div>
        <p className="ka-kicker">KREMAH CAFÉ · MANAGEMENT</p>
        <h1>Welcome back.</h1>
        <p className="ka-muted">
          Sign in using your administrator credentials.
        </p>

        <form onSubmit={submit} className="ka-form">
          <label>
            Admin email
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </label>

          {error && <p className="ka-error">{error}</p>}

          <button className="ka-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in to dashboard"}
          </button>
        </form>

        <small className="ka-login-note">
          Authorized administrators only.
        </small>
      </section>
    </main>
  );
}

function ProductModal({ product, categories, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    name: product?.name || "",
    description: product?.description || "",
    categoryId: String(product?.category_id || categories[0]?.id || ""),
    price: String((Number(product?.price_cents) || 0) / 100),
    emoji: product?.emoji || "☕",
    badge: product?.badge || "",
    stock: product?.stock_quantity ?? "",
    track: !!product?.track_inventory,
    available: product ? !!product.is_available : true,
    sort: product?.sort_order || 0,
  }));

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key, value) {
    setForm((old) => ({ ...old, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await onSave({
        name: form.name.trim(),
        description: form.description,
        categoryId: Number(form.categoryId),
        priceCents: Math.round(Number(form.price) * 100),
        emoji: form.emoji || "☕",
        badge: form.badge || null,
        stockQuantity:
          form.stock === "" ? null : Number(form.stock),
        trackInventory: form.track,
        isAvailable: form.available,
        sortOrder: Number(form.sort) || 0,
      });
    } catch (err) {
      setError(err.message || "Unable to save product.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="ka-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="ka-modal">
        <header>
          <div>
            <p className="ka-kicker">MENU MANAGEMENT</p>
            <h2>{product ? "Edit product" : "Add product"}</h2>
          </div>
          <button className="ka-close" onClick={onClose}>×</button>
        </header>

        <form className="ka-form ka-grid" onSubmit={submit}>
          <label>
            Product name
            <input
              required
              maxLength="200"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </label>

          <label>
            Category
            <select
              required
              value={form.categoryId}
              onChange={(e) => update("categoryId", e.target.value)}
            >
              <option value="">Choose category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Price (PHP)
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
            />
          </label>

          <label>
            Emoji
            <input
              value={form.emoji}
              onChange={(e) => update("emoji", e.target.value)}
            />
          </label>

          <label className="ka-wide">
            Description
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </label>

          <label>
            Badge
            <input
              value={form.badge}
              onChange={(e) => update("badge", e.target.value)}
            />
          </label>

          <label>
            Sort order
            <input
              type="number"
              min="0"
              value={form.sort}
              onChange={(e) => update("sort", e.target.value)}
            />
          </label>

          <label className="ka-check">
            <input
              type="checkbox"
              checked={form.track}
              onChange={(e) => update("track", e.target.checked)}
            />
            Track inventory
          </label>

          <label>
            Stock quantity
            <input
              type="number"
              min="0"
              disabled={!form.track}
              value={form.stock}
              onChange={(e) => update("stock", e.target.value)}
            />
          </label>

          <label className="ka-check">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => update("available", e.target.checked)}
            />
            Available for sale
          </label>

          {error && <p className="ka-error ka-wide">{error}</p>}

          <div className="ka-actions ka-wide">
            <button
              type="button"
              className="ka-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="ka-primary" disabled={loading}>
              {loading ? "Saving..." : "Save product"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function KremahAdmin() {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);

  const [tab, setTab] = useState("overview");
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [editor, setEditor] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [search, setSearch] = useState("");
  const [includeHidden, setIncludeHidden] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [d, p, c] = await Promise.all([
        api.adminDashboard(),
        api.adminGetProducts(),
        api.adminGetCategories(),
      ]);

      setDashboard(d.data);
      setProducts(p.data || []);
      setCategories(c.data || []);
    } catch (err) {
      setError(err.message || "Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    api.adminMe()
      .then((result) => {
        if (active) setAdmin(result.data);
      })
      .catch(() => {
        if (active) setAdmin(null);
      })
      .finally(() => {
        if (active) setChecking(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (admin) refresh();
  }, [admin, refresh]);

  const lowStock = products.filter(
    (p) =>
      p.track_inventory &&
      p.stock_quantity != null &&
      p.stock_quantity <= 5
  );

  const visibleProducts = useMemo(
    () =>
      products.filter((p) => {
        const matchesSearch = `${p.name} ${p.category_name || ""}`
          .toLowerCase()
          .includes(search.toLowerCase());

        return matchesSearch && (includeHidden || !!p.is_available);
      }),
    [products, search, includeHidden]
  );

  async function logout() {
    try {
      await api.adminLogout();
      setAdmin(null);
      setDashboard(null);
    } catch (err) {
      setError(err.message || "Unable to sign out.");
    }
  }

  async function saveProduct(payload) {
    if (editor?.id) {
      await api.adminUpdateProduct(editor.id, payload);
    } else {
      await api.adminCreateProduct(payload);
    }

    setEditor(null);
    setNotice(editor?.id ? "Product updated." : "Product created.");
    await refresh();
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Delete "${product.name}"?`)) return;

    try {
      await api.adminDeleteProduct(product.id);
      setNotice("Product deleted.");
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to delete product.");
    }
  }

  async function addCategory(e) {
    e.preventDefault();

    try {
      await api.adminCreateCategory({
        name: categoryName.trim(),
        isActive: true,
        sortOrder: 0,
      });

      setCategoryName("");
      setNotice("Category created.");
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to create category.");
    }
  }

  async function toggleCategory(category) {
    try {
      await api.adminUpdateCategory(category.id, {
        name: category.name,
        slug: category.slug,
        sortOrder: category.sort_order || 0,
        isActive: !category.is_active,
      });

      await refresh();
    } catch (err) {
      setError(err.message || "Unable to update category.");
    }
  }

  async function deleteCategory(category) {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;

    try {
      await api.adminDeleteCategory(category.id);
      setNotice("Category deleted.");
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to delete category.");
    }
  }

  if (checking) {
    return <main className="ka-login">Checking admin session...</main>;
  }

  if (!admin) {
    return <AdminLogin onLogin={setAdmin} />;
  }

  const navigation = [
    ["overview", "Overview"],
    ["products", "Products"],
    ["categories", "Categories"],
    ["inventory", "Inventory"],
  ];

  return (
    <div className="ka-app">
      <aside className="ka-sidebar">
        <a className="ka-logo" href="/">
          <span className="ka-mark-small">K</span>
          <span>
            KREMAH <i>CAFÉ</i>
            <small>MANAGEMENT</small>
          </span>
        </a>

        <p className="ka-nav-label">WORKSPACE</p>

        <nav>
          {navigation.map(([id, label]) => (
            <button
              key={id}
              className={tab === id ? "active" : ""}
              onClick={() => {
                setTab(id);
                setError("");
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="ka-user">
          <b>{admin.email}</b>
          <small>{admin.role || "admin"}</small>
          <button onClick={logout}>Sign out</button>
          <a href="/">Back to storefront</a>
        </div>
      </aside>

      <main className="ka-main">
        <header className="ka-topbar">
          <div>
            <p className="ka-kicker">KREMAH CAFÉ / ADMIN</p>
            <h1>
              {navigation.find((item) => item[0] === tab)?.[1]}
            </h1>
          </div>

          <button
            className="ka-secondary"
            onClick={refresh}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        <div className="ka-content">
          {error && (
            <div className="ka-alert">
              {error}
              <button onClick={() => setError("")}>×</button>
            </div>
          )}

          {notice && (
            <div className="ka-success">
              {notice}
              <button onClick={() => setNotice("")}>×</button>
            </div>
          )}

          {tab === "overview" && (
            <>
              <div className="ka-welcome">
                <p className="ka-kicker">YOUR CAFÉ AT A GLANCE</p>
                <h2>
                  Good day, {admin.email.split("@")[0]}.
                </h2>
                <p className="ka-muted">
                  Here's what's happening with KremahCafe.
                </p>
              </div>

              <div className="ka-stats">
                {[
                  ["Products", dashboard?.stats?.products ?? products.length],
                  ["Categories", dashboard?.stats?.categories ?? categories.length],
                  ["Orders", dashboard?.stats?.orders ?? 0],
                  ["Revenue", peso(dashboard?.stats?.revenueCents)],
                ].map(([label, value]) => (
                  <article className="ka-stat" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </article>
                ))}
              </div>

              <div className="ka-panels">
                <section className="ka-panel">
                  <header>
                    <div>
                      <h3>Recent orders</h3>
                      <p>Latest activity from your store</p>
                    </div>
                  </header>

                  {dashboard?.recentOrders?.length ? (
                    <div className="ka-table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboard.recentOrders.map((order) => (
                            <tr key={order.id}>
                              <td>#{order.order_number || order.id}</td>
                              <td>{order.customer_name}</td>
                              <td>{peso(order.total_price_cents)}</td>
                              <td>{order.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="ka-empty">No orders to display yet.</p>
                  )}
                </section>

                <section className="ka-panel">
                  <header>
                    <div>
                      <h3>Low stock</h3>
                      <p>Products needing attention</p>
                    </div>
                    <b className="ka-count">{lowStock.length}</b>
                  </header>

                  {lowStock.length ? (
                    lowStock.map((p) => (
                      <div className="ka-stock" key={p.id}>
                        <b>{p.emoji || "☕"} {p.name}</b>
                        <strong>{p.stock_quantity}</strong>
                      </div>
                    ))
                  ) : (
                    <p className="ka-empty">Inventory looks healthy.</p>
                  )}
                </section>
              </div>
            </>
          )}

          {tab === "products" && (
            <section className="ka-panel">
              <header>
                <div>
                  <h3>Menu products</h3>
                  <p>Manage items displayed in your storefront.</p>
                </div>
                <button
                  className="ka-primary"
                  onClick={() => setEditor({})}
                >
                  + Add product
                </button>
              </header>

              <div className="ka-tools">
                <input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <label>
                  <input
                    type="checkbox"
                    checked={includeHidden}
                    onChange={(e) => setIncludeHidden(e.target.checked)}
                  />
                  Include unavailable
                </label>
              </div>

              <div className="ka-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Availability</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleProducts.map((p) => (
                      <tr key={p.id}>
                        <td>{p.emoji || "☕"} {p.name}</td>
                        <td>{p.category_name || "—"}</td>
                        <td>{peso(p.price_cents)}</td>
                        <td>
                          {p.track_inventory
                            ? p.stock_quantity ?? "—"
                            : "Not tracked"}
                        </td>
                        <td>{p.is_available ? "Available" : "Hidden"}</td>
                        <td>
                          <div className="ka-row-actions">
                            <button onClick={() => setEditor(p)}>Edit</button>
                            <button
                              className="ka-danger"
                              onClick={() => deleteProduct(p)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {!visibleProducts.length && (
                  <p className="ka-empty">No matching products.</p>
                )}
              </div>
            </section>
          )}

          {tab === "categories" && (
            <section className="ka-panel">
              <header>
                <div>
                  <h3>Categories</h3>
                  <p>Organize your menu into sections.</p>
                </div>
              </header>

              <form className="ka-category-add" onSubmit={addCategory}>
                <input
                  required
                  maxLength="100"
                  placeholder="New category name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
                <button className="ka-primary">Add category</button>
              </form>

              {categories.map((category) => (
                <div className="ka-category" key={category.id}>
                  <div>
                    <b>{category.name}</b>
                    <small>/{category.slug}</small>
                  </div>

                  <span>
                    {category.is_active ? "Active" : "Inactive"}
                  </span>

                  <div className="ka-row-actions">
                    <button onClick={() => toggleCategory(category)}>
                      {category.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      className="ka-danger"
                      onClick={() => deleteCategory(category)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </section>
          )}

          {tab === "inventory" && (
            <section className="ka-panel">
              <header>
                <div>
                  <h3>Inventory overview</h3>
                  <p>Products with inventory tracking enabled.</p>
                </div>
                <b className="ka-count">
                  {lowStock.length} low stock
                </b>
              </header>

              <div className="ka-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter((p) => p.track_inventory)
                      .map((p) => (
                        <tr key={p.id}>
                          <td>{p.emoji || "☕"} {p.name}</td>
                          <td>{p.stock_quantity ?? "Not set"}</td>
                          <td>
                            {p.stock_quantity == null
                              ? "Unspecified"
                              : p.stock_quantity <= 5
                                ? "Low stock"
                                : "In stock"}
                          </td>
                          <td>
                            <button onClick={() => setEditor(p)}>
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <footer className="ka-footer">
            KremahCafe Management · Admin tools
          </footer>
        </div>
      </main>

      {editor !== null && (
        <ProductModal
          product={editor?.id ? editor : null}
          categories={categories.filter((c) => c.is_active)}
          onClose={() => setEditor(null)}
          onSave={saveProduct}
        />
      )}
    </div>
  );
}