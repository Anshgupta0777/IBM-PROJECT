// SONIC AUDIO - Backend Express Server

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const PORT = process.env.PORT || 3000;

// Google OAuth Credentials
// Replace these with your real credentials from https://console.cloud.google.com
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
// ──────────────────────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// Session middleware (required for passport)
app.use(session({
  secret: 'sonic-audio-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days
}));

app.use(passport.initialize());
app.use(passport.session());

// Data helpers
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const initJSON = (filename) => {
  const file = path.join(dataDir, filename);
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify([], null, 2));
};
initJSON('orders.json');
initJSON('contacts.json');
initJSON('subscribers.json');
initJSON('users.json');

const readJSON = (filename) => {
  return JSON.parse(fs.readFileSync(path.join(dataDir, filename), 'utf8'));
};

const appendToJSON = (filename, data) => {
  const file = path.join(dataDir, filename);
  try {
    const list = readJSON(filename);
    list.push(data);
    fs.writeFileSync(file, JSON.stringify(list, null, 2));
  } catch (err) {
    console.error(`Error writing to ${filename}:`, err);
  }
};

// Google auth strategy
const isGoogleConfigured = GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID';

if (isGoogleConfigured) {
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${BASE_URL}/auth/google/callback`
  }, (accessToken, refreshToken, profile, done) => {
    try {
      const users = readJSON('users.json');
      const email = profile.emails?.[0]?.value || '';
      const displayName = profile.displayName || email.split('@')[0];

      let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        user = {
          id: Date.now(),
          username: displayName,
          email,
          socialProvider: 'google',
          googleId: profile.id,
          avatar: profile.photos?.[0]?.value || null,
          createdAt: new Date().toISOString()
        };
        appendToJSON('users.json', user);
      }

      return done(null, { username: user.username, email: user.email });
    } catch (err) {
      return done(err, null);
    }
  }));
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Products catalog
const products = [
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

// API Routes
app.get('/api/products', (req, res) => res.json(products));

// Check if Google OAuth is configured (frontend uses this)
app.get('/api/auth/status', (req, res) => {
  res.json({ googleConfigured: isGoogleConfigured });
});

app.get('/api/admin/data', (req, res) => {
  try {
    const orders = readJSON('orders.json');
    const contacts = readJSON('contacts.json');
    const subscribers = readJSON('subscribers.json');
    res.json({ orders, contacts, subscribers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve database logs.' });
  }
});

app.post('/api/orders', (req, res) => {
  const { customerName, cartItems, total, paymentMethod, paymentDetails, userEmail, deliveryAddress } = req.body;
  if (!cartItems || !cartItems.length || !total || !deliveryAddress) {
    return res.status(400).json({ error: 'Cart items, order total, and delivery address are required.' });
  }

  const newOrder = {
    orderId: Date.now(),
    timestamp: new Date().toISOString(),
    customerName: customerName || 'Guest Customer',
    userEmail: userEmail || null,
    deliveryAddress,
    cartItems,
    total,
    paymentMethod,
    paymentDetails: paymentDetails || {}
  };

  appendToJSON('orders.json', newOrder);
  res.status(201).json({ success: true, orderId: newOrder.orderId, total: newOrder.total });
});

app.get('/api/orders', (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email parameter is required.' });
  try {
    const orders = readJSON('orders.json');
    const userOrders = orders.filter(o => o.userEmail && o.userEmail.toLowerCase() === email.toLowerCase());
    res.json(userOrders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
});

app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  appendToJSON('contacts.json', {
    inquiryId: Date.now(),
    timestamp: new Date().toISOString(),
    name, email,
    subject: subject || 'General Query',
    message
  });
  res.status(201).json({ success: true });
});

app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  try {
    const list = readJSON('subscribers.json');
    if (list.includes(email.trim().toLowerCase())) {
      return res.status(400).json({ error: 'Email is already subscribed.' });
    }
    appendToJSON('subscribers.json', email.trim().toLowerCase());
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to subscribe.' });
  }
});

app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }
  try {
    const users = readJSON('users.json');
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const newUser = { id: Date.now(), username, email, passwordHash, createdAt: new Date().toISOString() };
    appendToJSON('users.json', newUser);
    res.status(201).json({ success: true, user: { username: newUser.username, email: newUser.email } });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    const users = readJSON('users.json');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(400).json({ error: 'No account found with this email.' });
    if (!user.passwordHash) return res.status(400).json({ error: 'This account uses social login. Please sign in with Google.' });
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    if (user.passwordHash !== passwordHash) return res.status(400).json({ error: 'Incorrect password.' });
    res.json({ success: true, user: { username: user.username, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to login.' });
  }
});

app.post('/api/social-login', (req, res) => {
  const { username, email, provider } = req.body;
  if (!username || !email) {
    return res.status(400).json({ error: 'Username and email are required.' });
  }
  try {
    const users = readJSON('users.json');
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = { id: Date.now(), username, email, socialProvider: provider || 'google', createdAt: new Date().toISOString() };
      appendToJSON('users.json', user);
    }
    res.json({ success: true, user: { username: user.username, email: user.email } });
  } catch (err) {
    console.error('Social login error:', err);
    res.status(500).json({ error: 'Failed to authenticate social user.' });
  }
});

// Auth Routes
app.get('/auth/google', (req, res, next) => {
  if (!isGoogleConfigured) {
    return res.redirect('/login.html?error=google_not_configured');
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Google callback after user grants permission
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html?error=google_failed' }),
  (req, res) => {
    // Success — pass user data to frontend via query params then redirect
    const user = req.user;
    const encoded = encodeURIComponent(JSON.stringify(user));
    res.redirect(`/auth/google/success?user=${encoded}`);
  }
);

// Frontend picks up the user from this page and stores it in localStorage
app.get('/auth/google/success', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Signing you in...</title>
      <style>
        body { background: #070709; color: #f5f5f7; font-family: 'Outfit', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .box { text-align: center; }
        .spinner { width: 48px; height: 48px; border: 3px solid rgba(230,36,41,0.2); border-top-color: #e62429; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 20px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div class="box">
        <div class="spinner"></div>
        <div>Signing you in with Google...</div>
      </div>
      <script>
        const raw = new URLSearchParams(window.location.search).get('user');
        if (raw) {
          try {
            const user = JSON.parse(decodeURIComponent(raw));
            localStorage.setItem('sonic_logged_in_user', JSON.stringify(user));
          } catch(e) {}
        }
        window.location.href = '/index.html';
      </script>
    </body>
    </html>
  `);
});

// ─── Static files & fallback ─────────────────────────────────────────────────
app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SONIC AUDIO server running on port ${PORT}`);
  if (!isGoogleConfigured) {
    console.log('⚠  Google OAuth not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable real Google login.');
  } else {
    console.log('✓  Google OAuth is configured and active.');
  }
});
