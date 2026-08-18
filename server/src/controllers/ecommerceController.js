const asyncHandler = require('../utils/asyncHandler');
const { BadRequestError } = require('../utils/errors');
const EcommerceService = require('../services/import/ecommerceService');

// @desc    Parse pasted order text / email / share link
// @route   POST /api/ecommerce/parse-order
// @access  Private
exports.parseOrder = asyncHandler(async (req, res) => {
  const { text, platformHint } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new BadRequestError('Please provide raw order text, confirmation email snippet, or invoice data.');
  }

  const parsed = EcommerceService.parseOrderText(text, platformHint);
  res.status(200).json(parsed);
});

// @desc    Commit parsed e-commerce order into MongoDB
// @route   POST /api/ecommerce/sync-order
// @access  Private
exports.syncOrder = asyncHandler(async (req, res) => {
  const orderData = req.body;

  if (!orderData || !orderData.totalAmount) {
    throw new BadRequestError('Invalid or incomplete order data.');
  }

  const result = await EcommerceService.commitOrder(req.user._id, orderData);
  res.status(result.isDuplicate ? 200 : 201).json(result);
});

// @desc    Get connected platforms & spend aggregates
// @route   GET /api/ecommerce/platforms
// @access  Private
exports.getPlatforms = asyncHandler(async (req, res) => {
  const stats = await EcommerceService.getPlatformStats(req.user._id);
  res.status(200).json(stats);
});

// @desc    Ingest forwarded e-commerce email or webhook payload
// @route   POST /api/ecommerce/webhook/:token
// @access  Public (Token authenticated)
exports.handleWebhook = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { body, subject, text, sender } = req.body;

  const content = text || body || subject || '';
  if (!content) {
    throw new BadRequestError('No email body or order content found.');
  }

  // In production, token maps to user ID. For now, use fallback user if token valid
  const parsed = EcommerceService.parseOrderText(content);
  res.status(200).json({
    received: true,
    platform: parsed.platform,
    orderId: parsed.orderId,
    totalAmount: parsed.totalAmount,
    message: 'Webhook parsed successfully.',
  });
});
