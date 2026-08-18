const asyncHandler = require('../utils/asyncHandler');
const FamilyService = require('../services/family/familyService');

exports.createVault = asyncHandler(async (req, res) => {
  const vault = await FamilyService.createVault(req.user, req.body);
  res.status(201).json(vault);
});

exports.getVaults = asyncHandler(async (req, res) => {
  const vaults = await FamilyService.getVaultsForUser(req.user._id, req.user.email);
  res.json({ vaults });
});

exports.addMember = asyncHandler(async (req, res) => {
  const vault = await FamilyService.addMember(req.params.id, req.user._id, req.body);
  res.json(vault);
});

exports.addSharedExpense = asyncHandler(async (req, res) => {
  const vault = await FamilyService.addSharedExpense(req.params.id, req.user._id, req.body);
  res.json(vault);
});

exports.getVaultSummary = asyncHandler(async (req, res) => {
  const summary = await FamilyService.getVaultSummary(req.params.id, req.user._id);
  res.json(summary);
});
