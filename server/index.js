require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('./models/User');
const Wallet = require('./models/Wallet');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL, // React app
  credentials: true
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
  .then(async () => {
    console.log('MongoDB connected');
    // Seed manually to remove dependency on .env
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      await new User({ username: 'admin', password: 'admin' }).save();
    }
    const userExists = await User.findOne({ username: 'user' });
    if (!userExists) {
      await new User({ username: 'user', password: 'password' }).save();
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Middleware to verify JWT
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing token' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = decoded; // { username }
    next();
  });
};

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username, password });

    if (user) {
      const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '24h' });
      // Initialize wallet in db if not exists
      const existingWallet = await Wallet.findOne({ username: user.username });
      if (!existingWallet) {
        await new Wallet({ username: user.username, data: {} }).save();
      }
      return res.json({ success: true, token, user: { username: user.username, role: 'user' } });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/auth/user', authenticate, async (req, res) => {
  try {
    const { username } = req.body;
    const oldUsername = req.user.username;
    if (!username) return res.status(400).json({ error: 'New username required' });

    await User.findOneAndUpdate({ username: oldUsername }, { username });
    await Wallet.findOneAndUpdate({ username: oldUsername }, { username });

    return res.json({ success: true, user: { username, role: 'user' } });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Failed to update username' });
  }
});

// Get user's entire wallet data
app.get('/api/wallet', authenticate, async (req, res) => {
  try {
    const username = req.user.username;
    const wallet = await Wallet.findOne({ username });
    res.json(wallet ? wallet.data : {});
  } catch (error) {
    console.error('GET /api/wallet error:', error);
    res.status(500).json({ error: 'Failed to fetch wallet data', details: error.message });
  }
});

// Update user's entire wallet data
app.put('/api/wallet', authenticate, async (req, res) => {
  try {
    const username = req.user.username;
    const wallet = await Wallet.findOneAndUpdate(
      { username },
      { data: req.body },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: wallet.data });
  } catch (error) {
    console.error('PUT /api/wallet error:', error);
    res.status(500).json({ error: 'Failed to update wallet data', details: error.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
