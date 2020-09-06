const express = require('express');
const dotenv = require('dotenv');

const app = express();

dotenv.config();
require('./models/db');

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
