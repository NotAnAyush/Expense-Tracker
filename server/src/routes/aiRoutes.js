const express = require('express');
const router = express.Router();
const {
  suggestCategory,
  getMonthlySummaryAI,
  getSpendingExplanation,
  copilotChat,
  copilotChatStream,
  scanReceipt,
  getHealthScore,
  getInsights,
  scanReceipt,
  getAIConfig,
  updateAIConfig,
  testConnection,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/categorize', suggestCategory);
router.post('/receipt-scan', scanReceipt);
router.get('/summary', getMonthlySummaryAI);
router.get('/explanation', getSpendingExplanation);
router.post('/copilot', copilotChat);
router.post('/copilot/stream', copilotChatStream);
router.post('/receipt-scan', scanReceipt);
router.get('/health-score', getHealthScore);
router.get('/insights', getInsights);

// AI Multi-Provider Configuration Endpoints
router.get('/config', getAIConfig);
router.put('/config', updateAIConfig);
router.post('/test-connection', testConnection);

module.exports = router;
