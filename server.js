 require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Question = require('./models/Question');

const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz'); // Assuming you already have this for quiz questions

const app = express();

app.use(cors());
app.use(express.json()); // For parsing JSON bodies

//Create an API route to add quiz questions
app.post('/api/questions', async (req, res) => {
  try {
    const { question, options, answer } = req.body;

    // Basic validation
    if (!question || !options || !answer) {
      return res.status(400).json({ message: 'Please provide question, options, and answer.' });
    }
    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'Options must be an array with at least 2 items.' });
    }
    if (!options.includes(answer)) {
      return res.status(400).json({ message: 'Answer must be one of the options.' });
    }

    const newQuestion = new Question({ question, options, answer });
    await newQuestion.save();

    res.status(201).json({ message: 'Question added successfully', question: newQuestion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE a question by ID
app.delete('/api/questions/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Question.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error.message);
    res.status(500).json({ message: 'Server error while deleting question' });
  }
});

// GET all quiz questions
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error.message);
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
});

mongoose.connect('mongodb+srv://quizNEWadmin:Ad4LBjOWtOfNNLqH@masterquiz.i2fje.mongodb.net/quizdb?retryWrites=true&w=majority')
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(console.error);


app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
