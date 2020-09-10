const express = require('express');
const questionController = require('../controllers/questionController');

const router = express.Router();

router.get('/questions', questionController.getQuestions);
router.get('/leaderboard', questionController.getLeaderboard);
router.post('/submissions', questionController.submit);
