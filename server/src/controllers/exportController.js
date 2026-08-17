const Expense = require('../models/Expense');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Escapes a CSV field value — wraps in quotes if it contains commas, quotes, or newlines.
 */
function escapeCsvField(value) {
  const str = String(value || '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * @desc    Export user's expenses as CSV or JSON
 * @route   GET /api/export/expenses
 * @access  Private
 * @query   startDate, endDate, category, format (csv|json)
 */
exports.exportExpenses = asyncHandler(async (req, res) => {
  const { startDate, endDate, category, format = 'csv' } = req.query;

  const query = { userId: req.user._id };

  if (category) query.category = category;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  // Use cursor-based streaming for memory efficiency
  const cursor = Expense.find(query).sort({ date: -1 }).cursor();

  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="expenses_${new Date().toISOString().slice(0, 10)}.json"`);

    const expenses = [];
    for await (const doc of cursor) {
      expenses.push({
        title: doc.title,
        amount: doc.amount,
        category: doc.category,
        date: doc.date ? doc.date.toISOString().slice(0, 10) : '',
        merchant: doc.merchant || '',
        paymentMethod: doc.paymentMethod || '',
        note: doc.note || '',
        tags: (doc.tags || []).join('; '),
      });
    }
    return res.json({ exportedAt: new Date().toISOString(), count: expenses.length, expenses });
  }

  // Default: CSV export
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="expenses_${new Date().toISOString().slice(0, 10)}.csv"`);

  // CSV Header
  res.write('Date,Title,Amount,Category,Merchant,Payment Method,Note,Tags\n');

  // Stream rows
  let rowCount = 0;
  for await (const doc of cursor) {
    const row = [
      doc.date ? doc.date.toISOString().slice(0, 10) : '',
      escapeCsvField(doc.title),
      doc.amount,
      escapeCsvField(doc.category),
      escapeCsvField(doc.merchant || ''),
      escapeCsvField(doc.paymentMethod || ''),
      escapeCsvField(doc.note || ''),
      escapeCsvField((doc.tags || []).join('; ')),
    ].join(',');
    res.write(row + '\n');
    rowCount++;
  }

  if (rowCount === 0) {
    res.write('No expenses found for the selected period.\n');
  }

  res.end();
});

/**
 * @desc    Export tax-deductible expenses grouped by section
 * @route   GET /api/export/tax-summary
 * @access  Private
 * @query   year (YYYY), format (csv|json)
 */
exports.exportTaxSummary = asyncHandler(async (req, res) => {
  const { year = new Date().getFullYear(), format = 'csv' } = req.query;
  const targetYear = parseInt(year, 10);

  const startDate = new Date(targetYear, 0, 1);
  const endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);

  const query = {
    userId: req.user._id,
    date: { $gte: startDate, $lte: endDate },
    $or: [
      { isTaxDeductible: true },
      { taxSection: { $exists: true, $ne: '' } },
      { tags: { $regex: /(tax|80c|80d|80g|deduct)/i } },
    ],
  };

  const expenses = await Expense.find(query).sort({ date: 1 });

  const totalDeductible = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (format === 'json') {
    const sections = {};
    expenses.forEach(e => {
      const section = e.taxSection || 'Standard / General Deductible';
      if (!sections[section]) sections[section] = { total: 0, items: [] };
      sections[section].total += e.amount;
      sections[section].items.push({
        id: e._id,
        title: e.title,
        amount: e.amount,
        category: e.category,
        date: e.date ? e.date.toISOString().slice(0, 10) : '',
        merchant: e.merchant || '',
        reimbursementStatus: e.reimbursementStatus || 'none',
        note: e.note || '',
        tags: e.tags || [],
      });
    });

    return res.json({
      taxYear: targetYear,
      totalDeductible,
      itemCount: expenses.length,
      sections,
    });
  }

  // Default: CSV format
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="tax_summary_${targetYear}.csv"`);

  res.write(`Tax Deduction Summary for Year ${targetYear}\n`);
  res.write(`Total Deductible Expenses,${totalDeductible}\n\n`);
  res.write('Tax Section,Date,Title,Amount,Category,Merchant,Reimbursement Status,Note\n');

  if (expenses.length === 0) {
    res.write('No tax-deductible expenses recorded for this financial year.\n');
  } else {
    for (const e of expenses) {
      const row = [
        escapeCsvField(e.taxSection || 'General Deductible'),
        e.date ? e.date.toISOString().slice(0, 10) : '',
        escapeCsvField(e.title),
        e.amount,
        escapeCsvField(e.category),
        escapeCsvField(e.merchant || ''),
        escapeCsvField(e.reimbursementStatus || 'none'),
        escapeCsvField(e.note || ''),
      ].join(',');
      res.write(row + '\n');
    }
  }

  res.end();
});
