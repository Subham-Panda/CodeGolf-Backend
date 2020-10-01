const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const router = require('./routes/routes');

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

app.use(cors());

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

app.use('/', router);

const port = process.env.PORT || 5999;

app.listen(port, () => {
    console.log(`App running on port ${port}`);
});
