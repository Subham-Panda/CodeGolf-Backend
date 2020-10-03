const db = require('../models/models');

const roundtwo = async () => {
    const leaderboard = await db.Leaderboard.findOne({ questionName: 'Global' });
    let i;
    for (i = 0; i < 15; i += 1) {
        const name = leaderboard.users[i].username;
        // eslint-disable-next-line no-await-in-loop
        await db.Users.findOneAndUpdate(
            { username: name },
            { round: 3 },
        );
    }
    await db.Leaderboard.update({ questionName: 'Global' }, { $set: { users: [] } });
};

roundtwo();
