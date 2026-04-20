/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const selectedProductsContainer = document.getElementById("selectedProductsContainer");
const generateRoutineButton = document.getElementById("generateRoutine");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const userInput = document.getElementById("userInput");
let selectedProducts = [];

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
  `
    )
    .join("");
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
  `
    )
    .join("");
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;
  /* filter() creates a new array containing only products 
     where the category matches what the user selected */
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  displayProducts(filteredProducts);
});



/**
 * Display products inside of selected-products container when user clicks on the toggle button in Products Container
 */
productsContainer.addEventListener("click", async (e) => {
  if (e.target.classList.contains("add-product-btn")) {
    const products = await loadProducts();
    const productCard = e.target.closest(".product-card");
    const productId = Number(productCard.dataset.id);
    const selectedProduct = products.find(
      (product) => product.id === productId
    );
    const alreadySelected = selectedProducts.some((p) => p.id === selectedProduct.id);
    if (!alreadySelected) {
      selectedProducts.push(selectedProduct);
    } else {
      return;
    }
    displaySelectedProducts(selectedProducts);
  }
});

/**
 * Remove products from selected-products container when user clicks on the toggle button in Selected Products Container
 */
selectedProductsContainer.addEventListener("click", async (e) => {
  if (e.target.classList.contains("remove-product-btn")) {
    const products = await loadProducts();
    const productCard = e.target.closest(".product-card");
    const productId = Number(productCard.dataset.id);
    const unwantedProduct = selectedProducts.find((p) => p.id === productId);
    if (unwantedProduct){
      selectedProducts = selectedProducts.filter((p) => p.id !== productId);
    }
    displaySelectedProducts(selectedProducts);
  }
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

  try{
    trimMessages(12);
    const reply = await sendToChatBot();
    appendMessage("assistant", reply);
    addAssistantMessage(reply);
  } catch (error) {
    console.error("Error:", error);
    appendMessage("assistant", "Sorry, something went wrong. Please try again later.");
    setStatus("Connection problem.");
  } finally {
    setLoading(false);
  }
});

/**
 * Handles submission to generate the routine based on the products the user has selected. It sends the selected products to the worker and displays the generated routine in the chat window.
 */
generateRoutine.addEventListener("submit", async (e) => {
  e.preventDefault();
  const routineReply = await sendSelectedProducts();
  if(selectedProducts.isEmpty){
    appendMessage("assistant", "Please select some products to generate a routine.");
    return;
  }
  addUserMessage(`Generate a beauty routine using the selected products: ${JSON.stringify(selectedProducts)}`);
  appendMessage("user", `Generate a beauty routine using the selected products: ${JSON.stringify(selectedProducts)}`);
  appendMessage("assistant", routineReply);
  addAssistantMessage(routineReply);
  setLoading(true);

});
