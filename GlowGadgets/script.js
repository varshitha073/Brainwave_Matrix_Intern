// Element references
const productList = document.getElementById("productList");
const searchInput = document.getElementById("search");
const toggleButton = document.getElementById("theme-toggle");
const productDetailsContainer = document.getElementById("productDetails");
const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

// Save cart to localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cartItems));
}

function clearCart() {
  cartItems.length = 0;
  saveCart();
  displayCart();
  showToast("🛒 Cart has been cleared", "success");
}

// Checkout page logic
document.addEventListener('DOMContentLoaded', () => {
  const orderSummaryDiv = document.getElementById('order-summary');
  const checkoutProduct = JSON.parse(localStorage.getItem('checkoutProduct'));

  if (checkoutProduct && orderSummaryDiv) {
    const salePrice = Math.round(checkoutProduct.price * (1 - checkoutProduct.discountPercent / 100));
    orderSummaryDiv.innerHTML = `
      <div class="product-card">
        <img src="${checkoutProduct.image}" alt="${checkoutProduct.name}" />
        <h3>${checkoutProduct.name}</h3>
        <p class="mrp" style="text-decoration: line-through; color: #999;">MRP: ₹${checkoutProduct.price}</p>
        <p class="sale-price">Now: ₹${salePrice}</p>
       
      </div>
    `;
  }

  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert("🎉 Order placed successfully!");
      localStorage.removeItem('checkoutProduct');
      window.location.href = "index.html";
    });
  }
});

// Display products on products.html
function displayProducts(filter = "") {
  if (!productList) return;
  productList.innerHTML = "";

  products
    .filter((p) => p.name.toLowerCase().includes(filter.toLowerCase()))
    .forEach((product) => {
      const salePrice = Math.round(product.price * (1 - product.discountPercent / 100));

      const item = document.createElement("div");
      item.className = "product-card";
      item.innerHTML = `
        <img src="${product.image}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <p class="mrp">MRP: ₹${product.price}</p>
        <p class="sale-price">Now: ₹${salePrice}</p>
        <span class="discount">${product.discountPercent}% OFF</span>
        <button class="deal-btn">🔥 Limited Time Deal</button>
        <p class="timer">⏳ Deal ends in: <span class="countdown">00:${product.dealDuration}</span></p>
        <button onclick="viewProductDetails(${product.id})">View Details</button>
      `;

      productList.appendChild(item);

      let time = product.dealDuration;
      const countdownElement = item.querySelector(".countdown");
      const dealBtn = item.querySelector(".deal-btn");

      const interval = setInterval(() => {
        time--;
        countdownElement.textContent = `00:${time < 10 ? "0" + time : time}`;
        if (time <= 0) {
          clearInterval(interval);
          countdownElement.textContent = "Deal Expired";
          dealBtn.disabled = true;
          dealBtn.textContent = "Expired";
          dealBtn.style.backgroundColor = "#ccc";
        }
      }, 1000);
    });
}

// View product details
function viewProductDetails(productId) {
  const product = products.find(p => p.id === productId);
  localStorage.setItem("selectedProduct", JSON.stringify(product));
  window.location.href = "product-details.html";
}

// Display product details on product-details.html
function displayProductDetails() {
  if (!productDetailsContainer) return;

  const product = JSON.parse(localStorage.getItem("selectedProduct"));
  if (!product) return;

  const salePrice = Math.round(product.price * (1 - product.discountPercent / 100));

  productDetailsContainer.innerHTML = `
    <div class="product-detail-image">
      <img src="${product.image}" alt="${product.name}">
    </div>
    <div class="product-detail-info">
      <h2>${product.name}</h2>
      <div class="price-block">
        <span class="original-price"><s>MRP: ₹${product.price}</s></span><br>
        <span class="sale-price">Now: ₹${salePrice}</span>
        <span class="discount"> (${product.discountPercent}% OFF)</span>
      </div>
      <p class="product-meta"><strong>Rating:</strong> ⭐⭐⭐⭐☆ (4.0/5)</p>
      <p class="product-meta"><strong>Warranty:</strong> 1 Year Brand Warranty</p>
      <p class="product-meta"><strong>Launch Date:</strong> Jan 2025</p>
      <p class="product-meta"><strong>Description:</strong> Experience next-gen tech with top-notch quality and performance built for modern life.</p>
      <div class="action-buttons">
        <button onclick="addToCart(${product.id})">Add to Cart</button>
        <button onclick="checkoutNow(${product.id})">Buy Now</button>
      </div>
    </div>
  `;
}

// Buy Now
function checkoutNow(id) {
  const product = products.find(p => p.id === id) || JSON.parse(localStorage.getItem("selectedProduct"));
  if (!product) return;
  localStorage.setItem("checkoutProduct", JSON.stringify(product));
  window.location.href = "checkout.html";
}

// Add to cart
function addToCart(id) {
  const product = products.find(p => p.id === id) || JSON.parse(localStorage.getItem("selectedProduct"));
  if (!product) return;

  const existing = cartItems.find((item) => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cartItems.push({ ...product, qty: 1 });
  }
  saveCart();
  showToast(`✅ ${product.name} added to cart`, "success");
}

// Display cart items on cart.html
function displayCart() {
  const cartDiv = document.getElementById("cartItems");
  const totalDiv = document.getElementById("totalPrice");
  if (!cartDiv || !totalDiv) return;

  cartDiv.innerHTML = "";
  let total = 0;

  cartItems.forEach((item, index) => {
    const itemTotal = Math.round(item.price * item.qty);
    total += itemTotal;

    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-img" />
      <div class="cart-info">
        <h3>${item.name}</h3>
        <p>Price: ₹${item.price}</p>
        <p>Quantity: 
          <button onclick="updateQty(${index}, -1)">-</button> 
          ${item.qty} 
          <button onclick="updateQty(${index}, 1)">+</button>
        </p>
        <p>Total: ₹${itemTotal}</p>
        <button onclick="removeItem(${index})">Remove</button>
      </div>
    `;
    cartDiv.appendChild(div);
  });

  totalDiv.textContent = `${total}`;
}

// Update quantity
function updateQty(index, delta) {
  cartItems[index].qty += delta;
  if (cartItems[index].qty <= 0) {
    cartItems.splice(index, 1);
  }
  saveCart();
  displayCart();
}

// Remove item
function removeItem(index) {
  const removed = cartItems[index];
  cartItems.splice(index, 1);
  saveCart();
  displayCart();
  showToast(`❌ ${removed.name} removed from cart`, "error");
}

// Toast Notification
function showToast(message, type = "success") {
  const toastContainer = document.getElementById("toast-container");
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 500);
  }, 2500);
}

// Theme toggle
if (toggleButton) {
  const currentTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", currentTheme);
  toggleButton.textContent = currentTheme === "dark" ? "☀️" : "🌙";

  toggleButton.addEventListener("click", () => {
    const theme = document.documentElement.getAttribute("data-theme");
    const newTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    toggleButton.textContent = newTheme === "dark" ? "☀️" : "🌙";
  });
}

// INIT for each page
if (productList) displayProducts(); // products.html
if (searchInput)
  searchInput.addEventListener("input", () =>
    displayProducts(searchInput.value)
  );
if (productDetailsContainer) displayProductDetails(); // product-details.html
if (document.getElementById("cartItems")) displayCart(); // cart.html
