/* eslint-disable max-len */
const Bull = require('bull');

const Queue = new Bull('queue');

const db = require('../models/models');

let leaderboard = [];
let question = [];
const allLeaderboards = {};
const ranks = {};
const questionPoints = {};
let mainLeaderboard = [];

const getLeaderboardAndQuestion = async () => {
    leaderboard = await db.Leaderboard.find();
    question = await db.Question.find();
    question.forEach((item) => {
        questionPoints[item.questionName] = item.points;
    });
    leaderboard.forEach((item) => {
        allLeaderboards[item.questionName] = item.users;
    });
    mainLeaderboard = allLeaderboards.Global;
    // mainLeaderboard = [
    //     {
    //         username: 'Subham',
    //         score: 500,
    //         questionsSolved: 14,
    //         sLength: 800,
    //         latestTime: Date.now(),
    //     },
    // ];
    mainLeaderboard.forEach((item, i) => {
        ranks[item.username] = i;
    });
};
getLeaderboardAndQuestion();

const updateLeaderboard = async (
    username,
    questionName,
    time,
    sLength,
    hasSolved,
) => {
    const data = {
        username,
        questionName,
        time,
        sLength,
        hasSolved,
    };
    await Queue.add(data);
};

// sorting function
function sorting(arr) {
    const compareTime = (a, b) => a.latestTime - b.latestTime;
    const compareLength = (a, b) => {
        if (a.sLength !== b.sLength) return a.sLength - b.sLength;

        return compareTime(a, b);
    };
    const compareNo = (a, b) => {
        if (a.questionsSolved !== b.questionsSolved) return b.questionsSolved - a.questionsSolved;

        return compareLength(a, b);
    };

    const compareScore = (a, b) => {
        if (a.score !== b.score) return b.score - a.score;

        return compareNo(a, b);
    };
    arr.sort(compareScore);
}

async function task(job) {
    // get question and questionLeaderboard
    const points = questionPoints[job.questionName];
    const questionLeaderboard = allLeaderboards[job.questionName];

    // check for first submission
    if (!job.hasSolved) {
        questionLeaderboard.push({
            username: job.username,
            score: 0,
            questionsSolved: 1,
            sLength: 0,
            latestTime: job.time,
        });
    }
    // check bestLength
    let bestLength = questionLeaderboard[0].sLength;
    if (job.sLength < bestLength) {
        bestLength = job.sLength;
    }

    // looping through every user who has solved that question in case bestLength changes including the current user
    questionLeaderboard.map((u) => {
        const { username } = u;
        const index = ranks[username];
        let { sLength } = u;
        const questionsSolved = mainLeaderboard[index].questionsSolved + u.questionsSolved;
        let { latestTime } = mainLeaderboard[index];
        let lTime = u.latestTime;
        if (username === job.username) {
            sLength = job.sLength;
            latestTime = job.time;
            lTime = job.time;
        }
        const score = (bestLength / sLength) * points;
        const totalLength = mainLeaderboard[index].sLength - u.sLength + sLength;
        const totalScore = mainLeaderboard[index].score - u.score + score;
        mainLeaderboard[index] = {
            username,
            score: totalScore,
            questionsSolved,
            sLength: totalLength,
            latestTime,
        };
        return {
            username,
            score,
            questionsSolved: 0,
            sLength,
            latestTime: lTime,
        };
    });
    // sort(gameLeaderboard)
    sorting(mainLeaderboard);

    // sort(questionleaderboard)
    sorting(questionLeaderboard);

    // updating ranks
    mainLeaderboard.forEach((item, i) => {
        ranks[item.username] = i;
    });

    // db.update()
    await db.Leaderboard.findOneAndUpdate(
        { questionName: job.questionName },
        { users: questionLeaderboard },
    );

    // db.update()
    await db.Leaderboard.findOneAndUpdate(
        { questionName: 'Global' },
        { users: mainLeaderboard },
    );

    // mainLeaderboard gets updated itself, updating local copy of question-wise leaderboard
    allLeaderboards[job.questionName] = questionLeaderboard;
}

Queue.process(async (job) => {
    await task(job.data);
});

module.exports = updateLeaderboard;
