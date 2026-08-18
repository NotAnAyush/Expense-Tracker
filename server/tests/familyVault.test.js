const mongoose = require('mongoose');
const FamilyService = require('../src/services/family/familyService');
const FamilyVault = require('../src/models/FamilyVault');

describe('Family Vault Multi-User Service (Phase 9)', () => {
  const mockOwnerId = new mongoose.Types.ObjectId();
  const mockMemberId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('creates a new family household vault with owner as first member', async () => {
    const mockUser = { _id: mockOwnerId, name: 'Aarav Sharma', email: 'aarav@example.com' };
    const vaultData = { name: 'Sharma Household', description: 'Shared family vault', currency: '₹' };

    jest.spyOn(FamilyVault.prototype, 'save').mockImplementation(function () {
      return Promise.resolve(this);
    });

    const vault = await FamilyService.createVault(mockUser, vaultData);
    expect(vault.name).toBe('Sharma Household');
    expect(vault.members.length).toBe(1);
    expect(vault.members[0].role).toBe('OWNER');
    expect(vault.members[0].email).toBe('aarav@example.com');
  });

  test('adds a member to the family vault with CONTRIBUTOR role', async () => {
    const mockVault = new FamilyVault({
      name: 'Sharma Household',
      ownerId: mockOwnerId,
      members: [{ userId: mockOwnerId, name: 'Aarav', email: 'aarav@example.com', role: 'OWNER' }],
      sharedExpenses: [],
    });

    jest.spyOn(FamilyVault, 'findById').mockResolvedValue(mockVault);
    jest.spyOn(mockVault, 'save').mockResolvedValue(mockVault);

    const updated = await FamilyService.addMember(mockVault._id, mockOwnerId, {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      role: 'CONTRIBUTOR',
    });

    expect(updated.members.length).toBe(2);
    expect(updated.members[1].name).toBe('Priya Sharma');
    expect(updated.members[1].role).toBe('CONTRIBUTOR');
  });

  test('logs a shared household expense and updates member contributions', async () => {
    const mockVault = new FamilyVault({
      name: 'Sharma Household',
      ownerId: mockOwnerId,
      members: [
        { _id: mockOwnerId, userId: mockOwnerId, name: 'Aarav', email: 'aarav@example.com', role: 'OWNER' },
        { _id: mockMemberId, userId: mockMemberId, name: 'Priya', email: 'priya@example.com', role: 'CONTRIBUTOR' },
      ],
      sharedExpenses: [],
    });

    jest.spyOn(FamilyVault, 'findById').mockResolvedValue(mockVault);
    jest.spyOn(mockVault, 'save').mockResolvedValue(mockVault);

    const updated = await FamilyService.addSharedExpense(mockVault._id, mockMemberId, {
      title: 'Groceries at Zepto',
      amount: 1450,
      category: 'Groceries & Supermarket',
    });

    expect(updated.sharedExpenses.length).toBe(1);
    expect(updated.sharedExpenses[0].title).toBe('Groceries at Zepto');
    expect(updated.sharedExpenses[0].amount).toBe(1450);
  });

  test('calculates accurate aggregate family summary', async () => {
    const mockVault = new FamilyVault({
      name: 'Sharma Household',
      ownerId: mockOwnerId,
      currency: '₹',
      members: [{ userId: mockOwnerId, name: 'Aarav', email: 'aarav@example.com', role: 'OWNER' }],
      sharedExpenses: [
        { title: 'Electricity Bill', amount: 3200, category: 'Housing & Utilities', paidByMemberName: 'Aarav' },
        { title: 'Milk & Groceries', amount: 800, category: 'Groceries & Supermarket', paidByMemberName: 'Aarav' },
      ],
    });

    jest.spyOn(FamilyVault, 'findById').mockResolvedValue(mockVault);

    const summary = await FamilyService.getVaultSummary(mockVault._id, mockOwnerId);
    expect(summary.totalSharedSpend).toBe(4000);
    expect(summary.categoryBreakdown['Housing & Utilities']).toBe(3200);
    expect(summary.categoryBreakdown['Groceries & Supermarket']).toBe(800);
    expect(summary.memberContribution['Aarav']).toBe(4000);
  });
});
