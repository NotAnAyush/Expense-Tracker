const mongoose = require('mongoose');
const ReportExportEngine = require('../src/services/export/reportExportEngine');
const Expense = require('../src/models/Expense');
const Income = require('../src/models/Income');
const User = require('../src/models/User');

describe('Enterprise Financial Report Export Engine (Phase 9)', () => {
  const mockUserId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('generates accurate financial statement summary and savings rate', async () => {
    jest.spyOn(User, 'findById').mockReturnValue({
      lean: jest.fn().mockResolvedValue({ name: 'Aarav Sharma', email: 'aarav@example.com' }),
    });

    jest.spyOn(Expense, 'find').mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { date: new Date('2026-08-15'), title: 'Zepto Groceries', category: 'Food & Dining', amount: 1500, paymentMethod: 'UPI' },
          { date: new Date('2026-08-10'), title: 'Airtel Broadband', category: 'Housing & Utilities', amount: 1000, paymentMethod: 'Card' },
        ]),
      }),
    });

    jest.spyOn(Income, 'find').mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { date: new Date('2026-08-01'), title: 'Tech Consulting', category: 'Salary', amount: 10000 },
        ]),
      }),
    });

    const statement = await ReportExportEngine.generateFinancialStatement(mockUserId, { year: 2026, month: 7 });

    expect(statement.summary.totalIncome).toBe(10000);
    expect(statement.summary.totalSpend).toBe(2500);
    expect(statement.summary.netSavings).toBe(7500);
    expect(statement.summary.savingsRatePercent).toBe(75);
    expect(statement.categoryBreakdown.length).toBe(2);
    expect(statement.transactions.length).toBe(2);
  });

  test('generates valid multi-column CSV statement format', async () => {
    jest.spyOn(User, 'findById').mockReturnValue({
      lean: jest.fn().mockResolvedValue({ name: 'Aarav Sharma', email: 'aarav@example.com' }),
    });

    jest.spyOn(Expense, 'find').mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { date: new Date('2026-08-15'), title: 'Uber Ride', category: 'Transportation', amount: 350, paymentMethod: 'UPI' },
        ]),
      }),
    });

    jest.spyOn(Income, 'find').mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      }),
    });

    const csv = await ReportExportEngine.generateCsvStatement(mockUserId, { year: 2026 });
    expect(csv).toContain('Date,Type,Category,Merchant / Payee,Title,Amount,Payment Method');
    expect(csv).toContain('EXPENSE,"Transportation"');
    expect(csv).toContain('350');
  });
});
