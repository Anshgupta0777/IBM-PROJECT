// SONIC AUDIO - E-Commerce Frontend Scripting

const cartBtn = document.getElementById('cartBtn');
const productGrid = document.getElementById('productGrid');

let cartItems = JSON.parse(localStorage.getItem('sonic_cart_items')) || [];
let cartCount = cartItems.length;
let products = [];
let pageMap = {};

// Fallback product database if server is offline
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

async function loadProductsCatalog() {
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      products = await res.json();
    } else {
      products = fallbackProducts;
    }
  } catch (err) {
    console.warn('Offline mode. Using fallback products.');
    products = fallbackProducts;
  }
  
  pageMap = {
    home: products.slice(0, 9),
    new: products.slice(0, 18),
    headphones: products.filter(item => ['Over-Ear', 'True Wireless', 'On-Ear', 'Neckband', 'In-Ear', 'Gaming Headset'].includes(item.category)),
    speakers: products.filter(item => ['Portable Speaker', 'Home Speaker', 'Soundbar'].includes(item.category)),
    about: products.slice(0, 6)
  };
  
  const currentPage = document.body?.dataset?.page || 'home';
  renderProducts(currentPage);
}

const updateCartButton = () => cartBtn && (cartBtn.textContent = `Cart (${cartCount})`);

