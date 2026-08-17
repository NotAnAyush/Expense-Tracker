const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  getActiveSessions,
  revokeSession,
  revokeAllOtherSessions,
  resetUserData,
  deleteAccount,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateProfileSchema, changePasswordSchema } = require('../validators/userValidator');

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileSchema), updateProfile);
router.put('/password', validate(changePasswordSchema), changePassword);
router.get('/sessions', getActiveSessions);
router.delete('/sessions/:id', revokeSession);
router.delete('/sessions', revokeAllOtherSessions);
router.post('/reset-data', resetUserData);
router.delete('/account', deleteAccount);

module.exports = router;
