const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get paginated audit trail for the authenticated user
 * @route   GET /api/audit
 * @access  Private
 */
exports.getAuditLogs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    action,
    resourceType,
    startDate,
    endDate,
  } = req.query;

  const query = { userId: req.user._id };

  if (action) query.action = action;
  if (resourceType) query.resourceType = resourceType;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 50;
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-requestBody'), // Don't expose request bodies in list view
    AuditLog.countDocuments(query),
  ]);

  res.json({
    logs,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    total,
  });
});
