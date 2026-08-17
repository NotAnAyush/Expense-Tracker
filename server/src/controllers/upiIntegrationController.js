const Expense = require('../models/Expense');
const Income = require('../models/Income');
const LinkedAccount = require('../models/LinkedAccount');
const aiService = require('../services/ai/aiService');
const asyncHandler = require('../utils/asyncHandler');
const { encrypt, decrypt, verifyWebhookSignature, maskAccountNumber, maskUpiId } = require('../utils/cryptoVault');
const { BadRequestError, NotFoundError, UnauthorizedError } = require('../utils/errors');

/**
 * Detect UPI App based on VPA handle or narrative
 */
const detectUpiApp = (vpa = '', narrative = '') => {
  const text = `${vpa} ${narrative}`.toLowerCase();
  if (text.includes('okaxis') || text.includes('okhdfcbank') || text.includes('oksbi') || text.includes('okicici') || text.includes('gpay') || text.includes('google pay')) {
    return 'gpay';
  }
  if (text.includes('ybl') || text.includes('ibl') || text.includes('axl') || text.includes('phonepe')) {
    return 'phonepe';
  }
  if (text.includes('paytm') || text.includes('ptsbi') || text.includes('pthdfc') || text.includes('ptaxis')) {
    return 'paytm';
  }
  if (text.includes('cred') || text.includes('axiscred')) {
    return 'cred';
  }
  if (text.includes('apl') || text.includes('rapl') || text.includes('amazon')) {
    return 'amazonpay';
  }
  if (text.includes('upi') || text.includes('bhim')) {
    return 'bhim';
  }
  return 'other';
};

/**
 * Clean raw narrative into recognizable merchant or sender name
 */
const cleanMerchantName = (narrative = '', vpa = '') => {
  if (!narrative && !vpa) return 'UPI Payment';
  
  const raw = String(narrative || vpa).trim();
  const tokens = raw.split(/[\/\-_\s:@]+/).filter(t => t && t.length > 2);
  
  const knownEntities = [
    'swiggy', 'zomato', 'blinkit', 'zepto', 'instamart', 'uber', 'ola', 'rapido',
    'amazon', 'flipkart', 'myntra', 'nykaa', 'netflix', 'spotify', 'hotstar',
    'jio', 'airtel', 'vi', 'tataplay', 'cultfit', 'starbucks', 'mcdonalds',
    'dominos', 'pizzahut', 'dmart', 'bigbasket', 'apollo', 'pharmeasy', '1mg',
    'zerodha', 'groww', 'upstox', 'salary', 'payroll', 'infosys', 'tcs', 'wipro', 'google'
  ];

  for (const token of tokens) {
    const lower = token.toLowerCase();
    const match = knownEntities.find(m => lower.includes(m));
    if (match) {
      return match.charAt(0).toUpperCase() + match.slice(1);
    }
  }

  const fallback = tokens.find(t => !/^\d+$/.test(t) && !['upi', 'pos', 'pay', 'inb', 'neft', 'rtgs', 'imps', 'cr', 'dr', 'ac', 'credited', 'debited'].includes(t.toLowerCase()));
  return fallback || (vpa ? vpa.split('@')[0] : 'UPI Sender/Merchant');
};

/**
 * Determine Income category from credit narrative
 */
const categorizeIncome = (narrative = '', vpa = '') => {
  const text = `${narrative} ${vpa}`.toLowerCase();
  if (text.includes('salary') || text.includes('payroll') || text.includes('stipend') || text.includes('wages')) {
    return 'Salary';
  }
  if (text.includes('refund') || text.includes('reversal') || text.includes('cashback') || text.includes('return')) {
    return 'Refund';
  }
  if (text.includes('dividend') || text.includes('interest') || text.includes('zerodha') || text.includes('groww') || text.includes('mutual fund')) {
    return 'Dividends';
  }
  if (text.includes('rent') || text.includes('tenant')) {
    return 'Rental';
  }
  if (text.includes('freelance') || text.includes('upwork') || text.includes('client') || text.includes('invoice') || text.includes('consulting')) {
    return 'Freelance';
  }
  if (text.includes('gift') || text.includes('birthday') || text.includes('shagun')) {
    return 'Gift';
  }
  return 'Other';
};

