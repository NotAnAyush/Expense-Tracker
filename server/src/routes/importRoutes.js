const express = require('express');
const { protect } = require('../middleware/auth');
const { previewBankStatement, commitBankStatement } = require('../controllers/importController');

const router = express.Router();

// All import routes require authentication
router.use(protect);

router.post('/bank-statement/preview', previewBankStatement);
router.post('/bank-statement/commit', commitBankStatement);

module.exports = router;
