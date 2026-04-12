const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  id: String,
  title: String,
  amount: Number,
  category: String,
  date: String
});

const monthDataSchema = new mongoose.Schema({
  budget: { type: Number, default: 0 },
  transactions: { type: [transactionSchema], default: [] }
});

const walletSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  data: {
    type: Map,
    of: monthDataSchema,
    default: {}
  }
});

module.exports = mongoose.model('Wallet', walletSchema);
