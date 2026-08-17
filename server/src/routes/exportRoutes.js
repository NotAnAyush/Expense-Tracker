const express = require('express');
const router = express.Router();
const { exportExpenses, exportTaxSummary } = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/expenses', exportExpenses);
router.get('/tax-summary', exportTaxSummary);

module.exports = router;
