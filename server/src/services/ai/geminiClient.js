const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('[Gemini Client] Gemini API client initialized successfully.');
  } catch (err) {
    console.error('[Gemini Client] Failed to initialize GoogleGenerativeAI:', err.message);
  }
} else {
  console.log('[Gemini Client] No GEMINI_API_KEY found or default key used. AI features will use fallback analytics.');
}

const getGeminiModel = (modelName = 'gemini-1.5-flash') => {
  if (!genAI) return null;
  return genAI.getGenerativeModel({ model: modelName });
};

module.exports = {
  genAI,
  getGeminiModel,
  isAvailable: () => genAI !== null,
};
