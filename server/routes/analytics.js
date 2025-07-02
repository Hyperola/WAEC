const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const Test = require('../models/Test');
const { auth } = require('../middleware/auth');

router.get('/subject/:className/:subject', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Access restricted to admins and teachers' });
    }
    const { className, subject } = req.params;
    const results = await Result.find({ class: className, subject }).populate('userId', 'username');
    if (!results.length) return res.status(404).json({ error: 'No results found' });

    const avgScore = (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(2);
    const passRate = (results.filter(r => r.score >= 50).length / results.length * 100).toFixed(2);
    const data = {
      className,
      subject,
      avgScore,
      passRate,
      studentCount: results.length,
      scores: results.map(r => ({ student: r.userId?.username || 'N/A', score: r.score })),
    };
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Access restricted to admins and teachers' });
    }
    const query = req.user.role === 'teacher'
      ? { $or: req.user.subjects.map((sub) => ({ subject: sub.subject, class: sub.class })) }
      : {};
    const tests = await Test.find(query);
    const analytics = await Promise.all(
      tests.map(async (test) => {
        const results = await Result.find({ testId: test._id }).populate('userId', 'username');
        const totalStudents = results.length;
        const completed = results.filter((r) => r.submittedAt).length;
        const completionRate = totalStudents > 0 ? ((completed / totalStudents) * 100).toFixed(2) : 0;
        const scores = results.map((r) => r.score);
        const averageScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 0;
        const topResult = results.sort((a, b) => b.score - a.score)[0];
        return {
          testId: test._id,
          testTitle: test.title,
          subject: test.subject,
          class: test.class,
          session: test.session,
          averageScore,
          completionRate,
          topStudent: topResult ? topResult.userId?.username || 'N/A' : 'N/A',
        };
      })
    );
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;