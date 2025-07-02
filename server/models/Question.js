const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  class: { type: String, required: true },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
  imageUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);