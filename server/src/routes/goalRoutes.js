const express = require('express');
const router = express.Router();
const {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} = require('../controllers/goalController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createGoalSchema, updateGoalSchema } = require('../validators/goalValidator');

router.use(protect);

router.route('/')
  .get(getGoals)
  .post(validate(createGoalSchema), createGoal);

router.route('/:id')
  .put(validate(updateGoalSchema), updateGoal)
  .delete(deleteGoal);

module.exports = router;
