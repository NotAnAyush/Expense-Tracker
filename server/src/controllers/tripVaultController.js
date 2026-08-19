const { TripVault } = require('../models/TripVault');
const Expense = require('../models/Expense');
const { FxService } = require('../services/fx/fxService');
const ApiResponse = require('../utils/response');

class TripVaultController {
  /**
   * List all trip vaults for user
   * GET /api/trips
   */
  static async getTrips(req, res) {
    try {
      const userId = req.user._id;
      const trips = await TripVault.find({ userId }).sort({ updatedAt: -1 });

      const enrichedTrips = trips.map((t) => {
        const totalSpentBase = t.expenses.reduce((sum, e) => sum + e.baseAmount, 0);
        const remainingBudgetBase = Math.max(0, t.budgetBaseCurrency - totalSpentBase);
        const burnRatePct = t.budgetBaseCurrency > 0
          ? Math.min(100, Math.round((totalSpentBase / t.budgetBaseCurrency) * 1000) / 10)
          : 0;

        return {
          _id: t._id,
          name: t.name,
          destination: t.destination,
          tripCurrency: t.tripCurrency,
          baseCurrency: t.baseCurrency,
          budgetBaseCurrency: t.budgetBaseCurrency,
          totalSpentBase: Math.round(totalSpentBase * 100) / 100,
          remainingBudgetBase: Math.round(remainingBudgetBase * 100) / 100,
          burnRatePct,
          expenseCount: t.expenses.length,
          status: t.status,
          startDate: t.startDate,
          endDate: t.endDate,
        };
      });

      return ApiResponse.success(res, { trips: enrichedTrips });
    } catch (err) {
      console.error('[TripVaultController:getTrips]', err);
      return ApiResponse.error(res, err.message || 'Failed to fetch trips', 500);
    }
  }

  /**
   * Create a new trip vault
   * POST /api/trips
   */
  static async createTrip(req, res) {
    try {
      const userId = req.user._id;
      const {
        name,
        destination,
        tripCurrency = 'USD',
        budgetBaseCurrency,
        startDate,
        endDate,
      } = req.body;

      if (!name || !destination || budgetBaseCurrency === undefined) {
        return ApiResponse.error(res, 'Name, destination, and budget in base currency are required', 400);
      }

      const newTrip = await TripVault.create({
        userId,
        name: name.trim(),
        destination: destination.trim(),
        tripCurrency: tripCurrency.toUpperCase().trim(),
        baseCurrency: req.user.currency || 'INR',
        budgetBaseCurrency: Number(budgetBaseCurrency),
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : undefined,
        status: 'ACTIVE',
        expenses: [],
      });

      return ApiResponse.success(res, { trip: newTrip }, 'Trip vault created successfully', 201);
    } catch (err) {
      console.error('[TripVaultController:createTrip]', err);
      return ApiResponse.error(res, err.message || 'Failed to create trip vault', 500);
    }
  }

  /**
   * Get single trip vault details with complete multi-currency expense ledger
   * GET /api/trips/:id
   */
  static async getTripById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const trip = await TripVault.findOne({ _id: id, userId });
      if (!trip) {
        return ApiResponse.error(res, 'Trip vault not found', 404);
      }

      const totalSpentBase = trip.expenses.reduce((sum, e) => sum + e.baseAmount, 0);
      const remainingBudgetBase = Math.max(0, trip.budgetBaseCurrency - totalSpentBase);
      const burnRatePct = trip.budgetBaseCurrency > 0
        ? Math.min(100, Math.round((totalSpentBase / trip.budgetBaseCurrency) * 1000) / 10)
        : 0;

      // Current live FX rate for quick reference
      const fxInfo = FxService.convert({
        amount: 1,
        fromCurrency: trip.tripCurrency,
        toCurrency: trip.baseCurrency,
      });

