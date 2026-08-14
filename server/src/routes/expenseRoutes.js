const express = require('express');
const router = express.Router();
const {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createExpenseSchema, updateExpenseSchema } = require('../validators/expenseValidator');

router.use(protect);

router.get('/summary', getExpenseSummary);
router.route('/')
  .get(getExpenses)
  .post(validate(createExpenseSchema), createExpense);

router.route('/:id')
  .get(getExpenseById)
  .put(validate(updateExpenseSchema), updateExpense)
  .delete(deleteExpense);

module.exports = router;
