const LocalOcrService = require('../src/services/ai/localOcrService');

describe('LocalOcrService Tests', () => {
  describe('Health Probe & Availability', () => {
    it('should return a boolean when probing sidecar availability', async () => {
      const isAvailable = await LocalOcrService.isAvailable(200);
      expect(typeof isAvailable).toBe('boolean');
    });
  });

  describe('Heuristic Fallback Engine', () => {
    it('should produce a valid structured receipt object in Tier 3 fallback', () => {
      const result = LocalOcrService.heuristicFallback('fake-base64-data');
      expect(result).toHaveProperty('merchant');
      expect(result).toHaveProperty('date');
      expect(result).toHaveProperty('amount');
      expect(result).toHaveProperty('category');
      expect(result.source).toBe('local_heuristic_fallback');
      expect(result.confidence).toBeLessThanOrEqual(0.7);
    });
  });

  describe('Graceful Receipt Scan Cascade', () => {
    it('should throw if imageBase64 is not provided', async () => {
      await expect(LocalOcrService.scanReceipt({})).rejects.toThrow('Receipt image data is required');
    });

    it('should fall back gracefully to heuristic parse when sidecar is offline', async () => {
      const result = await LocalOcrService.scanReceipt({
        imageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...',
      });
      expect(result).toBeDefined();
      expect(result.merchant).toBeDefined();
      expect(result.source).toMatch(/local_unlimited_ocr|local_heuristic_fallback/);
    });
  });
});
