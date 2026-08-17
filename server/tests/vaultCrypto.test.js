const {
  encrypt,
  decrypt,
  deriveUserKey,
  maskSecretKey,
} = require('../src/utils/cryptoVault');

describe('Secret Vault Cryptographic Functions', () => {
  const sampleApiKey = 'sk-proj-abc123def456xyz7890qwertyuiop';
  const userId1 = '60d5ecb8b5c9c62b3c7c1111';
  const userId2 = '60d5ecb8b5c9c62b3c7c2222';

  describe('Envelope Encryption & User Isolation', () => {
    it('should encrypt and decrypt a secret key accurately with user context', () => {
      const encrypted = encrypt(sampleApiKey, userId1);
      expect(encrypted).toBeDefined();
      expect(encrypted.split(':').length).toBe(3); // iv:authTag:cipher

      const decrypted = decrypt(encrypted, userId1);
      expect(decrypted).toBe(sampleApiKey);
    });

    it('should reject or fail decryption when attempted with a different user context (isolation)', () => {
      const encryptedUser1 = encrypt(sampleApiKey, userId1);
      
      // Decrypting with userId2 should fail or not yield the original plaintext
      const decryptedUser2 = decrypt(encryptedUser1, userId2);
      expect(decryptedUser2).not.toBe(sampleApiKey);
    });

    it('should fail decryption if the ciphertext or authentication tag is tampered with', () => {
      const encrypted = encrypt(sampleApiKey, userId1);
      const [iv, authTag, cipher] = encrypted.split(':');
      
      // Tamper ciphertext
      const tamperedCipher = cipher.slice(0, -2) + 'ff';
      const tamperedPayload = `${iv}:${authTag}:${tamperedCipher}`;
      
      const decrypted = decrypt(tamperedPayload, userId1);
      expect(decrypted).toBe('');
    });
  });

  describe('API Key Masking (Zero Plaintext Leakage)', () => {
    it('should mask OpenAI project key with prefix and suffix', () => {
      const masked = maskSecretKey('sk-proj-1234567890abcdef1234');
      expect(masked).toContain('sk-proj-');
      expect(masked).toContain('1234');
      expect(masked).not.toContain('567890abcdef');
    });

    it('should mask Gemini API key preserving AIzaSy prefix', () => {
      const masked = maskSecretKey('AIzaSyAbcdEfgh1234567890zYxW');
      expect(masked.startsWith('AIzaSy')).toBe(true);
      expect(masked.endsWith('zYxW')).toBe(true);
      expect(masked).toContain('••••');
      expect(masked).not.toContain('AbcdEfgh');
    });

    it('should mask Groq API key preserving gsk_ prefix', () => {
      const masked = maskSecretKey('gsk_9876543210abcdefgh9999');
      expect(masked.startsWith('gsk_')).toBe(true);
      expect(masked.endsWith('9999')).toBe(true);
    });

    it('should handle short or empty strings safely', () => {
      expect(maskSecretKey('')).toBe('');
      expect(maskSecretKey('123')).toBe('••••••••');
    });
  });
});