function openCart() {
  document.getElementById('cartDrawer')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'cartDrawer';
  overlay.className = 'cart-overlay';
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  overlay.innerHTML = `
    <div class="cart-panel">
      <div class="cart-head">
        <h3>Your Cart</h3>
        <button class="cart-close">×</button>
      </div>
      ${cartItems.length ? `
        <ul class="cart-list">
          ${cartItems.map(item => `
            <li class="cart-item">
              <div>
                <strong>${item.name}</strong>
                <p>${item.category}</p>
              </div>
              <span>₹${item.price.toLocaleString('en-IN')}</span>
            </li>`).join('')}
        </ul>
      ` : '<p class="empty-cart">Your cart is empty.</p>'}
      <div class="cart-footer">
        <div class="cart-total">Total: ₹${total.toLocaleString('en-IN')}</div>
        <button class="btn btn-primary checkout-btn">Checkout</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  overlay.querySelector('.checkout-btn')?.addEventListener('click', () => {
    if (!cartItems.length) {
      overlay.querySelector('.cart-footer').insertAdjacentHTML('beforebegin', '<p class="empty-cart">Add a product before checkout.</p>');
      return;
    }
    overlay.remove();
    openPaymentGateway(total);
  });

  overlay.querySelector('.cart-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => e.target === overlay && overlay.remove());
}

function openPaymentGateway(total) {
  const overlay = document.createElement('div');
  overlay.id = 'paymentOverlay';
  overlay.className = 'payment-overlay';

  overlay.innerHTML = `
    <div class="payment-modal">
      <div class="payment-header">
        <h3>Checkout Payment</h3>
        <div class="total-amount">₹${total.toLocaleString('en-IN')}</div>
        <button class="payment-close-btn" id="paymentCloseBtn">&times;</button>
      </div>
      
      <div class="payment-body-container" id="paymentBodyContainer">
        <div class="payment-tabs">
          <button class="payment-tab active" data-tab="card">Card</button>
          <button class="payment-tab" data-tab="upi">UPI</button>
          <button class="payment-tab" data-tab="netbanking">Net Banking</button>
          <button class="payment-tab" data-tab="cod">Cash on Delivery</button>
        </div>
        
        <div class="payment-panels">
          <div class="payment-panel active" id="panel-card">
            <div class="card-preview-container">
              <div class="credit-card-view" id="creditCardView">
                <div class="card-view-top">
                  <div class="card-chip"></div>
                  <div class="card-type-logo" id="cardBrand">CARD</div>
                </div>
                <div class="card-view-number" id="cardNumView">•••• •••• •••• ••••</div>
                <div class="card-view-bottom">
                  <div>
                    <div class="card-view-label">Card Holder</div>
                    <div class="card-view-val" id="cardNameView">YOUR NAME</div>
                  </div>
                  <div>
                    <div class="card-view-label">Expires</div>
                    <div class="card-view-val" id="cardExpiryView">MM/YY</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="payment-input-group">
              <label for="cardNum">Card Number</label>
              <input type="text" id="cardNum" class="payment-input" placeholder="1234 5678 1234 5678" maxlength="19" autocomplete="off" />
              <div class="input-error" id="error-cardNum">Invalid card number. Must be 16 digits.</div>
            </div>
            <div class="payment-input-group">
              <label for="cardName">Cardholder Name</label>
              <input type="text" id="cardName" class="payment-input" placeholder="e.g. John Doe" autocomplete="off" />
              <div class="input-error" id="error-cardName">Cardholder name is required.</div>
            </div>
            <div class="form-row">
              <div class="payment-input-group">
                <label for="cardExpiry">Expiry Date</label>
                <input type="text" id="cardExpiry" class="payment-input" placeholder="MM/YY" maxlength="5" autocomplete="off" />
                <div class="input-error" id="error-cardExpiry">Invalid expiry (MM/YY).</div>
              </div>
              <div class="payment-input-group">
                <label for="cardCvv">CVV</label>
                <input type="password" id="cardCvv" class="payment-input" placeholder="•••" maxlength="4" autocomplete="off" />
                <div class="input-error" id="error-cardCvv">Invalid CVV (3-4 digits).</div>
              </div>
            </div>
          </div>
          
          <div class="payment-panel" id="panel-upi">
            <div class="upi-apps">
              <button class="upi-app-btn" data-app="gpay">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="#4285F4" d="M12.5 3.5c-.8 0-1.5.3-2.1.8l-5.6 5.6c-.6.6-.9 1.4-.9 2.2 0 .8.3 1.6.9 2.2l5.6 5.6c.6.6 1.3.8 2.1.8s1.5-.3 2.1-.8l5.6-5.6c.6-.6.9-1.4.9-2.2 0-.8-.3-1.6-.9-2.2l-5.6-5.6c-.6-.5-1.3-.8-2.1-.8z"/>
                  <path fill="#FFF" d="M12.5 7.5c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4z"/>
                </svg>
                <span>Google Pay</span>
              </button>
              <button class="upi-app-btn" data-app="phonepe">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="#5f259f" d="M3 3h18v18H3z"/>
                  <path fill="#FFF" d="M12 6a6 6 0 100 12 6 6 0 000-12zm-1 3h2v3.5h2.5v2H11V9z"/>
                </svg>
                <span>PhonePe</span>
              </button>
              <button class="upi-app-btn" data-app="paytm">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="#00baf2" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/>
                </svg>
                <span>Paytm</span>
              </button>
            </div>
            <div class="upi-divider">OR</div>
            <div class="payment-input-group">
              <label for="upiId">Enter UPI ID (VPA)</label>
              <input type="text" id="upiId" class="payment-input" placeholder="username@bank" autocomplete="off" />
              <div class="input-error" id="error-upiId">Please enter a valid UPI ID (e.g. user@bank).</div>
            </div>
            <div class="upi-qr-container">
              <div class="upi-qr-mock">
                <svg width="100" height="100" viewBox="0 0 29 29">
                  <path d="M0 0h7v7H0zm1 1v5h5V1zm1 1h3v3H2zm19-2h7v7h-7zm1 1v5h5V1zm1 1h3v3H22zM0 22h7v7H0zm1 1v5h5v-5zm1 1h3v3H2zm21-1h1v1h-1zm2 1h1v1h-1zm-2 1h1v1h-1zm2 1h1v1h-1zm1 1h2v2h-2zm-6-16h1v1h-1zm3 1h1v1h-1zm-3 2h1v1h-1zm3 1h1v1h-1zm3 1h1v1h-1zm-3 2h1v1h-1zm6 0h1v1h-1zm-3 2h1v1h-1zm6 2h1v1h-1zm-15-2h1v1h-1zm3 0h1v1h-1zm-3 3h1v1h-1zm5 1h1v1h-1zm1 1h1v1h-1zm2-7h1v1h-1zm3 1h1v1h-1zm-3 2h1v1h-1zm3 1h1v1h-1zm3 1h1v1h-1z" fill="#111"/>
                </svg>
              </div>
              <div class="upi-qr-desc">Scan QR code using any UPI app to pay</div>
            </div>
          </div>
          
          <div class="payment-panel" id="panel-netbanking">
            <label style="font-size:0.8rem;color:var(--muted);font-weight:600;margin-bottom:6px;">Select your bank</label>
            <div class="bank-grid" id="bankGrid">
              <button class="bank-btn" data-bank="hdfc"><div class="bank-icon"></div>HDFC Bank</button>
              <button class="bank-btn" data-bank="sbi"><div class="bank-icon"></div>State Bank of India</button>
              <button class="bank-btn" data-bank="icici"><div class="bank-icon"></div>ICICI Bank</button>
              <button class="bank-btn" data-bank="axis"><div class="bank-icon"></div>Axis Bank</button>
            </div>
            <div class="input-error" id="error-netbanking" style="display:none;margin-top:8px;">Please select a bank to proceed.</div>
          </div>
          
          <div class="payment-panel" id="panel-cod">
            <div class="cod-info">
              <div class="cod-title">Cash on Delivery (COD)</div>
              <div class="cod-desc">Pay in cash or digital scan upon delivery. An additional processing fee of ₹50 applies. Total order amount becomes ₹${(total + 50).toLocaleString('en-IN')}.</div>
            </div>
          </div>
        </div>
        
        <button class="payment-pay-btn" id="payBtn">Pay ₹${total.toLocaleString('en-IN')}</button>
      </div>

      <div class="payment-processing" id="paymentProcessing">
        <div class="spinner"></div>
        <div>
          <div class="processing-text" id="processingStatusText">Securing your payment connection...</div>
          <div class="processing-status" id="processingStatusStage">Please wait. Do not close or refresh this window.</div>
        </div>
      </div>

      <div class="payment-success" id="paymentSuccess">
        <div class="checkmark-circle">
          <svg class="checkmark-icon" viewBox="0 0 52 52" style="width: 32px; height: 32px; fill: none; stroke: #27ae60; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 100; stroke-dashoffset: 100; animation: drawCheckmark 0.6s 0.2s ease forwards;">
            <path d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
        <div>
          <div class="success-title">Payment Successful!</div>
          <div class="success-desc" id="successOrderDesc">Thank you for shopping with SONIC AUDIO. Your order has been placed.</div>
        </div>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('active'), 10);

  const closeBtn = overlay.querySelector('#paymentCloseBtn'),
        tabs = overlay.querySelectorAll('.payment-tab'),
        panels = overlay.querySelectorAll('.payment-panel'),
        payBtn = overlay.querySelector('#payBtn'),
        bodyContainer = overlay.querySelector('#paymentBodyContainer'),
        processingView = overlay.querySelector('#paymentProcessing'),
        successView = overlay.querySelector('#paymentSuccess'),
        cardNumInput = overlay.querySelector('#cardNum'),
        cardNameInput = overlay.querySelector('#cardName'),
        cardExpiryInput = overlay.querySelector('#cardExpiry'),
        cardCvvInput = overlay.querySelector('#cardCvv'),
        cardNumView = overlay.querySelector('#cardNumView'),
        cardNameView = overlay.querySelector('#cardNameView'),
        cardExpiryView = overlay.querySelector('#cardExpiryView'),
        cardBrand = overlay.querySelector('#cardBrand'),
        upiIdInput = overlay.querySelector('#upiId'),
        upiAppBtns = overlay.querySelectorAll('.upi-app-btn'),
        bankBtns = overlay.querySelectorAll('.bank-btn'),
        errorNetbanking = overlay.querySelector('#error-netbanking');

  let activeTab = 'card', selectedUpiApp = null, selectedBank = null;

  const updatePayBtnLabel = () => {
    const formatted = total.toLocaleString('en-IN');
    const labels = {
      card: `Pay ₹${formatted}`,
      upi: selectedUpiApp ? `Pay via ${selectedUpiApp} (₹${formatted})` : `Pay ₹${formatted}`,
      netbanking: selectedBank ? `Pay via ${selectedBank.toUpperCase()} (₹${formatted})` : `Pay ₹${formatted}`,
      cod: `Place Order (COD) - ₹${(total + 50).toLocaleString('en-IN')}`
    };
    payBtn.textContent = labels[activeTab];
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      overlay.querySelector(`#panel-${activeTab}`).classList.add('active');
      updatePayBtnLabel();
      overlay.querySelectorAll('.input-error').forEach(err => err.style.display = 'none');
    });
  });

  cardNumInput.addEventListener('input', (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = value.match(/.{1,4}/g)?.join(' ') || '';
    e.target.value = formatted;
    cardBrand.textContent = value.startsWith('4') ? 'VISA' : value.startsWith('5') ? 'MASTERCARD' : value.startsWith('3') ? 'AMEX' : 'CARD';
    cardNumView.textContent = formatted + '•••• •••• •••• ••••'.slice(formatted.length);
    overlay.querySelector('#error-cardNum').style.display = 'none';
  });

  cardNameInput.addEventListener('input', (e) => {
    cardNameView.textContent = e.target.value.toUpperCase() || 'YOUR NAME';
    overlay.querySelector('#error-cardName').style.display = 'none';
  });

  cardExpiryInput.addEventListener('input', (e) => {
    const val = e.target.value.replace(/\D/g, '');
    e.target.value = val.length > 2 ? val.slice(0, 2) + '/' + val.slice(2, 4) : val;
    cardExpiryView.textContent = e.target.value || 'MM/YY';
    overlay.querySelector('#error-cardExpiry').style.display = 'none';
  });

  cardCvvInput.addEventListener('input', () => {
    overlay.querySelector('#error-cardCvv').style.display = 'none';
  });

  upiAppBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      upiAppBtns.forEach(b => b.style.borderColor = 'var(--border)');
      btn.style.borderColor = 'var(--accent)';
      selectedUpiApp = btn.querySelector('span').textContent;
      updatePayBtnLabel();
      upiIdInput.value = '';
      overlay.querySelector('#error-upiId').style.display = 'none';
    });
  });

  upiIdInput.addEventListener('input', () => {
    upiAppBtns.forEach(b => b.style.borderColor = 'var(--border)');
    selectedUpiApp = null;
    updatePayBtnLabel();
    overlay.querySelector('#error-upiId').style.display = 'none';
  });

  bankBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      bankBtns.forEach(b => b.style.borderColor = 'var(--border)');
      btn.style.borderColor = 'var(--accent)';
      selectedBank = btn.dataset.bank;
      errorNetbanking.style.display = 'none';
      updatePayBtnLabel();
    });
  });

  const closeGateway = () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  };

  closeBtn.addEventListener('click', closeGateway);
  overlay.addEventListener('click', (e) => e.target === overlay && closeGateway());

  payBtn.addEventListener('click', () => {
    let isValid = true;
    overlay.querySelectorAll('.input-error').forEach(err => err.style.display = 'none');

    const showErr = (selector) => {
      overlay.querySelector(selector).style.display = 'block';
      return true;
    };

    if (activeTab === 'card') {
      const parts = cardExpiryInput.value.split('/');
      const mm = parseInt(parts[0], 10);
      if (cardNumInput.value.replace(/\s+/g, '').length !== 16) isValid = !showErr('#error-cardNum');
      if (!cardNameInput.value.trim()) isValid = !showErr('#error-cardName');
      if (parts.length !== 2 || parts[0].length !== 2 || parts[1].length !== 2 || mm < 1 || mm > 12) isValid = !showErr('#error-cardExpiry');
      if (cardCvvInput.value.length < 3 || cardCvvInput.value.length > 4) isValid = !showErr('#error-cardCvv');
    } else if (activeTab === 'upi' && !selectedUpiApp && !/^[\w.-]+@[\w.-]+$/.test(upiIdInput.value.trim())) {
      isValid = !showErr('#error-upiId');
    } else if (activeTab === 'netbanking' && !selectedBank) {
      isValid = !showErr('#error-netbanking');
    }

    if (!isValid) return;

    // Prepare package for POST api request
    const orderData = {
      customerName: activeTab === 'card' ? cardNameInput.value.trim() : 'Guest Customer',
      cartItems: cartItems.map(item => ({ name: item.name, price: item.price, category: item.category })),
      total: activeTab === 'cod' ? total + 50 : total,
      paymentMethod: activeTab,
      paymentDetails: activeTab === 'card' ? {
        cardBrand: cardBrand.textContent,
        cardExpiry: cardExpiryInput.value.trim()
      } : activeTab === 'upi' ? {
        upiId: selectedUpiApp || upiIdInput.value.trim()
      } : activeTab === 'netbanking' ? {
        bank: selectedBank
      } : {}
    };

    bodyContainer.style.display = 'none';
    closeBtn.style.display = 'none';
    processingView.style.display = 'flex';

    const statusStage = overlay.querySelector('#processingStatusStage');
    const statusText = overlay.querySelector('#processingStatusText');
    const stages = [
      { text: 'Securing payment gateway...', stage: 'Do not close or reload.' },
      { text: 'Connecting to bank servers...', stage: 'Requesting transaction approval...' },
      { text: 'Authorizing transaction amount...', stage: 'Processing token security handshakes...' },
      { text: 'Finalizing order registration...', stage: 'Saving transaction logs...' }
    ];

    let currentStage = 0;
    const interval = setInterval(async () => {
      currentStage++;
      if (currentStage < stages.length) {
        statusText.textContent = stages[currentStage].text;
        statusStage.textContent = stages[currentStage].stage;
      } else {
        clearInterval(interval);
        
        try {
          const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
          });
          const resData = await response.json();
          
          processingView.style.display = 'none';
          successView.style.display = 'flex';
          
          const orderId = resData.orderId || Date.now();
          const finalAmt = activeTab === 'cod' ? total + 50 : total;
          overlay.querySelector('#successOrderDesc').innerHTML = `
            Thank you for shopping with SONIC AUDIO.<br>
            Order ID: <strong>#${orderId}</strong><br>
            Total paid: <strong>₹${finalAmt.toLocaleString('en-IN')}</strong>.<br>
            Your order has been registered successfully!`;

          // Reset local state
          cartItems = [];
          cartCount = 0;
          localStorage.removeItem('sonic_cart_items');
          updateCartButton();
          setTimeout(closeGateway, 4000);
        } catch (err) {
          console.warn('Database server offline. Executing local simulated confirmation.');
          processingView.style.display = 'none';
          successView.style.display = 'flex';
          
          const finalAmt = activeTab === 'cod' ? total + 50 : total;
          overlay.querySelector('#successOrderDesc').innerHTML = `
            Thank you for shopping with SONIC AUDIO.<br>
            Total paid: <strong>₹${finalAmt.toLocaleString('en-IN')}</strong>.<br>
            Your order has been placed successfully!`;

          cartItems = [];
          cartCount = 0;
          localStorage.removeItem('sonic_cart_items');
          updateCartButton();
          setTimeout(closeGateway, 4000);
        }
      }
    }, 900);
  });
}

