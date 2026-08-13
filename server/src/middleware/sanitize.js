/**
 * NoSQL Query Operator Injection Sanitizer Middleware
 * Prevents malicious query operators ($ne, $gt, $where, etc.) in body, params, and query string.
 */
const sanitizeValue = (val) => {
  if (val === null || val === undefined) return val;
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return val;

  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }

  if (typeof val === 'object') {
    const cleanObj = {};
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        // Strip keys starting with $ or containing . to prevent NoSQL injection
        if (!key.startsWith('$') && !key.includes('.')) {
          cleanObj[key] = sanitizeValue(val[key]);
        }
      }
    }
    return cleanObj;
  }

  return val;
};

const sanitizeInput = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};

module.exports = sanitizeInput;
