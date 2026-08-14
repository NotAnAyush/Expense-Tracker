const AIService = require('../services/ai/aiService');
const asyncHandler = require('../utils/asyncHandler');
const { BadRequestError } = require('../utils/errors');

exports.suggestCategory = asyncHandler(async (req, res) => {
  const { title, amount, merchant, userCategories } = req.body;
  if (!title || amount === undefined) {
    throw new BadRequestError('Title and amount are required');
  }
  const suggestion = await AIService.suggestCategory(title, amount, merchant, userCategories);
  res.json(suggestion);
});

exports.getMonthlySummaryAI = asyncHandler(async (req, res) => {
  const summary = await AIService.getMonthlySummaryAI(req.user._id);
  res.json(summary);
});

exports.getSpendingExplanation = asyncHandler(async (req, res) => {
  const explanation = await AIService.getSpendingExplanation(req.user._id);
  res.json(explanation);
});

exports.copilotChat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) {
    throw new BadRequestError('Message query is required');
  }
  const response = await AIService.copilotChat(req.user._id, message);
  res.json(response);
});

exports.getInsights = asyncHandler(async (req, res) => {
  const insights = await AIService.getInsights(req.user._id);
  res.json({ insights });
});
