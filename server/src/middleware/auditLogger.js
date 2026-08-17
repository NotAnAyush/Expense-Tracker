const AuditLog = require('../models/AuditLog');

/**
 * Sensitive fields that should NEVER be persisted in audit logs.
 */
const REDACTED_FIELDS = ['password', 'passwordHash', 'token', 'refreshToken', 'secret', 'apiKey'];

/**
 * Redacts sensitive fields from request body before logging.
 */
const redactBody = (body) => {
  if (!body || typeof body !== 'object') return null;
  const cleaned = { ...body };
  REDACTED_FIELDS.forEach((field) => {
    if (cleaned[field]) cleaned[field] = '[REDACTED]';
  });
  return cleaned;
};

/**
 * Maps HTTP method + route path to audit action and resource type.
 */
const resolveAction = (method, path) => {
  const m = method.toUpperCase();
  const p = path.toLowerCase();

  if (p.includes('/auth/register')) return { action: 'USER_REGISTERED', resourceType: 'user' };
  if (p.includes('/auth/login')) return { action: 'USER_LOGIN', resourceType: 'user' };

  if (p.includes('/expenses')) {
    if (m === 'POST') return { action: 'EXPENSE_CREATED', resourceType: 'expense' };
    if (m === 'PUT') return { action: 'EXPENSE_UPDATED', resourceType: 'expense' };
    if (m === 'DELETE') return { action: 'EXPENSE_DELETED', resourceType: 'expense' };
  }

  if (p.includes('/budgets')) {
    if (m === 'POST') return { action: 'BUDGET_CREATED', resourceType: 'budget' };
    if (m === 'PUT') return { action: 'BUDGET_UPDATED', resourceType: 'budget' };
    if (m === 'DELETE') return { action: 'BUDGET_DELETED', resourceType: 'budget' };
  }

  if (p.includes('/goals')) {
    if (m === 'POST') return { action: 'GOAL_CREATED', resourceType: 'goal' };
    if (m === 'PUT') return { action: 'GOAL_UPDATED', resourceType: 'goal' };
    if (m === 'DELETE') return { action: 'GOAL_DELETED', resourceType: 'goal' };
  }

  if (p.includes('/recurring') && p.includes('/pay')) return { action: 'RECURRING_PAID', resourceType: 'recurring' };
  if (p.includes('/recurring')) {
    if (m === 'POST') return { action: 'RECURRING_CREATED', resourceType: 'recurring' };
    if (m === 'PUT') return { action: 'RECURRING_UPDATED', resourceType: 'recurring' };
    if (m === 'DELETE') return { action: 'RECURRING_DELETED', resourceType: 'recurring' };
  }

  if (p.includes('/export')) return { action: 'EXPORT_REQUESTED', resourceType: 'export' };

  if (p.includes('/ai/categorize')) return { action: 'AI_CATEGORIZE', resourceType: 'ai' };
  if (p.includes('/ai/copilot')) return { action: 'AI_COPILOT', resourceType: 'ai' };
  if (p.includes('/ai/summary')) return { action: 'AI_SUMMARY', resourceType: 'ai' };

  return null;
};

/**
 * Audit Logger Middleware
 * Logs all mutating requests (POST, PUT, DELETE) to the AuditLog collection.
 * Attached as a response-finish hook so we capture the final status code.
 */
const auditLogger = (req, res, next) => {
  // Only log mutating operations
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return next();
  }

  const startTime = Date.now();

  // Hook into response finish to capture the outcome
  res.on('finish', async () => {
    try {
      const actionInfo = resolveAction(req.method, req.originalUrl);
      if (!actionInfo) return; // Unknown route, skip logging

      // Extract resource ID from params if available
      const resourceId = req.params?.id || null;

      await AuditLog.create({
        userId: req.user?._id || null,
        action: actionInfo.action,
        resourceType: actionInfo.resourceType,
        resourceId,
        ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || '',
        requestBody: redactBody(req.body),
        success: res.statusCode < 400,
        statusCode: res.statusCode,
      });
    } catch (err) {
      // Audit log failures should never crash the request
      if (process.env.NODE_ENV !== 'test' && !err.message?.includes('client was closed')) {
        console.error('[Audit Logger Error]', err.message);
      }
    }
  });

  next();
};

module.exports = auditLogger;
