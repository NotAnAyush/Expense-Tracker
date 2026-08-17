const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'EXPENSE_CREATED', 'EXPENSE_UPDATED', 'EXPENSE_DELETED',
      'BUDGET_CREATED', 'BUDGET_UPDATED', 'BUDGET_DELETED',
      'GOAL_CREATED', 'GOAL_UPDATED', 'GOAL_DELETED',
      'RECURRING_CREATED', 'RECURRING_UPDATED', 'RECURRING_DELETED', 'RECURRING_PAID',
      'USER_REGISTERED', 'USER_LOGIN',
      'EXPORT_REQUESTED',
      'AI_CATEGORIZE', 'AI_COPILOT', 'AI_SUMMARY',
      'VAULT_SECRET_CREATED', 'VAULT_SECRET_ROTATED', 'VAULT_SECRET_DELETED', 'VAULT_PURGED', 'VAULT_SECRET_TESTED',
    ],
  },
  resourceType: {
    type: String,
    enum: ['expense', 'budget', 'goal', 'recurring', 'user', 'export', 'ai', 'vault'],
  },
  resourceId: {
    type: String,
    default: null,
  },
  ipAddress: {
    type: String,
    default: 'unknown',
  },
  userAgent: {
    type: String,
    default: '',
  },
  requestBody: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  success: {
    type: Boolean,
    default: true,
  },
  statusCode: {
    type: Number,
  },
}, {
  timestamps: true,
});

// Auto-expire audit logs after 90 days
const AUDIT_TTL_DAYS = parseInt(process.env.AUDIT_TTL_DAYS || '90', 10);
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: AUDIT_TTL_DAYS * 24 * 60 * 60 });
auditLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
