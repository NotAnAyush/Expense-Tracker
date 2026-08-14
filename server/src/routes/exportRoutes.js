const express = require('express');
const router = express.Router();
const { exportExpenses } = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/expenses', exportExpenses);

module.exports = router;
