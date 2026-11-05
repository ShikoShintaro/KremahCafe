
// ==========================================
// KREMAH CAFE - ADMIN DASHBOARD
// ==========================================

// Temporary keyword-based access gate.
// IMPORTANT: This is not secure server-side authentication.
const ADMIN_KEYWORD = "KREMAH-2026";

const tabs = ["dashboard", "orders", "menu", "users"];

const orderStatusClasses = {
  Pending: "bg-amber-500/10 text-amber-400",
  Preparing: "bg-blue-500/10 text-blue-400",
  Completed: "bg-emerald-500/10 text-emerald-400",
  Cancelled: "bg-red-500/10 text-red-400",
};

const menuItemDialog = document.getElementById("menu-item-dialog");
const menuItemForm = document.getElementById("menu-item-form");

let editingMenuCard = null;

// ==========================================
// ADMIN LOGIN
// ==========================================

function initializeAdminLogin() {
  const loginForm = document.getElementById("admin-login-form");
  const loginModal = document.getElementById("admin-login-modal");
  const loginError = document.getElementById("admin-login-error");
  const keywordInput = document.getElementById("admin-keyword");

  if (!loginForm || !loginModal || !loginError || !keywordInput) {
    console.error(
      "Admin login initialization failed. Check the login form IDs in index.html."
    );
    return;
  }

  // Lock dashboard until the correct keyword is entered.
  document.body.classList.add("admin-locked");

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const enteredKeyword = keywordInput.value.trim();

    if (enteredKeyword === ADMIN_KEYWORD) {
      loginError.classList.add("hidden");
      loginModal.remove();
      document.body.classList.remove("admin-locked");

      // Ensure dashboard opens on its default tab.
      switchTab("dashboard");

      console.info("Admin dashboard unlocked.");
    } else {
      loginError.textContent = "Incorrect keyword. Please try again.";
      loginError.classList.remove("hidden");

      keywordInput.value = "";
      keywordInput.focus();
    }
  });
}

// ==========================================
// DATE
// ==========================================

