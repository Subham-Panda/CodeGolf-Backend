import { idValidation, submissionValidation } from './validation';

const jwt = require('jsonwebtoken');
// const data = require('./data.json');

const {
    User,
    Question,
    Leaderboard,
    Testcases,
} = require('../models/models.js');
const executeCode = require('./code-executor');
const updateLeaderboard = require('./leaderboard');

// TO CHECK IF USER EXISTS AND SEND JWT
exports.login = async (req, res) => {
    try {
        // Get token id of user from body
        const { loginToken } = req.body;
        const valid = idValidation.validate({ id: loginToken });
        if (valid.error) {
            return res.status(400).json({
                success: true,
                error: 'validationError',
                message: valid.error.message,
            });
        }

        // Check if user exists
        const currentUser = await User.find({ loginToken });

        // Send error message is user doesn't exist

        if (!currentUser) {
            return res.status(403).json({
                status: 'failure',
                error: 'invalid login url',
            });
        }

        // Sign token and send it if user exists
        const token = jwt.sign({ loginToken }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
        return res.status(200).json({
            status: 'success',
            token,
        });
    } catch (error) {
        return res.status(401).json({
            status: 'failure',
            error: 'unsuccessful login',
        });
    }
};

// CHECK IF USER IS LOGGED IN
// eslint-disable-next-line consistent-return
exports.isLoggedIn = async (req, res, next) => {
    // Get authorization header
    const token = req.headers.authorization;
    // console.log('ISLOGGEDDIN: ', token);

    // Send error message if no authorization header
    if (!token) {
        return res.status(403).json({
            status: 'failure',
            error: 'not logged in',
        });
    }

    // If authorization header exists get the bearer token and verify it
    try {
        const loginToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ loginToken: loginToken.loginToken });
        req.user = user;
        req.loginToken = loginToken.loginToken;
        next();
    } catch (error) {
        return res.sendStatus(401);
    }
};

exports.getUser = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const loginToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ loginToken: loginToken.loginToken });
        if (user) {
            return res.json({
                status: 'success',
                user,
                currentRound: process.env.ROUND,
            });
        }
        return res.json({
            status: 'failure',
        });
    } catch (error) {
        console.log(error);
    }
    return null;
};

// GET DETAILS ABOUT ALL THE QUESTIONS DETAILS FROM DB
exports.getQuestions = async (req, res) => {
    try {
        const questions = await Question.find({ round: process.env.ROUND });
        // console.log('Questions: ', questions);
        return res.status(200).json({
            status: 'success',
            questions,
        });
    } catch (error) {
        return res.status(402).json({
            status: 'failure',
            error: 'Error fetching questions',
        });
    }
};

// GET THE LEADER BOARD FOR A PARTICULAR QUESTION
exports.getLeaderboards = async (req, res) => {
    try {
        const { user } = req;
        // Fetch leaderboard
        const leaderboards = await Leaderboard.find();
        leaderboards.forEach((leaderboard) => {
            let indexOfUser = leaderboard.users.findIndex(
                (induser) => induser.username === user.username,
            );
            indexOfUser = indexOfUser === -1 ? Infinity : indexOfUser;
            leaderboard.users.forEach(
                (induser, i) => {
                    if (i < indexOfUser) {
                        delete induser.code;
                    }
                },
            );
        });
        // Else send success and the leaderboards
        return res.status(200).json({
            status: 'success',
            leaderboards,
        });
    } catch (error) {
        return res.status(401).json({
            status: 'failure',
            error: 'Error fetching leaderboard',
        });
    }
};