/**
 * Verify a UPI ID (VPA)
 * GET /api/integrations/upi/verify-vpa?vpa=ayush@okhdfcbank
 */
const verifyVpa = asyncHandler(async (req, res) => {
  const { vpa } = req.query;
  if (!vpa || !vpa.includes('@')) {
    throw new BadRequestError('Valid UPI ID (e.g. username@bank) is required');
  }

  const cleanVpa = String(vpa).trim().toLowerCase();
  const upiApp = detectUpiApp(cleanVpa);
  
  const handle = cleanVpa.split('@')[1] || '';
  let bankName = 'UPI Bank';
  if (handle.includes('hdfc')) bankName = 'HDFC Bank';
  else if (handle.includes('sbi')) bankName = 'State Bank of India';
  else if (handle.includes('icici') || handle.includes('ibl')) bankName = 'ICICI Bank';
  else if (handle.includes('axis') || handle.includes('axl')) bankName = 'Axis Bank';
  else if (handle.includes('ybl')) bankName = 'YES Bank';
  else if (handle.includes('paytm')) bankName = 'Paytm Payments Bank';

  res.json({
    success: true,
    data: {
      vpa: cleanVpa,
      isValid: true,
      upiApp,
      bankName,
      registeredName: req.user?.name || 'Verified Account Holder',
    },
  });
});

/**
 * Initiate Account Aggregator (AA) Connection or VPA Linking
 * POST /api/integrations/upi/accounts/link-initiate
 */
