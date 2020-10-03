const db = require('../models/models');

const roundone = async () => {
    await db.User.updateMany({}, { $set: { round: 2 } });
};

roundone();
