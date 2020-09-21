const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
    questionNo: {
        type: Number,
        required: true,
    },
    testCase: {
        type: [{ input: { type: String }, output: { type: String } }],
    },
});

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    questionNo: {
        type: Number,
        required: true,
    },
    points: {
        type: Number,
        required: true,
    },
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    loginToken: {
        type: String,
        required: true,
    },
    round: {
        type: Number,
        default: 1,
        required: true,
    },
});

const leaderboardSchema = new mongoose.Schema({
    questionNo: {
        type: Number,
        required: true,
    },
    users: {
        type: [{
            user: { type: String },
            score: { type: Number, default: 0 },
            questionsSolved: { type: Number, default: 0 },
            sLength: { type: Number, default: Infinity },
            latestTime: { type: Date },
        }],
        required: true,
        default: [],
    },
});

const User = mongoose.model('User', userSchema);
const Question = mongoose.model('Question', questionSchema);
const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
const TestCase = mongoose.model('TestCase', testCaseSchema);
module.exports = {
    User,
    Question,
    Leaderboard,
    TestCase,
};
