const express = require('express');
const router = express.Router();
const {
  getIncomes,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeSummary,
} = require('../controllers/incomeController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createIncomeSchema, updateIncomeSchema } = require('../validators/incomeValidator');

router.use(protect);

router.route('/')
  .get(getIncomes)
  .post(validate(createIncomeSchema), createIncome);

router.get('/summary', getIncomeSummary);

router.route('/:id')
  .get(getIncomeById)
  .put(validate(updateIncomeSchema), updateIncome)
  .delete(deleteIncome);

module.exports = router;
