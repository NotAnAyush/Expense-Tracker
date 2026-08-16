const { Group } = require('../models/Group');
const { DebtSimplificationEngine } = require('../services/group/debtSimplificationEngine');
const ApiResponse = require('../utils/response');

class GroupController {
  /**
   * Create a new expense group
   * POST /api/groups
   */
  static async createGroup(req, res) {
    try {
      const { name, description, currency = 'INR', members = [] } = req.body;
      const userId = req.user._id;

      if (!name || !name.trim()) {
        return ApiResponse.error(res, 'Group name is required', 400);
      }

      // Ensure creator is in member list
      const memberList = Array.isArray(members) ? [...members] : [];
      const hasCreator = memberList.some(
        (m) => m.userId?.toString() === userId.toString() || m.name?.toLowerCase() === req.user.name?.toLowerCase()
      );

      if (!hasCreator) {
        memberList.unshift({
          name: req.user.name || 'Me',
          email: req.user.email || '',
          upiId: '',
          userId: userId,
        });
      }

      const newGroup = await Group.create({
        name: name.trim(),
        description: description?.trim() || '',
        currency,
        createdBy: userId,
        members: memberList,
        expenses: [],
        settlements: [],
      });

      return ApiResponse.success(res, { group: newGroup }, 'Group created successfully', 201);
    } catch (err) {
      console.error('[GroupController:createGroup]', err);
      return ApiResponse.error(res, err.message || 'Failed to create group', 500);
    }
  }

  /**
   * Get all groups for current user with summary balances
   * GET /api/groups
   */
  static async getGroups(req, res) {
    try {
      const userId = req.user._id;
      const groups = await Group.find({
        $or: [
          { createdBy: userId },
          { 'members.userId': userId },
          { 'members.email': req.user.email },
        ],
      }).sort({ updatedAt: -1 });

      const enrichedGroups = groups.map((g) => {
        const { memberBalances, totalGroupSpend } = DebtSimplificationEngine.calculateBalances(
          g.members,
          g.expenses,
          g.settlements
        );
        const simplifiedTransfers = DebtSimplificationEngine.simplifyDebts(memberBalances);

        // Find user balance in this group
        const myName = req.user.name?.toLowerCase() || '';
        const myEntry = memberBalances.find(
          (m) => m.userId?.toString() === userId.toString() || m.name?.toLowerCase() === myName
        );

        return {
          _id: g._id,
          name: g.name,
          description: g.description,
          currency: g.currency,
          memberCount: g.members.length,
          expenseCount: g.expenses.length,
          totalSpend: totalGroupSpend,
          myNetBalance: myEntry ? myEntry.net : 0,
          pendingSettlementsCount: simplifiedTransfers.length,
          updatedAt: g.updatedAt,
        };
      });

      return ApiResponse.success(res, { groups: enrichedGroups });
    } catch (err) {
      console.error('[GroupController:getGroups]', err);
      return ApiResponse.error(res, err.message || 'Failed to fetch groups', 500);
    }
  }

  /**
   * Get single group details with complete ledger and simplified debt matrix
   * GET /api/groups/:id
   */
  static async getGroupById(req, res) {
    try {
      const { id } = req.params;
      const group = await Group.findById(id);

      if (!group) {
        return ApiResponse.error(res, 'Group not found', 404);
      }

      const { memberBalances, totalGroupSpend } = DebtSimplificationEngine.calculateBalances(
        group.members,
        group.expenses,
        group.settlements
      );

      const simplifiedTransfers = DebtSimplificationEngine.simplifyDebts(memberBalances);

      return ApiResponse.success(res, {
        group,
        memberBalances,
        simplifiedTransfers,
        totalGroupSpend,
      });
    } catch (err) {
      console.error('[GroupController:getGroupById]', err);
      return ApiResponse.error(res, err.message || 'Failed to fetch group details', 500);
    }
  }

