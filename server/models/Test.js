const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Test title is required'],
    trim: true,
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    trim: true,
  },
  session: {
    type: String,
    required: [true, 'Session is required'],
    trim: true,
  },
  instructions: {
    type: String,
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be a positive number'],
  },
  questionCount: {
    type: Number,
    required: [true, 'Question count is required'],
    min: [1, 'Question count must be a positive number'],
  },
  randomize: {
    type: Boolean,
    default: false,
  },
  availability: {
    start: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    end: {
      type: Date,
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
  }],
}, { timestamps: true });

module.exports = mongoose.model('Test', TestSchema);