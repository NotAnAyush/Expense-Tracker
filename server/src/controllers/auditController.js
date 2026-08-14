const AuditLog = require('../models/AuditLog');

/**
 * @desc    Get paginated audit trail for the authenticated user
 * @route   GET /api/audit
 * @access  Private
 */
exports.getAuditLogs = async (req, res) => {
  try {
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

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-requestBody'), // Don't expose request bodies in list view
      AuditLog.countDocuments(query),
    ]);

    res.json({
      logs,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      total,
    });
  } catch (error) {
    console.error('[Audit Controller Error]', error);
    res.status(500).json({ message: 'Server error fetching audit logs' });
  }
};
