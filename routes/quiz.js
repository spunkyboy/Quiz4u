const express = require('express');
const Question = require('../models/Question');
const Result = require('../models/Result');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = 'e61bf6e901de83b627c13b0d03b05169a541fa61e08772a7df7a81ce5904a49bd981206fde7731ce8c3f27c66f020744ed65ad2c0763ef4a1451171c2a18a14c';

// JWT Middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log('📥 Received Authorization header:', authHeader);

  if (!authHeader) {
    console.log('❌ Missing Authorization header');
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('❌ Token not found in Authorization header');
    return res.status(401).json({ message: 'Token not found' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      console.log('❌ JWT verification failed:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    console.log('✅ JWT verified. Payload:', payload);
    req.userId = payload.userId;
    next();
  });
}

// Get random questions
router.get('/', auth, async (req, res) => {
  try {
    const questions = await Question.find(); //.limit(8); // Example limit
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching questions' });
  }
});


// Submit answers
router.post('/submit', auth, async (req, res) => {
  const { answers, timeTaken } = req.body;
  let score = 0;
  const questions = await Question.find({ _id: { $in: answers.map(a => a.id) } });
  answers.forEach(a => {
    const q = questions.find(q => q._id.equals(a.id));
    if (q && q.answer === a.answer) score++;
  });
  await new Result({ userId: req.userId, score, timeTaken }).save();
  res.json({ score });
});

module.exports = router;
