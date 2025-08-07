const mongoose = require('mongoose');
const RSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  score: Number,
  timeTaken: Number,
  date: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Result', RSchema);
