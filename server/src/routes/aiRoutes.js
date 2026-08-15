const express = require('express');
const router = express.Router();
const {
  suggestCategory,
  getMonthlySummaryAI,
  getSpendingExplanation,
  copilotChat,
  getInsights,
  getAIConfig,
  updateAIConfig,
  testConnection,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/categorize', suggestCategory);
router.get('/summary', getMonthlySummaryAI);
router.get('/explanation', getSpendingExplanation);
router.post('/copilot', copilotChat);
router.get('/insights', getInsights);

// AI Multi-Provider Configuration Endpoints
router.get('/config', getAIConfig);
router.put('/config', updateAIConfig);
router.post('/test-connection', testConnection);

module.exports = router;
