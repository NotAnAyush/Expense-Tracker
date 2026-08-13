const express = require('express');
const router = express.Router();
const {
  getRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  getRecurringHistory,
  recordRecurringPayment,
} = require('../controllers/recurringController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getRecurringExpenses)
  .post(createRecurringExpense);

router.get('/:id/history', getRecurringHistory);
router.post('/:id/pay', recordRecurringPayment);

router.route('/:id')
  .put(updateRecurringExpense)
  .delete(deleteRecurringExpense);

module.exports = router;
