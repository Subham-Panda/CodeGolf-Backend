const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { User } = require('../models/models');

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
};

roundone();
