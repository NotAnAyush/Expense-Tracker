const SecretVault = require('../models/SecretVault');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');
const { encrypt, decrypt, maskSecretKey } = require('../utils/cryptoVault');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const https = require('https');
const http = require('http');

/**
 * Helper to ping provider endpoint and measure latency
 */
const pingProvider = async (provider, apiKey, customBaseUrl = '') => {
  const startTime = Date.now();
  let url = '';
  const headers = {};

  switch (provider) {
    case 'gemini':
      url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      break;
    case 'openai':
      url = (customBaseUrl || 'https://api.openai.com/v1') + '/models';
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
    case 'claude':
      url = 'https://api.anthropic.com/v1/models';
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      break;
    case 'groq':
      url = 'https://api.groq.com/openai/v1/models';
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
    case 'deepseek':
      url = 'https://api.deepseek.com/models';
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
    case 'together':
      url = 'https://api.together.xyz/v1/models';
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
    case 'mistral':
      url = 'https://api.mistral.ai/v1/models';
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
    case 'openrouter':
      url = 'https://openrouter.ai/api/v1/models';
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
    case 'perplexity':
      url = 'https://api.perplexity.ai/models';
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
    case 'xai':
      url = 'https://api.x.ai/v1/models';
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
    default:
      if (customBaseUrl) {
        url = customBaseUrl;
        headers['Authorization'] = `Bearer ${apiKey}`;
      } else {
        // Generic format validation
        return {
          valid: apiKey.length >= 8,
          latencyMs: 15,
          message: 'Credential format validated locally',
        };
      }
  }

  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;
      const req = client.request(parsedUrl, { method: 'GET', headers, timeout: 7000 }, (res) => {
        const latencyMs = Date.now() - startTime;
        const statusCode = res.statusCode;
        // Drain data to free socket
        res.on('data', () => {});
        res.on('end', () => {
          if (statusCode >= 200 && statusCode < 300) {
            resolve({ valid: true, latencyMs, message: `Successfully connected to ${provider} (${latencyMs}ms)` });
          } else if (statusCode === 401 || statusCode === 403) {
            resolve({ valid: false, latencyMs, message: `Invalid API key or unauthorized by ${provider} (HTTP ${statusCode})` });
          } else {
            resolve({ valid: true, latencyMs, message: `Provider responded with HTTP ${statusCode} (${latencyMs}ms)` });
          }
        });
      });

      req.on('error', (err) => {
        const latencyMs = Date.now() - startTime;
        resolve({ valid: false, latencyMs, message: `Network error connecting to ${provider}: ${err.message}` });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ valid: false, latencyMs: 7000, message: `Connection to ${provider} timed out after 7s` });
      });

      req.end();
    } catch (err) {
      resolve({ valid: false, latencyMs: Date.now() - startTime, message: `Ping failed: ${err.message}` });
    }
  });
};

/**
 * Create a new encrypted secret in the Vault
 * POST /api/vault/secrets
 */
const createSecret = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    name,
    secretValue,
    category = 'ai_api_key',
    provider = 'gemini',
    customBaseUrl = '',
    description = '',
    isDefault = false,
  } = req.body;

  if (!name || !name.trim()) {
    throw new BadRequestError('Secret name/label is required');
  }

  if (!secretValue || typeof secretValue !== 'string' || !secretValue.trim()) {
    throw new BadRequestError('Secret credential value is required');
  }

  const cleanSecret = secretValue.trim();
  const maskedValue = maskSecretKey(cleanSecret);
  const encryptedValue = encrypt(cleanSecret, userId);

  // If set as default, unset other defaults for same provider
  if (isDefault) {
    await SecretVault.updateMany({ userId, provider }, { $set: { isDefault: false } });
  }

  const secret = await SecretVault.create({
    userId,
    name: name.trim(),
    category,
    provider,
    encryptedValue,
    maskedValue,
    customBaseUrl: customBaseUrl.trim(),
    description: description.trim(),
    isDefault,
    status: 'ACTIVE',
  });

  // Log Audit Event
  try {
    await AuditLog.create({
      userId,
      action: 'VAULT_SECRET_CREATED',
      resourceType: 'vault',
      resourceId: String(secret._id),
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || '',
      requestBody: { name: secret.name, category, provider, maskedValue },
      success: true,
      statusCode: 201,
    });
  } catch (err) {
    console.warn('[AuditLog Warning]', err.message);
  }

  res.status(201).json({
    success: true,
    message: `Confidential secret '${secret.name}' encrypted and securely stored in vault.`,
    data: {
      id: secret._id,
      name: secret.name,
      category: secret.category,
      provider: secret.provider,
      maskedValue: secret.maskedValue,
      customBaseUrl: secret.customBaseUrl,
      description: secret.description,
      isDefault: secret.isDefault,
      status: secret.status,
      createdAt: secret.createdAt,
    },
  });
});

/**
 * Get all stored secrets for current user (always masked)
 * GET /api/vault/secrets
 */
const getSecrets = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const secrets = await SecretVault.find({ userId }).sort({ isDefault: -1, createdAt: -1 });

  const safeSecrets = secrets.map((s) => ({
    id: s._id,
    name: s.name,
    category: s.category,
    provider: s.provider,
    maskedValue: s.maskedValue,
    customBaseUrl: s.customBaseUrl,
    description: s.description,
    isDefault: s.isDefault,
    status: s.status,
    lastUsedAt: s.lastUsedAt,
    lastTestedAt: s.lastTestedAt,
    latencyMs: s.latencyMs,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));

  res.json({
    success: true,
    count: safeSecrets.length,
    data: safeSecrets,
  });
});

/**
 * Get single secret metadata (masked)
 * GET /api/vault/secrets/:id
 */
