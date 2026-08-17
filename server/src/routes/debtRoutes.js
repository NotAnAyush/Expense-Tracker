const express = require('express');
const { DebtController } = require('../controllers/debtController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', DebtController.getDebts);
router.post('/', DebtController.createDebt);
router.put('/:id', DebtController.updateDebt);
router.delete('/:id', DebtController.deleteDebt);
router.post('/simulate', DebtController.simulatePayoff);
router.post('/:id/pay', DebtController.logPayment);

module.exports = router;
