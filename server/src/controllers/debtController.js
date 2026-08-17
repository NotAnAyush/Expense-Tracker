const { Debt } = require('../models/Debt');
const Expense = require('../models/Expense');
const { DebtAmortizationEngine } = require('../services/debt/debtAmortizationEngine');
const ApiResponse = require('../utils/response');

class DebtController {
  /**
   * Get all debts for user
   * GET /api/debts
   */
  static async getDebts(req, res) {
    try {
      const userId = req.user._id;
      const debts = await Debt.find({ userId }).sort({ status: 1, interestRate: -1 });

      const totalBalance = debts
        .filter((d) => d.status === 'ACTIVE')
        .reduce((sum, d) => sum + d.principalBalance, 0);

      const totalMinimumMonthly = debts
        .filter((d) => d.status === 'ACTIVE')
        .reduce((sum, d) => sum + d.minimumPayment, 0);

      return ApiResponse.success(res, {
        debts,
        totalBalance: Math.round(totalBalance * 100) / 100,
        totalMinimumMonthly: Math.round(totalMinimumMonthly * 100) / 100,
        activeCount: debts.filter((d) => d.status === 'ACTIVE').length,
        paidOffCount: debts.filter((d) => d.status === 'PAID_OFF').length,
      });
    } catch (err) {
      console.error('[DebtController:getDebts]', err);
      return ApiResponse.error(res, err.message || 'Failed to fetch debts', 500);
    }
  }

  /**
   * Create a new debt liability
   * POST /api/debts
   */
  static async createDebt(req, res) {
    try {
      const userId = req.user._id;
      const {
        name,
        category = 'Credit Card',
        principalBalance,
        interestRate,
        minimumPayment,
        dueDay = 1,
      } = req.body;

      if (!name || principalBalance === undefined || interestRate === undefined || minimumPayment === undefined) {
        return ApiResponse.error(res, 'Name, principal balance, interest rate (APR), and minimum payment are required', 400);
      }

      const newDebt = await Debt.create({
        userId,
        name: name.trim(),
        category,
        principalBalance: Number(principalBalance),
        originalBalance: Number(principalBalance),
        interestRate: Number(interestRate),
        minimumPayment: Number(minimumPayment),
        dueDay: Number(dueDay) || 1,
        status: Number(principalBalance) <= 0 ? 'PAID_OFF' : 'ACTIVE',
        payments: [],
      });

      return ApiResponse.success(res, { debt: newDebt }, 'Debt created successfully', 201);
    } catch (err) {
      console.error('[DebtController:createDebt]', err);
      return ApiResponse.error(res, err.message || 'Failed to create debt liability', 500);
    }
  }

  /**
   * Update debt liability
   * PUT /api/debts/:id
   */
  static async updateDebt(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const { name, category, principalBalance, interestRate, minimumPayment, dueDay, status } = req.body;

      const debt = await Debt.findOne({ _id: id, userId });
      if (!debt) {
        return ApiResponse.error(res, 'Debt record not found', 404);
      }

      if (name) debt.name = name.trim();
      if (category) debt.category = category;
      if (principalBalance !== undefined) {
        debt.principalBalance = Number(principalBalance);
        if (debt.principalBalance <= 0) debt.status = 'PAID_OFF';
      }
      if (interestRate !== undefined) debt.interestRate = Number(interestRate);
      if (minimumPayment !== undefined) debt.minimumPayment = Number(minimumPayment);
      if (dueDay !== undefined) debt.dueDay = Number(dueDay);
      if (status) debt.status = status;

      await debt.save();

      return ApiResponse.success(res, { debt }, 'Debt record updated successfully');
    } catch (err) {
      console.error('[DebtController:updateDebt]', err);
      return ApiResponse.error(res, err.message || 'Failed to update debt record', 500);
    }
  }

  /**
   * Delete debt liability
   * DELETE /api/debts/:id
   */
  static async deleteDebt(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const deleted = await Debt.findOneAndDelete({ _id: id, userId });
      if (!deleted) {
        return ApiResponse.error(res, 'Debt record not found', 404);
      }

      return ApiResponse.success(res, null, 'Debt liability deleted successfully');
    } catch (err) {
      console.error('[DebtController:deleteDebt]', err);
      return ApiResponse.error(res, err.message || 'Failed to delete debt record', 500);
    }
  }

  /**
   * Run Snowball vs Avalanche Payoff Simulation
   * POST /api/debts/simulate
   */
  static async simulatePayoff(req, res) {
    try {
      const userId = req.user._id;
      const { extraMonthlyBudget = 0 } = req.body;

      const debts = await Debt.find({ userId, status: 'ACTIVE' });
      const simulation = DebtAmortizationEngine.simulate({
        debts,
        extraMonthlyBudget: Number(extraMonthlyBudget) || 0,
      });

      return ApiResponse.success(res, simulation);
    } catch (err) {
      console.error('[DebtController:simulatePayoff]', err);
      return ApiResponse.error(res, err.message || 'Failed to simulate payoff schedule', 500);
    }
  }

  /**
   * Log an EMI / Payoff Payment against a debt (and sync to personal Expense ledger)
   * POST /api/debts/:id/pay
   */
  static async logPayment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const { amount, date, notes = '', syncToExpenses = true } = req.body;

      if (!amount || Number(amount) <= 0) {
        return ApiResponse.error(res, 'Valid payment amount is required', 400);
      }

      const debt = await Debt.findOne({ _id: id, userId });
      if (!debt) {
        return ApiResponse.error(res, 'Debt record not found', 404);
      }

      const paymentAmt = Number(amount);
      const paymentDate = date ? new Date(date) : new Date();

      // Deduct from principal
      debt.principalBalance = Math.max(0, Math.round((debt.principalBalance - paymentAmt) * 100) / 100);
      if (debt.principalBalance <= 0) {
        debt.status = 'PAID_OFF';
      }

      let expenseId = null;

      // Sync to Expense collection if requested
      if (syncToExpenses) {
        const expense = await Expense.create({
          userId,
          title: `EMI Payment: ${debt.name}`,
          amount: paymentAmt,
          category: 'Housing & Utilities',
          paymentMethod: 'Bank Transfer',
          date: paymentDate,
          notes: notes || `Debt payoff payment towards ${debt.name}`,
          tags: ['DebtPayoff', debt.category.replace(/\s+/g, '')],
        });
        expenseId = expense._id;
      }

      debt.payments.unshift({
        amount: paymentAmt,
        date: paymentDate,
        expenseId,
        notes,
      });

      await debt.save();

      return ApiResponse.success(res, { debt, expenseId }, 'Debt payment logged successfully', 201);
    } catch (err) {
      console.error('[DebtController:logPayment]', err);
      return ApiResponse.error(res, err.message || 'Failed to log debt payment', 500);
    }
  }
}

module.exports = { DebtController };
