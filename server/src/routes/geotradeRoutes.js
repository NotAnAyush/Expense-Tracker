const express = require('express');
const router = express.Router();
const geotradeService = require('../services/geotradeService');

/**
 * @route   GET /api/geotrade/gti
 * @desc    Get Global Tension Index (GTI) summary & regional breakdown
 * @access  Public / Authenticated
 */
router.get('/gti', async (req, res) => {
  try {
    await geotradeService.fetchLiveGeopoliticalEvents().catch(() => {});
    const data = geotradeService.getGlobalGTI();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/geotrade/countries
 * @desc    Get sovereign countries with live GTI scores
 * @access  Public / Authenticated
 */
router.get('/countries', (req, res) => {
  try {
    const countries = geotradeService.getCountries();
    res.json({ success: true, data: countries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/geotrade/hotspots
 * @desc    Get active conflict & chokepoint flashpoints
 * @access  Public / Authenticated
 */
router.get('/hotspots', (req, res) => {
  try {
    const hotspots = geotradeService.getHotspots();
    res.json({ success: true, data: hotspots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/geotrade/arcs
 * @desc    Get bilateral geopolitical tension & trade risk arcs
 * @access  Public / Authenticated
 */
router.get('/arcs', (req, res) => {
  try {
    const arcs = geotradeService.getTensionArcs();
    res.json({ success: true, data: arcs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/geotrade/signals
 * @desc    Get AI quantitative trade signals with 4-step reasoning chains
 * @access  Public / Authenticated
 */
router.get('/signals', async (req, res) => {
  try {
    await geotradeService.fetchLiveMarketQuotes().catch(() => {});
    const signals = geotradeService.getSignals();
    res.json({ success: true, data: signals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/geotrade/impact/:iso
 * @desc    Get country-specific financial impact, asset quotes, and candlestick timeseries
 * @access  Public / Authenticated
 */
router.get('/impact/:iso', async (req, res) => {
  try {
    await geotradeService.fetchLiveMarketQuotes().catch(() => {});
    const impact = geotradeService.getCountryMarketImpact(req.params.iso);
    res.json({ success: true, data: impact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
