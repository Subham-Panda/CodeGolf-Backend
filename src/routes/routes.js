const express = require('express');
const controller = require('../controllers/controllers');

const router = express.Router();

router.post('/login', controller.login);
// router.post('/putdata', controller.putDummyData);
// router.use(controller.isLoggedIn);
router.get('/questions', controller.getQuestions);
router.get('/leaderboards', controller.getLeaderboards);
router.post('/submissions', controller.submit);

module.exports = router;
