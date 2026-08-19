const express = require('express');
const router = express.Router();
const {
  getQuotes,
  getSchemes,
  getMacroIndicators,
  calculateMaturity,
  evaluateScamRisk,
  calculateDCF,
  calculatePiotroski,
  calculateAltman,
  solveArbitrage,
} = require('../controllers/marketController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/quotes', getQuotes);
router.get('/schemes', getSchemes);
router.get('/macro', getMacroIndicators);
router.post('/calculate-maturity', calculateMaturity);
router.post('/scam-check', evaluateScamRisk);
router.post('/dcf-valuation', calculateDCF);
router.post('/piotroski-score', calculatePiotroski);
router.post('/altman-score', calculateAltman);
router.post('/arbitrage-solve', solveArbitrage);

module.exports = router;
