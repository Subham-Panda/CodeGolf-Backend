const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true],
    },
    questionNo: {
        type: Number,
        required: [true],
    },
    testCases: {
        visible: {
            type: [String],
        },
        hidden: {
            type: [String],
        },
        outputs: {
            visible: {
                type: [String],
            },
            hidden: {
                type: [String],
            },
        },
    },
    points: {
        type: Number,
        required: [true],
    },
    bestLength: {
        type: Number,
        required: [true],
    },
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true],
    },
    email: {
        type: String,
        required: [true],
    },
    loginToken: {
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
        type: [
            {
                questionNo: { type: Number },
                timestamp: { type: Date },
                slength: { type: Number },
            },
        ],
    },
});

const leaderboardSchema = new mongoose.Schema({
    questionNo: {
        type: Number,
        required: [true],
    },
    users: {
        type: [{ user: { type: String }, score: { type: Number, default: 0 } }],
        required: [true],
        default: [],
    },
});

const User = mongoose.model('User', userSchema);
const Question = mongoose.model('Question', questionSchema);
const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
module.exports = {
    User,
    Question,
    Leaderboard,
};
