const Wallet = require('../models/Wallet');

const getWallet = async (req, res) => {
  try {
    const username = req.user.username;
    const wallet = await Wallet.findOne({ username });
    res.json(wallet ? wallet.data : {});
  } catch (error) {
    console.error('GET /api/wallet error:', error);
    res.status(500).json({ error: 'Failed to fetch wallet data', details: error.message });
  }
};

const updateWallet = async (req, res) => {
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
};

module.exports = {
  getWallet,
  updateWallet
};
