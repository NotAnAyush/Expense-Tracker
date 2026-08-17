const express = require('express');
const router = express.Router();
const {
  verifyVpa,
  initiateAccountLink,
  verifyAccountOtp,
  getLinkedAccounts,
  unlinkAccount,
  handleUpiWebhook,
  ingestDeviceNotification,
  generateUpiIntent,
} = require('../controllers/upiIntegrationController');
const { protect } = require('../middleware/auth');

// Public Webhook route for payment gateways & bank aggregators (secured via HMAC-SHA256)
router.post('/webhook', handleUpiWebhook);

// Protected routes for authenticated user
router.use(protect);

router.get('/verify-vpa', verifyVpa);
router.post('/accounts/link-initiate', initiateAccountLink);
router.post('/accounts/verify-otp', verifyAccountOtp);
router.get('/accounts', getLinkedAccounts);
router.delete('/accounts/:id', unlinkAccount);
router.post('/device-notification', ingestDeviceNotification);
router.post('/generate-intent', generateUpiIntent);

module.exports = router;
