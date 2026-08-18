const AIService = require('../src/services/ai/aiService');

describe('AI Cascade 3-Tier Fallback Tests', () => {
  it('should fall back gracefully to local RAG or local SLM when Cloud API fails in suggestCategory', async () => {
    const result = await AIService.suggestCategory('Uber Ride to Airport', 850, 'Uber');
    expect(result).toBeDefined();
    expect(result).toHaveProperty('category');
    expect(result.category).toBe('Transportation');
  });

  it('should fall back gracefully to LocalOcrService when scanReceipt fails cloud vision', async () => {
    const fakeImage = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const result = await AIService.scanReceipt(fakeImage, 'image/jpeg', null);
    expect(result).toBeDefined();
    expect(result).toHaveProperty('merchant');
    expect(result).toHaveProperty('amount');
    expect(result.source).toMatch(/local_unlimited_ocr|local_heuristic_fallback/);
  });
});
