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
const validate = require('../middleware/validate');
const { createRecurringSchema, updateRecurringSchema } = require('../validators/recurringValidator');

router.use(protect);

router.route('/')
  .get(getRecurringExpenses)
  .post(validate(createRecurringSchema), createRecurringExpense);

router.get('/:id/history', getRecurringHistory);
router.post('/:id/pay', recordRecurringPayment);

router.route('/:id')
  .put(validate(updateRecurringSchema), updateRecurringExpense)
  .delete(deleteRecurringExpense);

module.exports = router;
