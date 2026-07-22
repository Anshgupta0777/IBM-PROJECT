const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

let rawCart = JSON.parse(localStorage.getItem('sonic_cart_items')) || [];
let cartItems = rawCart.map(item => ({
  ...item,
  quantity: item.quantity && item.quantity > 0 ? item.quantity : 1
}));

let products = [];
let pageMap = {};
let allOrders = [];

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

const fallbackProducts = [
  { id: 1, name: 'Airdopes 141 ANC', category: 'True Wireless', price: 1299, originalPrice: 4490, discount: '71% OFF', tag: 'NEW LAUNCH', description: '42 Hours playback, Dual Mic ENx Tech, Beast Mode low latency.', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=700&q=80' },
  { id: 2, name: 'Wave Call 2 Smartwatch', category: 'Smart Watch', price: 1499, originalPrice: 6990, discount: '78% OFF', tag: 'JUST ARRIVED', description: '1.83" HD Display, Bluetooth Calling, 700+ Active Modes.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80' },
  { id: 3, name: 'Rockerz 450 Pro', category: 'Over-Ear', price: 1999, originalPrice: 5990, discount: '66% OFF', tag: 'EXCLUSIVE', description: '70 Hours non-stop playtime, 40mm Drivers, Adaptive fit.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80' },
  { id: 4, name: 'Pulse Box 30W RGB', category: 'Portable Speaker', price: 2999, originalPrice: 7990, discount: '62% OFF', tag: 'FRESH ARRIVAL', description: 'Dynamic RGB LEDs, IPX7 Waterproof, TWS Pairing mode.', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=700&q=80' },
  { id: 5, name: 'Rockerz 255 Pro+', category: 'Neckband', price: 1199, originalPrice: 3990, discount: '70% OFF', tag: '60H PLAYTIME', description: 'ASAP Fast Charge, Magnetic Earbuds, Dual Pairing.', image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=700&q=80' },
  { id: 6, name: 'Storm Call Pro GPS', category: 'Smart Watch', price: 2199, originalPrice: 8990, discount: '75% OFF', tag: 'NEW EDITION', description: 'Built-in GPS, Heart Rate & SpO2 Monitor, Metal Body.', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=700&q=80' },
  { id: 7, name: 'Nova Buds ANC Pro', category: 'True Wireless', price: 2499, originalPrice: 7990, discount: '68% OFF', tag: 'NEW LAUNCH', description: 'Active Noise Cancellation, Spatial Audio, 50H Battery.', image: 'https://images.unsplash.com/photo-1491927570842-0261e477d937?auto=format&fit=crop&w=700&q=80' },
  { id: 8, name: 'Quantum 910 Studio', category: 'Over-Ear', price: 16999, originalPrice: 29999, discount: '43% OFF', tag: 'FLAGSHIP', description: 'Hi-Res Certified Sound, Active Noise Cancelling, Plush Foam.', image: 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=700&q=80' },
  { id: 9, name: 'Airdopes Supreme', category: 'True Wireless', price: 1699, originalPrice: 5990, discount: '71% OFF', tag: 'JUST ARRIVED', description: 'Ultra-low 65ms gaming mode, In-ear detection, Fast Charge.', image: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=700&q=80' },
  { id: 10, name: 'Soundbar 1800W Surround', category: 'Home Audio', price: 8999, originalPrice: 19990, discount: '55% OFF', tag: 'NEW RELEASE', description: 'Dolby Audio, Wireless Subwoofer, HDMI ARC & Optical.', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=80' },
  { id: 11, name: 'Bass Drift 7.1 Gaming', category: 'Gaming Headset', price: 3499, originalPrice: 8990, discount: '61% OFF', tag: 'GAMING SERIES', description: 'Detachable Boom Mic, RGB Breathing Lights, Memory Foam.', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=700&q=80' },
  { id: 12, name: 'Lunar Connect AMOLED', category: 'Smart Watch', price: 3299, originalPrice: 10990, discount: '70% OFF', tag: 'NEW LAUNCH', description: 'Always-On 1.43" Display, Stainless Steel Bezel, BT Call.', image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=700&q=80' },
  { id: 13, name: 'Air Wave Flex Neckband', category: 'Neckband', price: 899, originalPrice: 2990, discount: '70% OFF', tag: 'NEW RELEASE', description: 'Lightweight ergonomic neckband, 30H battery, Fast USB-C.', image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=700&q=80' },
  { id: 14, name: 'Echo Lite Outdoor', category: 'Portable Speaker', price: 1799, originalPrice: 4990, discount: '64% OFF', tag: 'JUST ARRIVED', description: 'Pocket-friendly rugged speaker, 12H playback, Carabiner clip.', image: 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fit=crop&w=700&q=80' },
  { id: 15, name: 'Studio Mini Soundstation', category: 'Home Speaker', price: 4999, originalPrice: 11990, discount: '58% OFF', tag: 'NEW ARRIVAL', description: 'Wooden enclosure, Bluetooth 5.3, AUX, USB playback.', image: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=700&q=80' },
  { id: 16, name: 'Sonic X1 Wireless', category: 'On-Ear', price: 1899, originalPrice: 4990, discount: '62% OFF', tag: 'NEW LAUNCH', description: 'Foldable design, Soft cushion earcups, 25H battery.', image: 'https://images.unsplash.com/photo-1556438064-2d7646166914?auto=format&fit=crop&w=700&q=80' },
  { id: 17, name: 'Boom Arc Party 60W', category: 'Portable Speaker', price: 6499, originalPrice: 14990, discount: '56% OFF', tag: 'PARTY BASS', description: 'BassBoost technology, Karaoke Mic support, Shoulder strap.', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=700&q=80' },
  { id: 18, name: 'PowerVault 20000mAh', category: 'Mobile Accessories', price: 1699, originalPrice: 3990, discount: '57% OFF', tag: 'NEW LAUNCH', description: 'Triple output ports, Power Delivery 3.0, LED indicators.', image: 'https://images.unsplash.com/photo-1609592424074-95cbbf693630?auto=format&fit=crop&w=700&q=80' }
];

// Product Catalog Helpers & Modular Rendering
function filterProductsByQuery(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return products;
  return products.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.category.toLowerCase().includes(q) ||
    (p.description && p.description.toLowerCase().includes(q))
  );
}

function createProductCardHTML(item) {
  const cartItem = cartItems.find(c => c.name === item.name);
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const origPrice = item.originalPrice || Math.round(item.price * 2.8);
  const disc = item.discount || '60% OFF';
  return `
    <article class="product-card" data-product-name="${item.name}">
      ${item.tag ? `<div class="product-card-badge">${item.tag}</div>` : ''}
      <img src="${item.image}" alt="${item.name}" class="product-trigger" style="cursor: pointer;" />
      <div class="product-body">
        <p class="product-tag">${item.category}</p>
        <h3 class="product-trigger" style="cursor: pointer;">${item.name}</h3>
        <p class="product-desc">${item.description}</p>
        <div class="product-meta">
          <div class="price-container">
            <span class="price-val">₹${item.price.toLocaleString('en-IN')}</span>
            <span class="price-mrp">₹${origPrice.toLocaleString('en-IN')}</span>
            <span class="price-disc">${disc}</span>
          </div>
          <button class="buy-btn">
            ${qtyInCart > 0 ? `In Cart (${qtyInCart}) +` : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>`;
}

function bindProductCardEvents(container) {
  $$('.product-trigger', container).forEach(el => {
    el.addEventListener('click', () => {
      const card = el.closest('.product-card');
      const product = products.find(p => p.name === card?.dataset.productName);
      if (product) openProductDetailModal(product);
    });
  });

  $$('.buy-btn', container).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.product-card');
      const product = products.find(p => p.name === card?.dataset.productName);
      if (!product) return;
      addItemToCart(product, 1);
      renderProducts(document.body?.dataset?.page || 'home');
      renderSlidingWindow();
    });
  });
}

function renderProductList(items, container, query = '') {
  if (!container) return;
  if (!items || items.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; color: var(--muted);">
        <h3 style="font-size: 1.3rem; margin-bottom: 8px;">No products found matching "${query}"</h3>
        <p>Try searching for "Smartwatches", "Earbuds", "Headphones", or "Speakers"</p>
      </div>`;
    return;
  }
  container.innerHTML = items.map(createProductCardHTML).join('');
  bindProductCardEvents(container);
}

// Load Products Catalog
async function loadProductsCatalog() {
  try {
    const res = await fetch('/api/products');
    products = res.ok ? await res.json() : fallbackProducts;
  } catch (err) {
    products = fallbackProducts;
  }

  pageMap = {
    home: products,
    new: products.slice(0, 18),
    headphones: products.filter(p => ['Over-Ear', 'True Wireless', 'On-Ear', 'Neckband', 'In-Ear', 'Gaming Headset'].includes(p.category)),
    speakers: products.filter(p => ['Portable Speaker', 'Home Speaker', 'Soundbar', 'Home Audio'].includes(p.category)),
    about: products.slice(0, 6)
  };

  const currentPage = document.body?.dataset?.page || 'home';
  renderProducts(currentPage);
  renderSlidingWindow();

  // Check URL parameters for search query
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search') || urlParams.get('q');
  if (searchQuery) {
    const searchInput = $('#headerSearchInput');
    if (searchInput) searchInput.value = searchQuery;
    const productGrid = $('#productGrid');
    if (productGrid) {
      renderProductList(filterProductsByQuery(searchQuery), productGrid, searchQuery);
      setTimeout(() => {
        productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }
}

// Render 10-12 Product Sliding Window Carousel
function renderSlidingWindow() {
  const sliderTrack = $('#sliderTrack');
  if (!sliderTrack) return;

  const slidingProducts = products.slice(0, 12);

  sliderTrack.innerHTML = slidingProducts.map(item => {
    const cartItem = cartItems.find(c => c.name === item.name);
    const qtyInCart = cartItem ? cartItem.quantity : 0;
    const origPrice = item.originalPrice || Math.round(item.price * 2.8);
    const disc = item.discount || '65% OFF';

    return `
      <div class="slider-card" data-product-name="${item.name}">
        ${item.tag ? `<div class="slider-badge">${item.tag}</div>` : ''}
        <div class="slider-img-wrap product-trigger">
          <img src="${item.image}" alt="${item.name}" loading="lazy" />
        </div>
        <div class="slider-card-body">
          <p class="slider-category">${item.category}</p>
          <h4 class="slider-title product-trigger">${item.name}</h4>
          <div class="slider-pricing">
            <span class="price">₹${item.price.toLocaleString('en-IN')}</span>
            <span class="mrp">₹${origPrice.toLocaleString('en-IN')}</span>
            <span class="disc">${disc}</span>
          </div>
          <button class="slider-add-btn buy-btn">
            ${qtyInCart > 0 ? `In Cart (${qtyInCart})` : 'Add to Cart'}
          </button>
        </div>
      </div>`;
  }).join('');

  // Attach slider navigation button handlers
  const prevBtn = $('#sliderPrevBtn');
  const nextBtn = $('#sliderNextBtn');

  if (prevBtn && nextBtn) {
    prevBtn.onclick = () => {
      sliderTrack.scrollBy({ left: -320, behavior: 'smooth' });
    };
    nextBtn.onclick = () => {
      sliderTrack.scrollBy({ left: 320, behavior: 'smooth' });
    };
  }

  // Re-bind triggers for detail modal and add-to-cart
  $$('#sliderTrack .product-trigger').forEach(el => {
    el.addEventListener('click', () => {
      const card = el.closest('.slider-card');
      const pName = card?.dataset.productName;
      const product = products.find(p => p.name === pName);
      if (product) openProductDetailModal(product);
    });
  });

  $$('#sliderTrack .buy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.slider-card');
      const pName = card?.dataset.productName;
      const product = products.find(p => p.name === pName);
      if (!product) return;
      addItemToCart(product, 1);
      renderProducts(document.body?.dataset?.page || 'home');
      renderSlidingWindow();
    });
  });
}

// Render Products Grid
function renderProducts(page) {
  const productGrid = $('#productGrid');
  const selectedProducts = pageMap[page] || products.slice(0, 12);
  renderProductList(selectedProducts, productGrid);
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

// Header Search Handler & Live Suggestions
function initHeaderSearch() {
  const searchInput = $('#headerSearchInput');
  if (!searchInput) return;

  const searchWrap = searchInput.closest('.search-box-wrap');
  if (!searchWrap) return;

  // Create live dropdown container if not present
  let resultsContainer = searchWrap.querySelector('.header-search-results');
  if (!resultsContainer) {
    resultsContainer = document.createElement('div');
    resultsContainer.className = 'header-search-results';
    resultsContainer.id = 'headerSearchResults';
    searchWrap.appendChild(resultsContainer);
  }

  const renderLiveDropdown = (query) => {
    if (!query) {
      resultsContainer.classList.remove('active');
      resultsContainer.innerHTML = '';
      return;
    }

    const filtered = filterProductsByQuery(query);

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `
        <div class="search-no-results">
          <p style="margin: 0; font-weight: 600; color: #334155;">No products found for "${query}"</p>
          <p style="margin: 6px 0 0 0; font-size: 0.8rem; color: #94a3b8;">Try "Smartwatches", "Earbuds", "Headphones", or "Speakers"</p>
        </div>`;
    } else {
      const topMatches = filtered.slice(0, 5);
      const itemsHtml = topMatches.map(item => `
        <div class="search-result-item" data-product-name="${item.name.replace(/"/g, '&quot;')}">
          <img src="${item.image}" alt="${item.name}" class="search-result-img" />
          <div class="search-result-info">
            <div class="search-result-title">${item.name}</div>
            <div class="search-result-category">${item.category}</div>
          </div>
          <div class="search-result-price">₹${item.price.toLocaleString('en-IN')}</div>
        </div>
      `).join('');

      const footerHtml = `
        <div class="search-result-footer" id="searchSeeAllBtn">
          View all ${filtered.length} result${filtered.length > 1 ? 's' : ''} →
        </div>`;

      resultsContainer.innerHTML = itemsHtml + footerHtml;

      // Attach click events on dropdown items
      $$('.search-result-item', resultsContainer).forEach(itemEl => {
        itemEl.addEventListener('click', (e) => {
          e.stopPropagation();
          const pName = itemEl.dataset.productName;
          const product = products.find(p => p.name === pName);
          resultsContainer.classList.remove('active');
          if (product) {
            openProductDetailModal(product);
          }
        });
      });

      // Click on footer "View all results"
      const seeAllBtn = $('#searchSeeAllBtn', resultsContainer);
      if (seeAllBtn) {
        seeAllBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          resultsContainer.classList.remove('active');
          executeSearchAction(query, true);
        });
      }
    }

    resultsContainer.classList.add('active');
  };

  const executeSearchAction = (query, shouldScroll = false) => {
    const productGrid = $('#productGrid');
    if (productGrid) {
      if (!query) {
        renderProducts(document.body?.dataset?.page || 'home');
        return;
      }

      renderProductList(filterProductsByQuery(query), productGrid, query);

      if (shouldScroll) {
        productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.location.href = `index.html?search=${encodeURIComponent(query)}`;
    }
  };

  // Event Listeners
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    renderLiveDropdown(query);
    executeSearchAction(query, false);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = searchInput.value.trim().toLowerCase();
      resultsContainer.classList.remove('active');
      executeSearchAction(query, true);
    } else if (e.key === 'Escape') {
      resultsContainer.classList.remove('active');
    }
  });

  searchInput.addEventListener('focus', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
      renderLiveDropdown(query);
    }
  });

  // Hide dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!searchWrap.contains(e.target)) {
      resultsContainer.classList.remove('active');
    }
  });
}

// Back to Top Button
function initBackToTop() {
  const backBtn = $('#backToTopBtn');
  if (!backBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backBtn.classList.add('visible');
    } else {
      backBtn.classList.remove('visible');
    }
  });

  backBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
  initHeaderSearch();
  initBackToTop();
});

