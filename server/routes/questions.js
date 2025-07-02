const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Get all questions (teacher-only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      console.log('Questions route - Access denied:', { user: req.user.username });
      return res.status(403).json({ error: 'Access restricted to teachers' });
    }

    console.log('Questions route - Fetching questions for:', { user: req.user.username });
    const questions = await Question.find({
      $or: req.user.subjects.map((sub) => ({
        subject: sub.subject,
        class: sub.class,
      })),
    });
    console.log('Questions route - Success:', { count: questions.length });
    res.json(questions);
  } catch (error) {
    console.error('Questions route - Error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a question (teacher-only)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      console.log('Questions route - Access denied:', { user: req.user.username });
      return res.status(403).json({ error: 'Access restricted to teachers' });
    }

    const { subject, class: className, text, options, correctAnswer } = req.body;
    console.log('Questions route - Creating question:', { subject, class: className });

    if (!req.user.subjects.some((sub) => sub.subject === subject && sub.class === className)) {
      console.log('Questions route - Not assigned:', { user: req.user.username, subject, class: className });
      return res.status(403).json({ error: 'Not assigned to this subject/class' });
    }

    const question = new Question({
      subject,
      class: className,
      text,
      options: JSON.parse(options),
      correctAnswer,
      imageUrl: req.file ? `/Uploads/${req.file.filename}` : null,
      createdBy: req.user.userId,
    });
    await question.save();
    console.log('Questions route - Created:', { questionId: question._id });
    res.status(201).json({ message: 'Question created', questionId: question._id });
  } catch (error) {
    console.error('Questions route - Error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Bulk import questions (teacher-only)
router.post('/bulk', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      console.log('Questions route - Access denied:', { user: req.user.username });
      return res.status(403).json({ error: 'Access restricted to teachers' });
    }

    const { questions } = req.body;
    console.log('Questions route - Bulk importing:', { count: questions.length });

    let count = 0;
    const validQuestions = [];
    for (const q of questions) {
      const { subject, class: className, questionText, options, correctAnswer, imageUrl } = q;
      if (!req.user.subjects.some((sub) => sub.subject === subject && sub.class === className)) {
        console.log('Questions route - Not assigned:', { subject, class: className });
        continue;
      }
      if (!questionText || !options || options.length < 2 || !correctAnswer || !subject || !className) {
        console.log('Questions route - Invalid question:', { questionText });
        continue;
      }
      validQuestions.push({
        subject,
        class: className,
        text: questionText,
        options,
        correctAnswer,
        imageUrl: imageUrl || null,
        createdBy: req.user.userId,
      });
      count++;
    }
    if (validQuestions.length === 0) {
      return res.status(400).json({ error: 'No valid questions provided' });
    }
    const result = await Question.insertMany(validQuestions);
    console.log('Questions route - Bulk import complete:', { count });
    res.status(201).json({ message: `Imported ${count} questions successfully`, count, insertedIds: result.map(q => q._id) });
  } catch (error) {
    console.error('Questions route - Error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Update a question (teacher-only)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      console.log('Questions route - Access denied:', { user: req.user.username });
      return res.status(403).json({ error: 'Access restricted to teachers' });
    }

    const { subject, class: className, text, options, correctAnswer } = req.body;
    console.log('Questions route - Updating question:', { id: req.params.id });

    const question = await Question.findById(req.params.id);
    if (!question) {
      console.log('Questions route - Question not found:', { id: req.params.id });
      return res.status(404).json({ error: 'Question not found' });
    }

    if (!req.user.subjects.some((sub) => sub.subject === subject && sub.class === className)) {
      console.log('Questions route - Not assigned:', { user: req.user.username, subject, class: className });
      return res.status(403).json({ error: 'Not assigned to this subject/class' });
    }

    question.subject = subject;
    question.class = className;
    question.text = text;
    question.options = JSON.parse(options);
    question.correctAnswer = correctAnswer;
    if (req.file) question.imageUrl = `/Uploads/${req.file.filename}`;
    await question.save();
    console.log('Questions route - Updated:', { questionId: question._id });
    res.json({ message: 'Question updated', question });
  } catch (error) {
    console.error('Questions route - Error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Delete a question (teacher-only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      console.log('Questions route - Access denied:', { user: req.user.username });
      return res.status(403).json({ error: 'Access restricted to teachers' });
    }

    console.log('Questions route - Deleting question:', { id: req.params.id });
    const question = await Question.findById(req.params.id);
    if (!question) {
      console.log('Questions route - Question not found:', { id: req.params.id });
      return res.status(404).json({ error: 'Question not found' });
    }

    await question.deleteOne();
    console.log('Questions route - Deleted:', { questionId: req.params.id });
    res.json({ message: 'Question deleted' });
  } catch (error) {
    console.error('Questions route - Error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;