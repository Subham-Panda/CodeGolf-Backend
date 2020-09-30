/* eslint-disable max-len */
const Bull = require('bull');

const Queue = new Bull('queue');

const db = require('../models/models');

const leaderboard = db.Leaderboard.find().toArray();
const question = db.Question.find().toArray();
const questionPoints = {};
question.forEach((item) => {
    questionPoints[item.questionName] = item.points;
});
const allLeaderboards = {};
leaderboard.forEach((item) => {
    allLeaderboards[item.questionName] = item.users;
});
const mainLeaderboard = allLeaderboards.Global;
const ranks = {};
mainLeaderboard.forEach((item, i) => {
    ranks[item.user] = i;
});

exports.leaderboard = async (user, questionName, time, sLength, hasSolved) => {
    const data = {
        user,
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

function task(job) {
    // get question and questionLeaderboard
    const points = questionPoints[job.questionName];
    const questionLeaderboard = allLeaderboards[job.questionName];

    // check for first submission
    if (!job.hasSolved) {
        questionLeaderboard.push({
            user: job.user,
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
        const { user } = u;
        const index = ranks[user];
        let { sLength } = u;
        const questionsSolved = mainLeaderboard[index].questionsSolved + u.questionsSolved;
        let { latestTime } = mainLeaderboard[index];
        let lTime = u.latestTime;
        if (user === job.user) {
            sLength = job.sLength;
            latestTime = job.time;
            lTime = job.time;
        }
        const score = (bestLength / sLength) * points;
        const totalLength = mainLeaderboard[index].sLength - u.sLength + sLength;
        const totalScore = mainLeaderboard[index].score - u.score + score;
        mainLeaderboard[index] = {
            user,
            score: totalScore,
            questionsSolved,
            sLength: totalLength,
            latestTime,
        };
        return {
            user,
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
        ranks[item.user] = i;
    });

    // db.update()
    db.Leaderboard.findOneAndUpdate(
        { questionName: job.questionName },
        { users: questionLeaderboard },
    );

    // db.update()
    db.Leaderboard.findOneAndUpdate(
        { questionName: 'Global' },
        { users: mainLeaderboard },
    );

    // mainLeaderboard gets updated itself, updating local copy of question-wise leaderboard
    allLeaderboards[job.questionName] = questionLeaderboard;
}
Queue.process(async (job) => {
    task(job.data);
});
