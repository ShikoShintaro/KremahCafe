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

const json = (body) => ({
  method: "POST",
  body: JSON.stringify(body),
});

export const api = {
  health: () => request("/health"),

  getCategories: () => request("/categories"),

  getProducts: (params = {}) => {
    const query = new URLSearchParams(params);
    const suffix = query.size ? `?${query}` : "";
    return request(`/products${suffix}`);
  },

  customerRegister: (details) =>
    request("/customer-auth/register", json(details)),

  customerLogin: (credentials) =>
    request("/customer-auth/login", json(credentials)),

  customerMe: () => request("/customer-auth/me"),

  customerLogout: () =>
    request("/customer-auth/logout", json({})),
};