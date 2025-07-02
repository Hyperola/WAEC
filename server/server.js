require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const testRoutes = require('./routes/tests');
const resultRoutes = require('./routes/results');
const analyticsRoutes = require('./routes/analytics');
const cheatLogRoutes = require('./routes/cheat-logs');
const classRoutes = require('./routes/classes');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Routes
console.log('Mounting routes...');
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/cheat-logs', cheatLogRoutes);
app.use('/api/classes', classRoutes);

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://sodiqolaniyisanni:Controller1@cluster0.gw4ko28.mongodb.net/waec-cbt?retryWrites=true&w=majority');
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));