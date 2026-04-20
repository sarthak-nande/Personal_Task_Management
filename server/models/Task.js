const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  username: { type: String, required: true },
  title: { type: String, required: true },

  category: { type: String, default: 'General' },
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
