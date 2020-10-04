const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { Question, Leaderboard } = require('./src/models/models');
dotenv.config({ path: './.env' });
const DB = process.env.DB_URL.replace('<password>', process.env.DB_PASSWORD);
mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('DB connections successful'));

const updateLDB = async () => {
    const questions = await Question.find();
    await Promise.all(
        questions.map(async (question) => {
            await Leaderboard.create({
                questionName: question.questionName,
                users: [],
            });
            console.log(`ADDED FOR ${question.questionName}`);
        }),
    );
};
updateLDB();
