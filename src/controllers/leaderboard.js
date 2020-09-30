/* eslint-disable max-len */
const Bull = require('bull');

const Queue = new Bull('queue');

const db = require('../models/models');

const leaderboard = db.Leaderboard.find().toArray();
const question = db.Question.find().toArray();
const mainLeaderboard = leaderboard[leaderboard.findIndex((o) => o.questionName === 'Global')].users;
const ranks = {};
mainLeaderboard.forEach((item) => {
    ranks.item.user = mainLeaderboard.indexOf(item.user);
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
    // 1. get questionLeaderboard, leaderboard
    const { points } = question[question.findIndex((o) => o.questionName === job.questionName)];
    const questionLeaderboard = leaderboard[leaderboard.findIndex((o) => o.questionName === job.questionName)].users;

    // 2.  if its first submission, then add the user with 0 points
    if (!job.hasSolved) {
        questionLeaderboard.push({
            user: job.user,
            score: 0,
            questionsSolved: 1,
            sLength: 0,
            latestTime: job.time,
        });
    }
    // 3. check if code of current user shorter than best length
    let bestLength = questionLeaderboard[0].sLength;
    if (job.sLength < bestLength) {
        bestLength = job.sLength;
    }
    //         b. Update everyone's scores in the question leaderboard, with a .map(u)
    //                     store u's old_points in a variable
    //                     if u == current user, then score = question.points
    //                     if not , then score = formula(best length)
    //             extract out ranks[u], using that, extract out the user object in the global leaderboard
    //                     global_leaderboard = current_points - old_points + new_points

    questionLeaderboard.map((u) => {
        const { user } = u;
        const index = ranks.user;
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
        mainLeaderboard[index].users = {
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

    // UPDATE ranks map !!
    mainLeaderboard.forEach((item) => {
        ranks.item.user = mainLeaderboard.indexOf(item.user);
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

    leaderboard[leaderboard.findIndex((o) => o.questionName === 'Global')].users = mainLeaderboard;
    leaderboard[leaderboard.findIndex((o) => o.questionName === job.questionName)].users = questionLeaderboard;
}
Queue.process(async (job) => {
    task(job.data);
});
