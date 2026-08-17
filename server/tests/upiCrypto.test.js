const {
  encrypt,
  decrypt,
  verifyWebhookSignature,
  maskAccountNumber,
  maskUpiId,
} = require('../src/utils/cryptoVault');

describe('CryptoVault & Security Utility', () => {
  describe('AES-256-GCM Encryption / Decryption', () => {
    it('should encrypt and decrypt a sensitive token correctly', () => {
      const plainText = JSON.stringify({ consentId: 'AA_CONSENT_12345', scope: 'READ_ONLY' });
      const encrypted = encrypt(plainText);

      expect(encrypted).toBeDefined();
      expect(encrypted).toContain(':');
      expect(encrypted.split(':').length).toBe(3); // iv:authTag:cipher

      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(plainText);
      const parsed = JSON.parse(decrypted);
      expect(parsed.consentId).toBe('AA_CONSENT_12345');
    });

    it('should return empty string on invalid or tampered ciphertext', () => {
      const tampered = 'invalid:tampered:payload';
      const result = decrypt(tampered);
      expect(result).toBe('');
    });

    it('should handle null / empty inputs gracefully', () => {
      expect(encrypt('')).toBe('');
      expect(decrypt('')).toBe('');
    });
  });

  describe('HMAC-SHA256 Webhook Signature Verification', () => {
    const crypto = require('crypto');
    const secret = 'test-webhook-secret-key-123';
    const payload = JSON.stringify({ event: 'payment.captured', amount: 50000 });

    it('should verify a valid signature', () => {
      const validSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      const isValid = verifyWebhookSignature(payload, validSignature, secret);
      expect(isValid).toBe(true);
    });

    it('should reject a forged signature', () => {
      const fakeSignature = 'a'.repeat(64);
      const isValid = verifyWebhookSignature(payload, fakeSignature, secret);
      expect(isValid).toBe(false);
    });

    it('should reject when secret or payload is missing', () => {
      expect(verifyWebhookSignature('', 'sig', secret)).toBe(false);
      expect(verifyWebhookSignature(payload, '', secret)).toBe(false);
    });
  });

  describe('PII Masking', () => {
    it('should mask bank account numbers correctly', () => {
      expect(maskAccountNumber('50100423184012')).toBe('••••••••4012');
      expect(maskAccountNumber('4012')).toBe('••••4012');
      expect(maskAccountNumber('')).toBe('XXXX-XXXX-XXXX');
    });

    it('should mask UPI IDs safely', () => {
      expect(maskUpiId('ayushkaushik@okhdfcbank')).toBe('ay••••@okhdfcbank');
      expect(maskUpiId('ab@ybl')).toBe('ab••@ybl');
      expect(maskUpiId('invalid')).toBe('invalid');
    });
  });
});
