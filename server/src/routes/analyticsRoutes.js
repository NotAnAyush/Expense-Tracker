const express = require('express');
const router = express.Router();
const { getAnalyticsOverview, getCashFlow, getFinancialHealth, getHabitProfile } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getAnalyticsOverview);
router.get('/cashflow', getCashFlow);
router.get('/financial-health', getFinancialHealth);
router.get('/habit-profile', getHabitProfile);

module.exports = router;
