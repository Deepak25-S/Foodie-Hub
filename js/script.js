// ==========================================================================
// FOODIE HUB - JAVASCRIPT APPLICATION LOGIC
// ==========================================================================

const foodDatabase = [
  { id: 1, name: "Margherita Supreme Pizza", category: "pizza", price: 12.99, img: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=400&q=80", desc: "Fresh basil, mozzarella, tomatoes, and extra virgin olive oil." },
  { id: 2, name: "Double Smoked Bacon Burger", category: "burger", price: 9.99, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80", desc: "100% Angus beef patty, crispy bacon, cheddar, and secret sauce." },
  { id: 3, name: "Hyderabadi Chicken Biryani", category: "biryani", price: 14.49, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80", desc: "Slow-cooked aromatic basmati rice with marinated chicken & spices." },
  { id: 4, name: "Iced Mango Passion Smoothie", category: "drinks", price: 4.99, img: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=400&q=80", desc: "Fresh tropical mango blended with passionfruit puree." },
  { id: 5, name: "Pepperoni Feast Pizza", category: "pizza", price: 15.99, img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=400&q=80", desc: "Double pepperoni with extra mozzarella cheese blend." },
  { id: 6, name: "Crispy Zinger Burger", category: "burger", price: 8.49, img: "https://images.unsplash.com/photo-1513185158878-8d8c2a2a3da3?auto=format&fit=crop&w=400&q=80", desc: "Crispy fried chicken breast fillet topped with fresh lettuce and mayo." }
];

let cart = [];
let currentRotation = 0;
let lastWonPrize = null;
let activeDiscountPercent = 0; // Tracks percentage discount (e.g., 10, 15, 5)

window.addEventListener("DOMContentLoaded", () => {
  renderMenu("all");
  loadCartFromStorage();
  updateCartUI();
});

// Render food cards
function renderMenu(category) {
  const grid = document.getElementById("menuGrid");
  if (!grid) return;

  const filtered = category === "all" 
    ? foodDatabase 
    : foodDatabase.filter(item => item.category === category);

  grid.innerHTML = filtered.map(item => `
    <div class="food-card">
      <img src="${item.img}" alt="${item.name}" class="food-img">
      <div class="food-info">
        <h4>${item.name}</h4>
        <p>${item.desc}</p>
        <div class="food-footer">
          <span class="price">$${item.price.toFixed(2)}</span>
          <button class="add-btn" onclick="addToCart(${item.id})">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

// Category filter tabs
function filterMenu(category, event) {
  document.querySelectorAll(".cat-btn").forEach(btn => btn.classList.remove("active"));
  if (event && event.target) {
    event.target.classList.add("active");
  }
  renderMenu(category);
}

// Cart functionality
function addToCart(productId) {
  const item = foodDatabase.find(p => p.id === productId);
  if (!item) return;

  const existing = cart.find(c => c.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }

  saveCartAndSync();
  toggleCartDrawer();
}

function updateQuantity(productId, delta) {
  const index = cart.findIndex(c => c.id === productId);
  if (index !== -1) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
  }
  saveCartAndSync();
}

function saveCartAndSync() {
  localStorage.setItem("userCart", JSON.stringify(cart));
  updateCartUI();
}

function loadCartFromStorage() {
  const saved = localStorage.getItem("userCart");
  if (saved) {
    try { cart = JSON.parse(saved); } catch (e) { cart = []; }
  }
}

function updateCartUI() {
  const cartCount = document.getElementById("cartCount");
  const cartItemsList = document.getElementById("cartItemsList");
  const cartSubtotal = document.getElementById("cartSubtotal");
  const cartTotal = document.getElementById("cartTotal");

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate discount
  const discountAmount = subtotal * (activeDiscountPercent / 100);
  const finalTotal = subtotal - discountAmount;

  if (cartCount) cartCount.textContent = totalItems;

  if (cartItemsList) {
    if (cart.length === 0) {
      cartItemsList.innerHTML = `<p style="text-align: center; color: #888; margin-top: 40px;">Your cart is empty.</p>`;
    } else {
      let itemsHTML = cart.map(item => `
        <div class="cart-item-row">
          <div>
            <h5 style="color: #fff; font-size: 14px;">${item.name}</h5>
            <span style="color: #ff9f1c; font-size: 13px;">$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button onclick="updateQuantity(${item.id}, -1)" style="padding: 2px 8px; cursor: pointer;">-</button>
            <span style="font-size: 14px;">${item.quantity}</span>
            <button onclick="updateQuantity(${item.id}, 1)" style="padding: 2px 8px; cursor: pointer;">+</button>
          </div>
        </div>
      `).join("");

      // Display discount line if active
      if (activeDiscountPercent > 0) {
        itemsHTML += `
          <div class="cart-item-row" style="border-top: 1px dashed #ff9f1c; margin-top: 10px;">
            <span style="color: #2a9d8f; font-weight: bold; font-size: 13px;">🎯 ${activeDiscountPercent}% Wheel Discount</span>
            <span style="color: #2a9d8f; font-weight: bold; font-size: 13px;">-$${discountAmount.toFixed(2)}</span>
          </div>
        `;
      }

      cartItemsList.innerHTML = itemsHTML;
    }
  }

  if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  if (cartTotal) cartTotal.textContent = `$${finalTotal.toFixed(2)}`;
}

function toggleCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("drawerOverlay");
  if (drawer && overlay) {
    drawer.classList.toggle("open");
    overlay.classList.toggle("show");
  }
}

// Spin & Win Wheel Game
function spinWheel() {
  const result = document.getElementById("gameResult");
  const wheel = document.getElementById("wheel");
  if (!result || !wheel) return;

  const prizes = [
    { text: "🎉 You won 10% OFF!", discount: 10, stopAngle: 315 },
    { text: "🥳 You won a FREE Dessert!", discount: 100, freeItem: true, stopAngle: 225 },
    { text: "🥳 You won 15% Flat Discount!", discount: 15, stopAngle: 135 },
    { text: "🔥 You won 5% Instant Cashback!", discount: 5, stopAngle: 45 }
  ];

  const selectedPrize = prizes[Math.floor(Math.random() * prizes.length)];
  lastWonPrize = selectedPrize;

  const currentMod = currentRotation % 360;
  let diff = selectedPrize.stopAngle - currentMod;
  if (diff <= 0) diff += 360;

  currentRotation += 1800 + diff;

  wheel.style.transition = "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)";
  wheel.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(() => {
    result.textContent = selectedPrize.text;
    showCartModal(selectedPrize.text);
  }, 4000);
}

function showCartModal(prizeText) {
  const modal = document.getElementById("cartModal");
  const modalMsg = document.getElementById("modalMessage");
  if (modal && modalMsg) {
    modalMsg.textContent = prizeText;
    modal.style.display = "flex";
  }
}

function closeModal() {
  const modal = document.getElementById("cartModal");
  if (modal) modal.style.display = "none";
}

function addRewardToCart() {
  if (lastWonPrize) {
    if (lastWonPrize.freeItem) {
      // Add a free item directly to the cart
      cart.push({ id: Date.now(), name: "🎁 Free Surprise Dessert", price: 0.00, quantity: 1 });
    } else {
      // Set the percentage discount
      activeDiscountPercent = lastWonPrize.discount;
    }
    
    saveCartAndSync();
    alert("Reward applied to your cart total!");
    closeModal();
    toggleCartDrawer();
  }
}

// Checkout Screen Logic
function processCheckout() {
  if (cart.length === 0) {
    alert("Your cart is empty! Add items from the menu first.");
    return;
  }
  toggleCartDrawer();
  const modal = document.getElementById("checkoutModal");
  if (modal) modal.classList.add("show");
}

function closeCheckoutModal() {
  const modal = document.getElementById("checkoutModal");
  if (modal) modal.classList.remove("show");
}

function handleFinalOrder(event) {
  event.preventDefault();

  const name = document.getElementById("userName").value;
  const address = document.getElementById("userAddress").value;
  const payment = document.getElementById("paymentMethod").value;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = subtotal * (activeDiscountPercent / 100);
  const finalTotal = subtotal - discountAmount;

  alert(`🎉 Order Placed Successfully!\n\nThank you, ${name}!\nDelivering to: ${address}\nPayment Option: ${payment}\nFinal Total: $${finalTotal.toFixed(2)} (Discount applied: $${discountAmount.toFixed(2)})`);

  cart = [];
  activeDiscountPercent = 0;
  saveCartAndSync();
  document.getElementById("checkoutForm").reset();
  closeCheckoutModal();
}