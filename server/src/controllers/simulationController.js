const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Goal = require('../models/Goal');
const { FireSimulatorEngine } = require('../services/analytics/fireSimulatorEngine');
const ApiResponse = require('../utils/response');

class SimulationController {
  /**
   * Get user baseline financial context for simulation
   * GET /api/simulations/context
   */
  static async getSimulationContext(req, res) {
    try {
      const userId = req.user._id;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const [monthlyExpenses, monthlyIncomes, goals] = await Promise.all([
        Expense.aggregate([
          { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Income.aggregate([
          { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Goal.find({ userId }),
      ]);

      const currentMonthlyExpense = monthlyExpenses[0]?.total || 45000;
      const currentMonthlyIncome = monthlyIncomes[0]?.total || 100000;
      const totalGoalSavings = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
      const currentNetWorth = totalGoalSavings > 0 ? totalGoalSavings : 350000;

      const fireMilestones = FireSimulatorEngine.calculateFireMilestones({
        monthlyIncome: currentMonthlyIncome,
        monthlyExpense: currentMonthlyExpense,
        currentSavings: currentNetWorth,
      });

      const monteCarlo = FireSimulatorEngine.runMonteCarloSimulation({
        currentNetWorth,
        monthlyContribution: Math.max(0, currentMonthlyIncome - currentMonthlyExpense),
        years: 25,
      });

      return ApiResponse.success(res, {
        context: {
          currentMonthlyIncome,
          currentMonthlyExpense,
          currentNetWorth,
        },
        fireMilestones,
        monteCarlo,
      });
    } catch (err) {
      console.error('[SimulationController:getSimulationContext]', err);
      return ApiResponse.error(res, err.message || 'Failed to fetch simulation context', 500);
    }
  }

  /**
   * Run What-If Scenario Calculation
   * POST /api/simulations/what-if
   */
  static async simulateWhatIf(req, res) {
    try {
      const {
        currentMonthlyIncome,
        currentMonthlyExpense,
        currentNetWorth,
        deltaIncome = 0,
        deltaExpense = 0,
        deltaOneTime = 0,
        annualReturnPct = 11.5,
      } = req.body;

      const results = FireSimulatorEngine.calculateWhatIf({
        currentMonthlyIncome: Number(currentMonthlyIncome) || 100000,
        currentMonthlyExpense: Number(currentMonthlyExpense) || 50000,
        currentNetWorth: Number(currentNetWorth) || 500000,
        deltaIncome: Number(deltaIncome) || 0,
        deltaExpense: Number(deltaExpense) || 0,
        deltaOneTime: Number(deltaOneTime) || 0,
        annualReturnPct: Number(annualReturnPct) || 11.5,
      });

      return ApiResponse.success(res, results);
    } catch (err) {
      console.error('[SimulationController:simulateWhatIf]', err);
      return ApiResponse.error(res, err.message || 'Failed to calculate what-if scenario', 500);
    }
  }

  /**
   * Run custom Monte Carlo Stochastic Simulation
   * POST /api/simulations/monte-carlo
   */
  static async simulateMonteCarlo(req, res) {
    try {
      const {
        currentNetWorth = 500000,
        monthlyContribution = 30000,
        years = 25,
        expectedReturn = 11.5,
        volatility = 15.0,
        inflation = 6.0,
        runs = 1000,
      } = req.body;

      const results = FireSimulatorEngine.runMonteCarloSimulation({
        currentNetWorth: Number(currentNetWorth),
        monthlyContribution: Number(monthlyContribution),
        years: Number(years),
        expectedReturn: Number(expectedReturn),
        volatility: Number(volatility),
        inflation: Number(inflation),
        runs: Number(runs),
      });

      return ApiResponse.success(res, results);
    } catch (err) {
      console.error('[SimulationController:simulateMonteCarlo]', err);
      return ApiResponse.error(res, err.message || 'Failed to run Monte Carlo simulation', 500);
    }
  }
}

module.exports = { SimulationController };