function initializeDate() {
  const dateElement = document.getElementById("current-date");

  if (!dateElement) return;

  dateElement.textContent = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ==========================================
// TAB NAVIGATION
// ==========================================

function switchTab(tabId) {
  if (!tabs.includes(tabId)) return;

  tabs.forEach((tab) => {
    const content = document.getElementById(`tab-content-${tab}`);
    const navigation = document.getElementById(`nav-${tab}`);

    if (content) {
      content.classList.toggle("hidden", tab !== tabId);
    }

    if (navigation) {
      const active = tab === tabId;

      navigation.classList.toggle("text-cafeGold", active);
      navigation.classList.toggle("border-cafeGold", active);
      navigation.classList.toggle("font-semibold", active);
      navigation.classList.toggle("text-neutral-400", !active);
      navigation.classList.toggle("border-transparent", !active);
    }
  });

  const mobileNavigation = document.getElementById("mobile-nav");

  if (mobileNavigation) {
    mobileNavigation.value = tabId;
  }
}

// ==========================================
// ORDER MANAGEMENT
// ==========================================

function filterOrders() {
  const statusFilter = document.getElementById("order-status-filter");

  if (!statusFilter) return;

  const selectedStatus = statusFilter.value;

  document
    .querySelectorAll("#tab-content-orders tbody tr")
    .forEach((row) => {
      const statusCell = row.cells[4];

      if (!statusCell) return;

      const status = statusCell.textContent.trim();

      row.classList.toggle(
        "hidden",
        selectedStatus !== "all" && status !== selectedStatus
      );
    });
}

function setOrderStatus(button, status) {
  const row = button.closest("tr");
  const statusLabel = row?.cells[4]?.querySelector("span");

  if (!row || !statusLabel || !orderStatusClasses[status]) {
    return;
  }

  statusLabel.className =
    `${orderStatusClasses[status]} text-xs px-2.5 py-1 rounded-full font-medium`;

  statusLabel.textContent = status;

  if (status === "Preparing") {
    button.dataset.status = "Completed";
    button.textContent = "Complete";

    button.className =
      "bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded transition";

    filterOrders();
    return;
  }

  const actionsCell = button.closest("td");

  if (actionsCell) {
    const closedLabel = document.createElement("span");

    closedLabel.className = "text-neutral-500 text-xs";
    closedLabel.textContent =
      status === "Cancelled" ? "Cancelled" : "Closed";

    actionsCell.replaceChildren(closedLabel);
  }

  filterOrders();
}

// ==========================================
// MENU AVAILABILITY
// ==========================================

function setMenuAvailability(card, isAvailable) {
  if (!card) return;

  const status = card.querySelector("[data-menu-status]");
  const toggleButton = card.querySelector(
    '[data-action="toggle-item"]'
  );

  if (!status || !toggleButton) return;

  status.classList.toggle("text-emerald-400", isAvailable);
  status.classList.toggle("text-amber-400", !isAvailable);

  status.replaceChildren();

  const icon = document.createElement("i");

  icon.className = "fa-solid fa-circle text-[8px] mr-1";

  status.append(
    icon,
    document.createTextNode(
      isAvailable ? " Available" : " Sold Out"
    )
  );

  toggleButton.className = isAvailable
    ? "text-xs text-amber-400 hover:text-amber-300 px-3 py-1 bg-neutral-800 rounded transition"
    : "text-xs text-emerald-400 hover:text-emerald-300 px-3 py-1 bg-neutral-800 rounded transition";

  toggleButton.textContent = isAvailable
    ? "Mark Unavailable"
    : "Mark Available";
}

// ==========================================
// MENU ITEM DIALOG
// ==========================================

function openMenuItemDialog(card = null) {
  if (!menuItemDialog || !menuItemForm) {
    console.error("Menu item dialog or form is missing.");
    return;
  }

  editingMenuCard = card;

  menuItemForm.reset();

  const title = document.getElementById("menu-item-dialog-title");
  const submitButton = document.getElementById("menu-item-submit");
  const error = document.getElementById("menu-item-error");

  if (title) {
    title.textContent = card ? "Edit menu item" : "Add menu item";
  }

  if (submitButton) {
    submitButton.textContent = card ? "Save changes" : "Add item";
  }

  error?.classList.add("hidden");

  if (card) {
    const name = card.querySelector("h3");
    const category = card.querySelector("[data-menu-category]");
    const description = card.querySelector("p.text-neutral-400");
    const price = card.querySelector("p.text-cafeGold");

    document.getElementById("menu-item-name").value =
      name?.textContent.trim() || "";

    document.getElementById("menu-item-category").value =
      category?.textContent.trim() || "";

    document.getElementById("menu-item-description").value =
      description?.textContent.trim() || "";

    document.getElementById("menu-item-price").value =
      price?.textContent.replace(/[^\d.]/g, "") || "";
  }

  menuItemDialog.showModal();

  document.getElementById("menu-item-name")?.focus();
}

function saveMenuItem(event) {
  event.preventDefault();

  const name = document.getElementById("menu-item-name").value.trim();
  const category = document.getElementById("menu-item-category").value.trim();
  const description = document.getElementById("menu-item-description").value.trim();
  const price = Number(document.getElementById("menu-item-price").value);
  const error = document.getElementById("menu-item-error");

  if (!name || !category || !Number.isFinite(price) || price < 0) {
    if (error) {
      error.textContent =
        "Enter an item name, category, and valid non-negative price.";

      error.classList.remove("hidden");
    }

    return;
  }

  let card = editingMenuCard;

  if (!card) {
    const firstCard = document.querySelector("[data-menu-card]");

    if (!firstCard) {
      console.error("Cannot add menu item: no existing menu card template.");
      return;
    }

    card = firstCard.cloneNode(true);

    setMenuAvailability(card, true);

    firstCard.parentElement.append(card);
  }

  const nameElement = card.querySelector("h3");
  const categoryElement = card.querySelector("[data-menu-category]");
  const descriptionElement = card.querySelector("p.text-neutral-400");
  const priceElement = card.querySelector("p.text-cafeGold");

  if (nameElement) nameElement.textContent = name;
  if (categoryElement) categoryElement.textContent = category;
  if (descriptionElement) descriptionElement.textContent = description;
  if (priceElement) priceElement.textContent = `₱${price.toFixed(2)}`;

  menuItemDialog.close();
  editingMenuCard = null;
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function initializeEventListeners() {
  // Dashboard buttons.
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    switch (button.dataset.action) {
      case "switch-tab":
        switchTab(button.dataset.tab);
        break;

      case "update-order":
        setOrderStatus(button, button.dataset.status);
        break;

      case "toggle-item": {
        const card = button.closest("[data-menu-card]");
        const status = card?.querySelector("[data-menu-status]");

        if (!status) break;

        const isAvailable = status.classList.contains("text-amber-400");

        setMenuAvailability(card, isAvailable);
        break;
      }

      case "edit-item":
        openMenuItemDialog(button.closest("[data-menu-card]"));
        break;

      case "add-item":
        openMenuItemDialog();
        break;

      case "close-modal":
        menuItemDialog?.close();
        break;

      default:
        break;
    }
  });

  // Mobile navigation.
  document.getElementById("mobile-nav")?.addEventListener(
    "change",
    (event) => {
      switchTab(event.target.value);
    }
  );

  // Order status filter.
  document.getElementById("order-status-filter")?.addEventListener(
    "change",
    filterOrders
  );

  // Menu item form.
  menuItemForm?.addEventListener("submit", saveMenuItem);
}

// ==========================================
// INITIALIZATION
// ==========================================

function initializeAdminDashboard() {
  initializeAdminLogin();
  initializeDate();
  initializeEventListeners();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeAdminDashboard,
    { once: true }
  );
} else {
  initializeAdminDashboard();
}
