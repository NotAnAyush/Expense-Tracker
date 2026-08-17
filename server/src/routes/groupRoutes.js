const express = require('express');
const { GroupController } = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', GroupController.createGroup);
router.get('/', GroupController.getGroups);
router.get('/:id', GroupController.getGroupById);
router.post('/:id/expenses', GroupController.addExpense);
router.delete('/:id/expenses/:expenseId', GroupController.deleteExpense);
router.post('/:id/settle', GroupController.recordSettlement);

module.exports = router;