// SUBMIT THE RESPONSE TO CALCULATE AND UPDATE DB AND LEADERBOARD IF REQUIRED
exports.submit = async (req, res) => {
    // // Send submission to compiler and get response
    const {
        questionName, code, language, submitTime,
    } = req.body;

    const valid = submissionValidation.validate({
        questionName,
        code,
        language,
        submitTime,
    });
    if (valid.error) {
        return res.status(400).json({
            success: true,
            error: 'validationError',
            message: valid.error.message,
        });
    }

    const testCases = await Testcases.findOne({ questionName });

    const inputArray = testCases.inputs;
    const outputArray = testCases.outputs;

    const testCasesCE = [];

    inputArray.forEach((input, i) => {
        const obj = {};
        obj.input = input.replace(/\r/g, '');
        obj.output = outputArray[i].replace(/\r/g, '');
        testCasesCE.push(obj);
    });

    const compilerResponse = await executeCode(language, code, testCasesCE);
    // console.log('LOGIN TOKEN IN REQ: ', req.loginToken);
    const currentUser = await User.findOne({ loginToken: req.loginToken });
    console.log(currentUser);

    const currentQsLeaderboard = await Leaderboard.find({ questionName });
    console.log(currentQsLeaderboard);
    const currentUserInLeaderboard = currentQsLeaderboard[0].users.find(
        (user) => user.username === currentUser.username,
    );
    console.log('currentUserInLeaderboard', currentUserInLeaderboard);
    const allTestCasesPass = !compilerResponse.tests.find(
        (test) => test.remarks !== 'Pass',
    );
    // console.log('allTEstCases PAss', allTestCasesPass);
    if (allTestCasesPass) {
        console.log('REACHED CHECKPOINT 1');
        if (
            !currentUserInLeaderboard
            || currentUserInLeaderboard.sLength > code.length
        ) {
            // If not exists update score and return success message
            // OR
            // If better submission then update score and return success message

            // eslint-disable-next-line no-undef
            console.log('REACHED CHECKPOINT 2');
            const hasSolved = !!currentUserInLeaderboard;
            updateLeaderboard(
                currentUser.username,
                questionName,
                submitTime,
                code.length,
                hasSolved,
                code,
            );
            console.log('REACHED CHECKPOINT 3');
            return res.status(200).json({
                status: 'success',
                message: 'Submission Successful',
                compilerResponse,
            });
        }
        // Return better submission for the question already submitted
        return res.json({
            status: 'failure',
            message: 'Better submission already done',
            compilerResponse,
        });
    }
    // console.log('reached here');
    return res.json({
        status: 'failure',
        message: 'Did not pass all test cases',
        compilerResponse,
    });
};

// exports.putDummyData = async (req, res) => {
//     // const newDoc = await Leaderboard.create(req.body);
//     // res.send(newDoc);

//     // const newDocs = [];
//     // await Object.keys(data).forEach(async (email) => {
//     //     const splits = data[email].split('/');
//     //     const loginToken = splits[splits.length - 1];
//     //     const obj = {
//     //         username: email.split('@')[0],
//     //         email,
//     //         loginToken,
//     //         round: 1,
//     //     };
//     //     const newDoc = await Leaderboard.create(obj);
//     //     newDocs.push[newDoc];
//     // });

//     // const users = [];
//     // Object.keys(data).forEach((email) => {
//     //     const username = email.split('@')[0];
//     //     users.push({
//     //         username,
//     //         score: 0,
//     //         questionsSolved: 0,
//     //         sLength: 9999999,
//     //         latestTime: Date.now(),
//     //         code: '',
//     //     });
//     // });
//     // users.push({
//     //     username: 'Ashikka',
//     //     score: 5000,
//     //     questionsSolved: 1,
//     //     sLength: 20,
//     //     latestTime: Date.now(),
//     //     code: '',
//     // });
//     // users.push({
//     //     username: 'Arushi',
//     //     score: 3000,
//     //     questionsSolved: 1,
//     //     sLength: 30,
//     //     latestTime: Date.now(),
//     //     code: '',
//     // });
//     // users.push({
//     //     username: 'Subham',
//     //     score: 2000,
//     //     questionsSolved: 1,
//     //     sLength: 40,
//     //     latestTime: Date.now(),
//     //     code: '',
//     // });
//     // const newDoc = await Leaderboard.create({
//     //     questionName: 'Global',
//     //     users,
//     // });
//     // res.send(newDoc);
// }

exports.getSolutions = async (req, res) => {
    const { questionName, username } = req.body;
    try {
        // Fetch leaderboard
        const leaderboard = await Leaderboard.findOne({ questionName });

        const index = leaderboard.users.indexOf((o) => o.username === username);
        const worseLeaderboard = leaderboard.users.slice(
            index,
            leaderboard.users.length,
        );

        return res.status(200).json({
            status: 'success',
            worseLeaderboard,
        });
    } catch (error) {
        return res.status(401).json({
            status: 'failure',
            error: 'Error fetching leaderboard',
        });
    }
};
