const express = require('express');
const router = express.Router();
const {
  exportExpenses,
  exportTaxSummary,
  getFinancialStatement,
  exportFinancialStatementCsv,
} = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/expenses', exportExpenses);
router.get('/tax-summary', exportTaxSummary);
router.get('/financial-statement', getFinancialStatement);
router.get('/financial-statement/csv', exportFinancialStatementCsv);

module.exports = router;
