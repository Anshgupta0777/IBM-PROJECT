// SONIC AUDIO - Backend Express Server

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const initJSON = (filename) => {
  const file = path.join(dataDir, filename);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify([], null, 2));
  }
};
initJSON('orders.json');
initJSON('contacts.json');
initJSON('subscribers.json');

const appendToJSON = (filename, data) => {
  const file = path.join(dataDir, filename);
  try {
    const list = JSON.parse(fs.readFileSync(file, 'utf8'));
    list.push(data);
    fs.writeFileSync(file, JSON.stringify(list, null, 2));
  } catch (err) {
    console.error(`Error writing to ${filename}:`, err);
  }
};

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

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/admin/data', (req, res) => {
  try {
    const orders = JSON.parse(fs.readFileSync(path.join(dataDir, 'orders.json'), 'utf8'));
    const contacts = JSON.parse(fs.readFileSync(path.join(dataDir, 'contacts.json'), 'utf8'));
    const subscribers = JSON.parse(fs.readFileSync(path.join(dataDir, 'subscribers.json'), 'utf8'));
    res.json({ orders, contacts, subscribers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve database logs.' });
  }
});

app.post('/api/orders', (req, res) => {
  const { customerName, cartItems, total, paymentMethod, paymentDetails } = req.body;
  if (!cartItems || !cartItems.length || !total) {
    return res.status(400).json({ error: 'Cart items and order total are required.' });
  }

  const newOrder = {
    orderId: Date.now(),
    timestamp: new Date().toISOString(),
    customerName: customerName || 'Guest Customer',
    cartItems,
    total,
    paymentMethod,
    paymentDetails: paymentDetails || {}
  };

  appendToJSON('orders.json', newOrder);
  res.status(201).json({ success: true, orderId: newOrder.orderId, total: newOrder.total });
});

app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const newInquiry = {
    inquiryId: Date.now(),
    timestamp: new Date().toISOString(),
    name,
    email,
    subject: subject || 'General Query',
    message
  };

  appendToJSON('contacts.json', newInquiry);
  res.status(201).json({ success: true });
});

app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const subscribersFile = path.join(dataDir, 'subscribers.json');
  try {
    const list = JSON.parse(fs.readFileSync(subscribersFile, 'utf8'));
    if (list.includes(email.trim().toLowerCase())) {
      return res.status(400).json({ error: 'Email is already subscribed.' });
    }

    appendToJSON('subscribers.json', email.trim().toLowerCase());
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to subscribe.' });
  }
});

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SONIC AUDIO server running on port ${PORT}`);
});
