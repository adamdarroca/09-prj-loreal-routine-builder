/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const selectedProductsContainer = document.getElementById(
  "selectedProductsContainer",
);
const removeAllBtn = document.getElementById("removeAllBtn");
const generateRoutine = document.getElementById("generateRoutine");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const userInput = document.getElementById("userInput");
const SELECTED_ITEMS_KEY = "selectedItems";

/* Save selected items in localStorage so they persist after refresh */
function saveSelectedItems(items) {
  localStorage.setItem(SELECTED_ITEMS_KEY, JSON.stringify(items));
}

/* Load selected items from localStorage when the page opens */
function loadSelectedItems() {
  const storedItems = localStorage.getItem(SELECTED_ITEMS_KEY);
  if (!storedItems) return [];

  try {
    const parsedItems = JSON.parse(storedItems);
    return Array.isArray(parsedItems) ? parsedItems : [];
  } catch (error) {
    console.error("Could not read selected items from localStorage:", error);
    return [];
  }
}

let selectedProducts = loadSelectedItems();
let activeModalProductId = null;

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

/* Create HTML for displaying product cards inside Products Container */
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map(
      (product) => `
    <div class="product-card" id="productStack" data-id="${product.id}">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
      </div>
      <button class="add-product-btn">ADD PRODUCT</button>
    </div>
  `,
    )
    .join("");

  syncProductStackCards();
}

/* Keep product cards in sync with selected items state */
function syncProductStackCards() {
  const selectedIds = new Set(selectedProducts.map((product) => product.id));
  const stackCards = productsContainer.querySelectorAll(".product-card");

  stackCards.forEach((card) => {
    const cardId = Number(card.dataset.id);
    const addButton = card.querySelector(".add-product-btn");
    if (!addButton) return;

    const isAdded = selectedIds.has(cardId);
    card.classList.toggle("is-added", isAdded);
    addButton.disabled = isAdded;
    addButton.textContent = isAdded ? "PRODUCT ADDED" : "ADD PRODUCT";
  });

  syncModalAddButtonState();
}

/* Create one modal and insert it inside the products container */
function ensureProductModal() {
  let modal = document.getElementById("productDetailsModal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "productDetailsModal";
  modal.className = "product-modal hidden";
  modal.innerHTML = `
    <div class="product-modal-content" role="dialog" aria-modal="true" aria-labelledby="modalProductTitle">
      <button class="product-modal-close" type="button" aria-label="Close product details">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <img id="modalProductImage" src="" alt="">
      <h2 id="modalProductTitle"></h2>
      <p id="modalProductCategory" class="product-modal-category"></p>
      <p id="modalProductDescription" class="product-modal-description"></p>
      <div class="product-modal-actions">
        <button id="modalAddProductBtn" class="product-modal-add-btn" type="button">ADD PRODUCT</button>
      </div>
    </div>
  `;

  productsContainer.appendChild(modal);

  const closeModalBtn = modal.querySelector(".product-modal-close");
  closeModalBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeProductModal();
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeProductModal();
    }
  });

  const modalAddProductBtn = modal.querySelector("#modalAddProductBtn");
  modalAddProductBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (activeModalProductId === null) return;

    const products = await loadProducts();
    const selectedProduct = products.find((p) => p.id === activeModalProductId);
    const alreadySelected = selectedProducts.some(
      (p) => p.id === activeModalProductId,
    );

    if (selectedProduct && !alreadySelected) {
      selectedProducts.push(selectedProduct);
      saveSelectedItems(selectedProducts);
      displaySelectedProducts(selectedProducts);
      syncProductStackCards();
    }

    closeProductModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeProductModal();
    }
  });

  return modal;
}

function openProductModal(product) {
  const modal = ensureProductModal();
  modal.querySelector("#modalProductImage").src = product.image;
  modal.querySelector("#modalProductImage").alt = product.name;
  modal.querySelector("#modalProductTitle").textContent = product.name;
  modal.querySelector("#modalProductCategory").textContent =
    `Category: ${product.category}`;
  modal.querySelector("#modalProductDescription").textContent =
    product.description || "No description available for this product.";

  activeModalProductId = product.id;
  syncModalAddButtonState();
  modal.classList.remove("hidden");
}

function closeProductModal() {
  const modal = document.getElementById("productDetailsModal");
  if (!modal) return;

  modal.classList.add("hidden");
  activeModalProductId = null;
}

