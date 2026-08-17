const express = require('express');
const { SimulationController } = require('../controllers/simulationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/context', SimulationController.getSimulationContext);
router.post('/what-if', SimulationController.simulateWhatIf);
router.post('/monte-carlo', SimulationController.simulateMonteCarlo);

module.exports = router;
