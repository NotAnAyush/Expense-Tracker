const express = require('express');
const router = express.Router();
const {
  suggestCategory,
  getMonthlySummaryAI,
  getSpendingExplanation,
  copilotChat,
  getInsights,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/categorize', suggestCategory);
router.get('/summary', getMonthlySummaryAI);
router.get('/explanation', getSpendingExplanation);
router.post('/copilot', copilotChat);
router.get('/insights', getInsights);

module.exports = router;