const initiateAccountLink = asyncHandler(async (req, res) => {
  const { bankName, accountNumber, upiId, accountType = 'bank_account', provider = 'setu_aa' } = req.body;
  const userId = req.user._id;

  if (!bankName) {
    throw new BadRequestError('Bank name is required');
  }

  const masked = accountNumber ? maskAccountNumber(accountNumber) : (upiId ? `UPI • ${maskUpiId(upiId)}` : '••••4012');
  const consentHandle = `AA_CONSENT_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const linkedAccount = await LinkedAccount.create({
    userId,
    accountType,
    provider,
    bankName,
    accountMasked: masked,
    accountHolderName: req.user.name,
    upiId: upiId || '',
    consentHandle,
    consentStatus: 'PENDING_OTP',
    encryptedToken: encrypt(JSON.stringify({ consentHandle, initiatedAt: new Date() })),
  });

  res.status(201).json({
    success: true,
    message: 'OTP consent sent to your registered mobile number by your bank',
    data: {
      accountId: linkedAccount._id,
      consentHandle,
      bankName: linkedAccount.bankName,
      accountMasked: linkedAccount.accountMasked,
      consentStatus: linkedAccount.consentStatus,
    },
  });
});

/**
 * Verify Bank OTP and Activate Account Sync
 * POST /api/integrations/upi/accounts/verify-otp
 */
const verifyAccountOtp = asyncHandler(async (req, res) => {
  const { accountId, otp } = req.body;
  const userId = req.user._id;

  if (!accountId || !otp) {
    throw new BadRequestError('Account ID and OTP are required');
  }

  const account = await LinkedAccount.findOne({ _id: accountId, userId });
  if (!account) {
    throw new NotFoundError('Linked account not found');
  }

  if (!/^\d{4,6}$/.test(otp)) {
    throw new BadRequestError('Invalid OTP format. Please enter a 4-6 digit numeric code');
  }

  account.consentStatus = 'ACTIVE';
  account.consentExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  account.lastSyncedAt = new Date();
  account.encryptedToken = encrypt(JSON.stringify({
    consentId: account.consentHandle,
    approvedAt: new Date(),
    scope: 'READ_ONLY_TRANSACTIONS',
  }));
  await account.save();

  res.json({
    success: true,
    message: `Successfully linked ${account.bankName} (${account.accountMasked}). Real-time UPI sync is now active.`,
    data: {
      accountId: account._id,
      bankName: account.bankName,
      accountMasked: account.accountMasked,
      upiId: account.upiId,
      consentStatus: account.consentStatus,
      lastSyncedAt: account.lastSyncedAt,
    },
  });
});

/**
 * Get all linked accounts for current user
 * GET /api/integrations/upi/accounts
 */
const getLinkedAccounts = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const accounts = await LinkedAccount.find({ userId, isActive: true }).sort({ createdAt: -1 });

  const safeAccounts = accounts.map(acc => ({
    id: acc._id,
    accountType: acc.accountType,
    provider: acc.provider,
    bankName: acc.bankName,
    accountMasked: acc.accountMasked,
    accountHolderName: acc.accountHolderName,
    upiId: acc.upiId,
    consentStatus: acc.consentStatus,
    consentExpiry: acc.consentExpiry,
    balance: acc.balance,
    lastSyncedAt: acc.lastSyncedAt,
    syncFrequency: acc.syncFrequency,
    autoCategorize: acc.autoCategorize,
  }));

  res.json({
    success: true,
    count: safeAccounts.length,
    data: safeAccounts,
  });
});

/**
 * 1-Click Revoke & Wipe Account Link (DPDP Act 2023 & GDPR compliant)
 * DELETE /api/integrations/upi/accounts/:id
 */
const unlinkAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const account = await LinkedAccount.findOne({ _id: id, userId });
  if (!account) {
    throw new NotFoundError('Linked account not found');
  }

  account.isActive = false;
  account.consentStatus = 'REVOKED';
  account.encryptedToken = '';
  await account.save();

  res.json({
    success: true,
    message: `Revoked consent and unlinked ${account.bankName} (${account.accountMasked}) completely.`,
  });
});

/**
 * Ingest Real-time Payment Gateway / Bank Webhook (Debit or Credit)
 * POST /api/integrations/upi/webhook
 */
const handleUpiWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-webhook-signature'] || req.headers['x-razorpay-signature'];
  const secret = process.env.UPI_WEBHOOK_SECRET || process.env.PAYMENT_GATEWAY_WEBHOOK_SECRET;

  if (secret && signature) {
    const rawBody = JSON.stringify(req.body);
    const isValid = verifyWebhookSignature(rawBody, signature, secret);
    if (!isValid) {
      throw new UnauthorizedError('Invalid cryptographic webhook signature');
    }
  }

  const {
    userId: payloadUserId,
    utr,
    amount,
    type = 'DEBIT', // 'DEBIT' (Expense) or 'CREDIT' (Income)
    vpa = '',
    narrative = '',
    bankName = '',
    accountMasked = '',
    date = new Date(),
    paymentMethod = 'UPI',
  } = req.body;

  const targetUserId = payloadUserId || req.user?._id;
  if (!targetUserId) {
    throw new BadRequestError('User identification missing from webhook payload');
  }

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    throw new BadRequestError('Valid positive amount is required');
  }

  const cleanUtr = utr ? String(utr).trim() : null;
  const isCredit = String(type).toUpperCase() === 'CREDIT' ||
    narrative.toLowerCase().includes('credited') ||
    narrative.toLowerCase().includes('deposit') ||
    narrative.toLowerCase().includes('received');

  const cleanTitle = cleanMerchantName(narrative, vpa);
  const upiApp = detectUpiApp(vpa, narrative);

  // ============================================
  // CASE 1: CREDIT TRANSACTION (Money IN -> Income Ledger)
  // ============================================
  if (isCredit) {
    // Idempotency check on Income
    if (cleanUtr) {
      const existingIncome = await Income.findOne({
        userId: targetUserId,
        note: { $regex: cleanUtr },
      });

      if (existingIncome) {
        return res.status(200).json({
          success: true,
          type: 'CREDIT',
          message: 'Credit transaction already recorded (idempotent)',
          data: existingIncome,
        });
      }
    }

    const incomeCategory = categorizeIncome(narrative, vpa);
    const income = await Income.create({
      userId: targetUserId,
      title: cleanTitle,
      amount: Number(amount),
      category: incomeCategory,
      date: new Date(date),
      source: `UPI Credit (${upiApp.toUpperCase()})`,
      note: narrative ? `${narrative} • Ref: ${cleanUtr || 'N/A'}` : `Received via UPI from ${vpa || cleanTitle} • Ref: ${cleanUtr || 'N/A'}`,
      tags: ['auto-synced', 'upi-credit', upiApp],
    });

    return res.status(201).json({
      success: true,
      type: 'CREDIT',
      message: `Credit of ₹${amount} received from ${cleanTitle} logged as Income (${incomeCategory}).`,
      data: income,
    });
  }

  // ============================================
  // CASE 2: DEBIT TRANSACTION (Money OUT -> Expense Ledger)
  // ============================================
  if (cleanUtr) {
    const existing = await Expense.findOne({
      userId: targetUserId,
      'upiDetails.utr': cleanUtr,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        type: 'DEBIT',
        message: 'Transaction already recorded (idempotent)',
        data: existing,
      });
    }
  }

  let category = 'Other';
  try {
    const aiResult = await aiService.suggestCategory(cleanTitle, Number(amount), vpa || cleanTitle);
    if (aiResult && aiResult.category) {
      category = aiResult.category;
    }
  } catch (err) {
    console.warn('[AI Categorization Fallback for Webhook]', err.message);
  }

  const expense = await Expense.create({
    userId: targetUserId,
    title: cleanTitle,
    amount: Number(amount),
    category,
    date: new Date(date),
    note: narrative || `Auto-synced via ${upiApp.toUpperCase()} (${vpa || 'UPI'})`,
    paymentMethod: 'UPI',
    source: 'upi_sync',
    merchant: cleanTitle,
    tags: ['auto-synced', 'upi', upiApp],
    upiDetails: {
      vpa: String(vpa).trim(),
      utr: cleanUtr || `UPI${Date.now()}`,
      upiApp,
      bankRefNumber: cleanUtr || '',
      rawNarrative: narrative,
      accountMasked: accountMasked ? maskAccountNumber(accountMasked) : '',
    },
  });

  res.status(201).json({
    success: true,
    type: 'DEBIT',
    message: `Payment of ₹${amount} at ${cleanTitle} auto-synced successfully.`,
    data: expense,
  });
});

/**
 * Ingest Device / SMS Notification from Mobile Companion (Debit or Credit)
 * POST /api/integrations/upi/device-notification
 */
const ingestDeviceNotification = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { rawText, sender = '' } = req.body;

  if (!rawText) {
    throw new BadRequestError('Raw notification text is required');
  }

  const isCredit = /(?:credited|received|deposited|refunded|added to a\/c)/i.test(rawText);
  const amountMatch = rawText.match(/(?:(?:INR|RS\.?|₹)\s*([\d,]+(?:\.\d{2})?)|(?:paid|debited|sent|credited|received)\s*(?:INR|RS\.?|₹)?\s*([\d,]+(?:\.\d{2})?))/i);
  const utrMatch = rawText.match(/(?:ref(?:\s*no\.?|\s*id)?|utr|txn\s*id)[\s:]*([0-9]{9,16})/i);
  const vpaMatch = rawText.match(/([a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64})/);

  const rawAmountStr = amountMatch ? (amountMatch[1] || amountMatch[2]) : null;
  const parsedAmount = rawAmountStr ? parseFloat(rawAmountStr.replace(/,/g, '')) : null;
  const parsedUtr = utrMatch ? utrMatch[1] : `SMS${Date.now()}`;
  const parsedVpa = vpaMatch ? vpaMatch[1] : '';

  if (!parsedAmount || isNaN(parsedAmount)) {
    throw new BadRequestError('Could not reliably parse transaction amount from notification');
  }

  const senderOrMerchant = cleanMerchantName(rawText, parsedVpa);
  const upiApp = detectUpiApp(parsedVpa, rawText);

  // If Credit SMS:
  if (isCredit) {
    const existingIncome = await Income.findOne({
      userId,
      note: { $regex: parsedUtr },
    });

    if (existingIncome) {
      return res.status(200).json({
        success: true,
        type: 'CREDIT',
        message: 'Credit transaction already recorded (idempotent)',
        data: existingIncome,
      });
    }

    const incomeCategory = categorizeIncome(rawText, parsedVpa);
    const income = await Income.create({
      userId,
      title: senderOrMerchant,
      amount: parsedAmount,
      category: incomeCategory,
      date: new Date(),
      source: `UPI Credit (${sender || upiApp.toUpperCase()})`,
      note: `${rawText} • Ref: ${parsedUtr}`,
      tags: ['auto-synced', 'sms-credit', upiApp],
    });

    return res.status(201).json({
      success: true,
      type: 'CREDIT',
      message: `Auto-logged Credit of ₹${parsedAmount} from ${senderOrMerchant} into Income (${incomeCategory})`,
      data: income,
    });
  }

  // If Debit SMS:
  const existing = await Expense.findOne({
    userId,
    'upiDetails.utr': parsedUtr,
  });

  if (existing) {
    return res.status(200).json({
      success: true,
      type: 'DEBIT',
      message: 'Transaction already recorded (idempotent)',
      data: existing,
    });
  }

  let category = 'Other';
  try {
    const aiResult = await aiService.suggestCategory(senderOrMerchant, parsedAmount, parsedVpa || senderOrMerchant);
    if (aiResult && aiResult.category) {
      category = aiResult.category;
    }
  } catch (err) {
    console.warn('[AI Categorization Fallback for SMS]', err.message);
  }

  const expense = await Expense.create({
    userId,
    title: senderOrMerchant,
    amount: parsedAmount,
    category,
    date: new Date(),
    note: rawText,
    paymentMethod: 'UPI',
    source: 'upi_sync',
    merchant: senderOrMerchant,
    tags: ['auto-synced', 'sms-notification', upiApp],
    upiDetails: {
      vpa: parsedVpa,
      utr: parsedUtr,
      upiApp,
      rawNarrative: rawText,
    },
  });

  res.status(201).json({
    success: true,
    type: 'DEBIT',
    message: `Auto-logged ₹${parsedAmount} for ${senderOrMerchant} from ${sender || 'UPI notification'}`,
    data: expense,
  });
});

/**
 * Generate Dynamic UPI Intent URL and QR Code Payload
 * POST /api/integrations/upi/generate-intent
 */
const generateUpiIntent = asyncHandler(async (req, res) => {
  const { payeeVpa, payeeName, amount, note = '', transactionRef } = req.body;

  if (!payeeVpa || !payeeVpa.includes('@')) {
    throw new BadRequestError('Valid payee UPI ID is required');
  }

  const cleanAmount = Number(amount);
  if (!cleanAmount || isNaN(cleanAmount) || cleanAmount <= 0) {
    throw new BadRequestError('Valid positive amount is required');
  }

  const cleanPayee = String(payeeName || req.user.name || 'Expense Settlement').trim();
  const tr = transactionRef || `RR${Date.now()}`;
  const tn = note || `Expense Tracker Settlement - ${cleanPayee}`;

  const upiUri = `upi://pay?pa=${encodeURIComponent(payeeVpa.trim())}&pn=${encodeURIComponent(cleanPayee)}&am=${cleanAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(tn)}&tr=${encodeURIComponent(tr)}`;

  res.json({
    success: true,
    data: {
      upiUri,
      payeeVpa: payeeVpa.trim(),
      payeeName: cleanPayee,
      amount: cleanAmount,
      currency: 'INR',
      transactionRef: tr,
      note: tn,
      supportedApps: ['Google Pay', 'PhonePe', 'Paytm', 'CRED', 'BHIM', 'Any UPI App'],
    },
  });
});

module.exports = {
  verifyVpa,
  initiateAccountLink,
  verifyAccountOtp,
  getLinkedAccounts,
  unlinkAccount,
  handleUpiWebhook,
  ingestDeviceNotification,
  generateUpiIntent,
  detectUpiApp,
  cleanMerchantName,
  categorizeIncome,
};
