const asyncHandler = require('../utils/asyncHandler');
const BrokerClient = require('../services/market/brokerClient');
const SchemeRadarService = require('../services/market/schemeRadarService');
const MacroService = require('../services/market/macroService');
const ScamShieldEngine = require('../services/market/scamShieldEngine');
const QuantitativeEngine = require('../services/market/quantitativeEngine');
const ArbitrageSolver = require('../services/market/arbitrageSolver');

exports.getQuotes = asyncHandler(async (req, res) => {
  const symbols = req.query.symbols ? req.query.symbols.split(',').map((s) => s.trim()) : undefined;
  const forceRefresh = req.query.refresh === 'true' || req.query.force === 'true';
  const quotes = await BrokerClient.getQuotes(symbols, forceRefresh);
  res.json({ quotes, timestamp: new Date().toISOString() });
});

exports.getSchemes = asyncHandler(async (req, res) => {
  const forceRefresh = req.query.refresh === 'true' || req.query.force === 'true';
  const schemes = await SchemeRadarService.getVerifiedSchemes(forceRefresh);
  res.json(schemes);
});

exports.getMacroIndicators = asyncHandler(async (req, res) => {
  const forceRefresh = req.query.refresh === 'true' || req.query.force === 'true';
  const macro = await MacroService.getMacroIndicators(forceRefresh);
  res.json(macro);
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
