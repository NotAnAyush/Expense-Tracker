const crypto = require('crypto');

// Master Encryption key derivation (32 bytes for AES-256-GCM)
const getMasterKey = () => {
  const secret = process.env.ENCRYPTION_SECRET || process.env.JWT_SECRET || 'richy-rich-v2-super-secure-master-encryption-key-32b!';
  return crypto.createHash('sha256').update(secret).digest();
};

/**
 * Derive user-specific 32-byte key using HKDF-SHA256
 */
const deriveUserKey = (userId) => {
  const masterKey = getMasterKey();
  if (!userId) return masterKey;
  const salt = crypto.createHash('sha256').update(`USER_SALT_${userId}`).digest();
  return crypto.hkdfSync('sha256', masterKey, salt, Buffer.from('EXPENSE_TRACKER_VAULT_INFO'), 32);
};

/**
 * Encrypt sensitive text (tokens, credentials) using AES-256-GCM
 * Output format: iv:authTag:encryptedHex
 */
const encrypt = (plainText, userId = null) => {
  if (!plainText) return '';
  const key = userId ? deriveUserKey(userId) : getMasterKey();
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * Decrypt ciphertext encrypted with AES-256-GCM
 */
const decrypt = (encryptedPayload, userId = null) => {
  if (!encryptedPayload) return '';
  try {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) return '';
    
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const key = userId ? deriveUserKey(userId) : getMasterKey();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    // If user-scoped decryption failed, try fallback with master key for backward compatibility
    if (userId) {
      try {
        const parts = encryptedPayload.split(':');
        const [ivHex, authTagHex, encryptedHex] = parts;
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-gcm', getMasterKey(), iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
      } catch {
        // Fallback failed
      }
    }
    console.error('[CryptoVault Decrypt Error]', error.message);
    return '';
  }
};

/**
 * Verify HMAC-SHA256 signature for incoming webhooks (with timing safe comparison)
 */
const verifyWebhookSignature = (payloadString, signature, secret) => {
  if (!signature || !secret || !payloadString) return false;
  try {
    const expected = crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
    const signatureBuffer = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expected, 'utf8');
    
    if (signatureBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch {
    return false;
  }
};

/**
 * Mask account number for safe display (e.g. "••••••••4012")
 */
const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return 'XXXX-XXXX-XXXX';
  const clean = String(accountNumber).trim();
  if (clean.length <= 4) return `••••${clean}`;
  const last4 = clean.slice(-4);
  return `••••••••${last4}`;
};

/**
 * Mask UPI ID (e.g. "ay••••@okhdfcbank")
 */
const maskUpiId = (upiId) => {
  if (!upiId || !upiId.includes('@')) return upiId || '';
  const [user, handle] = upiId.split('@');
  if (user.length <= 2) return `${user}••@${handle}`;
  return `${user.slice(0, 2)}••••@${handle}`;
};

/**
 * Intelligently mask an API secret key while preserving provider prefix and last 4 chars
 * e.g., "sk-proj-abc123xyz789" -> "sk-proj-••••••••y789"
 * e.g., "AIzaSyAbcd1234efgh" -> "AIzaSy••••••••efgh"
 */
const maskSecretKey = (key) => {
  if (!key) return '';
  const clean = String(key).trim();
  if (clean.length <= 8) return '••••••••';

  // Detect common prefixes
  const prefixes = ['sk-proj-', 'sk-ant-', 'sk-', 'gsk_', 'xai-', 'ghp_', 'gho_', 'AIzaSy'];
  for (const p of prefixes) {
    if (clean.startsWith(p)) {
      const remaining = clean.slice(p.length);
      const suffix = remaining.length >= 4 ? remaining.slice(-4) : remaining;
      return `${p}••••••••••••${suffix}`;
    }
  }

  // Generic prefix (first 3 chars) + dots + last 4 chars
  const prefix = clean.slice(0, 3);
  const suffix = clean.slice(-4);
  return `${prefix}••••••••••••${suffix}`;
};

module.exports = {
  getMasterKey,
  deriveUserKey,
  encrypt,
  decrypt,
  verifyWebhookSignature,
  maskAccountNumber,
  maskUpiId,
  maskSecretKey,
};
