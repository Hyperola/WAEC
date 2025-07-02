const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  class: { type: String, required: true },
  instructions: { type: String },
  duration: { type: Number, required: true },
  randomize: { type: Boolean, default: false },
  availability: {
    start: { type: Date, required: true },
    end: { type: Date },
  },
  session: { type: String, default: '2025/2026 Semester 1' },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Test', testSchema);