  /**
   * Add an expense to group
   * POST /api/groups/:id/expenses
   */
  static async addExpense(req, res) {
    try {
      const { id } = req.params;
      const { description, amount, paidBy, date, category = 'General', splitType = 'EQUAL', customSplits } = req.body;

      if (!description || !amount || Number(amount) <= 0 || !paidBy) {
        return ApiResponse.error(res, 'Description, valid amount, and payer are required', 400);
      }

      const group = await Group.findById(id);
      if (!group) {
        return ApiResponse.error(res, 'Group not found', 404);
      }

      const parsedAmount = Number(amount);
      let splits = [];

      if (splitType === 'EQUAL') {
        splits = DebtSimplificationEngine.computeSplits({
          totalAmount: parsedAmount,
          splitType: 'EQUAL',
          members: group.members,
        });
      } else if (Array.isArray(customSplits) && customSplits.length > 0) {
        splits = DebtSimplificationEngine.computeSplits({
          totalAmount: parsedAmount,
          splitType,
          members: customSplits,
        });
      } else {
        return ApiResponse.error(res, 'Custom splits required for non-equal split type', 400);
      }

      const newExpense = {
        description: description.trim(),
        amount: parsedAmount,
        paidBy: paidBy.trim(),
        date: date ? new Date(date) : new Date(),
        category,
        splitType,
        splits,
        createdBy: req.user._id,
      };

      group.expenses.unshift(newExpense);
      await group.save();

      const { memberBalances, totalGroupSpend } = DebtSimplificationEngine.calculateBalances(
        group.members,
        group.expenses,
        group.settlements
      );
      const simplifiedTransfers = DebtSimplificationEngine.simplifyDebts(memberBalances);

      return ApiResponse.success(res, {
        expense: newExpense,
        memberBalances,
        simplifiedTransfers,
        totalGroupSpend,
      }, 'Group expense added successfully', 201);
    } catch (err) {
      console.error('[GroupController:addExpense]', err);
      return ApiResponse.error(res, err.message || 'Failed to add group expense', 500);
    }
  }

  /**
   * Delete an expense from group
   * DELETE /api/groups/:id/expenses/:expenseId
   */
  static async deleteExpense(req, res) {
    try {
      const { id, expenseId } = req.params;
      const group = await Group.findById(id);

      if (!group) {
        return ApiResponse.error(res, 'Group not found', 404);
      }

      group.expenses = group.expenses.filter((e) => e.id !== expenseId && e._id?.toString() !== expenseId);
      await group.save();

      const { memberBalances, totalGroupSpend } = DebtSimplificationEngine.calculateBalances(
        group.members,
        group.expenses,
        group.settlements
      );
      const simplifiedTransfers = DebtSimplificationEngine.simplifyDebts(memberBalances);

      return ApiResponse.success(res, {
        memberBalances,
        simplifiedTransfers,
        totalGroupSpend,
      }, 'Group expense deleted successfully');
    } catch (err) {
      console.error('[GroupController:deleteExpense]', err);
      return ApiResponse.error(res, err.message || 'Failed to delete group expense', 500);
    }
  }

  /**
   * Record a settlement between two members
   * POST /api/groups/:id/settle
   */
  static async recordSettlement(req, res) {
    try {
      const { id } = req.params;
      const { fromMember, toMember, amount, method = 'UPI', notes = '' } = req.body;

      if (!fromMember || !toMember || !amount || Number(amount) <= 0) {
        return ApiResponse.error(res, 'fromMember, toMember, and valid amount are required', 400);
      }

      const group = await Group.findById(id);
      if (!group) {
        return ApiResponse.error(res, 'Group not found', 404);
      }

      const settlementEntry = {
        fromMember: fromMember.trim(),
        toMember: toMember.trim(),
        amount: Number(amount),
        date: new Date(),
        method,
        notes: notes.trim(),
        recordedBy: req.user._id,
      };

      group.settlements.unshift(settlementEntry);
      await group.save();

      const { memberBalances, totalGroupSpend } = DebtSimplificationEngine.calculateBalances(
        group.members,
        group.expenses,
        group.settlements
      );
      const simplifiedTransfers = DebtSimplificationEngine.simplifyDebts(memberBalances);

      return ApiResponse.success(res, {
        settlement: settlementEntry,
        memberBalances,
        simplifiedTransfers,
      }, 'Settlement recorded successfully', 201);
    } catch (err) {
      console.error('[GroupController:recordSettlement ERROR]', err.stack || err);
      return ApiResponse.error(res, err.message || 'Failed to record settlement', 500);
    }
  }
}

module.exports = { GroupController };
