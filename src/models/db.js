const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}, (err) => {
  if (err) {
    console.log(`Error: ${err}`);
  } else {
    console.log('Mongo Connection Success');
  }
});
