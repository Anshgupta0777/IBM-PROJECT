/**
 * SONIC AUDIO — Main Application Logic
 */

// Helper utility for DOM selection
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Application State
let rawCart = JSON.parse(localStorage.getItem('sonic_cart_items')) || [];
let cartItems = rawCart.map(item => ({
  ...item,
  quantity: item.quantity && item.quantity > 0 ? item.quantity : 1
}));

let products = [];
let pageMap = {};
let allOrders = [];

// Helper functions for Cart calculations & Persistence
const getCartCount = () => cartItems.reduce((sum, item) => sum + item.quantity, 0);
const getCartTotal = () => cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

const saveCart = () => {
  localStorage.setItem('sonic_cart_items', JSON.stringify(cartItems));
  updateCartButton();
};

const updateCartButton = () => {
  const countEl = $('#cartCount');
  if (countEl) countEl.textContent = getCartCount();
};

const addItemToCart = (product, qtyToAdd = 1) => {
  const existing = cartItems.find(item => item.name === product.name);
  if (existing) {
    existing.quantity += qtyToAdd;
  } else {
    cartItems.push({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: qtyToAdd
    });
  }
  saveCart();
  showToastNotification(`Added ${qtyToAdd}x ${product.name} to cart!`);
};

// Fallback Product Catalog
const fallbackProducts = [
  { name: 'Nova Pro', category: 'Over-Ear', price: 12999, description: 'Immersive sound with smart controls and rich bass.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80' },
  { name: 'Nova Buds', category: 'True Wireless', price: 8999, description: 'Compact earbuds with strong battery and precise audio.', image: 'https://images.unsplash.com/photo-1491927570842-0261e477d937?auto=format&fit=crop&w=700&q=80' },
  { name: 'Pulse Box', category: 'Portable Speaker', price: 19999, description: 'Powerful portable sound for parties and travel.', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=700&q=80' },
  { name: 'Quantum 910', category: 'Over-Ear', price: 16999, description: 'Deep bass and cinematic sound for music and gaming.', image: 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=700&q=80' },
  { name: 'Studio Mini', category: 'Home Speaker', price: 14999, description: 'Balanced sound for lounge, office, and daily listening.', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=80' },
  { name: 'Air Wave', category: 'Neckband', price: 6999, description: 'Lightweight neckband with long playtime and clarity.', image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=700&q=80' },
  { name: 'Echo Lite', category: 'Portable Speaker', price: 7999, description: 'Pocket-friendly speaker with rich tone and easy carry.', image: 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fit=crop&w=700&q=80' },
  { name: 'Bass Drift', category: 'Gaming Headset', price: 10999, description: 'Precision audio for immersive gameplay and voice clarity.', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=700&q=80' },
  { name: 'Sonic X1', category: 'On-Ear', price: 4999, description: 'Slim and stylish for calls, travel, and everyday use.', image: 'https://images.unsplash.com/photo-1556438064-2d7646166914?auto=format&fit=crop&w=700&q=80' },
  { name: 'Riff Max', category: 'Over-Ear', price: 13999, description: 'Comfortable and powerful for long sessions and streaming.', image: 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=700&q=80' },
  { name: 'Sound Nest', category: 'Home Speaker', price: 17999, description: 'Elegant speaker for lounge, desk, and home entertainment.', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=700&q=80' },
  { name: 'Boom Arc', category: 'Portable Speaker', price: 15999, description: 'Powerful output with deep bass and outdoor-ready build.', image: 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fit=crop&w=700&q=80' }
];

// Load Products Catalog
async function loadProductsCatalog() {
  try {
    const res = await fetch('/api/products');
    products = res.ok ? await res.json() : fallbackProducts;
  } catch (err) {
    products = fallbackProducts;
  }

  pageMap = {
    home: products.slice(0, 9),
    new: products.slice(0, 18),
    headphones: products.filter(p => ['Over-Ear', 'True Wireless', 'On-Ear', 'Neckband', 'In-Ear', 'Gaming Headset'].includes(p.category)),
    speakers: products.filter(p => ['Portable Speaker', 'Home Speaker', 'Soundbar'].includes(p.category)),
    about: products.slice(0, 6)
  };

  const currentPage = document.body?.dataset?.page || 'home';
  renderProducts(currentPage);
}

// Render Products Grid
function renderProducts(page) {
  const productGrid = $('#productGrid');
  if (!productGrid) return;

  const selectedProducts = pageMap[page] || products.slice(0, 9);
  productGrid.innerHTML = selectedProducts.map(item => {
    const cartItem = cartItems.find(c => c.name === item.name);
    const qtyInCart = cartItem ? cartItem.quantity : 0;
    return `
      <article class="product-card" data-product-name="${item.name}">
        <img src="${item.image}" alt="${item.name}" class="product-trigger" style="cursor: pointer;" />
        <div class="product-body">
          <p class="product-tag">${item.category}</p>
          <h3 class="product-trigger" style="cursor: pointer;">${item.name}</h3>
          <p>${item.description}</p>
          <div class="product-meta">
            <span>₹${item.price.toLocaleString('en-IN')}</span>
            <button class="buy-btn">
              ${qtyInCart > 0 ? `In Cart (${qtyInCart}) +` : 'Add to Cart'}
            </button>
          </div>
        </div>
      </article>`;
  }).join('');

  $$('.product-trigger').forEach(el => {
    el.addEventListener('click', () => {
      const card = el.closest('.product-card');
      const pName = card?.dataset.productName;
      const product = products.find(p => p.name === pName);
      if (product) openProductDetailModal(product);
    });
  });

  $$('.buy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      const pName = card?.dataset.productName;
      const product = products.find(p => p.name === pName);
      if (!product) return;

      addItemToCart(product, 1);
      renderProducts(document.body?.dataset?.page || 'home');
    });
  });
}

// Product Details Modal
function openProductDetailModal(product) {
  $('.product-modal-overlay')?.remove();
  let selectedQty = 1;

  const overlay = document.createElement('div');
  overlay.className = 'product-modal-overlay';
  overlay.innerHTML = `
    <div class="product-detail-modal">
      <button class="product-modal-close" id="productModalClose">&times;</button>
      <div class="product-modal-grid">
        <img src="${product.image}" alt="${product.name}" class="product-modal-img" />
        <div class="product-modal-info">
          <p class="product-tag">${product.category}</p>
          <h2>${product.name}</h2>
          <div class="price-tag">₹${product.price.toLocaleString('en-IN')}</div>
          <p style="color:var(--muted); margin:0;">${product.description}</p>

          <div class="product-specs-title">Key Specifications</div>
          <ul class="spec-list">
            <li><span>Driver Size</span><strong>40mm Neodymium</strong></li>
            <li><span>Battery</span><strong>Up to 30 Hours</strong></li>
            <li><span>Bluetooth</span><strong>v5.3 Low Latency</strong></li>
            <li><span>Warranty</span><strong>1 Year Brand</strong></li>
          </ul>

          <!-- Quantity Selector -->
          <div style="display:flex; align-items:center; gap:14px; margin-top:10px;">
            <span style="font-weight:600; font-size:0.9rem; color:var(--muted);">Select Quantity:</span>
            <div class="cart-qty-row">
              <button class="qty-btn" id="modalQtyMinus">-</button>
              <span class="qty-val" id="modalQtyVal">1</span>
              <button class="qty-btn" id="modalQtyPlus">+</button>
            </div>
          </div>

          <button class="btn btn-primary modal-add-btn" id="modalAddBtn" style="margin-top: 12px; width: 100%;">Add to Cart (₹${product.price.toLocaleString('en-IN')})</button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('active'), 10);

  const close = () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  };

  overlay.querySelector('#productModalClose').addEventListener('click', close);
  overlay.addEventListener('click', e => e.target === overlay && close());

  const qtyValEl = overlay.querySelector('#modalQtyVal');
  const addBtn = overlay.querySelector('#modalAddBtn');

  overlay.querySelector('#modalQtyMinus').addEventListener('click', () => {
    if (selectedQty > 1) {
      selectedQty--;
      qtyValEl.textContent = selectedQty;
      addBtn.textContent = `Add to Cart (₹${(product.price * selectedQty).toLocaleString('en-IN')})`;
    }
  });

  overlay.querySelector('#modalQtyPlus').addEventListener('click', () => {
    selectedQty++;
    qtyValEl.textContent = selectedQty;
    addBtn.textContent = `Add to Cart (₹${(product.price * selectedQty).toLocaleString('en-IN')})`;
  });

  addBtn.addEventListener('click', () => {
    addItemToCart(product, selectedQty);
    renderProducts(document.body?.dataset?.page || 'home');
    close();
  });
}

// Cart Drawer Overlay with Quantity & Subtotal Controls
function openCart() {
  $('#cartDrawer')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'cartDrawer';
  overlay.className = 'cart-overlay';

  const renderCartDrawer = () => {
    const total = getCartTotal();
    const count = getCartCount();
    overlay.innerHTML = `
      <div class="cart-panel">
        <div class="cart-head">
          <h3>Your Cart (${count})</h3>
          <button class="cart-close">&times;</button>
        </div>
        ${cartItems.length ? `
          <ul class="cart-list">
            ${cartItems.map((item, index) => `
              <li class="cart-item" data-index="${index}">
                <div>
                  <strong>${item.name}</strong>
                  <p>${item.category}</p>
                  <div class="cart-qty-row">
                    <button class="qty-btn btn-minus">-</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="qty-btn btn-plus">+</button>
                  </div>
                </div>
                <div class="cart-item-right">
                  <span class="cart-item-subtotal">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  <button class="cart-item-remove">Remove</button>
                </div>
              </li>`).join('')}
          </ul>
        ` : '<p class="empty-cart">Your cart is empty.</p>'}
        <div class="cart-footer">
          <div class="cart-total">Total: ₹${total.toLocaleString('en-IN')}</div>
          <button class="btn btn-primary checkout-btn" ${!cartItems.length ? 'disabled style="opacity:0.5;"' : ''}>Checkout</button>
        </div>
      </div>`;

    overlay.querySelector('.cart-close').addEventListener('click', () => overlay.remove());

    overlay.querySelectorAll('.btn-plus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.closest('.cart-item').dataset.index, 10);
        cartItems[idx].quantity++;
        saveCart();
        renderCartDrawer();
        renderProducts(document.body?.dataset?.page || 'home');
      });
    });

    overlay.querySelectorAll('.btn-minus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.closest('.cart-item').dataset.index, 10);
        if (cartItems[idx].quantity > 1) {
          cartItems[idx].quantity--;
        } else {
          cartItems.splice(idx, 1);
        }
        saveCart();
        renderCartDrawer();
        renderProducts(document.body?.dataset?.page || 'home');
      });
    });

    overlay.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.closest('.cart-item').dataset.index, 10);
        const name = cartItems[idx].name;
        cartItems.splice(idx, 1);
        saveCart();
        renderCartDrawer();
        renderProducts(document.body?.dataset?.page || 'home');
        showToastNotification(`Removed ${name} from cart.`);
      });
    });

    overlay.querySelector('.checkout-btn')?.addEventListener('click', () => {
      if (!cartItems.length) {
        showToastNotification('Your cart is empty. Add a product first.');
        return;
      }
      const userStr = localStorage.getItem('sonic_logged_in_user');
      if (!userStr) {
        showToastNotification('Please login or sign up to complete your purchase.');
        overlay.remove();
        setTimeout(() => window.location.href = 'login.html', 1200);
        return;
      }
      overlay.remove();
      openCheckout();
    });
  };

  renderCartDrawer();
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => e.target === overlay && overlay.remove());
}

// Simple Checkout Modal
function openCheckout() {
  const total = getCartTotal();
  $('#checkoutOverlay')?.remove();

  const user = JSON.parse(localStorage.getItem('sonic_logged_in_user') || 'null');
  const savedAddress = localStorage.getItem('sonic_saved_address') || '';

  const overlay = document.createElement('div');
  overlay.id = 'checkoutOverlay';
  overlay.className = 'payment-overlay';

  overlay.innerHTML = `
    <div class="payment-modal">
      <div class="payment-header">
        <h3>Confirm Order</h3>
        <div class="total-amount">₹${total.toLocaleString('en-IN')}</div>
        <button class="payment-close-btn" id="checkoutCloseBtn">&times;</button>
      </div>

      <div id="checkoutBody">
        <div style="display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: rgba(255,255,255,0.03); border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; color: #fff; flex-shrink: 0;">
            ${user ? user.username.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <div style="font-weight: 700; font-size: 0.95rem;">${user ? user.username : 'Guest'}</div>
            <div style="font-size: 0.8rem; color: var(--muted);">${user ? user.email : ''}</div>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.02); border-radius: 14px; padding: 14px 16px; border: 1px solid rgba(255,255,255,0.06); margin-top: 14px;">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px;">Order Summary (${getCartCount()} items)</div>
          ${cartItems.map(item => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 0.9rem;">
              <span>${item.name} <strong style="color:var(--accent);">x ${item.quantity}</strong></span>
              <strong style="color: var(--accent-2); font-family: 'Space Grotesk', sans-serif;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</strong>
            </div>`).join('')}
          <div style="display: flex; justify-content: space-between; margin-top: 12px; font-size: 1rem; font-weight: 700;">
            <span>Total</span>
            <span style="color: var(--accent-2); font-family: 'Space Grotesk', sans-serif;">₹${total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div class="payment-input-group" style="margin-top: 14px;">
          <label for="checkoutAddress" style="font-weight: 700;">Delivery Address</label>
          <textarea id="checkoutAddress" class="payment-input" rows="2" placeholder="Flat, Street, City, State, PIN Code" style="resize: none;">${savedAddress}</textarea>
          <div class="input-error" id="error-checkoutAddress">Please enter your delivery address.</div>
          ${savedAddress ? '<div style="font-size:0.75rem; color: var(--muted); margin-top: 2px;">✓ Pre-filled from your saved profile address</div>' : ''}
        </div>

        <button class="payment-pay-btn" id="placeOrderBtn" style="margin-top: 14px;">
          Place Order — ₹${total.toLocaleString('en-IN')}
        </button>
      </div>

      <div class="payment-processing" id="checkoutProcessing">
        <div class="spinner"></div>
        <div>
          <div class="processing-text">Placing your order...</div>
          <div class="processing-status">Please wait a moment.</div>
        </div>
      </div>

      <div class="payment-success" id="checkoutSuccess">
        <div class="checkmark-circle">
          <svg class="checkmark-icon" viewBox="0 0 52 52"><path d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg>
        </div>
        <div>
          <div class="success-title">Order Placed!</div>
          <div class="success-desc" id="checkoutSuccessDesc">Your order has been confirmed.</div>
        </div>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('active'), 10);

  const closeBtn = overlay.querySelector('#checkoutCloseBtn');
  const body = overlay.querySelector('#checkoutBody');
  const processing = overlay.querySelector('#checkoutProcessing');
  const success = overlay.querySelector('#checkoutSuccess');
  const addressInput = overlay.querySelector('#checkoutAddress');

  const closeCheckout = () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  };

  closeBtn.addEventListener('click', closeCheckout);
  overlay.addEventListener('click', e => e.target === overlay && closeCheckout());

  overlay.querySelector('#placeOrderBtn').addEventListener('click', async () => {
    if (!addressInput.value.trim()) {
      overlay.querySelector('#error-checkoutAddress').style.display = 'block';
      return;
    }

    localStorage.setItem('sonic_saved_address', addressInput.value.trim());

    body.style.display = 'none';
    closeBtn.style.display = 'none';
    processing.style.display = 'flex';

    const orderData = {
      customerName: user ? user.username : 'Guest',
      userEmail: user ? user.email : null,
      deliveryAddress: addressInput.value.trim(),
      cartItems: cartItems.map(item => ({ name: item.name, price: item.price, category: item.category, quantity: item.quantity })),
      total,
      paymentMethod: 'cod',
      paymentDetails: {}
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      processing.style.display = 'none';
      success.style.display = 'flex';
      overlay.querySelector('#checkoutSuccessDesc').innerHTML = `
        Thank you, <strong>${user ? user.username : 'Customer'}</strong>!<br>
        Order ID: <strong>#${data.orderId || Date.now()}</strong><br>
        Total: <strong>₹${total.toLocaleString('en-IN')}</strong>`;
    } catch (err) {
      processing.style.display = 'none';
      success.style.display = 'flex';
      overlay.querySelector('#checkoutSuccessDesc').innerHTML = `
        Order confirmed!<br>Total: <strong>₹${total.toLocaleString('en-IN')}</strong>`;
    }

    cartItems = [];
    saveCart();
    setTimeout(closeCheckout, 4000);
  });
}

// Toast Notification Banner
function showToastNotification(message) {
  $('.toast-notification')?.remove();
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `
    <div class="toast-icon">
      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
    <span>${message}</span>`;

  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('active'), 50);
  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// Initialize Dynamic Navigation Links
function initUserAuth() {
  const nav = $('.nav-links');
  if (!nav) return;

  const userStr = localStorage.getItem('sonic_logged_in_user');
  let user = null;
  if (userStr) {
    try { user = JSON.parse(userStr); } catch (e) { localStorage.removeItem('sonic_logged_in_user'); }
  }

  $$('.auth-nav-link').forEach(link => link.remove());

  if (user) {
    const ordersLink = document.createElement('a');
    ordersLink.href = 'orders.html';
    ordersLink.className = 'auth-nav-link';
    ordersLink.textContent = 'Orders';
    if (document.body.dataset.page === 'orders') ordersLink.classList.add('nav-active');

    const profileLink = document.createElement('a');
    profileLink.href = 'profile.html';
    profileLink.className = 'auth-nav-link';
    profileLink.textContent = 'My Profile';
    if (document.body.dataset.page === 'profile') profileLink.classList.add('nav-active');

    const logoutLink = document.createElement('a');
    logoutLink.href = '#';
    logoutLink.className = 'auth-nav-link';
    logoutLink.textContent = `Logout (${user.username})`;
    logoutLink.style.opacity = '0.85';

    nav.appendChild(ordersLink);
    nav.appendChild(profileLink);
    nav.appendChild(logoutLink);

    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('sonic_logged_in_user');
      showToastNotification('Logged out successfully.');
      setTimeout(() => window.location.href = 'index.html', 1000);
    });
  } else {
    const loginLink = document.createElement('a');
    loginLink.href = 'login.html';
    loginLink.className = 'auth-nav-link';
    loginLink.textContent = 'Login';
    if (document.body.dataset.page === 'login') loginLink.classList.add('nav-active');
    nav.appendChild(loginLink);
  }
}

// Login & Signup Page Logic
function initLoginPage() {
  if (document.body.dataset.page !== 'login') return;

  if (localStorage.getItem('sonic_logged_in_user')) {
    window.location.href = 'index.html';
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const oauthError = params.get('error');
  if (oauthError) {
    const banner = $('#oauthErrorBanner');
    if (banner) {
      const messages = {
        'google_not_configured': 'Google login is not yet configured by the site admin. Please use email & password.',
        'google_failed': 'Google sign-in was cancelled or failed. Please try again.'
      };
      banner.textContent = messages[oauthError] || 'Authentication failed.';
      banner.style.display = 'block';
    }
  }

  const tabLogin = $('#tab-login');
  const tabSignup = $('#tab-signup');
  const loginForm = $('#loginForm');
  const signupForm = $('#signupForm');

  tabLogin?.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
    $$('.input-error').forEach(err => err.style.display = 'none');
  });

  tabSignup?.addEventListener('click', () => {
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    signupForm.classList.add('active');
    loginForm.classList.remove('active');
    $$('.input-error').forEach(err => err.style.display = 'none');
  });

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#loginEmail');
    const pass = $('#loginPassword');

    let isValid = true;
    $$('.input-error').forEach(err => err.style.display = 'none');

    if (!/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email.value.trim())) {
      $('#error-loginEmail').style.display = 'block';
      isValid = false;
    }
    if (pass.value.length < 6) {
      $('#error-loginPassword').style.display = 'block';
      isValid = false;
    }

    if (!isValid) return;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value.trim(), password: pass.value })
      });
      const data = await res.json();

      if (!res.ok) {
        showToastNotification(data.error || 'Login failed.');
        return;
      }

      localStorage.setItem('sonic_logged_in_user', JSON.stringify(data.user));
      showToastNotification(`Welcome back, ${data.user.username}!`);
      setTimeout(() => window.location.href = 'index.html', 1200);
    } catch (err) {
      showToastNotification('Failed to connect to authentication server.');
    }
  });

  signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = $('#signupUsername');
    const email = $('#signupEmail');
    const pass = $('#signupPassword');
    const confirmPass = $('#signupConfirmPassword');

    let isValid = true;
    $$('.input-error').forEach(err => err.style.display = 'none');

    if (!/^[a-zA-Z0-9_]{3,15}$/.test(username.value.trim())) {
      $('#error-signupUsername').style.display = 'block';
      isValid = false;
    }
    if (!/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email.value.trim())) {
      $('#error-signupEmail').style.display = 'block';
      isValid = false;
    }
    if (pass.value.length < 6) {
      $('#error-signupPassword').style.display = 'block';
      isValid = false;
    }
    if (pass.value !== confirmPass.value) {
      $('#error-signupConfirmPassword').style.display = 'block';
      isValid = false;
    }

    if (!isValid) return;

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.value.trim(), email: email.value.trim(), password: pass.value })
      });
      const data = await res.json();

      if (!res.ok) {
        showToastNotification(data.error || 'Registration failed.');
        return;
      }

      localStorage.setItem('sonic_logged_in_user', JSON.stringify(data.user));
      showToastNotification('Account created successfully!');
      setTimeout(() => window.location.href = 'index.html', 1200);
    } catch (err) {
      showToastNotification('Failed to connect to authentication server.');
    }
  });

  const handleSocialClick = async (provider) => {
    const username = provider === 'apple' ? 'Apple User' : 'GitHub Dev';
    const email = provider === 'apple' ? 'user@icloud.com' : 'dev@github.com';

    try {
      const res = await fetch('/api/social-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, provider })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('sonic_logged_in_user', JSON.stringify(data.user));
        showToastNotification(`Signed in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}!`);
        setTimeout(() => window.location.href = 'index.html', 1200);
      }
    } catch (e) {
      showToastNotification('Social login failed.');
    }
  };

  $('#btn-apple')?.addEventListener('click', () => handleSocialClick('apple'));
  $('#btn-github')?.addEventListener('click', () => handleSocialClick('github'));
}

// Order History Page Logic
async function initOrdersPage() {
  if (document.body.dataset.page !== 'orders') return;

  const userStr = localStorage.getItem('sonic_logged_in_user');
  if (!userStr) {
    window.location.href = 'login.html';
    return;
  }

  const user = JSON.parse(userStr);
  const spinner = $('#ordersSpinner');
  const listContainer = $('#ordersList');
  const summaryText = $('#ordersSummaryText');
  const searchInput = $('#orderSearchInput');

  try {
    const res = await fetch(`/api/orders?email=${encodeURIComponent(user.email)}`);
    if (!res.ok) throw new Error();

    allOrders = await res.json();
    if (spinner) spinner.style.display = 'none';
    if (listContainer) listContainer.style.display = 'block';

    renderOrders(allOrders);

    searchInput?.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) {
        renderOrders(allOrders);
        return;
      }
      const filtered = allOrders.filter(o => 
        o.orderId.toString().includes(q) || 
        o.cartItems.some(item => item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q))
      );
      renderOrders(filtered);
    });
  } catch (err) {
    if (spinner) spinner.style.display = 'none';
    if (summaryText) summaryText.textContent = 'Error loading order history.';
    if (listContainer) {
      listContainer.style.display = 'block';
      listContainer.innerHTML = `<div class="orders-empty-card"><h3>Could not load order history</h3><p>Ensure the server is running and try refreshing.</p></div>`;
    }
  }
}

function renderOrders(ordersList) {
  const listContainer = $('#ordersList');
  const summaryText = $('#ordersSummaryText');
  if (!listContainer) return;

  if (ordersList.length === 0) {
    if (summaryText) summaryText.textContent = 'Showing 0 orders';
    listContainer.innerHTML = `
      <div class="orders-empty-card">
        <h3>No orders found</h3>
        <p>You haven't placed any orders yet.</p>
        <a class="btn btn-primary" href="headphones.html" style="margin-top: 15px; display: inline-flex;">Shop Products</a>
      </div>`;
    return;
  }

  if (summaryText) summaryText.textContent = `Showing ${ordersList.length} order${ordersList.length === 1 ? '' : 's'}`;

  listContainer.innerHTML = ordersList.map(order => {
    const date = new Date(order.timestamp).toLocaleString('en-IN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'long', year: 'numeric'
    });

    const itemsHtml = order.cartItems.map(item => `
      <div class="order-item-row">
        <div>
          <span class="item-name">${item.name} ${item.quantity && item.quantity > 1 ? `<strong style="color:var(--accent);">x ${item.quantity}</strong>` : ''}</span>
          <span class="item-category">${item.category}</span>
        </div>
        <span class="item-price">₹${(item.price * (item.quantity || 1)).toLocaleString('en-IN')}</span>
      </div>`).join('');

    return `
      <div class="order-card">
        <div class="order-card-header">
          <div>
            <div class="order-id-label">ORDER ID</div>
            <div class="order-id-val">#${order.orderId}</div>
          </div>
          <div>
            <div class="order-id-label">DATE PLACED</div>
            <div style="font-size: 0.92rem; font-weight: 500;">${date}</div>
          </div>
        </div>
        <div class="order-card-items">${itemsHtml}</div>
        ${order.deliveryAddress ? `
        <div class="order-card-address">
          <div class="order-id-label">Delivery Address</div>
          <div style="color: var(--muted); margin-top: 2px;">${order.deliveryAddress}</div>
        </div>` : ''}
        <div class="order-card-footer">
          <span class="order-status-badge">Status: <strong style="color: var(--accent-2);">Delivered</strong></span>
          <div class="order-total-val">Total: <strong style="font-size: 1.2rem; color: var(--accent-2);">₹${order.total.toLocaleString('en-IN')}</strong></div>
        </div>
      </div>`;
  }).join('');
}

// My Profile Page Logic
async function initProfilePage() {
  if (document.body.dataset.page !== 'profile') return;

  const userStr = localStorage.getItem('sonic_logged_in_user');
  if (!userStr) {
    window.location.href = 'login.html';
    return;
  }

  const user = JSON.parse(userStr);

  const avatar = $('#profileAvatar');
  const nameEl = $('#profileName');
  const emailEl = $('#profileEmail');
  const statOrders = $('#statOrders');
  const statSpent = $('#statSpent');

  const addressText = $('#addressText');
  const addressEditBtn = $('#addressEditBtn');
  const addressDisplay = $('#addressDisplay');
  const addressForm = $('#addressForm');
  const addressInput = $('#profileAddress');
  const addressCancelBtn = $('#addressCancelBtn');

  if (avatar) avatar.textContent = user.username.charAt(0).toUpperCase();
  if (nameEl) nameEl.textContent = user.username;
  if (emailEl) emailEl.textContent = user.email;

  const savedAddr = localStorage.getItem('sonic_saved_address');
  if (savedAddr) {
    if (addressText) addressText.textContent = savedAddr;
    if (addressInput) addressInput.value = savedAddr;
  } else {
    if (addressText) addressText.textContent = 'No delivery address saved yet. Click Edit to add your address.';
  }

  addressEditBtn?.addEventListener('click', () => {
    addressDisplay.style.display = 'none';
    addressForm.style.display = 'block';
  });

  addressCancelBtn?.addEventListener('click', () => {
    addressForm.style.display = 'none';
    addressDisplay.style.display = 'block';
  });

  addressForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const newAddr = addressInput.value.trim();
    if (!newAddr) {
      showToastNotification('Address cannot be empty.');
      return;
    }
    localStorage.setItem('sonic_saved_address', newAddr);
    if (addressText) addressText.textContent = newAddr;
    addressForm.style.display = 'none';
    addressDisplay.style.display = 'block';
    showToastNotification('Delivery address saved!');
  });

  $('#profileLogoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('sonic_logged_in_user');
    showToastNotification('Logged out successfully.');
    setTimeout(() => window.location.href = 'index.html', 1000);
  });

  try {
    const res = await fetch(`/api/orders?email=${encodeURIComponent(user.email)}`);
    if (res.ok) {
      const userOrders = await res.json();
      if (statOrders) statOrders.textContent = userOrders.length;
      const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      if (statSpent) statSpent.textContent = `₹${totalSpent.toLocaleString('en-IN')}`;
    }
  } catch (e) {
    if (statOrders) statOrders.textContent = '0';
    if (statSpent) statSpent.textContent = '₹0';
  }
}


// Contact Form Handler
function initContactForm() {
  const contactForm = $('#contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#contactName');
    const email = $('#contactEmail');
    const subject = $('#contactSubject');
    const message = $('#contactMessage');

    let isValid = true;
    $$('.input-error').forEach(err => err.style.display = 'none');

    if (!name?.value.trim()) { $('#error-contactName').style.display = 'block'; isValid = false; }
    if (!/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email?.value.trim() || '')) { $('#error-contactEmail').style.display = 'block'; isValid = false; }
    if (!subject?.value.trim()) { $('#error-contactSubject').style.display = 'block'; isValid = false; }
    if ((message?.value.trim().length || 0) < 10) { $('#error-contactMessage').style.display = 'block'; isValid = false; }

    if (!isValid) return;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.value.trim(),
          email: email.value.trim(),
          subject: subject.value.trim(),
          message: message.value.trim()
        })
      });
      if (res.ok) {
        showToastNotification('Thank you! Your message has been sent successfully.');
        contactForm.reset();
      } else {
        showToastNotification('Failed to send message.');
      }
    } catch (err) {
      showToastNotification('Message sent! We will get back to you soon.');
      contactForm.reset();
    }
  });
}

// Newsletter Subscription Handler
function initNewsletterForm() {
  const form = $('#newsletterForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = $('#newsletterEmail');
    const email = emailInput?.value.trim() || '';

    if (!/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      const err = $('#error-newsletterEmail');
      if (err) err.style.display = 'block';
      return;
    }
    const err = $('#error-newsletterEmail');
    if (err) err.style.display = 'none';

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        showToastNotification('Welcome to SONIC Club! You are now subscribed.');
        emailInput.value = '';
      } else {
        showToastNotification(data.error || 'Already subscribed.');
      }
    } catch (err) {
      showToastNotification('Subscribed successfully!');
      emailInput.value = '';
    }
  });
}

// Global Event Listeners & Bootstrapping
document.addEventListener('DOMContentLoaded', () => {
  updateCartButton();
  $('#cartBtn')?.addEventListener('click', openCart);

  loadProductsCatalog();
  initUserAuth();
  initLoginPage();
  initOrdersPage();
  initProfilePage();
  initContactForm();
  initNewsletterForm();
});

