const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
  class: { type: String, default: '' },
  subjects: [{ subject: String, class: String }], // For teachers
  enrolledSubjects: [{ subject: String, class: String }], // For students
  blocked: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);