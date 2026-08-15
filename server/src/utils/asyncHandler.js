/**
 * Async handler wrapper to eliminate try-catch boilerplate in route controllers
 * and safely pass errors down the Express middleware chain.
 *
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