function syncModalAddButtonState() {
  const modalAddBtn = document.getElementById("modalAddProductBtn");
  if (!modalAddBtn || activeModalProductId === null) return;

  const alreadySelected = selectedProducts.some(
    (p) => p.id === activeModalProductId,
  );
  modalAddBtn.disabled = alreadySelected;
  modalAddBtn.textContent = alreadySelected ? "PRODUCT ADDED" : "ADD PRODUCT";
}

function displaySelectedProducts(selectedProducts) {
  selectedProductsContainer.innerHTML = selectedProducts
    .map(
      (selectedProduct) => `
    <div class="product-card" id="productList" data-id="${selectedProduct.id}">
      <img src="${selectedProduct.image}" alt="${selectedProduct.name}">
      <div class="product-info">
        <h3>${selectedProduct.name}</h3>
        <p>${selectedProduct.brand}</p>
      </div>
      <button class="remove-product-btn">Remove</button>
    </div>
  `,
    )
    .join("");
}

/* Show saved selected items right away when page loads */
displaySelectedProducts(selectedProducts);

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;
  /* filter() creates a new array containing only products 
     where the category matches what the user selected */
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory,
  );

  displayProducts(filteredProducts);
});

/**
 * Display products inside of selected-products container when user clicks on the toggle button in Products Container
 */
productsContainer.addEventListener("click", async (e) => {
  const addButton = e.target.closest(".add-product-btn");
  if (addButton) {
    const products = await loadProducts();
    const productCard = addButton.closest(".product-card");
    if (!productCard) return;
    const productId = Number(productCard.dataset.id);
    const selectedProduct = products.find(
      (product) => product.id === productId,
    );
    const alreadySelected = selectedProducts.some(
      (p) => p.id === selectedProduct.id,
    );
    if (!alreadySelected) {
      selectedProducts.push(selectedProduct);
      saveSelectedItems(selectedProducts);
    } else {
      return;
    }
    displaySelectedProducts(selectedProducts);
    syncProductStackCards();

    return;
  }

  const productCard = e.target.closest("#productStack.product-card");
  if (!productCard) return;

  const productId = Number(productCard.dataset.id);
  const products = await loadProducts();
  const selectedProduct = products.find((product) => product.id === productId);

  if (selectedProduct) {
    openProductModal(selectedProduct);
  }
});

/**
 * Remove products from selected-products container when user clicks on the toggle button in Selected Products Container
 */
selectedProductsContainer.addEventListener("click", async (e) => {
  if (e.target.classList.contains("remove-product-btn")) {
    const productCard = e.target.closest(".product-card");
    const productId = Number(productCard.dataset.id);
    const unwantedProduct = selectedProducts.find((p) => p.id === productId);
    if (unwantedProduct) {
      selectedProducts = selectedProducts.filter((p) => p.id !== productId);
      saveSelectedItems(selectedProducts);
    }
    displaySelectedProducts(selectedProducts);
    syncProductStackCards();
  }
});

/* Clear all selected products and reset product cards */
removeAllBtn.addEventListener("click", () => {
  selectedProducts = [];
  saveSelectedItems(selectedProducts);
  displaySelectedProducts(selectedProducts);
  syncProductStackCards();
});

/**
 * Handle form submission when user sends a message in the chat interface.
 */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;
  addUserMessage(text);
  appendMessage("user", text);
  userInput.value = "";
  setLoading(true);

  try {
    trimMessages(12);
    const reply = await sendToChatBot();
    setLoading(false);
    appendMessage("assistant", reply);
    addAssistantMessage(reply);
  } catch (error) {
    console.error("Error:", error);
    setLoading(false);
    appendMessage(
      "assistant",
      "Sorry, something went wrong. Please try again later.",
    );
    setStatus("Connection problem.");
  }
});

/**
 * Handles submission to generate the routine based on the products the user has selected. It sends the selected products to the worker and displays the generated routine in the chat window.
 */
generateRoutine.addEventListener("click", async (e) => {
  e.preventDefault();
  if (selectedProducts.length === 0) {
    return "Please select some products to generate a routine.";
  }
  const productSummary = selectedProducts
    .map((p) => `${p.name} (${p.category})`)
    .join("\n");
  const routinePrompt = `Generate a beauty routine using the selected products:\n${productSummary}`;
  addUserMessage(routinePrompt);
  appendMessage("user", routinePrompt);
  setLoading(true);
  try {
    trimMessages(12);
    const routineReply = await sendSelectedProducts(selectedProducts);
    addAssistantMessage(routineReply);
    setLoading(false);
    appendMessage("assistant", routineReply);
  } catch (error) {
    console.error("Error:", error);
    setLoading(false);
    appendMessage(
      "assistant",
      "Sorry, something went wrong. Please try again later.",
    );
    setStatus("Connection problem.");
  }
});
