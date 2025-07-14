const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Test = require('../models/Test');
const Question = require('../models/Question');
const Result = require('../models/Result');
const { auth, teacherOnly, adminOnly } = require('../middleware/auth');

router.post('/', auth, teacherOnly, async (req, res) => {
  try {
    const { subject, class: className, title, instructions, duration, randomize, availability, session, questions, questionCount } = req.body;
    console.log('Tests route - Creating test:', {
      subject,
      class: className,
      title,
      duration,
      availability,
      session,
      questionCount,
      randomize,
      user: req.user.username,
      userSubjects: req.user.subjects,
      payload: req.body
    });
    const missingFields = [];
    if (!title || typeof title !== 'string' || title.trim() === '') missingFields.push('title');
    if (!subject || typeof subject !== 'string' || subject.trim() === '') missingFields.push('subject');
    if (!className || typeof className !== 'string' || className.trim() === '') missingFields.push('class');
    if (!duration && duration !== 0) missingFields.push('duration');
    if (!availability || !availability.start) missingFields.push('availability.start');
    if (!session || typeof session !== 'string' || session.trim() === '') missingFields.push('session');
    if (!questionCount && questionCount !== 0) missingFields.push('questionCount');
    if (missingFields.length > 0) {
      console.log('Tests route - Missing or invalid fields:', missingFields);
      return res.status(400).json({ error: `Missing or invalid fields: ${missingFields.join(', ')}` });
    }
    const parsedQuestionCount = Number(questionCount);
    const parsedDuration = Number(duration);
    if (isNaN(parsedQuestionCount) || parsedQuestionCount < 1) {
      console.log('Tests route - Invalid questionCount:', questionCount);
      return res.status(400).json({ error: 'Question count must be a positive number.' });
    }
    if (isNaN(parsedDuration) || parsedDuration < 1) {
      console.log('Tests route - Invalid duration:', duration);
      return res.status(400).json({ error: 'Duration must be a positive number.' });
    }
    if (new Date(availability.end) <= new Date(availability.start)) {
      console.log('Tests route - Invalid date range:', { start: availability.start, end: availability.end });
      return res.status(400).json({ error: 'End date must be after start date' });
    }
    if (!Array.isArray(req.user.subjects) || !req.user.subjects.some(sub => sub.subject === subject && sub.class === className)) {
      console.log('Tests route - Not assigned:', { user: req.user.username, subject, class: className, userSubjects: req.user.subjects });
      return res.status(403).json({ error: 'You are not assigned to this subject/class.' });
    }
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
      if (questions.length > parsedQuestionCount) {
        console.log('Tests route - Too many questions:', { parsedQuestionCount, questionsLength: questions.length });
        return res.status(400).json({ error: `Number of questions (${questions.length}) exceeds question count (${parsedQuestionCount}).` });
      }
    }
    const test = new Test({
      subject,
      class: className,
      title,
      instructions,
      duration: parsedDuration,
      randomize,
      availability,
      session,
      questionCount: parsedQuestionCount,
      createdBy: req.user.userId,
      questions: questions || [],
    });
    await test.save();
    console.log('Tests route - Created:', { testId: test._id });
    res.status(201).json(test);
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
    res.status(500).json({ error: 'Server error' });
  }
});

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
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/admin', auth, adminOnly, async (req, res) => {
  try {
    console.log('Tests route - Admin fetch success:', { user: req.user.username });
    const tests = await Test.find().populate('createdBy', 'username');
    console.log('Tests route - Admin fetch success:', { count: tests.length });
    res.json(tests);
  } catch (error) {
    console.error('Tests route - Error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:testId', auth, async (req, res) => {
  try {
    console.log('Tests route - Fetching test:', { testId: req.params.testId, user: req.user.username });
    if (!mongoose.isValidObjectId(req.params.testId)) {
      console.log('Tests route - Invalid test ID:', { testId: req.params.testId });
      return res.status(400).json({ error: 'Invalid test ID format.' });
    }
    const test = await Test.findById(req.params.testId).populate({
      path: 'questions',
      select: '_id text options correctAnswer subject class'
    }).populate('createdBy', 'username');
    if (!test) {
      console.log('Tests route - Test not found:', { testId: req.params.testId });
      return res.status(404).json({ error: 'Test not found.' });
    }
    if (
      req.user.role === 'teacher' &&
      !req.user.subjects.some(sub => sub.subject === test.subject && sub.class === test.class)
    ) {
      console.log('Tests route - Not assigned:', { 
        user: req.user.username, 
        subject: test.subject, 
        class: test.class, 
        userSubjects: req.user.subjects 
      });
      return res.status(403).json({ error: 'You are not assigned to this subject/class.' });
    } else if (
      req.user.role === 'student' &&
      !req.user.enrolledSubjects.some(sub => sub.subject === test.subject && sub.class === test.class)
    ) {
      console.log('Tests route - Not enrolled:', { 
        user: req.user.username, 
        subject: test.subject, 
        class: test.class,
        enrolledSubjects: req.user.enrolledSubjects 
      });
      return res.status(403).json({ error: 'You are not enrolled in this subject/class.' });
    } else if (req.user.role !== 'admin' && req.user.role !== 'teacher' && req.user.role !== 'student') {
      console.log('Tests route - Access denied:', { user: req.user.username });
      return res.status(403).json({ error: 'Access restricted to authorized users.' });
    }
    test.questions = test.questions || [];
    console.log('Tests route - Success:', { 
      testId: test._id, 
      questionCount: test.questions.length, 
      questions: test.questions.map(q => ({ _id: q._id, text: q.text }))
    });
    res.json(test);
  } catch (error) {
    console.error('Tests route - Error:', {
      error: error.message,
      testId: req.params.testId,
      user: req.user.username,
      stack: error.stack
    });
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:testId/results', auth, async (req, res) => {
  try {
    console.log('Tests route - Fetching results:', { testId: req.params.testId, user: req.user.username });
    if (!mongoose.isValidObjectId(req.params.testId)) {
      console.log('Tests route - Invalid test ID:', { testId: req.params.testId });
      return res.status(400).json({ error: 'Invalid test ID format.' });
    }
    const test = await Test.findById(req.params.testId);
    if (!test) {
      console.log('Tests route - Test not found:', { testId: req.params.testId });
      return res.status(404).json({ error: 'Test not found.' });
    }
    if (
      req.user.role === 'teacher' &&
      !req.user.subjects.some(sub => sub.subject === test.subject && sub.class === test.class)
    ) {
      console.log('Tests route - Not assigned:', {
        user: req.user.username,
        subject: test.subject,
        class: test.class,
        userSubjects: req.user.subjects
      });
      return res.status(403).json({ error: 'You are not assigned to this subject/class.' });
    } else if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      console.log('Tests route - Access denied:', { user: req.user.username });
      return res.status(403).json({ error: 'Access restricted to teachers or admins.' });
    }
    const results = await Result.find({ testId: req.params.testId })
      .populate('userId', 'username name')
      .populate({
        path: 'testId',
        populate: { path: 'questions', select: '_id text correctAnswer' }
      });
    console.log('Tests route - Results fetched:', { count: results.length, testId: req.params.testId });
    res.json(results);
  } catch (error) {
    console.error('Tests route - Results error:', {
      error: error.message,
      testId: req.params.testId,
      user: req.user.username,
      stack: error.stack
    });
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', auth, teacherOnly, async (req, res) => {
  try {
    const { title, subject, class: className, session, instructions, duration, randomize, availability, questions, questionCount } = req.body;
    console.log('Tests route - Updating test:', { id: req.params.id, user: req.user.username, payload: req.body });
    if (!mongoose.isValidObjectId(req.params.id)) {
      console.log('Tests route - Invalid test ID:', { id: req.params.id });
      return res.status(400).json({ error: 'Invalid test ID format.' });
    }
    const test = await Test.findById(req.params.id);
    if (!test) {
      console.log('Tests route - Test not found:', { id: req.params.id });
      return res.status(404).json({ error: 'Test not found.' });
    }
    const invalidFields = [];
    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) invalidFields.push('title');
    if (subject !== undefined && (typeof subject !== 'string' || subject.trim() === '')) invalidFields.push('subject');
    if (className !== undefined && (typeof className !== 'string' || className.trim() === '')) invalidFields.push('class');
    if (duration !== undefined && (isNaN(Number(duration)) || Number(duration) < 1)) invalidFields.push('duration');
    if (availability && !availability.start) invalidFields.push('availability.start');
    if (session !== undefined && (typeof session !== 'string' || session.trim() === '')) invalidFields.push('session');
    if (questionCount !== undefined && (isNaN(Number(questionCount)) || Number(questionCount) < 1)) invalidFields.push('questionCount');
    if (invalidFields.length > 0) {
      console.log('Tests route - Invalid fields:', invalidFields);
      return res.status(400).json({ error: `Invalid fields: ${invalidFields.join(', ')}` });
    }
    const parsedQuestionCount = questionCount !== undefined ? Number(questionCount) : test.questionCount;
    const parsedDuration = duration !== undefined ? Number(duration) : test.duration;
    if (availability && availability.end && new Date(availability.end) <= new Date(availability.start)) {
      console.log('Tests route - Invalid date range:', { start: availability.start, end: availability.end });
      return res.status(400).json({ error: 'End date must be after start date' });
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
      if (questions.length > parsedQuestionCount) {
        console.log('Tests route - Too many questions:', { parsedQuestionCount, questionsLength: questions.length });
        return res.status(400).json({ error: `Number of questions (${questions.length}) exceeds question count (${parsedQuestionCount}).` });
      }
    }
    if (title !== undefined) test.title = title;
    if (subject !== undefined) test.subject = subject;
    if (className !== undefined) test.class = className;
    if (session !== undefined) test.session = session;
    if (instructions !== undefined) test.instructions = instructions;
    if (duration !== undefined) test.duration = parsedDuration;
    if (randomize !== undefined) test.randomize = randomize;
    if (availability !== undefined) test.availability = availability;
    if (questions !== undefined) test.questions = questions || [];
    if (questionCount !== undefined) test.questionCount = parsedQuestionCount;
    await test.save();
    console.log('Tests route - Updated:', { testId: test._id });
    res.json(test);
  } catch (error) {
    console.error('Tests route - Error:', {
      error: error.message,
      request: req.body,
      stack: error.stack
    });
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:testId', auth, async (req, res) => {
  try {
    console.log('Tests route - Deleting test:', { testId: req.params.testId, user: req.user.username });
    if (!mongoose.isValidObjectId(req.params.testId)) {
      console.log('Tests route - Invalid test ID:', { testId: req.params.testId });
      return res.status(400).json({ error: 'Invalid test ID format.' });
    }
    const test = await Test.findById(req.params.testId);
    if (!test) {
      console.log('Tests route - Test not found:', { testId: req.params.testId });
      return res.status(404).json({ error: 'Test not found.' });
    }
    if (req.user.role !== 'admin' && test.createdBy.toString() !== req.user.userId) {
      console.log('Tests route - Access denied:', { user: req.user.username });
      return res.status(403).json({ error: 'Access restricted to test creator or admins.' });
    }
    await Test.deleteOne({ _id: req.params.testId });
    await Result.deleteMany({ testId: req.params.testId });
    console.log('Tests route - Deleted test and results:', { testId: req.params.testId });
    res.json({ message: 'Test and related results deleted successfully.' });
  } catch (error) {
    console.error('Tests route - Error:', {
      error: error.message,
      stack: error.stack
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
      return res.status(400).json({ error: 'Invalid test ID format.' });
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
    if (test.questions.length !== test.questionCount) {
      console.log('Tests route - Question count mismatch:', { testId: test._id, questions: test.questions.length, questionCount: test.questionCount });
      return res.status(400).json({ error: 'Test questions do not match the specified question count.' });
    }
    let score = 0;
    const totalQuestions = test.questions.length;
    const results = test.questions.map(q => {
      const selectedAnswer = answers instanceof Map ? answers.get(q._id.toString()) : answers[q._id];
      const isCorrect = selectedAnswer === q.correctAnswer;
      if (isCorrect) score += 1;
      return {
        questionId: q._id,
        selectedAnswer: selectedAnswer || null,
        isCorrect,
      };
    });
    const result = new Result({
      userId,
      testId: req.params.id,
      answers: Object.fromEntries(Object.entries(answers)),
      score,
      totalQuestions,
      submittedAt: new Date(),
      subject: test.subject,
      class: test.class,
      session: test.session,
    });
    await result.save();
    console.log('Tests route - Submission success:', { testId: req.params.id, score });
    res.json({ message: 'Test submitted' });
  } catch (error) {
    console.error('Tests route - Submission error:', {
      error: error.message,
      request: req.body,
      stack: error.stack
    });
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/results/:resultId', auth, adminOnly, async (req, res) => {
  try {
    const { score, answers } = req.body;
    console.log('Tests route - Updating result:', { resultId: req.params.resultId, user: req.user.username });
    if (!mongoose.isValidObjectId(req.params.resultId)) {
      console.log('Tests route - Invalid result ID:', { resultId: req.params.resultId });
      return res.status(400).json({ error: 'Invalid result ID format.' });
    }
    const result = await Result.findById(req.params.resultId);
    if (!result) {
      console.log('Tests route - Result not found:', { resultId: req.params.resultId });
      return res.status(404).json({ error: 'Result not found.' });
    }
    if (score !== undefined) {
      if (isNaN(score) || score < 0 || score > result.totalQuestions) {
        console.log('Tests route - Invalid score:', { score, totalQuestions: result.totalQuestions });
        return res.status(400).json({ error: 'Score must be a number between 0 and total questions.' });
      }
      result.score = score;
    }
    if (answers !== undefined) {
      if (typeof answers !== 'object' || Object.keys(answers).length === 0) {
        console.log('Tests route - Invalid answers:', { answers });
        return res.status(400).json({ error: 'Answers must be a non-empty object.' });
      }
      result.answers = Object.fromEntries(Object.entries(answers));
    }
    await result.save();
    console.log('Tests route - Result updated:', { resultId: result._id });
    res.json(result);
  } catch (error) {
    console.error('Tests route - Result update error:', {
      error: error.message,
      resultId: req.params.resultId,
      stack: error.stack
    });
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;