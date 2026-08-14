const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  seedDemoAccount,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.get('/me', protect, getMe);
router.post('/demo', seedDemoAccount);

module.exports = router;
