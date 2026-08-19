const express = require('express');
const { TripVaultController } = require('../controllers/tripVaultController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/rates', TripVaultController.getFxRates);
router.post('/convert', TripVaultController.convertCurrency);

module.exports = router;
