const mongoose = require('mongoose');

const taskListSchema = new mongoose.Schema({
  username: { type: String, required: true },
  name: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('TaskList', taskListSchema);
