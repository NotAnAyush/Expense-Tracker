const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  parseOrder,
  syncOrder,
  getPlatforms,
  handleWebhook,
} = require('../controllers/ecommerceController');

// Private Routes (Protected)
router.post('/parse-order', protect, parseOrder);
router.post('/sync-order', protect, syncOrder);
router.get('/platforms', protect, getPlatforms);

// Public Webhook Route (Token Authenticated)
router.post('/webhook/:token', handleWebhook);

module.exports = router;
