const express = require('express');
const router = express.Router();
const CheatLog = require('../models/CheatLog');
const { auth } = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      console.log('CheatLogs route - Access denied:', { userId: req.user.userId, username: req.user.username });
      return res.status(403).json({ error: 'Access restricted to students' });
    }

    const { testId, userId, type } = req.body;
    console.log('CheatLogs route - Logging violation:', { testId, userId, type });

    const log = new CheatLog({
      testId,
      userId,
      type,
      timestamp: new Date(),
    });
    await log.save();

    console.log('CheatLogs route - Success:', { logId: log._id });
    res.status(201).json({ message: 'Violation logged' });
  } catch (error) {
    console.error('CheatLogs route - Error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;