const asyncHandler = require('../utils/asyncHandler');
const BrokerClient = require('../services/market/brokerClient');
const SchemeRadarService = require('../services/market/schemeRadarService');
const ScamShieldEngine = require('../services/market/scamShieldEngine');
const QuantitativeEngine = require('../services/market/quantitativeEngine');
const ArbitrageSolver = require('../services/market/arbitrageSolver');

exports.getQuotes = asyncHandler(async (req, res) => {
  const symbols = req.query.symbols ? req.query.symbols.split(',').map((s) => s.trim()) : undefined;
  const quotes = await BrokerClient.getQuotes(symbols);
  res.json({ quotes, timestamp: new Date().toISOString() });
});

exports.getSchemes = asyncHandler(async (req, res) => {
  const schemes = await SchemeRadarService.getVerifiedSchemes();
  res.json(schemes);
});

exports.calculateMaturity = asyncHandler(async (req, res) => {
  const result = SchemeRadarService.calculateMaturity(req.body);
  res.json(result);
});

exports.evaluateScamRisk = asyncHandler(async (req, res) => {
  const result = ScamShieldEngine.evaluateSchemeRisk(req.body);
  res.json(result);
});

exports.calculateDCF = asyncHandler(async (req, res) => {
  const result = QuantitativeEngine.calculateDCF(req.body);
  res.json(result);
});

exports.calculatePiotroski = asyncHandler(async (req, res) => {
  const result = QuantitativeEngine.calculatePiotroskiFScore(req.body);
  res.json(result);
});

exports.calculateAltman = asyncHandler(async (req, res) => {
  const result = QuantitativeEngine.calculateAltmanZScore(req.body);
  res.json(result);
});

exports.solveArbitrage = asyncHandler(async (req, res) => {
  const result = ArbitrageSolver.solveArbitrage(req.body);
  res.json(result);
});