function renderProducts(page) {
  const selectedProducts = pageMap[page] || products.slice(0, 9);
  if (!productGrid) return;

  productGrid.innerHTML = selectedProducts.map(item => {
    const isAdded = cartItems.some(cartItem => cartItem.name === item.name);
    return `
      <article class="product-card" data-product-name="${item.name}">
        <img src="${item.image}" alt="${item.name}" class="product-img-btn" style="cursor: pointer;" />
        <div class="product-body">
          <p class="product-tag">${item.category}</p>
          <h3 class="product-title-btn" style="cursor: pointer;">${item.name}</h3>
          <p>${item.description}</p>
          <div class="product-meta">
            <span>₹${item.price.toLocaleString('en-IN')}</span>
            <button class="buy-btn" ${isAdded ? 'disabled style="opacity: 0.7;"' : ''}>${isAdded ? 'Added' : 'Add to Cart'}</button>
          </div>
        </div>
      </article>`;
  }).join('');

  document.querySelectorAll('.product-img-btn, .product-title-btn').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const card = trigger.closest('.product-card');
      const pName = card?.dataset.productName;
      const product = products.find(p => p.name === pName);
      if (product) openProductDetailModal(product);
    });
  });

  document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      const name = card?.querySelector('h3')?.textContent || 'Product';
      const category = card?.querySelector('.product-tag')?.textContent || 'Audio';
      const price = Number(card?.querySelector('.product-meta span')?.textContent.replace(/[₹,]/g, '')) || 0;

      cartCount++;
      cartItems.push({ name, category, price });
      localStorage.setItem('sonic_cart_items', JSON.stringify(cartItems));
      updateCartButton();
      btn.textContent = 'Added';
      btn.disabled = true;
      btn.style.opacity = '0.7';
    });
  });
}

