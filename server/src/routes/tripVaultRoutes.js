const express = require('express');
const { TripVaultController } = require('../controllers/tripVaultController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', TripVaultController.getTrips);
router.post('/', TripVaultController.createTrip);
router.get('/:id', TripVaultController.getTripById);
router.post('/:id/expenses', TripVaultController.addTripExpense);
router.delete('/:id/expenses/:expenseId', TripVaultController.deleteTripExpense);

module.exports = router;
