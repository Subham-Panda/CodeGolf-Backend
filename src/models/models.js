const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
    inputs: {
        type: [String],
    },
    outputs: {
        type: [String],
    },
    questionName: {
        type: String,
        required: true,
    },
});

const questionSchema = new mongoose.Schema({
    questionName: {
        type: String,
        required: true,
        unique: true,
    },
    question: {
        type: String,
        required: true,
    },
    points: {
        type: Number,
        required: true,
    },
    round: {
        type: Number,
        required: true,
    },
    hidden: {
        type: Boolean,
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
    questionName: {
        type: String,
        required: true,
    },
    users: {
        type: [{
            username: { type: String },
            score: { type: Number, default: 0 },
            questionsSolved: { type: Number, default: 0 },
            sLength: { type: Number, default: Infinity },
            latestTime: { type: Date },
            code: { type: String, default: '' },
        }],
        required: true,
        default: [],
    },
});

const User = mongoose.model('User', userSchema);
const Question = mongoose.model('Question', questionSchema);
const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
const Testcases = mongoose.model('Testcases', testCaseSchema);
module.exports = {
    User,
    Question,
    Leaderboard,
    Testcases,
};