      return ApiResponse.success(res, {
        trip,
        totalSpentBase: Math.round(totalSpentBase * 100) / 100,
        remainingBudgetBase: Math.round(remainingBudgetBase * 100) / 100,
        burnRatePct,
        currentExchangeRate: fxInfo.exchangeRate,
      });
    } catch (err) {
      console.error('[TripVaultController:getTripById]', err);
      return ApiResponse.error(res, err.message || 'Failed to fetch trip vault details', 500);
    }
  }

  /**
   * Add a multi-currency expense to a trip vault
   * POST /api/trips/:id/expenses
   */
  static async addTripExpense(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const {
        description,
        foreignAmount,
        currency,
        customExchangeRate,
        category = 'Travel & Vacation',
        date,
        paymentMethod = 'Card',
        syncToExpenses = true,
      } = req.body;

      if (!description || !foreignAmount || Number(foreignAmount) <= 0) {
        return ApiResponse.error(res, 'Description and valid foreign amount are required', 400);
      }

      const trip = await TripVault.findOne({ _id: id, userId });
      if (!trip) {
        return ApiResponse.error(res, 'Trip vault not found', 404);
      }

      const usedCurrency = (currency || trip.tripCurrency).toUpperCase().trim();
      let rate = Number(customExchangeRate);

      if (!rate || rate <= 0) {
        const conversion = FxService.convert({
          amount: 1,
          fromCurrency: usedCurrency,
          toCurrency: trip.baseCurrency,
        });
        rate = conversion.exchangeRate;
      }

      const foreignAmt = Number(foreignAmount);
      const baseAmt = Math.round(foreignAmt * rate * 100) / 100;
      const expenseDate = date ? new Date(date) : new Date();

      const newExpense = {
        description: description.trim(),
        foreignAmount: foreignAmt,
        currency: usedCurrency,
        exchangeRate: rate,
        baseAmount: baseAmt,
        category,
        date: expenseDate,
        paymentMethod,
      };

      trip.expenses.unshift(newExpense);
      await trip.save();

      // Sync to main personal Expense ledger if enabled
      if (syncToExpenses) {
        await Expense.create({
          userId,
          title: `[${trip.name}] ${description.trim()}`,
          amount: baseAmt,
          category: 'Travel & Vacation',
          paymentMethod: paymentMethod === 'Card' ? 'Card' : 'Other',
          date: expenseDate,
          notes: `${foreignAmt} ${usedCurrency} @ ₹${rate} (Trip Vault: ${trip.name})`,
          tags: ['TripVault', trip.destination.replace(/\s+/g, '')],
        });
      }

      const totalSpentBase = trip.expenses.reduce((sum, e) => sum + e.baseAmount, 0);

      return ApiResponse.success(res, {
        expense: newExpense,
        totalSpentBase: Math.round(totalSpentBase * 100) / 100,
        remainingBudgetBase: Math.max(0, Math.round((trip.budgetBaseCurrency - totalSpentBase) * 100) / 100),
      }, 'Trip expense logged successfully', 201);
    } catch (err) {
      console.error('[TripVaultController:addTripExpense]', err);
      return ApiResponse.error(res, err.message || 'Failed to log trip expense', 500);
    }
  }

  /**
   * Delete a trip expense
   * DELETE /api/trips/:id/expenses/:expenseId
   */
  static async deleteTripExpense(req, res) {
    try {
      const { id, expenseId } = req.params;
      const userId = req.user._id;

      const trip = await TripVault.findOne({ _id: id, userId });
      if (!trip) {
        return ApiResponse.error(res, 'Trip vault not found', 404);
      }

      trip.expenses = trip.expenses.filter((e) => e._id.toString() !== expenseId);
      await trip.save();

      const totalSpentBase = trip.expenses.reduce((sum, e) => sum + e.baseAmount, 0);

      return ApiResponse.success(res, {
        totalSpentBase: Math.round(totalSpentBase * 100) / 100,
        remainingBudgetBase: Math.max(0, Math.round((trip.budgetBaseCurrency - totalSpentBase) * 100) / 100),
      }, 'Trip expense deleted successfully');
    } catch (err) {
      console.error('[TripVaultController:deleteTripExpense]', err);
      return ApiResponse.error(res, err.message || 'Failed to delete trip expense', 500);
    }
  }

  /**
   * Get Live FX Rates
   * GET /api/fx/rates?base=INR&refresh=true
   */
  static async getFxRates(req, res) {
    try {
      const baseCurrency = req.query.base || req.user?.currency || 'INR';
      const forceRefresh = req.query.refresh === 'true' || req.query.force === 'true';
      const rates = await FxService.getRates(baseCurrency, forceRefresh);
      return ApiResponse.success(res, rates);
    } catch (err) {
      console.error('[TripVaultController:getFxRates]', err);
      return ApiResponse.error(res, err.message || 'Failed to fetch FX rates', 500);
    }
  }

  /**
   * Convert Currency on the Fly
   * POST /api/fx/convert
   */
  static async convertCurrency(req, res) {
    try {
      const { amount, fromCurrency, toCurrency, forceRefresh } = req.body;
      const result = await FxService.convertAsync({
        amount: Number(amount) || 0,
        fromCurrency: fromCurrency || 'USD',
        toCurrency: toCurrency || req.user?.currency || 'INR',
        forceRefresh: !!forceRefresh,
      });
      return ApiResponse.success(res, result);
    } catch (err) {
      console.error('[TripVaultController:convertCurrency]', err);
      return ApiResponse.error(res, err.message || 'Currency conversion failed', 500);
    }
  }
}

module.exports = { TripVaultController };
