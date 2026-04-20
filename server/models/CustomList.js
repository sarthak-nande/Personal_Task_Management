const mongoose = require('mongoose');

const customListItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false }
});

const customListSchema = new mongoose.Schema({
  username: { type: String, required: true },
  name: { type: String, required: true },
  items: [customListItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('CustomList', customListSchema);
