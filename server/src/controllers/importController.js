const ImportService = require('../services/import/importService');
const ApiResponse = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');
const { BadRequestError } = require('../utils/errors');

/**
 * Controller for Bank Statement Ingestion
 */
const previewBankStatement = asyncHandler(async (req, res) => {
  const { csvContent } = req.body;
  if (!csvContent || typeof csvContent !== 'string' || csvContent.trim().length === 0) {
    throw new BadRequestError('CSV content is required to preview bank statement');
  }

  const preview = await ImportService.previewStatement(req.user._id, csvContent);
  return ApiResponse.success(res, preview, 'Bank statement parsed and staged successfully');
});

const commitBankStatement = asyncHandler(async (req, res) => {
  const { transactions } = req.body;
  if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
    throw new BadRequestError('Transactions array is required for batch import commit');
  }

  const result = await ImportService.commitStatement(req.user._id, transactions);
  return ApiResponse.success(res, result, 'Transactions committed successfully to ledger');
});

module.exports = {
  previewBankStatement,
  commitBankStatement,
};
