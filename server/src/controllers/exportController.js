const Expense = require('../models/Expense');

/**
 * @desc    Export user's expenses as CSV or JSON
 * @route   GET /api/export/expenses
 * @access  Private
 * @query   startDate, endDate, category, format (csv|json)
 */
exports.exportExpenses = async (req, res) => {
  try {
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
          date: doc.date.toISOString().slice(0, 10),
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
  } catch (error) {
    console.error('[Export Controller Error]', error);
    res.status(500).json({ message: 'Server error exporting expenses' });
  }
};

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
