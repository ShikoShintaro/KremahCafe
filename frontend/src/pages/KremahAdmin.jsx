
import { useMemo, useState } from "react";
import "./admin.css";

const seedProducts = [
  { id: 1, name: "Dubai Chewy Cookie", category: "Desserts", price: 145, badge: "Bestseller", stock: 18, active: true, icon: "🍪" },
  { id: 2, name: "Iced Spanish Latte", category: "Coffee", price: 135, badge: "Popular", stock: 24, active: true, icon: "🧋" },
  { id: 3, name: "Strawberry Matcha", category: "Matcha", price: 155, badge: "New", stock: 12, active: true, icon: "🍵" },
  { id: 4, name: "Caramel Frappe", category: "Frappes", price: 150, badge: "", stock: 9, active: true, icon: "🥤" },
  { id: 5, name: "Classic Croffle", category: "Pastries", price: 120, badge: "Fan Fave", stock: 4, active: false, icon: "🧇" },
  { id: 6, name: "Creamy Carbonara", category: "Meals", price: 185, badge: "", stock: 15, active: true, icon: "🍝" }
];

const seedOrders = [
  { id: "KR-1028", customer: "Mika Santos", items: "2× Spanish Latte, 1× Croffle", total: 390, status: "Preparing", date: "Today, 2:42 PM" },
  { id: "KR-1027", customer: "Joshua Reyes", items: "1× Strawberry Matcha", total: 155, status: "Pending", date: "Today, 2:18 PM" },
  { id: "KR-1026", customer: "Andrea Cruz", items: "2× Dubai Chewy Cookie", total: 290, status: "Completed", date: "Today, 1:56 PM" },
  { id: "KR-1025", customer: "Paolo Garcia", items: "1× Carbonara, 1× Caramel Frappe", total: 335, status: "Completed", date: "Today, 1:31 PM" }
];

const seedCategories = ["Coffee", "Frappes", "Matcha", "Pastries", "Desserts", "Meals"];

const nav = [
  ["overview", "▦", "Overview"],
  ["orders", "▤", "Orders"],
  ["menu", "☕", "Menu items"],
  ["categories", "◇", "Categories"],
  ["store", "⌖", "Store details"],
  ["announcement", "▧", "Announcements"],
  ["backup", "⇩", "Backup & data"]
];

