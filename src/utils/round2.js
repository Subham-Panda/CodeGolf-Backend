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

const roundtwo = async () => {
    const leaderboard = await Leaderboard.findOne({ questionName: 'Global' });
    let i;
    const usersArray = [];
    for (i = 0; i < 15; i += 1) {
        const name = leaderboard.users[i].username;
        usersArray.push({
            username: name,
            score: 0,
            sLength: 9999999,
            code: '',
            latestTime: Date.now(),
        });
        // eslint-disable-next-line no-await-in-loop
        await User.findOneAndUpdate({ username: name }, { round: 3 });
    }
    await Leaderboard.updateOne(
        { questionName: 'Global' },
        { $set: { users: usersArray } },
    );
};

roundtwo();
