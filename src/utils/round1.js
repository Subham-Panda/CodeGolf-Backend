const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { User, Leaderboard } = require('../models/models');

dotenv.config({ path: './.env' });
const DB = process.env.DB_URL.replace('<password>', process.env.DB_PASSWORD);
mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('DB connections successful'));

const roundone = async () => {
    await User.updateMany({}, { $set: { round: 2 } });
    await Leaderboard.updateMany({}, { users: [] });
    const leaderboard = await Leaderboard.findOne({ questionName: 'Global' });
    const usersArray = [];
    let i;
    for (i = 0; i < leaderboard.users.length; i += 1) {
        const name = leaderboard.users[i].username;
        usersArray.push({
            username: name,
            score: 0,
            sLength: 9999999,
            code: '',
            latestTime: Date.now(),
        });
    }
    await Leaderboard.updateOne(
        { questionName: 'Global' },
        { $set: { users: usersArray } },
    );
};
roundone();
