require('dotenv').config({ path: 'c:/Users/91902/OneDrive/Desktop/MyWallet/server/.env' });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL).then(async () => {
  const walletSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }
  });
  const Wallet = mongoose.model('Wallet', walletSchema);

  try {
    console.log('Attempting to save...');
    const wallet = new Wallet({ username: 'test_admin', data: { test: 123 } });
    await wallet.save();
    console.log('Saved successfully');
  } catch (err) {
    console.error('Save error:', err);
  }

  try {
    console.log('Attempting findOneAndUpdate upsert...');
    const w = await Wallet.findOneAndUpdate(
      { username: 'test_upsert' },
      { data: { updated: true } },
      { new: true, upsert: true }
    );
    console.log('Upsert successful:', w);
  } catch (err) {
    console.error('Upsert error:', err);
  }

  mongoose.disconnect();
}).catch(console.error);
