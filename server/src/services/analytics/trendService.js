const Expense = require('../../models/Expense');

/**
 * TrendService — Advanced analytics using MongoDB Aggregation Pipelines
 * Provides weekly trends, category heatmaps, and merchant frequency analysis.
 */
class TrendService {
  /**
   * Weekly Spending Trend — last N weeks
   * Returns: [{ week: '2026-W32', weekStart: Date, total: Number, count: Number }]
   */
  static async getWeeklyTrend(userId, weeks = 12) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeks * 7));

    const pipeline = [
      { $match: { userId, date: { $gte: startDate } } },
      {
        $group: {
          _id: { $isoWeek: '$date' },
          year: { $first: { $isoWeekYear: '$date' } },
          weekStart: { $min: '$date' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { year: 1, _id: 1 } },
      {
        $project: {
          _id: 0,
          week: { $concat: [{ $toString: '$year' }, '-W', { $toString: '$_id' }] },
          weekStart: 1,
          total: { $round: ['$total', 0] },
          count: 1,
        },
      },
    ];

    return Expense.aggregate(pipeline);
  }

  /**
   * Category Heatmap — spending by category × day-of-week
   * Returns: [{ category, dayOfWeek (1=Sun…7=Sat), total, count }]
   */
  static async getCategoryHeatmap(userId, months = 3) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const pipeline = [
      { $match: { userId, date: { $gte: startDate } } },
      {
        $group: {
          _id: {
            category: '$category',
            dayOfWeek: { $dayOfWeek: '$date' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id.category',
          dayOfWeek: '$_id.dayOfWeek',
          total: { $round: ['$total', 0] },
          count: 1,
        },
      },
      { $sort: { category: 1, dayOfWeek: 1 } },
    ];

    return Expense.aggregate(pipeline);
  }

  /**
   * Merchant Frequency Analysis — top merchants by transaction count
   * Returns: [{ merchant, transactionCount, totalSpend, avgTransactionSize }]
   */
  static async getMerchantFrequency(userId, limit = 10) {
    const pipeline = [
      { $match: { userId, merchant: { $exists: true, $ne: '' } } },
      {
        $group: {
          _id: '$merchant',
          transactionCount: { $sum: 1 },
          totalSpend: { $sum: '$amount' },
          avgTransactionSize: { $avg: '$amount' },
          lastTransaction: { $max: '$date' },
        },
      },
      { $sort: { transactionCount: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          merchant: '$_id',
          transactionCount: 1,
          totalSpend: { $round: ['$totalSpend', 0] },
          avgTransactionSize: { $round: ['$avgTransactionSize', 0] },
          lastTransaction: 1,
        },
      },
    ];

    return Expense.aggregate(pipeline);
  }

  /**
   * Daily Spending Pattern — average spend by hour of day
   * Useful for understanding when the user tends to spend
   */
  static async getDailyPattern(userId, months = 3) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const pipeline = [
      { $match: { userId, date: { $gte: startDate } } },
      {
        $group: {
          _id: { $hour: '$date' },
          avgSpend: { $avg: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          hour: '$_id',
          avgSpend: { $round: ['$avgSpend', 0] },
          count: 1,
        },
      },
    ];

    return Expense.aggregate(pipeline);
  }
}

module.exports = TrendService;
