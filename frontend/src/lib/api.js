
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://generic-overuse-ability.ngrok-free.dev/api/v1"
).replace(/\/+$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "ngrok-skip-browser-warning": "true",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || `Request failed: ${response.status}`
    );
  }

  return data;
}

const post = (body = {}) => ({
  method: "POST",
  body: JSON.stringify(body),
});

const put = (body = {}) => ({
  method: "PUT",
  body: JSON.stringify(body),
});

export const api = {
  // Health
  health: () => request("/health"),

  // Public catalog
  getCategories: () => request("/categories"),

  getProducts: (params = {}) => {
    const query = new URLSearchParams(params);
    const suffix = query.size ? `?${query.toString()}` : "";

    return request(`/products${suffix}`);
  },

  // Customer authentication
  customerRegister: (details) =>
    request("/customer-auth/register", post(details)),

  customerLogin: (credentials) =>
    request("/customer-auth/login", post(credentials)),

  customerMe: () =>
    request("/customer-auth/me"),

  customerLogout: () =>
    request("/customer-auth/logout", post()),

  // Admin authentication
  adminLogin: (credentials) =>
    request("/auth/login", post(credentials)),

  adminMe: () =>
    request("/auth/me"),

  adminLogout: () =>
    request("/auth/logout", post()),

  // Admin dashboard
  adminDashboard: () =>
    request("/admin/dashboard"),

  // Admin product management
  adminGetProducts: () =>
    request("/admin/catalog/products"),

  adminCreateProduct: (product) =>
    request("/admin/catalog/products", post(product)),

  adminUpdateProduct: (id, product) =>
    request(`/admin/catalog/products/${encodeURIComponent(id)}`, put(product)),

  adminDeleteProduct: (id) =>
    request(`/admin/catalog/products/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  // Admin category management
  adminGetCategories: () =>
    request("/admin/catalog/categories"),

  adminCreateCategory: (category) =>
    request("/admin/catalog/categories", post(category)),

  adminUpdateCategory: (id, category) =>
    request(`/admin/catalog/categories/${encodeURIComponent(id)}`, put(category)),

  adminDeleteCategory: (id) =>
    request(`/admin/catalog/categories/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};
