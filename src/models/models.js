const mongoose = require('mongoose');

const questionschema = new mongoose.Schema({
  question: {
    type: String,
    required: [true],
  },
  testcases: {
    visible: {
      type: [String],
    },
    hidden: {
      type: [String],
    },
  },
  points: {
    type: Number,
    required: [true],
  },
});

const userschema = new mongoose.Schema({
  username: {
    type: String,
    required: [true],
  },
  round: {
    type: Number,
    default: 1,
    required: [true],
  },
  rank: {
    type: Number,
  },
  points: {
    type: Number,
    required: [true],
    default: 0,
  },
  questionsSolved: {
    type: [questionschema],
  },
  timestamps: {
    type: [Date],
  },
});

const leaderboardschema = new mongoose.Schema({
  questionNo: {
    type: Number,
    required: [true],
  },
  users: {
    type: [userschema],
    required: [true],
  },
});

const User = mongoose.model('User', userschema);
const Question = mongoose.model('Question', questionschema);
const Leaderboard = mongoose.model('Leaderboard', leaderboardschema);
module.exports = {
  User,
  Question,
  Leaderboard,
};
