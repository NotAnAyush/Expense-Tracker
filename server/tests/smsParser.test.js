const SmsParserEngine = require('../src/services/import/smsParserEngine');

describe('Bank Transaction SMS Regular Expression Parser (Phase 9)', () => {
  test('parses HDFC Bank debit transaction SMS accurately', () => {
    const sms = 'Sent Rs. 1,450.00 from HDFC Bank A/c *4321 to ZOMATO on 18-AUG-26. UPI Ref: 394829104829. Avl Bal: Rs. 45,200.00';
    const parsed = SmsParserEngine.parseSms(sms);

    expect(parsed).not.toBeNull();
    expect(parsed.amount).toBe(1450);
    expect(parsed.type).toBe('DEBIT');
    expect(parsed.bank).toBe('HDFC');
    expect(parsed.accountLast4).toBe('4321');
    expect(parsed.category).toBe('Food & Dining');
    expect(parsed.refNumber).toBe('394829104829');
  });

  test('parses SBI Bank credit transaction SMS accurately', () => {
    const sms = 'Your SBI A/C *9876 has been credited with Rs. 75,000.00 on 01-AUG-26 by SALARY. Ref no 928374829102';
    const parsed = SmsParserEngine.parseSms(sms);

    expect(parsed).not.toBeNull();
    expect(parsed.amount).toBe(75000);
    expect(parsed.type).toBe('CREDIT');
    expect(parsed.bank).toBe('SBI');
    expect(parsed.accountLast4).toBe('9876');
  });

  test('parses ICICI Bank Uber ride transaction SMS accurately', () => {
    const sms = 'Dear Customer, INR 340.50 spent on your ICICI Card ending 1122 at UBER on 18-08-2026. Txn ID: IC8372648';
    const parsed = SmsParserEngine.parseSms(sms);

    expect(parsed).not.toBeNull();
    expect(parsed.amount).toBe(340.5);
    expect(parsed.type).toBe('DEBIT');
    expect(parsed.bank).toBe('ICICI');
    expect(parsed.accountLast4).toBe('1122');
    expect(parsed.category).toBe('Transportation');
  });

  test('parses Amazon shopping SMS from Axis Bank', () => {
    const sms = 'Rs 2,999 debited from Axis Bank A/c 5544 towards AMAZON on 18-Aug-26. Ref no: 8472910482';
    const parsed = SmsParserEngine.parseSms(sms);

    expect(parsed).not.toBeNull();
    expect(parsed.amount).toBe(2999);
    expect(parsed.type).toBe('DEBIT');
    expect(parsed.bank).toBe('AXIS');
    expect(parsed.category).toBe('Shopping');
  });

  test('returns null for non-transaction OTP or promotional SMS', () => {
    const promoSms = 'Your OTP for login to Richy Rich is 482910. Do not share with anyone.';
    const parsed = SmsParserEngine.parseSms(promoSms);

    expect(parsed).toBeNull();
  });

  test('batch parses multiple SMS alerts and filters invalid messages', () => {
    const list = [
      'Rs 500 debited from HDFC A/c 1234 to SWIGGY. UPI Ref: 111122223333',
      'Here is your monthly statement link: https://bank.com',
      'Rs 1200 debited from SBI A/c 5678 to BLINKIT. Ref: 444455556666',
    ];

    const batch = SmsParserEngine.parseBatch(list);
    expect(batch.length).toBe(2);
    expect(batch[0].amount).toBe(500);
    expect(batch[1].amount).toBe(1200);
  });
});