const cash = value =>
  `₱${Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

function Heading({ eyebrow, title, description, action }) {
  return (
    <div className="kremah-admin-heading">
      <div>
        <div className="kremah-admin-eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

function Stat({ label, value, icon, detail }) {
  return (
    <article className="kremah-admin-stat">
      <div className="kremah-admin-stat-top">
        {label}
        <span>{icon}</span>
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function IconButton({ children, onClick, title }) {
  return (
    <button
      type="button"
      className="kremah-admin-icon-btn"
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}

export default function KremahAdmin() {
  const [tab, setTab] = useState("overview");
  const [products, setProducts] = useState(seedProducts);
  const [orders, setOrders] = useState(seedOrders);
  const [categories, setCategories] = useState(seedCategories);

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [editing, setEditing] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [toast, setToast] = useState("");

  const [store, setStore] = useState({
    weekday: "2:00 PM – 9:00 PM",
    saturday: "2:00 PM – 10:00 PM",
    sunday: "2:00 PM – 8:00 PM",
    phone: "+63 924 121 6120",
    email: "kremahcafe@gmail.com",
    address: "San Mateo, Rizal, Philippines",
    maps: "https://maps.app.goo.gl/GbnKkZfuDZRHpf1c8"
  });

  const [hero, setHero] = useState({
    announcement: "Welcome to Kremah Café! Enjoy our new Dubai Chewy Cookie and Fresh Matcha Series.",
    tag: "Good Drinks. Good Food. Good Vibes.",
    title: "Kremah",
    subtitle: "Cafè",
    description: "Handcrafted frappes, specialty coffee, matcha drinks, croffles, and more — made with love in every cup."
  });

  const filteredProducts = useMemo(
    () =>
      products.filter(product =>
        (categoryFilter === "All categories" ||
          product.category === categoryFilter) &&
        `${product.name} ${product.category} ${product.badge}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [products, categoryFilter, query]
  );

  const filteredOrders = useMemo(
    () =>
      orders.filter(order =>
        statusFilter === "All statuses" ||
        order.status === statusFilter
      ),
    [orders, statusFilter]
  );

  const revenue = orders
    .filter(order => order.status === "Completed")
    .reduce((sum, order) => sum + order.total, 0);

  const notify = message => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  };

  const go = key => {
    setTab(key);
    setQuery("");
  };

  const saveProduct = event => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const item = {
      id: editing?.id || Date.now(),
      name: form.get("name"),
      category: form.get("category"),
      price: Number(form.get("price")),
      badge: form.get("badge"),
      stock: Number(form.get("stock")),
      icon: form.get("icon") || "☕",
      active: editing?.active ?? true
    };

    setProducts(old =>
      editing?.id
        ? old.map(product =>
            product.id === editing.id ? item : product
          )
        : [item, ...old]
    );

    setEditing(null);
    notify("Menu item saved locally.");
  };

  const updateOrder = (id, status) => {
    setOrders(old =>
      old.map(order =>
        order.id === id ? { ...order, status } : order
      )
    );

    notify(`Order ${id} updated.`);
  };

  const addCategory = event => {
    event.preventDefault();

    const name = newCategory.trim();

    if (!name) return;

    if (
      categories.some(
        category => category.toLowerCase() === name.toLowerCase()
      )
    ) {
      return notify("That category already exists.");
    }

    setCategories(old => [...old, name]);
    setNewCategory("");
    notify("Category added locally.");
  };

  return (
    <div className="kremah-admin">
      <aside className="kremah-admin-sidebar">
        <div className="kremah-admin-brand">
          <div className="kremah-admin-mark">K</div>
          <div>
            <b>Kremah <i>Cafè</i></b>
            <small>ADMINISTRATION</small>
          </div>
        </div>

        <div className="kremah-admin-workspace">
          <i /> Store workspace <span>⌄</span>
        </div>

        <div className="kremah-admin-nav-label">WORKSPACE</div>

        <nav className="kremah-admin-nav">
          {nav.map(([key, icon, label]) => (
            <button
              key={key}
              className={tab === key ? "active" : ""}
              onClick={() => go(key)}
            >
              <span>{icon}</span>
              {label}

              {key === "orders" && (
                <em>
                  {orders.filter(order => order.status === "Pending").length}
                </em>
              )}
            </button>
          ))}
        </nav>

        <div className="kremah-admin-sidebar-bottom">
          <div className="kremah-admin-storage">
            <b>◈ &nbsp; Local preview mode</b>
            <p>
              Changes are temporary and stay in this browser session.
            </p>
            <div><i /></div>
            <small>API connection not enabled</small>
          </div>

          <div className="kremah-admin-profile">
            <span>A</span>
            <div>
              <b>Store Admin</b>
              <small>Administrator</small>
            </div>
            <i>···</i>
          </div>
        </div>
      </aside>

      <main className="kremah-admin-main">
        <header className="kremah-admin-topbar">
          <div>
            KREMAH CAFÈ <span>/</span>
            <b>{nav.find(item => item[0] === tab)?.[2].toUpperCase()}</b>
          </div>

          <section>
            <label><i /> PREVIEW DATA</label>
            <IconButton
              title="Notifications"
              onClick={() => notify("You're all caught up.")}
            >
              ♧
            </IconButton>
            <b>A</b>
          </section>
        </header>

        <div className="kremah-admin-content">
          {tab === "overview" && (
            <>
              <Heading
                eyebrow="SATURDAY, OCTOBER 31, 2026"
                title="Good afternoon, Admin."
                description="Here's what's happening at Kremah Café today."
                action={
                  <button
                    className="kremah-admin-btn dark"
                    onClick={() => go("menu")}
                  >
                    ＋ Add menu item
                  </button>
                }
              />

              <div className="kremah-admin-stats">
                <Stat
                  label="MENU ITEMS"
                  value={products.length}
                  icon="☕"
                  detail="Across all categories"
                />
                <Stat
                  label="CATEGORIES"
                  value={categories.length}
                  icon="▦"
                  detail="Organized collections"
                />
                <Stat
                  label="PENDING ORDERS"
                  value={orders.filter(o => o.status === "Pending").length}
                  icon="◷"
                  detail="Awaiting confirmation"
                />
                <Stat
                  label="COMPLETED SALES"
                  value={cash(revenue)}
                  icon="₱"
                  detail="Sample completed orders"
                />
              </div>

              <div className="kremah-admin-overview-grid">
                <section className="kremah-admin-panel">
                  <div className="kremah-admin-panel-head">
                    <div>
                      <h2>Recent orders</h2>
                      <p>Your latest customer activity</p>
                    </div>
                    <button className="kremah-admin-link" onClick={() => go("orders")}>
                      View all →
                    </button>
                  </div>

                  <div className="kremah-admin-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>ORDER</th>
                          <th>CUSTOMER</th>
                          <th>TOTAL</th>
                          <th>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 4).map(order => (
                          <tr key={order.id}>
                            <td>
                              <b>{order.id}</b>
                              <small>{order.date}</small>
                            </td>
                            <td>
                              {order.customer}
                              <small>{order.items}</small>
                            </td>
                            <td><b>{cash(order.total)}</b></td>
                            <td>
                              <span className={`kremah-admin-status ${order.status.toLowerCase()}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="kremah-admin-panel">
                  <div className="kremah-admin-panel-head">
                    <div>
                      <h2>Menu categories</h2>
                      <p>Items grouped by collection</p>
                    </div>
                    <button className="kremah-admin-link" onClick={() => go("categories")}>
                      Manage →
                    </button>
                  </div>

                  <div className="kremah-admin-category-list">
                    {categories.map((category, index) => (
                      <div className="kremah-admin-category-row" key={category}>
                        <span>{["☕", "🥤", "🍵", "🥐", "🍪", "🍝"][index % 6]}</span>
                        <div>
                          {category}
                          <small>
                            {products.filter(p => p.category === category).length} menu items
                          </small>
                        </div>
                        <b>
                          {products.filter(p => p.category === category).length}
                        </b>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="kremah-admin-note">
                <span>✦</span>
                <div>
                  <b>A little note from Kremah</b>
                  <p>
                    Keep your menu fresh, your details up to date, and every cup made with care.
                  </p>
                </div>
                <small>GOOD DRINKS. GOOD FOOD. GOOD VIBES.</small>
              </div>
            </>
          )}

          {tab === "orders" && (
            <>
              <Heading
                eyebrow="CUSTOMER ACTIVITY"
                title="Customer orders"
                description="Review incoming orders and keep track of their progress."
              />

              <section className="kremah-admin-panel">
                <div className="kremah-admin-panel-head">
                  <div>
                    <h2>All orders <small className="kremah-admin-count">{orders.length}</small></h2>
                    <p>Manage order status and fulfillment</p>
                  </div>

                  <select
                    value={statusFilter}
                    onChange={event => setStatusFilter(event.target.value)}
                  >
                    <option>All statuses</option>
                    {["Pending", "Preparing", "Completed", "Cancelled"].map(status => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="kremah-admin-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ORDER ID</th>
                        <th>CUSTOMER</th>
                        <th>ORDER DETAILS</th>
                        <th>TOTAL</th>
                        <th>STATUS</th>
                        <th>UPDATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(order => (
                        <tr key={order.id}>
                          <td>
                            <b>{order.id}</b>
                            <small>{order.date}</small>
                          </td>
                          <td>{order.customer}</td>
                          <td>{order.items}</td>
                          <td><b>{cash(order.total)}</b></td>
                          <td>
                            <span className={`kremah-admin-status ${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <select
                              className="kremah-admin-small-select"
                              value={order.status}
                              onChange={event => updateOrder(order.id, event.target.value)}
                            >
                              {["Pending", "Preparing", "Completed", "Cancelled"].map(status => (
                                <option key={status}>{status}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {!filteredOrders.length && (
                    <div className="kremah-admin-empty">No orders match this filter.</div>
                  )}
                </div>
              </section>
            </>
          )}

          {tab === "menu" && (
            <>
              <Heading
                eyebrow="YOUR PRODUCTS"
                title="Menu items"
                description="Create, organize, and maintain the items on your digital menu."
                action={
                  <button className="kremah-admin-btn dark" onClick={() => setEditing({})}>
                    ＋ Add item
                  </button>
                }
              />

              <section className="kremah-admin-panel">
                <div className="kremah-admin-panel-head">
                  <div>
                    <h2>
                      All menu items <small className="kremah-admin-count">{filteredProducts.length}</small>
                    </h2>
                    <p>Search and filter your product catalogue</p>
                  </div>

                  <div className="kremah-admin-filters">
                    <input
                      value={query}
                      onChange={event => setQuery(event.target.value)}
                      placeholder="⌕ Search menu..."
                    />
                    <select
                      value={categoryFilter}
                      onChange={event => setCategoryFilter(event.target.value)}
                    >
                      <option>All categories</option>
                      {categories.map(category => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="kremah-admin-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ITEM</th>
                        <th>CATEGORY</th>
                        <th>PRICE</th>
                        <th>BADGE</th>
                        <th>STOCK</th>
                        <th>VISIBILITY</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(product => (
                        <tr key={product.id}>
                          <td>
                            <span className="kremah-admin-product-icon">{product.icon}</span>
                            <b>{product.name}</b>
                          </td>
                          <td>{product.category}</td>
                          <td><b>{cash(product.price)}</b></td>
                          <td>{product.badge || "—"}</td>
                          <td className={product.stock <= 5 ? "kremah-admin-low" : ""}>
                            {product.stock} left
                          </td>
                          <td>
                            <span className={`kremah-admin-visible ${product.active ? "" : "off"}`}>
                              ● {product.active ? "Visible" : "Hidden"}
                            </span>
                          </td>
                          <td>
                            <IconButton
                              title="Edit item"
                              onClick={() => setEditing(product)}
                            >
                              ✎
                            </IconButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {!filteredProducts.length && (
                    <div className="kremah-admin-empty">No menu items found.</div>
                  )}
                </div>
              </section>
            </>
          )}

          {tab === "categories" && (
            <>
              <Heading
                eyebrow="MENU ORGANIZATION"
                title="Categories"
                description="Group your products so customers can find their favorites."
              />

              <div className="kremah-admin-category-manager">
                <section className="kremah-admin-panel kremah-admin-add">
                  <h2>Create a category</h2>
                  <p>Give your menu a new collection.</p>

                  <form onSubmit={addCategory}>
                    <label>
                      Category name
                      <input
                        value={newCategory}
                        onChange={event => setNewCategory(event.target.value)}
                        placeholder="e.g. Seasonal drinks"
                        required
                      />
                    </label>
                    <button className="kremah-admin-btn dark">＋ Add category</button>
                  </form>
                </section>

                <section className="kremah-admin-panel">
                  <div className="kremah-admin-panel-head">
                    <div>
                      <h2>Active categories</h2>
                      <p>{categories.length} collections in your menu</p>
                    </div>
                  </div>

                  <div className="kremah-admin-category-list">
                    {categories.map((category, index) => (
                      <div className="kremah-admin-category-row" key={category}>
                        <span>{["☕", "🥤", "🍵", "🥐", "🍪", "🍝"][index % 6]}</span>
                        <div>
                          {category}
                          <small>
                            {products.filter(p => p.category === category).length} items
                          </small>
                        </div>
                        <b>{products.filter(p => p.category === category).length}</b>
                        <IconButton
                          title={`Remove ${category}`}
                          onClick={() => {
                            if (products.some(p => p.category === category)) {
                              return notify("Move products out of this category first.");
                            }

                            setCategories(old => old.filter(c => c !== category));
                            notify("Category removed.");
                          }}
                        >
                          ×
                        </IconButton>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}

          {tab === "store" && (
            <>
              <Heading
                eyebrow="BUSINESS PROFILE"
                title="Store details"
                description="Keep your opening hours and contact information accurate."
              />

              <form
                className="kremah-admin-panel kremah-admin-settings"
                onSubmit={event => {
                  event.preventDefault();
                  notify("Store details saved locally.");
                }}
              >
                <div className="kremah-admin-panel-head">
                  <div>
                    <h2>Hours & contact information</h2>
                    <p>These details are shown on your public KremahCafe page.</p>
                  </div>
                </div>

                <div className="kremah-admin-form-grid">
                  {Object.entries({
                    weekday: "Monday – Friday hours",
                    saturday: "Saturday hours",
                    sunday: "Sunday hours",
                    phone: "Phone number",
                    email: "Contact email",
                    address: "Store address",
                    maps: "Google Maps URL"
                  }).map(([key, label]) => (
                    <label
                      key={key}
                      className={["address", "maps"].includes(key) ? "wide" : ""}
                    >
                      {label}
                      <input
                        type={
                          key === "email" ? "email" :
                          key === "maps" ? "url" : "text"
                        }
                        value={store[key]}
                        onChange={event =>
                          setStore(old => ({
                            ...old,
                            [key]: event.target.value
                          }))
                        }
                        required
                      />
                    </label>
                  ))}
                </div>

                <button className="kremah-admin-btn gold">Save store details</button>
              </form>
            </>
          )}

          {tab === "announcement" && (
            <>
              <Heading
                eyebrow="PUBLIC WEBSITE CONTENT"
                title="Hero & announcements"
                description="Shape the first message customers see when they visit KremahCafe."
              />

              <form
                className="kremah-admin-panel kremah-admin-settings"
                onSubmit={event => {
                  event.preventDefault();
                  notify("Announcement settings saved locally.");
                }}
              >
                <div className="kremah-admin-panel-head">
                  <div>
                    <h2>Homepage content</h2>
                    <p>Edit the announcement bar and hero section.</p>
                  </div>
                </div>

                <div className="kremah-admin-form-grid">
                  <label className="wide">
                    Announcement banner
                    <input
                      value={hero.announcement}
                      onChange={event => setHero(old => ({
                        ...old,
                        announcement: event.target.value
                      }))}
                    />
                  </label>

                  <label>
                    Hero tagline
                    <input
                      value={hero.tag}
                      onChange={event => setHero(old => ({
                        ...old,
                        tag: event.target.value
                      }))}
                    />
                  </label>

                  <label>
                    Main title
                    <input
                      value={hero.title}
                      onChange={event => setHero(old => ({
                        ...old,
                        title: event.target.value
                      }))}
                    />
                  </label>

                  <label>
                    Italic subtitle
                    <input
                      value={hero.subtitle}
                      onChange={event => setHero(old => ({
                        ...old,
                        subtitle: event.target.value
                      }))}
                    />
                  </label>

                  <label className="wide">
                    Hero description
                    <textarea
                      rows="4"
                      value={hero.description}
                      onChange={event => setHero(old => ({
                        ...old,
                        description: event.target.value
                      }))}
                    />
                  </label>
                </div>

                <div className="kremah-admin-live-preview">
                  <small>LIVE PREVIEW</small>
                  <p>{hero.announcement}</p>
                  <h2>{hero.title} <i>{hero.subtitle}</i></h2>
                  <b>{hero.tag}</b>
                  <p>{hero.description}</p>
                </div>

                <button className="kremah-admin-btn gold">Save homepage content</button>
              </form>
            </>
          )}

          {tab === "backup" && (
            <>
              <Heading
                eyebrow="DATA & MAINTENANCE"
                title="Backup & data"
                description="Tools for keeping your KremahCafe information safe."
              />

              <div className="kremah-admin-backup-grid">
                <section className="kremah-admin-panel">
                  <div className="kremah-admin-backup-icon">⇩</div>
                  <h2>Export menu data</h2>
                  <p>
                    Download a JSON snapshot of the current sample menu and category data.
                  </p>

                  <button
                    className="kremah-admin-btn dark"
                    onClick={() => {
                      const blob = new Blob(
                        [JSON.stringify({ products, categories, store, hero }, null, 2)],
                        { type: "application/json" }
                      );

                      const url = URL.createObjectURL(blob);
                      const anchor = document.createElement("a");
                      anchor.href = url;
                      anchor.download = "kremah-admin-backup.json";
                      anchor.click();
                      URL.revokeObjectURL(url);

                      notify("Backup exported.");
                    }}
                  >
                    Download JSON backup
                  </button>
                </section>

                <section className="kremah-admin-panel kremah-admin-danger">
                  <div className="kremah-admin-backup-icon">!</div>
                  <h2>Reset preview data</h2>
                  <p>
                    Restore sample products, orders, and categories.
                    This does not affect a server or database.
                  </p>

                  <button
                    className="kremah-admin-btn danger"
                    onClick={() => {
                      if (window.confirm("Reset all local preview data?")) {
                        setProducts(seedProducts);
                        setOrders(seedOrders);
                        setCategories(seedCategories);
                        notify("Preview data reset.");
                      }
                    }}
                  >
                    Reset sample data
                  </button>
                </section>
              </div>
            </>
          )}
        </div>
      </main>

      {toast && <div className="kremah-admin-toast">✦ &nbsp;{toast}</div>}

      {editing && (
        <div
          className="kremah-admin-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              setEditing(null);
            }
          }}
        >
          <form className="kremah-admin-modal" onSubmit={saveProduct}>
            <button
              type="button"
              className="kremah-admin-close"
              onClick={() => setEditing(null)}
            >
              ×
            </button>

            <div className="kremah-admin-eyebrow">
              {editing.id ? "EDIT PRODUCT" : "NEW PRODUCT"}
            </div>

            <h2>{editing.id ? "Update menu item" : "Add menu item"}</h2>
            <p>Product details for your digital menu.</p>

            <div className="kremah-admin-form-grid">
              <label className="wide">
                Item name
                <input
                  name="name"
                  defaultValue={editing.name || ""}
                  required
                  placeholder="e.g. Vanilla Latte"
                />
              </label>

              <label>
                Category
                <select
                  name="category"
                  defaultValue={editing.category || categories[0]}
                >
                  {categories.map(category => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label>
                Price (₱)
                <input
                  name="price"
                  type="number"
                  min="0"
                  step=".01"
                  defaultValue={editing.price || ""}
                  required
                />
              </label>

              <label>
                Badge
                <input
                  name="badge"
                  defaultValue={editing.badge || ""}
                  placeholder="Bestseller"
                />
              </label>

              <label>
                Stock quantity
                <input
                  name="stock"
                  type="number"
                  min="0"
                  defaultValue={editing.stock ?? 0}
                />
              </label>

              <label>
                Icon / emoji
                <input
                  name="icon"
                  defaultValue={editing.icon || "☕"}
                />
              </label>
            </div>

            <div className="kremah-admin-modal-actions">
              <button
                type="button"
                className="kremah-admin-btn light"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button className="kremah-admin-btn gold">Save item</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}