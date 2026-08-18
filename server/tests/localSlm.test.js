const LocalSlmClient = require('../src/services/ai/localSlmClient');

describe('LocalSlmClient Tests', () => {
  describe('Daemon Availability', () => {
    it('should return boolean when probing local SLM endpoint', async () => {
      const isAvailable = await LocalSlmClient.isAvailable(200);
      expect(typeof isAvailable).toBe('boolean');
    });
  });

  describe('Categorization & Copilot Handlers', () => {
    it('should return null or structured categorization when daemon is probed', async () => {
      const result = await LocalSlmClient.suggestCategory('Starbucks Coffee', 450, 'Starbucks', [
        'Food & Dining',
        'Shopping',
      ]);
      // If offline, returns null; if online, returns structured object
      if (result) {
        expect(result).toHaveProperty('category');
        expect(result.source).toBe('local_slm_qwen2.5');
      } else {
        expect(result).toBeNull();
      }
    });

    it('should return null or copilot answer when daemon is probed', async () => {
      const result = await LocalSlmClient.copilotChat('total_spend', { totalSpend: 50000 }, 'How much did I spend?');
      if (result) {
        expect(result).toHaveProperty('answer');
        expect(result.source).toBe('local_slm_qwen2.5');
      } else {
        expect(result).toBeNull();
      }
    });
  });
});
