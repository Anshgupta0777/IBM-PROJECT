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

// ─── Google OAuth Credentials ─────────────────────────────────────────────────
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

// ─── Data helpers ─────────────────────────────────────────────────────────────
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

// ─── Passport Google Strategy ─────────────────────────────────────────────────
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

// ─── Products ─────────────────────────────────────────────────────────────────
const products = [
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

// ─── API Routes ───────────────────────────────────────────────────────────────

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

// ─── Google OAuth Routes ──────────────────────────────────────────────────────

// Start Google OAuth flow
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
