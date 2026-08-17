const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createSecret,
  getSecrets,
  getSecretById,
  testSecretConnection,
  rotateSecret,
  deleteSecret,
  purgeVault,
} = require('../controllers/vaultController');

// All vault routes require user authentication
router.use(protect);

router.route('/secrets')
  .post(createSecret)
  .get(getSecrets);

router.post('/purge', purgeVault);

router.route('/secrets/:id')
  .get(getSecretById)
  .delete(deleteSecret);

router.post('/secrets/:id/test', testSecretConnection);
router.put('/secrets/:id/rotate', rotateSecret);

module.exports = router;
