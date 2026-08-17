const express = require('express');
const router = express.Router();
const { getAnalyticsOverview, getCashFlow, getFinancialHealth } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getAnalyticsOverview);
router.get('/cashflow', getCashFlow);
router.get('/financial-health', getFinancialHealth);

module.exports = router;
