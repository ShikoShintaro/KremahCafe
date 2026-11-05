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

document.getElementById("current-date").textContent =
  new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function switchTab(tabId) {
  if (!tabs.includes(tabId)) {
    return;
  }

  tabs.forEach((tab) => {
    const active = tab === tabId;
    document.getElementById(`tab-content-${tab}`).classList.toggle("hidden", !active);
    document.getElementById(`nav-${tab}`).classList.toggle("text-cafeGold", active);
    document.getElementById(`nav-${tab}`).classList.toggle("border-cafeGold", active);
    document.getElementById(`nav-${tab}`).classList.toggle("font-semibold", active);
    document.getElementById(`nav-${tab}`).classList.toggle("text-neutral-400", !active);
    document.getElementById(`nav-${tab}`).classList.toggle("border-transparent", !active);
  });

  document.getElementById("mobile-nav").value = tabId;
}

function filterOrders() {
  const selectedStatus = document.getElementById("order-status-filter").value;

  document.querySelectorAll("#tab-content-orders tbody tr").forEach((row) => {
    const status = row.cells[4].textContent.trim();
    row.classList.toggle(
      "hidden",
      selectedStatus !== "all" && status !== selectedStatus,
    );
  });
}

function setOrderStatus(button, status) {
  const row = button.closest("tr");
  const statusLabel = row?.cells[4].querySelector("span");
  if (!row || !statusLabel || !orderStatusClasses[status]) {
    return;
  }

  statusLabel.className = `${orderStatusClasses[status]} text-xs px-2.5 py-1 rounded-full font-medium`;
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
  const closedLabel = document.createElement("span");
  closedLabel.className = "text-neutral-500 text-xs";
  closedLabel.textContent = status === "Cancelled" ? "Cancelled" : "Closed";
  actionsCell.replaceChildren(closedLabel);
  filterOrders();
}

function setMenuAvailability(card, isAvailable) {
  const status = card.querySelector("[data-menu-status]");
  const toggleButton = card.querySelector('[data-action="toggle-item"]');
  if (!status || !toggleButton) {
    return;
  }

  status.classList.toggle("text-emerald-400", isAvailable);
  status.classList.toggle("text-amber-400", !isAvailable);
  status.replaceChildren();

  const icon = document.createElement("i");
  icon.className = "fa-solid fa-circle text-[8px] mr-1";
  status.append(icon, document.createTextNode(isAvailable ? " Available" : " Sold Out"));

  toggleButton.className = isAvailable
    ? "text-xs text-amber-400 hover:text-amber-300 px-3 py-1 bg-neutral-800 rounded transition"
    : "text-xs text-emerald-400 hover:text-emerald-300 px-3 py-1 bg-neutral-800 rounded transition";
  toggleButton.textContent = isAvailable ? "Mark Unavailable" : "Mark Available";
}

function openMenuItemDialog(card = null) {
  editingMenuCard = card;
  menuItemForm.reset();
  document.getElementById("menu-item-dialog-title").textContent = card
    ? "Edit menu item"
    : "Add menu item";
  document.getElementById("menu-item-submit").textContent = card
    ? "Save changes"
    : "Add item";
  document.getElementById("menu-item-error").classList.add("hidden");

  if (card) {
    document.getElementById("menu-item-name").value =
      card.querySelector("h3").textContent.trim();
    document.getElementById("menu-item-category").value =
      card.querySelector("[data-menu-category]").textContent.trim();
    document.getElementById("menu-item-description").value =
      card.querySelector("p.text-neutral-400").textContent.trim();
    document.getElementById("menu-item-price").value =
      card.querySelector("p.text-cafeGold").textContent.replace(/[^\d.]/g, "");
  }

  menuItemDialog.showModal();
  document.getElementById("menu-item-name").focus();
}

function saveMenuItem(event) {
  event.preventDefault();

  const name = document.getElementById("menu-item-name").value.trim();
  const category = document.getElementById("menu-item-category").value.trim();
  const description = document.getElementById("menu-item-description").value.trim();
  const price = Number(document.getElementById("menu-item-price").value);
  const error = document.getElementById("menu-item-error");

  if (!name || !category || !Number.isFinite(price) || price < 0) {
    error.textContent = "Enter an item name, category, and valid non-negative price.";
    error.classList.remove("hidden");
    return;
  }

  let card = editingMenuCard;
  if (!card) {
    const firstCard = document.querySelector("[data-menu-card]");
    card = firstCard.cloneNode(true);
    setMenuAvailability(card, true);
    firstCard.parentElement.append(card);
  }

  card.querySelector("h3").textContent = name;
  card.querySelector("[data-menu-category]").textContent = category;
  card.querySelector("p.text-neutral-400").textContent = description;
  card.querySelector("p.text-cafeGold").textContent = `₱${price.toFixed(2)}`;
  menuItemDialog.close();
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  switch (button.dataset.action) {
    case "switch-tab":
      switchTab(button.dataset.tab);
      break;
    case "update-order":
      setOrderStatus(button, button.dataset.status);
      break;
    case "toggle-item": {
      const card = button.closest("[data-menu-card]");
      const isAvailable = card
        .querySelector("[data-menu-status]")
        .classList.contains("text-amber-400");
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
      menuItemDialog.close();
      break;
    default:
      break;
  }
});

document.getElementById("mobile-nav").addEventListener("change", (event) => {
  switchTab(event.target.value);
});

document
  .getElementById("order-status-filter")
  .addEventListener("change", filterOrders);

menuItemForm.addEventListener("submit", saveMenuItem);
