const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  seedDemoAccount,
  refreshToken,
  logoutUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, refreshTokenSchema } = require('../validators/authValidator');
const { authLimiter, demoLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, validate(registerSchema), registerUser);
router.post('/login', authLimiter, validate(loginSchema), loginUser);
router.post('/refresh', validate(refreshTokenSchema), refreshToken);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
router.post('/demo', demoLimiter, seedDemoAccount);

module.exports = router;