function openProductDetailModal(product) {
  document.getElementById('productModal')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'productModal';
  overlay.className = 'product-modal-overlay';
  
  const isSpeaker = ['Portable Speaker', 'Home Speaker', 'Soundbar'].includes(product.category);
  const specs = isSpeaker ? [
    { key: 'Output Power', val: product.price > 15000 ? '80W RMS' : '30W RMS' },
    { key: 'Bluetooth', val: '5.3 LE Audio' },
    { key: 'Driver Size', val: product.price > 15000 ? '4.5" Subwoofer' : '2.2" Drivers' },
    { key: 'Battery Life', val: product.category === 'Home Speaker' ? 'AC Powered' : 'Up to 20 Hrs' }
  ] : [
    { key: 'Driver Type', val: '40mm Dynamic' },
    { key: 'Bluetooth', val: '5.3' },
    { key: 'Battery Life', val: 'Up to 35 Hrs' },
    { key: 'Noise Cancelling', val: product.price > 10000 ? 'Active ANC' : 'Passive Isolation' }
  ];

  const colors = [
    { name: 'Matte Black', hex: '#0f0f0f' },
    { name: 'Silver White', hex: '#e2e2e2' },
    { name: 'Accent Gold', hex: '#d4af37' }
  ];

  overlay.innerHTML = `
    <div class="product-detail-modal">
      <button class="product-modal-close" id="productModalClose">&times;</button>
      <div class="product-modal-grid">
        <img src="${product.image}" alt="${product.name}" class="product-modal-img" />
        <div class="product-modal-info">
          <p class="product-tag">${product.category}</p>
          <h2>${product.name}</h2>
          <div class="product-rating">
            ★★★★★ <span>4.8 (84 Customer Reviews)</span>
          </div>
          <div class="price-tag">₹${product.price.toLocaleString('en-IN')}</div>
          <p style="color: var(--muted); font-size: 0.95rem; line-height: 1.5; margin: 0;">${product.description}</p>
          
          <div>
            <label style="font-size:0.8rem;color:var(--muted);font-weight:600;display:block;margin-bottom:6px;">Select Color</label>
            <div class="color-swatch-group">
              ${colors.map((c, idx) => `
                <div class="color-swatch ${idx === 0 ? 'active' : ''}" style="background-color: ${c.hex};" title="${c.name}"></div>
              `).join('')}
            </div>
          </div>
          
          <div>
            <div class="product-specs-title">Technical Specifications</div>
            <ul class="spec-list">
              ${specs.map(s => `<li><span>${s.key}</span> <strong>${s.val}</strong></li>`).join('')}
              <li><span>Warranty</span> <strong>1 Year</strong></li>
              <li><span>Availability</span> <strong style="color: #27ae60;">In Stock</strong></li>
            </ul>
          </div>
          
          <button class="btn btn-primary modal-add-btn" style="margin-top: 8px; padding: 12px; font-weight: 700; width: 100%;">Add to Cart</button>
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

  const swatches = overlay.querySelectorAll('.color-swatch');
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
    });
  });

  const isAdded = cartItems.some(item => item.name === product.name);
  const addBtn = overlay.querySelector('.modal-add-btn');
  if (isAdded) {
    addBtn.textContent = 'Already in Cart';
    addBtn.disabled = true;
    addBtn.style.opacity = '0.7';
  } else {
    addBtn.addEventListener('click', () => {
      cartCount++;
      cartItems.push({ name: product.name, category: product.category, price: product.price });
      localStorage.setItem('sonic_cart_items', JSON.stringify(cartItems));
      updateCartButton();
      addBtn.textContent = 'Added to Cart';
      addBtn.disabled = true;
      addBtn.style.opacity = '0.7';
      
      document.querySelectorAll('.product-card').forEach(card => {
        if (card.dataset.productName === product.name) {
          const buyBtn = card.querySelector('.buy-btn');
          if (buyBtn) {
            buyBtn.textContent = 'Added';
            buyBtn.disabled = true;
          }
        }
      });
      
      showToastNotification(`${product.name} successfully added to cart!`);
      close();
    });
  }
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('contactName'),
          email = document.getElementById('contactEmail'),
          subject = document.getElementById('contactSubject'),
          msg = document.getElementById('contactMessage');
    
    let isValid = true;
    document.querySelectorAll('.input-error').forEach(err => err.style.display = 'none');
    
    const showErr = (sel) => {
      document.querySelector(sel).style.display = 'block';
      return true;
    };
    
    if (!name.value.trim()) isValid = !showErr('#error-contactName');
    if (!/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email.value.trim())) isValid = !showErr('#error-contactEmail');
    if (!subject.value.trim()) isValid = !showErr('#error-contactSubject');
    if (msg.value.trim().length < 10) isValid = !showErr('#error-contactMessage');
    
    if (!isValid) return;
    
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.value.trim(),
          email: email.value.trim(),
          subject: subject.value.trim(),
          message: msg.value.trim()
        })
      });
    } catch (err) {
      console.warn('Network offline. Form processed locally.');
    }
    
    showToastNotification(`Thanks, ${name.value.trim()}! Message sent successfully.`);
    contactForm.reset();
  });
}

const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail');
    const err = document.getElementById('error-newsletterEmail');
    
    err.style.display = 'none';
    if (!/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email.value.trim())) {
      err.style.display = 'block';
      return;
    }
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value.trim() })
      });
      if (!response.ok) {
        const errData = await response.json();
        showToastNotification(errData.error || 'Failed to subscribe.');
        return;
      }
    } catch (err) {
      console.warn('Network offline. Subscribed locally.');
    }
    
    showToastNotification('Successfully subscribed to SONIC AUDIO updates!');
    email.value = '';
  });
}

function showToastNotification(message) {
  let toast = document.getElementById('toastNotification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.className = 'toast-notification';
    toast.innerHTML = `
      <div class="toast-icon">
        <svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
      </div>
      <span class="toast-message"></span>`;
    document.body.appendChild(toast);
  }
  toast.querySelector('.toast-message').textContent = message;
  toast.classList.add('active');
  setTimeout(() => toast.classList.remove('active'), 4000);
}

if (cartBtn) {
  cartBtn.addEventListener('click', (event) => {
    event.preventDefault();
    openCart();
  });
}

updateCartButton();
loadProductsCatalog();
