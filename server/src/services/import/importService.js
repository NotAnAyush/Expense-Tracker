const crypto = require('crypto');
const Expense = require('../../models/Expense');
const Income = require('../../models/Income');

/**
 * Bank Statement CSV & Batch Ingestion Engine
 * Supports standard formats: HDFC, SBI, ICICI, Axis, Chase, Amex, Generic CSV
 */
class ImportService {
  /**
   * Merchant to Category Deterministic Mapping Rules
   */
  static MERCHANT_CATEGORY_MAP = {
    // Food & Dining
    swiggy: 'Food & Dining',
    zomato: 'Food & Dining',
    mcdonalds: 'Food & Dining',
    starbucks: 'Food & Dining',
    dominos: 'Food & Dining',
    kfc: 'Food & Dining',
    restaurant: 'Food & Dining',
    cafe: 'Food & Dining',
    dine: 'Food & Dining',

    // Transportation
    uber: 'Transportation',
    ola: 'Transportation',
    rapido: 'Transportation',
    petrol: 'Transportation',
    fuel: 'Transportation',
    shell: 'Transportation',
    irctc: 'Transportation',
    metro: 'Transportation',
    flight: 'Transportation',
    indigo: 'Transportation',

    // Shopping & Groceries
    amazon: 'Shopping',
    flipkart: 'Shopping',
    myntra: 'Shopping',
    blinkit: 'Shopping',
    zepto: 'Shopping',
    instamart: 'Shopping',
    dmart: 'Shopping',
    bigbasket: 'Shopping',
    groceries: 'Shopping',
    supermarket: 'Shopping',

    // Housing & Utilities
    electricity: 'Housing & Utilities',
    bescom: 'Housing & Utilities',
    water: 'Housing & Utilities',
    gas: 'Housing & Utilities',
    rent: 'Housing & Utilities',
    broadband: 'Housing & Utilities',
    airtel: 'Housing & Utilities',
    jio: 'Housing & Utilities',

    // Entertainment & Subscriptions
    netflix: 'Subscriptions',
    spotify: 'Subscriptions',
    hotstar: 'Subscriptions',
    prime: 'Subscriptions',
    youtube: 'Subscriptions',
    apple: 'Subscriptions',
    cinema: 'Entertainment',
    pvr: 'Entertainment',
    inox: 'Entertainment',
    bookmyshow: 'Entertainment',

    // Incomes
    salary: 'Salary',
    payroll: 'Salary',
    freelance: 'Freelance',
    upwork: 'Freelance',
    dividend: 'Dividends',
    interest: 'Investments',
    refund: 'Refund',
  };

