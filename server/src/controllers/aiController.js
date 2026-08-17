const AIService = require('../services/ai/aiService');
const UnifiedAIClient = require('../services/ai/unifiedAIClient');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { BadRequestError } = require('../utils/errors');

/**
 * Mask API key for secure frontend display (e.g. sk-••••••••1234)
 */
const maskKey = (key = '') => {
  if (!key || key.length < 8) return key ? '••••••••' : '';
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
};

exports.suggestCategory = asyncHandler(async (req, res) => {
  const { title, amount, merchant, userCategories } = req.body;
  if (!title || amount === undefined) {
    throw new BadRequestError('Title and amount are required');
  }
  const suggestion = await AIService.suggestCategory(title, amount, merchant, userCategories, req.user._id);
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

exports.scanReceipt = asyncHandler(async (req, res) => {
  const { imageBase64, mimeType } = req.body;
  if (!imageBase64) {
    throw new BadRequestError('Receipt imageBase64 data is required');
  }

  const parsedReceipt = await AIService.scanReceipt(imageBase64, mimeType, req.user._id);
  res.json(parsedReceipt);
});

exports.getAIConfig = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('aiConfig preferredCurrency themePreference');
  const metadata = UnifiedAIClient.getProviderMetadata();
  const currentConfig = user?.aiConfig ? user.aiConfig.toObject() : {};

  res.json({
    config: {
      provider: currentConfig.provider || 'gemini',
      model: currentConfig.model || 'gemini-1.5-flash',
      apiKey: maskKey(currentConfig.apiKey),
      hasCustomKey: Boolean(currentConfig.apiKey && currentConfig.apiKey.trim() !== ''),
      customBaseUrl: currentConfig.customBaseUrl || '',
      customHeaders: currentConfig.customHeaders || {},
      temperature: currentConfig.temperature !== undefined ? currentConfig.temperature : 0.2,
      useLocalRagFallback: currentConfig.useLocalRagFallback !== undefined ? currentConfig.useLocalRagFallback : true,
    },
    providers: metadata,
  });
});

exports.updateAIConfig = asyncHandler(async (req, res) => {
  const { provider, model, apiKey, customBaseUrl, customHeaders, temperature, useLocalRagFallback } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new BadRequestError('User not found');
  }

  if (!user.aiConfig) {
    user.aiConfig = {};
  }

  if (provider) user.aiConfig.provider = provider;
  if (model) user.aiConfig.model = model;
  if (customBaseUrl !== undefined) user.aiConfig.customBaseUrl = customBaseUrl;
  if (customHeaders !== undefined) user.aiConfig.customHeaders = customHeaders;
  if (temperature !== undefined) user.aiConfig.temperature = Math.max(0, Math.min(2, Number(temperature)));
  if (useLocalRagFallback !== undefined) user.aiConfig.useLocalRagFallback = Boolean(useLocalRagFallback);

  // If user provided a non-empty, non-masked new API key, save it
  if (apiKey !== undefined && apiKey.trim() !== '' && !apiKey.includes('••••')) {
    user.aiConfig.apiKey = apiKey.trim();
  } else if (apiKey === '') {
    user.aiConfig.apiKey = ''; // Cleared to use server fallback
  }

  await user.save();

  res.json({
    message: 'AI settings updated successfully',
    config: {
      provider: user.aiConfig.provider,
      model: user.aiConfig.model,
      apiKey: maskKey(user.aiConfig.apiKey),
      hasCustomKey: Boolean(user.aiConfig.apiKey && user.aiConfig.apiKey.trim() !== ''),
      customBaseUrl: user.aiConfig.customBaseUrl,
      customHeaders: user.aiConfig.customHeaders,
      temperature: user.aiConfig.temperature,
      useLocalRagFallback: user.aiConfig.useLocalRagFallback,
    },
  });
});

exports.testConnection = asyncHandler(async (req, res) => {
  const { provider, model, apiKey, customBaseUrl, customHeaders } = req.body;

  let effectiveApiKey = apiKey;
  // If user passed a masked key or empty key, lookup saved key in DB
  if (!effectiveApiKey || effectiveApiKey.includes('••••')) {
    const user = await User.findById(req.user._id).select('aiConfig');
    if (user?.aiConfig?.apiKey && !user.aiConfig.apiKey.includes('••••')) {
      effectiveApiKey = user.aiConfig.apiKey;
    }
  }

  const result = await UnifiedAIClient.testConnection({
    provider: provider || 'gemini',
    model,
    apiKey: effectiveApiKey,
    customBaseUrl,
    customHeaders,
  });

  res.json(result);
});
