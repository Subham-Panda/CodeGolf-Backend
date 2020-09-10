const jwt = require('jsonwebtoken');
const { User, Question, Leaderboard } = require('../models/models.js');

// TO CHECK IF USER EXISTS AND SEND JWT
exports.login = async (req, res) => {
    try {
        // Get token id of user from body
        const { id } = req.body;

        // Check if user exists
        const currentUser = await User.findById(id);

        // Send error message is user doesn't exist
        if (!currentUser) {
            res.status(403).json({
                status: 'failure',
                error: 'invalid login url',
            });
        }

        // Sign token and send it if user exists
        const token = jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
        res.status(200).json({
            status: 'success',
            token,
        });
    } catch (error) {
        res.status(401).json({
            status: 'failure',
            error: 'unsuccessful login',
        });
    }
};

// CHECK IF USER IS LOGGED IN
exports.isLoggedIn = (req, res, next) => {
    // Get authorization header
    const header = req.headers.authorization;

    // Send error message if no authorization header
    if (!header) {
        res.status(403).json({
            status: 'failure',
            error: 'not logged in',
        });
        return;
    }

    // If authorization header exists get the bearer token and verify it
    try {
        const bearer = header.split(' ');
        const token = bearer[1];
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        res.sendStatus(401);
    }
};

// GET DETAILS ABOUT ALL THE QUESTIONS DETAILS FROM DB
exports.getQuestions = async (req, res) => {
    try {
        const questions = await Question.find();
        res.status(200).json({
            status: 'success',
            questions,
        });
    } catch (error) {
        res.status(402).json({
            status: 'failure',
            error: 'Error fetching questions',
        });
    }
};

// GET THE LEADER BOARD FOR A PARTICULAR QUESTION
exports.getLeaderboard = async (req, res) => {
    try {
        // Get question number for req body
        const { questionNumber } = req.body;

        // Fetch leaderboard
        const questionLeaderboard = await Leaderboard.find({
            questionNo: questionNumber,
        });

        // Send error message if invalid question number
        if (!questionLeaderboard) {
            res.json({
                status: 'failure',
                error: 'Invalid question number',
            });
        }

        // Else send success and the leaderboard
        res.status(200).json({
            status: 'success',
            questionLeaderboard,
        });
    } catch (error) {
        res.status(401).json({
            status: 'failure',
            error: 'Error fetching leaderboard',
        });
    }
};

// SUBMIT THE RESPONSE TO CALCULATE AND UPDATE DB AND LEADERBOARD IF REQUIRED
exports.submit = (req, res) => {
    // Check if its a check submission or final submission
    // If check submission return the required message
    // If final submission then check if better submission
    // If better submission then return better submission exists
    // If no better submission then send code to code executer
    // If code executer returns true, then put new leaderboard update request on queue
    // If code executer returns false, then return appropriate error.
};
