const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const app = express();

dotenv.config({ path: './.env' });

const DB = process.env.DB_URL.replace('<password>', process.env.DB_PASSWORD);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('DB connections successful'));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`App running on port ${port}`);
});
