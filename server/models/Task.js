const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  username: { type: String, required: true },
  title: { type: String, required: true },
  listId: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskList' },
  category: { type: String, default: 'General' },
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
