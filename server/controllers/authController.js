const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

const loginUser = async (req, res) => {
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
};

const updateUser = async (req, res) => {
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
};

module.exports = {
  loginUser,
  updateUser
};
