/**
 * Idempotency Middleware
 * Prevents duplicate POST requests by caching responses keyed by Idempotency-Key header.
 * Cache TTL: 24 hours. In-memory store suitable for single-instance deployments.
 */

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory idempotency store
const idempotencyCache = new Map();

// Periodic cleanup of expired keys (every 30 minutes)
// .unref() ensures this timer doesn't prevent the process from exiting (e.g. in tests)
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of idempotencyCache) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      idempotencyCache.delete(key);
    }
  }
}, 30 * 60 * 1000);
cleanupTimer.unref();

const idempotency = (req, res, next) => {
  // Only apply to POST requests
  if (req.method !== 'POST') return next();

  const idempotencyKey = req.headers['idempotency-key'];

  // If no key provided, process normally (idempotency is opt-in)
  if (!idempotencyKey) return next();

  // Check if we've seen this key before
  const cached = idempotencyCache.get(idempotencyKey);
  if (cached) {
    // Return the cached response
    return res.status(cached.statusCode).json(cached.body);
  }

  // Override res.json to capture the response for caching
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    // Only cache successful responses
    if (res.statusCode >= 200 && res.statusCode < 300) {
      idempotencyCache.set(idempotencyKey, {
        statusCode: res.statusCode,
        body,
        timestamp: Date.now(),
      });
    }
    return originalJson(body);
  };

  next();
};

module.exports = idempotency;
