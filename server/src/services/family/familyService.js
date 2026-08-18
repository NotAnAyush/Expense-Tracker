const FamilyVault = require('../../models/FamilyVault');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../../utils/errors');

/**
 * Family Vault Service
 * Multi-user household ledgers with Role-Based Access Control (RBAC).
 * Adheres to ADR-012.
 */
class FamilyService {
  /**
   * Create a new family household vault
   */
  static async createVault(user, { name, description = '', currency = '₹', sharedBudgets = [] }) {
    if (!name || name.trim().length === 0) {
      throw new BadRequestError('Family vault name is required');
    }

    const vault = new FamilyVault({
      name: name.trim(),
      description: description.trim(),
      ownerId: user._id,
      currency,
      members: [
        {
          userId: user._id,
          name: user.name || 'Owner',
          email: user.email.toLowerCase(),
          role: 'OWNER',
          monthlySpendingLimit: 0,
        },
      ],
      sharedBudgets,
      sharedExpenses: [],
    });

    await vault.save();
    return vault;
  }

  /**
   * List all family vaults the user belongs to
   */
  static async getVaultsForUser(userId, email) {
    const userEmail = (email || '').toLowerCase();
    return FamilyVault.find({
      $or: [{ ownerId: userId }, { 'members.userId': userId }, { 'members.email': userEmail }],
    }).sort({ updatedAt: -1 });
  }

  /**
   * Add a family member to the vault (Owner/Admin only)
   */
  static async addMember(vaultId, requestingUserId, { name, email, role = 'CONTRIBUTOR', monthlySpendingLimit = 0 }) {
    const vault = await FamilyVault.findById(vaultId);
    if (!vault) throw new NotFoundError('Family vault not found');

    this._assertAdminOrOwner(vault, requestingUserId);

    const cleanEmail = email.toLowerCase().trim();
    const existing = vault.members.find((m) => m.email === cleanEmail);
    if (existing) {
      throw new BadRequestError('Member with this email is already in the family vault');
    }

    vault.members.push({
      name: name.trim(),
      email: cleanEmail,
      role,
      monthlySpendingLimit: Number(monthlySpendingLimit) || 0,
    });

    await vault.save();
    return vault;
  }

  /**
   * Log a shared household expense
   */
  static async addSharedExpense(vaultId, requestingUserId, expenseData) {
    const vault = await FamilyVault.findById(vaultId);
    if (!vault) throw new NotFoundError('Family vault not found');

    const member = vault.members.find((m) => String(m.userId) === String(requestingUserId) || String(m.userId) === String(requestingUserId));
    if (!member && String(vault.ownerId) !== String(requestingUserId)) {
      throw new ForbiddenError('You are not a member of this family vault');
    }

    const memberRole = member ? member.role : 'OWNER';
    if (memberRole === 'VIEWER') {
      throw new ForbiddenError('Viewers cannot log expenses in this family vault');
    }

    const { title, amount, category, date, notes } = expenseData;
    if (!title || !amount || Number(amount) <= 0) {
      throw new BadRequestError('Valid expense title and positive amount are required');
    }

    vault.sharedExpenses.push({
      title: title.trim(),
      amount: Number(amount),
      category: category || 'General & Miscellaneous',
      paidByMemberId: member ? member._id : vault.ownerId,
      paidByMemberName: member ? member.name : 'Owner',
      date: date ? new Date(date) : new Date(),
      notes: notes || '',
    });

    await vault.save();
    return vault;
  }

  /**
   * Generate aggregate family summary and budget utilization
   */
  static async getVaultSummary(vaultId, requestingUserId) {
    const vault = await FamilyVault.findById(vaultId);
    if (!vault) throw new NotFoundError('Family vault not found');

    const isMember = vault.members.some((m) => String(m.userId) === String(requestingUserId)) || String(vault.ownerId) === String(requestingUserId);
    if (!isMember) {
      throw new ForbiddenError('Access denied to this family vault');
    }

    const totalSharedSpend = vault.sharedExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

    // Spend by category
    const categoryBreakdown = {};
    vault.sharedExpenses.forEach((exp) => {
      categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
    });

    // Spend by member
    const memberContribution = {};
    vault.sharedExpenses.forEach((exp) => {
      memberContribution[exp.paidByMemberName] = (memberContribution[exp.paidByMemberName] || 0) + exp.amount;
    });

    return {
      vaultId: vault._id,
      vaultName: vault.name,
      currency: vault.currency,
      memberCount: vault.members.length,
      totalSharedSpend: Number(totalSharedSpend.toFixed(2)),
      categoryBreakdown,
      memberContribution,
      sharedBudgets: vault.sharedBudgets,
      recentExpenses: vault.sharedExpenses.slice(-10).reverse(),
    };
  }

  static _assertAdminOrOwner(vault, userId) {
    const isOwner = String(vault.ownerId) === String(userId);
    const member = vault.members.find((m) => String(m.userId) === String(userId));
    const isAdmin = member && (member.role === 'ADMIN' || member.role === 'OWNER');

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('Only the vault owner or admin can manage family members');
    }
  }
}

module.exports = FamilyService;
