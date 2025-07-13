const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Test = require('../models/Test');
const Question = require('../models/Question');
const Result = require('../models/Result');
const { auth, teacherOnly } = require('../middleware/auth');

router.post('/', auth, teacherOnly, async (req, res) => {
  try {
    const { subject, class: className, title, instructions, duration, randomize, availability, session, questions } = req.body;
    console.log('Tests route - Creating test:', {
      subject,
      class: className,
      user: req.user.username,
      userSubjects: req.user.subjects,
      session,
      payload: req.body
    });
    const missingFields = [];
    if (!subject) missingFields.push('subject');
    if (!className) missingFields.push('class');
    if (!title) missingFields.push('title');
    if (!duration) missingFields.push('duration');
    if (!availability?.start) missingFields.push('availability.start');
    if (!session) missingFields.push('session');
    if (missingFields.length > 0) {
      console.log('Tests route - Missing fields:', missingFields);
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }
    if (availability.end && new Date(availability.end) <= new Date(availability.start)) {
      console.log('Tests route - Invalid date range:', { start: availability.start, end: availability.end });
      return res.status(400).json({ error: 'End date must be after start date' });
    }
    if (duration <= 0) {
      console.log('Tests route - Invalid duration:', duration);
      return res.status(400).json({ error: 'Duration must be a positive number' });
    }
    if (!Array.isArray(req.user.subjects) || !req.user.subjects.some(sub => sub.subject === subject && sub.class === className)) {
      console.log('Tests route - Not assigned:', { user: req.user.username, subject, class: className, userSubjects: req.user.subjects });
      return res.status(403).json({ error: 'You are not assigned to this subject/class.' });
    }
    // Validate session format (adjust based on Test model)
    if (!session.match(/^\d{4}\/\d{4}( Semester [12])?$/)) {
      console.log('Tests route - Invalid session format:', session);
      return res.status(400).json({ error: 'Invalid session format. Use "YYYY/YYYY" or "YYYY/YYYY Semester 1/2".' });
    }
    if (questions && questions.length > 0) {
      const questionDocs = await Question.find({ _id: { $in: questions } });
      if (questionDocs.length !== questions.length) {
        console.log('Tests route - Invalid question IDs:', { questions });
        return res.status(400).json({ error: 'One or more question IDs are invalid.' });
      }
      if (!questionDocs.every(q => q.subject === subject && q.class === className)) {
        console.log('Tests route - Questions mismatch:', { subject, class: className });
        return res.status(400).json({ error: 'Questions must match test subject and class.' });
      }
    }
    const test = new Test({
      subject,
      class: className,
      title,
      instructions,
      duration,
      randomize,
      availability,
      session,
      createdBy: req.user.userId,
      questions: questions || [],
    });
    await test.save();
    console.log('Tests route - Created:', { testId: test._id });
    res.status(201).json({ message: 'Test created successfully.', testId: test._id.toString() });
  } catch (error) {
    console.error('Tests route - Error:', {
      error: error.message,
      code: error.code,
      request: req.body,
      stack: error.stack
    });
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: `Validation failed: ${errors.join(', ')}` });
    }
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Duplicate test entry detected.' });
    }
    res.status(400).json({ error: error.message || 'Failed to create test. Please check your input and try again.' });
  }
});

// ... (rest of the routes unchanged)

router.get('/', auth, async (req, res) => {
  try {
    console.log('Tests route - Fetching tests for:', { user: req.user.username, role: req.user.role });
    let query = {};
    if (req.user.role === 'teacher') {
      const subjects = Array.isArray(req.user.subjects) ? req.user.subjects.map(sub => sub.subject).filter(Boolean) : [];
      const classes = Array.isArray(req.user.subjects) ? req.user.subjects.map(sub => sub.class).filter(Boolean) : [];
      if (!subjects.length || !classes.length) {
        console.log('Tests route - No subjects/classes assigned:', { user: req.user.username });
        return res.status(400).json({ error: 'No subjects or classes assigned to this teacher.' });
      }
      query = { subject: { $in: subjects }, class: { $in: classes } };
    } else if (req.user.role === 'student') {
      const subjects = Array.isArray(req.user.enrolledSubjects) ? req.user.enrolledSubjects.map(sub => sub.subject).filter(Boolean) : [];
      const classes = Array.isArray(req.user.enrolledSubjects) ? req.user.enrolledSubjects.map(sub => sub.class).filter(Boolean) : [];
      if (!subjects.length || !classes.length) {
        console.log('Tests route - No enrolled subjects/classes:', { user: req.user.username });
        return res.status(400).json({ error: 'No enrolled subjects or classes for this student.' });
      }
      query = { subject: { $in: subjects }, class: { $in: classes } };
    } else if (req.user.role !== 'admin') {
      console.log('Tests route - Access denied:', { user: req.user.username });
      return res.status(403).json({ error: 'Access restricted to authorized users.' });
    }
    const tests = await Test.find(query).populate('createdBy', 'username');
    console.log('Tests route - Success:', { count: tests.length });
    res.json(tests);
  } catch (error) {
    console.error('Tests route - Error:', error.message);
    res.status(400).json({ error: error.message || 'Failed to fetch tests. Please try again.' });
  }
});

