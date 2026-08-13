const AIService = require('../services/ai/aiService');

exports.suggestCategory = async (req, res) => {
  try {
    const { title, amount, merchant, userCategories } = req.body;
    if (!title || amount === undefined) {
      return res.status(400).json({ message: 'Title and amount are required' });
    }
    const suggestion = await AIService.suggestCategory(title, amount, merchant, userCategories);
    res.json(suggestion);
  } catch (error) {
    res.status(500).json({ message: 'Error performing smart categorization' });
  }
};

exports.getMonthlySummaryAI = async (req, res) => {
  try {
    const summary = await AIService.getMonthlySummaryAI(req.user._id);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Error generating AI summary' });
  }
};

exports.getSpendingExplanation = async (req, res) => {
  try {
    const explanation = await AIService.getSpendingExplanation(req.user._id);
    res.json(explanation);
  } catch (error) {
    res.status(500).json({ message: 'Error generating spending explanation' });
  }
};

exports.copilotChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message query is required' });
    }
    const response = await AIService.copilotChat(req.user._id, message);
    res.json(response);
  } catch (error) {
    console.error('[AI Copilot Controller Error]', error);
    res.status(500).json({ message: 'Error executing copilot chat' });
  }
};

exports.getInsights = async (req, res) => {
  try {
    const insights = await AIService.getInsights(req.user._id);
    res.json({ insights });
  } catch (error) {
    res.status(500).json({ message: 'Error generating AI insights' });
  }
};
