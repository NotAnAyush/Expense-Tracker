/**
 * Request Logger Middleware
 * Provides structured request logging with timing, HTTP method, URL, status code, IP, and user-agent.
 */
const requestLogger = (req, res, next) => {
  // Skip verbose request logging during automated tests
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const color = statusCode >= 500 ? '\x1b[31m' : statusCode >= 400 ? '\x1b[33m' : statusCode >= 300 ? '\x1b[36m' : '\x1b[32m';
    const reset = '\x1b[0m';

    console.log(
      `[HTTP] ${req.method} ${req.originalUrl || req.url} ${color}${statusCode}${reset} - ${duration}ms (${req.ip || 'unknown'})`
    );
  });

  next();
};

module.exports = requestLogger;
