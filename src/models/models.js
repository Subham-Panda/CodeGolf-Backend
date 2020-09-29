const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
    inputs: {
        type: [String],
    },
    outputs: {
        type: [String],
    },
    questionName: {
        type: Number,
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
    blength: {
        type: Number,
        required: true,
        default: -1,
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
    rank: {
        type: Number,
    },
    points: {
        type: Number,
        required: true,
        default: 0,
    },
    questionsSolved: {
        type: [{
            questionNo: { type: Number },
            timestamp: { type: Date },
            slength: { type: Number },
        }],
    },
});

const leaderboardSchema = new mongoose.Schema({
    questionNo: {
        type: Number,
        required: true,
    },
    users: {
        type: [{ user: { type: String }, score: { type: Number, default: 0 } }],
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