router.get('/admin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      console.log('Tests route - Admin access denied:', { user: req.user.username });
      return res.status(403).json({ error: 'Admin access required.' });
    }
    const tests = await Test.find().populate('createdBy', 'username');
    console.log('Tests route - Admin fetch success:', { count: tests.length });
    res.json(tests);
  } catch (error) {
    console.error('Tests route - Error:', error.message);
    res.status(400).json({ error: error.message || 'Failed to fetch tests. Please try again.' });
  }
});

router.get('/:testId', auth, async (req, res) => {
  try {
    console.log('Tests route - Fetching test:', { testId: req.params.testId, user: req.user.username });
    if (!mongoose.isValidObjectId(req.params.testId)) {
      console.log('Tests route - Invalid test ID:', { testId: req.params.testId });
      return res.status(400).json({ error: 'Invalid test ID.' });
    }
    const test = await Test.findById(req.params.testId).populate('questions createdBy', 'username');
    if (!test) {
      console.log('Tests route - Test not found:', { testId: req.params.testId });
      return res.status(404).json({ error: 'Test not found.' });
    }
    if (
      req.user.role === 'teacher' &&
      !req.user.subjects.some(sub => sub.subject === test.subject && sub.class === test.class)
    ) {
      console.log('Tests route - Not assigned:', { user: req.user.username, subject: test.subject, class: test.class });
      return res.status(403).json({ error: 'You are not assigned to this subject/class.' });
    } else if (
      req.user.role === 'student' &&
      !req.user.enrolledSubjects.some(sub => sub.subject === test.subject && sub.class === test.class)
    ) {
      console.log('Tests route - Not enrolled:', { user: req.user.username, subject: test.subject, class: test.class });
      return res.status(403).json({ error: 'You are not enrolled in this subject/class.' });
    } else if (req.user.role !== 'admin' && req.user.role !== 'teacher' && req.user.role !== 'student') {
      console.log('Tests route - Access denied:', { user: req.user.username });
      return res.status(403).json({ error: 'Access restricted to authorized users.' });
    }
    console.log('Tests route - Success:', { testId: test._id });
    res.json(test);
  } catch (error) {
    console.error('Tests route - Error:', error.message);
    res.status(400).json({ error: error.message || 'Failed to fetch test. Please try again.' });
  }
});

