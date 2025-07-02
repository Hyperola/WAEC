const mongoose = require('mongoose');

const cheatLogSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // e.g., 'Tab switch', 'Window blur'
  timestamp: { type: Date, required: true },
});

module.exports = mongoose.model('CheatLog', cheatLogSchema);