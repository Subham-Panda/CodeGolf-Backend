const Bull = require('bull');

const Queue = new Bull('queue');

const db = require('../models/models');

exports.leaderboard = async (user, questionNo, time, sLength) => {
    const data = {
        user,
        questionNo,
        time,
        sLength,

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
        if (a.questionsSolved !== b.questionsSolved) return a.questionsSolved - b.questionsSolved;

        return compareLength(a, b);
    };

    const compareScore = (a, b) => {
        if (a.score !== b.score) return b.score - a.score;

        return compareNo(a, b);
    };
    arr.sort(compareScore);
}

function task(job) {
    const question = db.Question.findOne({ questionNo: job.questionNo });
    const questionLeaderboard = db.Leaderboard.findOne({ questionNo: job.questionNo });
    const leaderboard = db.Leaderboard.findOne({ questionNo: 0 }).users;

    // to calculate score for question
    let bestLength;

    if (questionLeaderboard.users.length !== 0) {
        bestLength = questionLeaderboard.users[0].sLength;
        if (bestLength > job.sLength) {
            let newLeaderboard = leaderboard;
            const newQleaderboard = [];
            // updating every user's scores
            questionLeaderboard.users.forEach((item) => {
                const newScore = (job.sLength / item.sLength) * (question.points);
                newQleaderboard.push({
                    user: item.user,
                    score: newScore,
                    questionsSolved: item.questionsSolved,
                    sLength: item.sLength,
                    latestTime: item.latestTime,
                });
                // eslint-disable-next-line max-len
                const leaderboardUser = leaderboard[leaderboard.findIndex((o) => o.user === item.user)];
                newLeaderboard = newLeaderboard.filter((item1) => item1 !== leaderboardUser);
                const updatedScore = leaderboardUser.score - item.score + newScore;
                newLeaderboard.push({
                    user: leaderboardUser.user,
                    score: updatedScore,
                    questionsSolved: leaderboardUser.questionsSolved,
                    sLength: leaderboardUser.sLength,
                    latestTime: leaderboardUser.latestTime,
                });
                sorting(newLeaderboard);
                db.Leaderboard.findOneAndUpdate(
                    { questionNo: 0 },
                    { users: newLeaderboard },
                );
            });
            db.Leaderboard.findOneAndUpdate(
                { questionNo: job.questionNo },
                { users: newQleaderboard },
            );
            bestLength = job.sLength;
        }
    } else {
        bestLength = job.sLength;
    }
    const score = (bestLength / job.sLength) * (question.points);

    // updating score and questionsSolved
    const mainUser = leaderboard[leaderboard.findIndex((o) => o.user === job.user)];
    let newScore = mainUser.score;
    let qSolved = mainUser.questionsSolved;
    let length = mainUser.sLength;
    for (let i = 0; i < questionLeaderboard.users.length; i += 1) {
        if (questionLeaderboard.users[i].user === job.user) {
            newScore -= questionLeaderboard.users[i].score;
            qSolved -= 1;
            length -= questionLeaderboard.users[i].sLength;
            break;
        }
    }
    newScore += score;
    qSolved += 1;
    length += job.sLength;

    // updating leaderboards
    let newQuestionLeaderboard = db.Leaderboard.findOne({ questionNo: job.questionNo }).users;
    // eslint-disable-next-line max-len
    const questionLeaderboardUser = newQuestionLeaderboard[newQuestionLeaderboard.findIndex((o) => o.user === job.user)];
    // eslint-disable-next-line max-len
    newQuestionLeaderboard = newQuestionLeaderboard.filter((item) => item !== questionLeaderboardUser);
    let newLeaderboard = db.Leaderboard.findOne({ questionNo: 0 }).users;
    const leaderboardUser = newLeaderboard[newLeaderboard.findIndex((o) => o.user === job.user)];
    newLeaderboard = newLeaderboard.filter((item) => item !== leaderboardUser);

    newQuestionLeaderboard.push({
        user: job.user,
        score,
        questionsSolved: qSolved,
        sLength: job.sLength,
        latestTime: job.time,
    });
    newLeaderboard.push({
        user: job.user,
        score: newScore,
        questionsSolved: qSolved,
        sLength: length,
        latestTime: job.time,
    });

    sorting(newQuestionLeaderboard);

    db.Leaderboard.findOneAndUpdate(
        { questionNo: job.questionNo },
        { users: newQuestionLeaderboard },
    );

    sorting(newLeaderboard);
    db.Leaderboard.findOneAndUpdate(
        { questionNo: 0 },
        { users: newLeaderboard },
    );
}

Queue.process(async (job) => {
    task(job.data);
});
