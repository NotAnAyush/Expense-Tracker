/**
 * In-Memory Mutation-Aware AI State-Hash Cache
 * Sub-5ms response times for repeat queries when underlying financial data has not changed.
 */

class AICache {
  constructor(ttlMs = 1000 * 60 * 60) { // 1 Hour TTL
    this.cache = new Map();
    this.ttlMs = ttlMs;
  }

  /**
   * Generates a deterministic cache key based on user and data mutation fingerprint
   */
  generateKey(userId, scope, stateFingerprint = '') {
    return `${userId}:${scope}:${stateFingerprint}`;
  }

  /**
   * Gets a cached item if not expired
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  /**
   * Stores an item with expiration
   */
  set(key, data, customTtlMs = null) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + (customTtlMs || this.ttlMs),
    });
  }

  /**
   * Clears all cached items for a specific user upon data mutation
   */
  clearUser(userId) {
    const prefix = `${userId}:`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clears the entire cache
   */
  clearAll() {
    this.cache.clear();
  }

  /**
   * Returns current cache size
   */
  size() {
    return this.cache.size;
  }
}

module.exports = new AICache();
