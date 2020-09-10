const express = require('express');
const controller = require('../controllers/controllers');

const router = express.Router();

router.post('/login', controller.login);

router.get('/questions', controller.getQuestions);
router.get('/leaderboard', controller.getLeaderboard);
router.post('/submissions', controller.submit);

export default router;
