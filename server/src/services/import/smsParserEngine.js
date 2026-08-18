/**
 * Bank Transaction SMS Regular Expression State Machine
 * Deterministically parses Indian bank transaction alerts (HDFC, SBI, ICICI, Axis, Kotak, UPI).
 * Adheres to ADR-012.
 */
class SmsParserEngine {
  /**
   * Parses raw SMS text into a structured transaction object
   */
  static parseSms(smsText = '') {
    const raw = String(smsText).trim();
    if (!raw) return null;

    // 1. Amount Extraction (Matches "Rs. 1,500.00" or "INR 500" or "Rs 350")
    const amountMatch = raw.match(/(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{1,2})?)/i);
    if (!amountMatch) {
      return null; // Not a financial transaction SMS
    }
    const cleanAmountStr = amountMatch[1].replace(/,/g, '');
    const amount = Number(parseFloat(cleanAmountStr).toFixed(2));
    if (isNaN(amount) || amount <= 0) return null;

    // 2. Transaction Type (Debit vs Credit)
    const isDebit = /(?:debited|spent|paid|withdrawn|deducted|transfer to)/i.test(raw);
    const isCredit = /(?:credited|deposited|received|refund)/i.test(raw);
    const type = isCredit && !isDebit ? 'CREDIT' : 'DEBIT';

    // 3. Bank Identification
    let bank = 'UNKNOWN';
    if (/HDFC/i.test(raw)) bank = 'HDFC';
    else if (/SBI|State Bank/i.test(raw)) bank = 'SBI';
    else if (/ICICI/i.test(raw)) bank = 'ICICI';
    else if (/Axis/i.test(raw)) bank = 'AXIS';
    else if (/Kotak/i.test(raw)) bank = 'KOTAK';
    else if (/Paytm/i.test(raw)) bank = 'PAYTM';
    else if (/PhonePe|Google Pay|GPay|UPI/i.test(raw)) bank = 'UPI';

    // 4. Account / Card Last 4 Digits
    const accMatch = raw.match(/(?:A\/c\s*(?:no\.?)?|Card\s*(?:ending)?|Acct\s*)\s*[*Xx]*(\d{4})/i);
    const accountLast4 = accMatch ? accMatch[1] : '';

    // 5. Merchant / Payee / Info extraction
    let merchant = 'Unknown Merchant';
    const payeeMatch = raw.match(/(?:at|to|info|VPA|towards)\s+([A-Za-z0-9\s._*-]+?)(?:\s+on|\.|\s+Avl|\s+Ref|\s+UPI|$)/i);
    if (payeeMatch && payeeMatch[1]) {
      const candidate = payeeMatch[1].trim();
      if (candidate.length > 1 && !/^(the|your|a\/c|bank)$/i.test(candidate)) {
        merchant = candidate;
      }
    }

    // 6. UPI / UTR Reference Number
    const refMatch = raw.match(/(?:UPI\s*Ref(?:\s*no)?|Ref\s*no|UTR|Txn\s*ID)\s*[:\s]*([A-Za-z0-9]{6,16})/i);
    const refNumber = refMatch ? refMatch[1] : '';

    // 7. Auto Category Guessing based on Merchant
    let category = 'General & Miscellaneous';
    const mLower = merchant.toLowerCase();
    if (/swiggy|zomato|mcdonald|starbucks|cafe|restaurant|eats|food/i.test(mLower)) {
      category = 'Food & Dining';
    } else if (/uber|ola|rapido|petrol|fuel|shell|metro|irctc/i.test(mLower)) {
      category = 'Transportation';
    } else if (/amazon|flipkart|myntra|blinkit|zepto|supermarket|mart|store/i.test(mLower)) {
      category = 'Shopping';
    } else if (/netflix|spotify|prime|hotstar|youtube|apple/i.test(mLower)) {
      category = 'Subscriptions';
    } else if (/pharmacy|hospital|apollo|1mg|clinic|med/i.test(mLower)) {
      category = 'Health & Medical';
    } else if (/bescom|airtel|jio|electricity|utility|water/i.test(mLower)) {
      category = 'Housing & Utilities';
    }

    return {
      amount,
      type,
      merchant,
      category,
      bank,
      accountLast4,
      refNumber,
      date: new Date().toISOString().split('T')[0],
      rawSms: raw,
    };
  }

  /**
   * Batch parse multiple SMS messages (e.g. from pasted SMS dump or webhook queue)
   */
  static parseBatch(smsList = []) {
    return smsList
      .map((sms) => this.parseSms(sms))
      .filter((item) => item !== null && item.amount > 0);
  }
}

module.exports = SmsParserEngine;