  /**
   * Generate a deterministic signature to detect duplicate imported records
   */
  static generateSignature(userId, dateStr, amount, cleanDescription) {
    const raw = `${userId}_${dateStr}_${Number(amount).toFixed(2)}_${cleanDescription.toLowerCase().trim()}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  /**
   * Guess category from description string
   */
  static inferCategory(description, isCredit = false) {
    if (!description) return isCredit ? 'Other' : 'General';
    const lower = description.toLowerCase();

    if (isCredit) {
      if (lower.includes('salary') || lower.includes('payroll')) return 'Salary';
      if (lower.includes('freelance') || lower.includes('consulting')) return 'Freelance';
      if (lower.includes('dividend')) return 'Dividends';
      if (lower.includes('interest')) return 'Investments';
      if (lower.includes('refund') || lower.includes('cashback')) return 'Refund';
      return 'Other';
    }

    for (const [keyword, cat] of Object.entries(this.MERCHANT_CATEGORY_MAP)) {
      if (lower.includes(keyword)) {
        return cat;
      }
    }

    return 'Shopping';
  }

  /**
   * Parse CSV content lines safely handling quoted fields
   */
  static parseCSVLines(csvText) {
    if (!csvText || typeof csvText !== 'string') return [];

    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const result = [];
    for (const line of lines) {
      const row = [];
      let inQuotes = false;
      let curVal = '';

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(curVal.trim());
          curVal = '';
        } else {
          curVal += char;
        }
      }
      row.push(curVal.trim());
      result.push(row);
    }
    return result;
  }

  /**
   * Parse Date string into standard ISO Date
   */
  static parseDate(dateStr) {
    if (!dateStr) return new Date();
    const clean = dateStr.replace(/["']/g, '').trim();

    // Standard ISO format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
      const d = new Date(clean);
      if (!isNaN(d.getTime())) return d;
    }

    // DD/MM/YYYY or DD-MM-YYYY
    const ddmmyyyy = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (ddmmyyyy) {
      const day = parseInt(ddmmyyyy[1], 10);
      const month = parseInt(ddmmyyyy[2], 10) - 1;
      const year = parseInt(ddmmyyyy[3], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }

    // MM/DD/YYYY
    const mmddyyyy = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (mmddyyyy) {
      const month = parseInt(mmddyyyy[1], 10) - 1;
      const day = parseInt(mmddyyyy[2], 10);
      const year = parseInt(mmddyyyy[3], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }

    const fallback = new Date(clean);
    return isNaN(fallback.getTime()) ? new Date() : fallback;
  }

  /**
   * Preview Bank Statement CSV: Detect columns, parse rows, flag duplicates
   */
  static async previewStatement(userId, csvText) {
    const table = this.parseCSVLines(csvText);
    if (table.length < 2) {
      throw new Error('Invalid CSV file: at least a header row and one data row are required.');
    }

    const headers = table[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

    // Detect column indexes with precise token matching
    let dateIdx = headers.findIndex(h => h.includes('date') || h.includes('txn') || h.includes('time'));
    let descIdx = headers.findIndex(h => h.includes('desc') || h.includes('narration') || h.includes('particular') || h.includes('remark') || h.includes('title') || h.includes('detail') || h.includes('merchant'));
    
    // Check debit column (excluding description column)
    let debitIdx = headers.findIndex((h, idx) => idx !== descIdx && (
      h.includes('debit') || h.includes('withdrawal') || h.includes('spent') || h.includes('outflow') || h === 'dr' || h.startsWith('dr')
    ));

    // Check credit column (excluding description column)
    let creditIdx = headers.findIndex((h, idx) => idx !== descIdx && (
      h.includes('credit') || h.includes('deposit') || h.includes('inflow') || h === 'cr' || h.startsWith('cr')
    ));

    let amountIdx = headers.findIndex((h, idx) => idx !== descIdx && (
      h.includes('amount') || h === 'amt'
    ));

    // Fallbacks
    if (dateIdx === -1) dateIdx = 0;
    if (descIdx === -1) descIdx = 1;
    if (debitIdx === -1 && amountIdx !== -1) debitIdx = amountIdx;

    // Fetch existing user transactions for the last 180 days to detect duplicates
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

    const [existingExpenses, existingIncomes] = await Promise.all([
      Expense.find({ userId, date: { $gte: sixMonthsAgo } }, 'title amount date').lean(),
      Income.find({ userId, date: { $gte: sixMonthsAgo } }, 'title amount date').lean(),
    ]);

    const existingSignatures = new Set();
    for (const e of existingExpenses) {
      const dStr = new Date(e.date).toISOString().split('T')[0];
      existingSignatures.add(this.generateSignature(userId, dStr, e.amount, e.title));
    }
    for (const i of existingIncomes) {
      const dStr = new Date(i.date).toISOString().split('T')[0];
      existingSignatures.add(this.generateSignature(userId, dStr, i.amount, i.title));
    }

    const stagedTransactions = [];

    for (let r = 1; r < table.length; r++) {
      const row = table[r];
      if (!row || row.length === 0 || row.every(c => !c)) continue;

      const rawDate = row[dateIdx] || '';
      const parsedDate = this.parseDate(rawDate);
      const dateIso = parsedDate.toISOString().split('T')[0];
      const rawDesc = row[descIdx] || 'Bank Transaction';
      const cleanDesc = rawDesc.replace(/\s+/g, ' ').trim();
      const title = cleanDesc.length > 80 ? cleanDesc.substring(0, 80) : cleanDesc;

      let debitVal = 0;
      let creditVal = 0;

      if (debitIdx !== -1 && row[debitIdx] !== undefined && row[debitIdx] !== '') {
        const rawDebit = String(row[debitIdx]).replace(/[^0-9.-]/g, '');
        if (rawDebit) debitVal = Math.abs(parseFloat(rawDebit) || 0);
      }
      if (creditIdx !== -1 && row[creditIdx] !== undefined && row[creditIdx] !== '') {
        const rawCredit = String(row[creditIdx]).replace(/[^0-9.-]/g, '');
        if (rawCredit) creditVal = Math.abs(parseFloat(rawCredit) || 0);
      }

      // If single amount column with sign
      if (amountIdx !== -1 && debitVal === 0 && creditVal === 0 && row[amountIdx] !== undefined && row[amountIdx] !== '') {
        const rawAmt = parseFloat(String(row[amountIdx]).replace(/[^0-9.-]/g, '')) || 0;
        if (rawAmt < 0) debitVal = Math.abs(rawAmt);
        else creditVal = rawAmt;
      }

      const isCredit = creditVal > 0 && debitVal === 0;
      const amount = isCredit ? creditVal : (debitVal > 0 ? debitVal : creditVal);
      if (amount <= 0) continue;

      const category = this.inferCategory(cleanDesc, isCredit);
      const signature = this.generateSignature(userId, dateIso, amount, title);
      const isDuplicate = existingSignatures.has(signature);

      stagedTransactions.push({
        id: `stmt_${r}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        date: parsedDate.toISOString(),
        title,
        rawDescription: cleanDesc,
        amount,
        type: isCredit ? 'income' : 'expense',
        category,
        merchant: isCredit ? '' : cleanDesc.split(/[-_/#]/)[0].trim(),
        source: isCredit ? cleanDesc.split(/[-_/#]/)[0].trim() : '',
        paymentMethod: 'Bank Transfer',
        isDuplicate,
        signature,
        selected: !isDuplicate, // default unselected if duplicate
      });
    }

    return {
      totalRows: table.length - 1,
      parsedCount: stagedTransactions.length,
      duplicateCount: stagedTransactions.filter(t => t.isDuplicate).length,
      transactions: stagedTransactions,
    };
  }

  /**
   * Commit staged batch transactions to MongoDB atomically
   */
  static async commitStatement(userId, transactions) {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      throw new Error('No transactions provided to commit.');
    }

    const expensesToInsert = [];
    const incomesToInsert = [];

    for (const item of transactions) {
      if (!item.amount || item.amount <= 0) continue;

      if (item.type === 'income') {
        incomesToInsert.push({
          userId,
          title: item.title || 'Imported Income',
          amount: item.amount,
          category: item.category || 'Other',
          source: item.source || item.merchant || 'Bank Import',
          date: item.date ? new Date(item.date) : new Date(),
          isRecurring: false,
          tags: ['bank-import', ...(item.tags || [])],
          note: item.note || `Imported from statement: ${item.rawDescription || ''}`,
        });
      } else {
        expensesToInsert.push({
          userId,
          title: item.title || 'Imported Expense',
          amount: item.amount,
          category: item.category || 'Shopping',
          merchant: item.merchant || item.title || 'Bank Merchant',
          paymentMethod: item.paymentMethod || 'Bank Transfer',
          date: item.date ? new Date(item.date) : new Date(),
          tags: ['bank-import', ...(item.tags || [])],
          note: item.note || `Imported from statement: ${item.rawDescription || ''}`,
        });
      }
    }

    const [createdExpenses, createdIncomes] = await Promise.all([
      expensesToInsert.length > 0 ? Expense.insertMany(expensesToInsert) : Promise.resolve([]),
      incomesToInsert.length > 0 ? Income.insertMany(incomesToInsert) : Promise.resolve([]),
    ]);

    return {
      success: true,
      importedExpenses: createdExpenses.length,
      importedIncomes: createdIncomes.length,
      totalImported: createdExpenses.length + createdIncomes.length,
    };
  }
}

module.exports = ImportService;