const getSecretById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const secret = await SecretVault.findOne({ _id: id, userId });
  if (!secret) {
    throw new NotFoundError('Secret not found in vault');
  }

  res.json({
    success: true,
    data: {
      id: secret._id,
      name: secret.name,
      category: secret.category,
      provider: secret.provider,
      maskedValue: secret.maskedValue,
      customBaseUrl: secret.customBaseUrl,
      description: secret.description,
      isDefault: secret.isDefault,
      status: secret.status,
      lastUsedAt: secret.lastUsedAt,
      lastTestedAt: secret.lastTestedAt,
      latencyMs: secret.latencyMs,
      createdAt: secret.createdAt,
    },
  });
});

/**
 * Test secret connectivity live with provider without exposing key
 * POST /api/vault/secrets/:id/test
 */
const testSecretConnection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const secret = await SecretVault.findOne({ _id: id, userId });
  if (!secret) {
    throw new NotFoundError('Secret not found in vault');
  }

  const decryptedKey = decrypt(secret.encryptedValue, userId);
  if (!decryptedKey) {
    throw new BadRequestError('Could not decrypt secret. Master key or authentication tag invalid.');
  }

  const pingResult = await pingProvider(secret.provider, decryptedKey, secret.customBaseUrl);

  secret.lastTestedAt = new Date();
  secret.latencyMs = pingResult.latencyMs;
  await secret.save();

  // Log Audit Event
  try {
    await AuditLog.create({
      userId,
      action: 'VAULT_SECRET_TESTED',
      resourceType: 'vault',
      resourceId: String(secret._id),
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || '',
      requestBody: { name: secret.name, provider: secret.provider, result: pingResult },
      success: pingResult.valid,
      statusCode: 200,
    });
  } catch (err) {
    console.warn('[AuditLog Warning]', err.message);
  }

  res.json({
    success: true,
    data: {
      id: secret._id,
      name: secret.name,
      provider: secret.provider,
      valid: pingResult.valid,
      latencyMs: pingResult.latencyMs,
      message: pingResult.message,
      lastTestedAt: secret.lastTestedAt,
    },
  });
});

/**
 * Rotate / Update secret value
 * PUT /api/vault/secrets/:id/rotate
 */
const rotateSecret = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newSecretValue, name, description, isDefault } = req.body;
  const userId = req.user._id;

  const secret = await SecretVault.findOne({ _id: id, userId });
  if (!secret) {
    throw new NotFoundError('Secret not found in vault');
  }

  if (newSecretValue && typeof newSecretValue === 'string' && newSecretValue.trim()) {
    const cleanSecret = newSecretValue.trim();
    secret.encryptedValue = encrypt(cleanSecret, userId);
    secret.maskedValue = maskSecretKey(cleanSecret);
    secret.latencyMs = null;
    secret.lastTestedAt = null;
  }

  if (name && name.trim()) secret.name = name.trim();
  if (description !== undefined) secret.description = String(description).trim();
  if (isDefault !== undefined) {
    if (isDefault) {
      await SecretVault.updateMany({ userId, provider: secret.provider }, { $set: { isDefault: false } });
    }
    secret.isDefault = Boolean(isDefault);
  }

  await secret.save();

  // Log Audit Event
  try {
    await AuditLog.create({
      userId,
      action: 'VAULT_SECRET_ROTATED',
      resourceType: 'vault',
      resourceId: String(secret._id),
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || '',
      requestBody: { name: secret.name, maskedValue: secret.maskedValue },
      success: true,
      statusCode: 200,
    });
  } catch (err) {
    console.warn('[AuditLog Warning]', err.message);
  }

  res.json({
    success: true,
    message: `Secret '${secret.name}' successfully rotated and re-encrypted.`,
    data: {
      id: secret._id,
      name: secret.name,
      provider: secret.provider,
      maskedValue: secret.maskedValue,
      isDefault: secret.isDefault,
      status: secret.status,
      updatedAt: secret.updatedAt,
    },
  });
});

/**
 * Delete a single secret (Zeroization)
 * DELETE /api/vault/secrets/:id
 */
const deleteSecret = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const secret = await SecretVault.findOneAndDelete({ _id: id, userId });
  if (!secret) {
    throw new NotFoundError('Secret not found in vault');
  }

  // Log Audit Event
  try {
    await AuditLog.create({
      userId,
      action: 'VAULT_SECRET_DELETED',
      resourceType: 'vault',
      resourceId: String(secret._id),
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || '',
      requestBody: { name: secret.name, provider: secret.provider },
      success: true,
      statusCode: 200,
    });
  } catch (err) {
    console.warn('[AuditLog Warning]', err.message);
  }

  res.json({
    success: true,
    message: `Confidential secret '${secret.name}' permanently deleted and zeroized from vault.`,
  });
});

/**
 * Emergency Purge all vault secrets for the user
 * POST /api/vault/purge
 */
const purgeVault = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const result = await SecretVault.deleteMany({ userId });

  // Log Audit Event
  try {
    await AuditLog.create({
      userId,
      action: 'VAULT_PURGED',
      resourceType: 'vault',
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || '',
      requestBody: { deletedCount: result.deletedCount },
      success: true,
      statusCode: 200,
    });
  } catch (err) {
    console.warn('[AuditLog Warning]', err.message);
  }

  res.json({
    success: true,
    message: `Emergency purge complete. Deleted ${result.deletedCount} confidential secret(s) from vault.`,
    deletedCount: result.deletedCount,
  });
});

module.exports = {
  createSecret,
  getSecrets,
  getSecretById,
  testSecretConnection,
  rotateSecret,
  deleteSecret,
  purgeVault,
};