router.put('/:id', auth, teacherOnly, async (req, res) => {
  try {
    const { title, subject, class: className, session, instructions, duration, randomize, availability, questions } = req.body;
    console.log('Tests route - Updating test:', { id: req.params.id, user: req.user.username, payload: req.body });
    if (!mongoose.isValidObjectId(req.params.id)) {
      console.log('Tests route - Invalid test ID:', { id: req.params.id });
      return res.status(400).json({ error: 'Invalid test ID.' });
    }
    const test = await Test.findById(req.params.id);
    if (!test) {
      console.log('Tests route - Test not found:', { id: req.params.id });
      return res.status(404).json({ error: 'Test not found.' });
    }
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!subject) missingFields.push('subject');
    if (!className) missingFields.push('class');
    if (!duration) missingFields.push('duration');
    if (!availability?.start) missingFields.push('availability.start');
    if (!session) missingFields.push('session');
    if (missingFields.length > 0) {
      console.log('Tests route - Missing fields:', missingFields);
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }
    if (availability.end && new Date(availability.end) <= new Date(availability.start)) {
      console.log('Tests route - Invalid date range:', { start: availability.start, end: availability.end });
      return res.status(400).json({ error: 'End date must be after start date' });
    }
    if (duration <= 0) {
      console.log('Tests route - Invalid duration:', duration);
      return res.status(400).json({ error: 'Duration must be a positive number' });
    }
    if (subject && className && !req.user.subjects.some(sub => sub.subject === subject && sub.class === className)) {
      console.log('Tests route - Not assigned:', { user: req.user.username, subject, class: className, userSubjects: req.user.subjects });
      return res.status(403).json({ error: 'You are not assigned to this subject/class.' });
    }
    if (questions && questions.length > 0) {
      const questionDocs = await Question.find({ _id: { $in: questions } });
      if (questionDocs.length !== questions.length) {
        console.log('Tests route - Invalid question IDs:', { questions });
        return res.status(400).json({ error: 'One or more question IDs are invalid.' });
      }
      const testSubject = subject || test.subject;
      const testClass = className || test.class;
      if (!questionDocs.every(q => q.subject === testSubject && q.class === testClass)) {
        console.log('Tests route - Questions mismatch:', { subject: testSubject, class: testClass });
        return res.status(400).json({ error: 'Questions must match test subject and class.' });
      }
    }
    test.title = title || test.title;
    test.subject = subject || test.subject;
    test.class = className || test.class;
    test.session = session || test.session;
    test.instructions = instructions || test.instructions;
    test.duration = duration || test.duration;
    test.randomize = randomize !== undefined ? randomize : test.randomize;
    test.availability = availability || test.availability;
    test.questions = questions || test.questions;
    await test.save();
    console.log('Tests route - Updated:', { testId: test._id });
    res.json({ message: 'Test updated successfully.', testId: test._id.toString() });
  } catch (error) {
    console.error('Tests route - Error:', {
      error: error.message,
      request: req.body,
      stack: error.stack
    });
    res.status(400).json({ error: error.message || 'Failed to update test. Please try again.' });
  }
});

router.delete('/:testId', auth, async (req, res) => {
  try {
    console.log('Tests route - Deleting test:', { testId: req.params.testId, user: req.user.username });
    if (!mongoose.isValidObjectId(req.params.testId)) {
      console.log('Tests route - Invalid test ID:', { testId: req.params.testId });
      return res.status(400).json({ error: 'Invalid test ID.' });
    }
    if (req.user.role !== 'admin') {
      console.log('Tests route - Access denied:', { user: req.user.username });
      return res.status(403).json({ error: 'Admin access required.' });
    }
    const test = await Test.findById(req.params.testId);
    if (!test) {
      console.log('Tests route - Test not found:', { testId: req.params.testId });
      return res.status(404).json({ error: 'Test not found.' });
    }
    await Test.deleteOne({ _id: req.params.testId });
    await Result.deleteMany({ testId: req.params.testId });
    console.log('Tests route - Deleted test and results:', { testId: req.params.testId });
    res.json({ message: 'Test and related results deleted successfully.' });
  } catch (error) {
    console.error('Tests route - Error:', {
      error: error.message,
    });
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answers, userId } = req.body;
    console.log('Tests route - Submitting test:', { testId: req.params.id, userId });
    if (!mongoose.isValidObjectId(req.params.id)) {
      console.log('Tests route - Invalid test ID:', { testId: req.params.id });
      return res.status(400).json({ error: 'Invalid test ID.' });
    }
    const test = await Test.findById(req.params.id).populate('questions');
    if (!test) {
      console.log('Tests route - Test not found:', { testId: req.params.id });
      return res.status(404).json({ error: 'Test not found.' });
    }
    if (
      req.user.role === 'student' &&
      !req.user.enrolledSubjects.some(sub => sub.subject === test.subject && sub.class === test.class)
    ) {
      console.log('Tests route - Not enrolled:', { user: req.user.username, subject: test.subject, class: test.class });
      return res.status(403).json({ error: 'You are not enrolled in this subject/class.' });
    }
    let score = 0;
    const totalQuestions = test.questions.length;
    const results = test.questions.map(q => {
      const isCorrect = answers[q._id] === q.correctAnswer;
      if (isCorrect) score += 1;
      return {
        questionId: q._id,
        selectedAnswer: answers[q._id] || null,
        isCorrect,
      };
    });
    const result = new Result({
      userId,
      testId: req.params.id,
      answers: results,
      score,
      totalQuestions,
      submittedAt: new Date(),
      subject: test.subject,
      class: test.class,
      session: test.session,
    });
    await result.save();
    console.log('Tests route - Submission success:', { testId: req.params.id, score });
    res.json({ message: 'Test submitted', score, totalQuestions });
  } catch (error) {
    console.error('Tests route - Submission error:', {
      error: error.message,
      request: req.body,
    });
    res.status(400).json({ error: error.message || 'Failed to submit test.' });
  }
});

module.exports = router;