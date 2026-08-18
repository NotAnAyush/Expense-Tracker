const express = require('express');
const router = express.Router();
const {
  createVault,
  getVaults,
  addMember,
  addSharedExpense,
  getVaultSummary,
} = require('../controllers/familyController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createVault);
router.get('/', getVaults);
router.post('/:id/members', addMember);
router.post('/:id/expenses', addSharedExpense);
router.get('/:id/summary', getVaultSummary);

module.exports = router;
