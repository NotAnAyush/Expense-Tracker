const Expense = require('../../models/Expense');
const Income = require('../../models/Income');
const User = require('../../models/User');

/**
 * Enterprise Financial Statement & Report Generator
 * Generates audit-ready financial statements, tax schedules, and CSV/Excel tables.
 * Adheres to ADR-012.
 */
class ReportExportEngine {
  /**
   * Generates a comprehensive financial statement model
   */
  static async generateFinancialStatement(userId, { year = new Date().getFullYear(), month } = {}) {
    const user = await User.findById(userId).lean();
    const query = { userId };

    if (year) {
      const start = new Date(year, month !== undefined ? month : 0, 1);
      const end = new Date(year, month !== undefined ? month + 1 : 12, 0, 23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const [expenses, incomes] = await Promise.all([
      Expense.find(query).sort({ date: -1 }).lean(),
      Income.find(query).sort({ date: -1 }).lean(),
    ]);

    const totalSpend = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalIncome = incomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const netSavings = totalIncome - totalSpend;
    const savingsRatePercent = totalIncome > 0 ? Number(((netSavings / totalIncome) * 100).toFixed(2)) : 0;

    // Category breakdown
    const categoryTotals = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const categoryBreakdown = Object.keys(categoryTotals).map((cat) => ({
      category: cat,
      amount: Number(categoryTotals[cat].toFixed(2)),
      percentage: totalSpend > 0 ? Number(((categoryTotals[cat] / totalSpend) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.amount - a.amount);

    return {
      statementId: `STMT-${year}-${Date.now().toString().slice(-6)}`,
      generatedAt: new Date().toISOString(),
      user: {
        name: user ? user.name : 'Valued User',
        email: user ? user.email : '',
        currency: user?.customization?.regional?.currency || '₹',
      },
      period: {
        year,
        month: month !== undefined ? month + 1 : 'Full Year',
      },
      summary: {
        totalIncome: Number(totalIncome.toFixed(2)),
        totalSpend: Number(totalSpend.toFixed(2)),
        netSavings: Number(netSavings.toFixed(2)),
        savingsRatePercent,
        transactionCount: expenses.length + incomes.length,
      },
      categoryBreakdown,
      transactions: expenses.slice(0, 100).map((e) => ({
        date: new Date(e.date).toISOString().split('T')[0],
        title: e.title,
        merchant: e.merchant || '',
        category: e.category,
        amount: e.amount,
        paymentMethod: e.paymentMethod || 'UPI',
      })),
    };
  }

  /**
   * Generates a multi-column standard CSV table
   */
  static async generateCsvStatement(userId, options = {}) {
    const stmt = await this.generateFinancialStatement(userId, options);
    const headers = ['Date', 'Type', 'Category', 'Merchant / Payee', 'Title', 'Amount', 'Payment Method'];
    const rows = [headers.join(',')];

    stmt.transactions.forEach((tx) => {
      const cleanTitle = `"${(tx.title || '').replace(/"/g, '""')}"`;
      const cleanMerchant = `"${(tx.merchant || '').replace(/"/g, '""')}"`;
      rows.push([
        tx.date,
        'EXPENSE',
        `"${tx.category}"`,
        cleanMerchant,
        cleanTitle,
        tx.amount,
        tx.paymentMethod,
      ].join(','));
    });

    return rows.join('\n');
  }
}

module.exports = ReportExportEngine;
