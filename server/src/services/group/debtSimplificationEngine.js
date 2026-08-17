/**
 * Debt Simplification & UPI Deep Link Engine
 * Implements the Minimum Cash Flow Graph Algorithm to minimize inter-member debt transactions.
 */

class DebtSimplificationEngine {
  /**
   * Generates a UPI deep link intent URI for instant mobile payments
   * @param {Object} params
   * @param {string} params.upiId - Target UPI VPA (e.g. 'ayush@okhdfcbank')
   * @param {string} params.payeeName - Payee Name (e.g. 'Ayush Kaushik')
   * @param {number} params.amount - Amount in INR
   * @param {string} params.note - Payment description/note
   * @returns {string} Standardized UPI URI
   */
  static buildUpiIntentUri({ upiId, payeeName, amount, note = 'Group Settlement' }) {
    if (!upiId) return '';
    const cleanUpi = upiId.trim();
    const cleanName = encodeURIComponent(payeeName?.trim() || 'Group Member');
    const cleanAmount = Number(amount || 0).toFixed(2);
    const cleanNote = encodeURIComponent(note?.trim() || 'Richy Rich Settlement');

    return `upi://pay?pa=${cleanUpi}&pn=${cleanName}&am=${cleanAmount}&cu=INR&tn=${cleanNote}`;
  }

  /**
   * Calculates individual member net balances and total spend for a group
   * @param {Array} members - List of group member objects
   * @param {Array} expenses - List of group expenses
   * @param {Array} settlements - List of recorded settlements
   * @returns {Object} { memberBalances: Array, totalGroupSpend: number }
   */
  static calculateBalances(members = [], expenses = [], settlements = []) {
    const balanceMap = {};

    // Initialize all members
    members.forEach((m) => {
      balanceMap[m.name] = {
        name: m.name,
        email: m.email || '',
        upiId: m.upiId || '',
        paid: 0,
        owed: 0,
        settledSent: 0,
        settledReceived: 0,
        net: 0,
      };
    });

    let totalGroupSpend = 0;

    // Process all expenses
    expenses.forEach((exp) => {
      totalGroupSpend += Number(exp.amount || 0);

      // Add to payer's total paid
      if (balanceMap[exp.paidBy]) {
        balanceMap[exp.paidBy].paid += Number(exp.amount || 0);
      } else {
        balanceMap[exp.paidBy] = {
          name: exp.paidBy,
          email: '',
          upiId: '',
          paid: Number(exp.amount || 0),
          owed: 0,
          settledSent: 0,
          settledReceived: 0,
          net: 0,
        };
      }

      // Add to split members' owed amounts
      if (Array.isArray(exp.splits) && exp.splits.length > 0) {
        exp.splits.forEach((split) => {
          if (!balanceMap[split.memberName]) {
            balanceMap[split.memberName] = {
              name: split.memberName,
              email: '',
              upiId: '',
              paid: 0,
              owed: 0,
              settledSent: 0,
              settledReceived: 0,
              net: 0,
            };
          }
          balanceMap[split.memberName].owed += Number(split.amount || 0);
        });
      }
    });

    // Process all settlements
    settlements.forEach((set) => {
      const amt = Number(set.amount || 0);
      if (balanceMap[set.fromMember]) {
        balanceMap[set.fromMember].settledSent += amt;
      }
      if (balanceMap[set.toMember]) {
        balanceMap[set.toMember].settledReceived += amt;
      }
    });

    // Compute Net for all members: (Paid - Owed) + SettledSent - SettledReceived
    const memberBalances = Object.values(balanceMap).map((m) => {
      const net = (m.paid - m.owed) + m.settledSent - m.settledReceived;
      return {
        ...m,
        paid: Math.round(m.paid * 100) / 100,
        owed: Math.round(m.owed * 100) / 100,
        settledSent: Math.round(m.settledSent * 100) / 100,
        settledReceived: Math.round(m.settledReceived * 100) / 100,
        net: Math.round(net * 100) / 100,
      };
    });

    return {
      memberBalances,
      totalGroupSpend: Math.round(totalGroupSpend * 100) / 100,
    };
  }

  /**
   * Computes the minimal set of transfer payments required to settle all debts
   * using the Minimum Cash Flow Graph Algorithm.
   * @param {Array} memberBalances
   * @returns {Array} List of simplified settlement transfers
   */
  static simplifyDebts(memberBalances = []) {
    const debtors = [];
    const creditors = [];

    memberBalances.forEach((m) => {
      const net = Math.round(m.net * 100) / 100;
      if (net < -0.01) {
        debtors.push({ name: m.name, net: net, upiId: m.upiId });
      } else if (net > 0.01) {
        creditors.push({ name: m.name, net: net, upiId: m.upiId });
      }
    });

    const simplifiedTransfers = [];

    // Sort: greatest debtor first (most negative) & greatest creditor first (most positive)
    debtors.sort((a, b) => a.net - b.net);
    creditors.sort((a, b) => b.net - a.net);

    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];

      const debtAmount = Math.abs(debtor.net);
      const creditAmount = creditor.net;

      if (debtAmount < 0.01) {
        dIdx++;
        continue;
      }
      if (creditAmount < 0.01) {
        cIdx++;
        continue;
      }

      const settledAmount = Math.min(debtAmount, creditAmount);
      const roundedAmount = Math.round(settledAmount * 100) / 100;

      if (roundedAmount > 0.01) {
        simplifiedTransfers.push({
          from: debtor.name,
          to: creditor.name,
          amount: roundedAmount,
          toUpiId: creditor.upiId || '',
          upiUri: this.buildUpiIntentUri({
            upiId: creditor.upiId,
            payeeName: creditor.name,
            amount: roundedAmount,
            note: `Settlement to ${creditor.name}`,
          }),
        });
      }

      debtor.net += settledAmount;
      creditor.net -= settledAmount;

      if (Math.abs(debtor.net) < 0.01) {
        dIdx++;
      }
      if (creditor.net < 0.01) {
        cIdx++;
      }
    }

    return simplifiedTransfers;
  }

  /**
   * Helper to generate exact splits array from splitType and members
   * @param {Object} params
   * @param {number} params.totalAmount
   * @param {string} params.splitType - 'EQUAL' | 'EXACT' | 'PERCENT'
   * @param {Array} params.members - [{ name, amount, percentage }]
   * @returns {Array} Formatted splits array
   */
  static computeSplits({ totalAmount, splitType, members = [] }) {
    if (!members.length || totalAmount <= 0) return [];

    if (splitType === 'EQUAL') {
      const count = members.length;
      const baseSplit = Math.floor((totalAmount / count) * 100) / 100;
      let remainder = Math.round((totalAmount - (baseSplit * count)) * 100) / 100;

      return members.map((m, idx) => {
        const amt = idx === 0 ? baseSplit + remainder : baseSplit;
        return {
          memberName: m.name || m,
          amount: Math.round(amt * 100) / 100,
          percentage: Math.round((amt / totalAmount) * 10000) / 100,
        };
      });
    }

    if (splitType === 'PERCENT') {
      return members.map((m) => {
        const pct = Number(m.percentage || 0);
        const amt = (totalAmount * pct) / 100;
        return {
          memberName: m.name || m.memberName,
          amount: Math.round(amt * 100) / 100,
          percentage: pct,
        };
      });
    }

    // EXACT
    return members.map((m) => ({
      memberName: m.name || m.memberName,
      amount: Math.round(Number(m.amount || 0) * 100) / 100,
      percentage: Math.round((Number(m.amount || 0) / totalAmount) * 10000) / 100,
    }));
  }
}

module.exports = { DebtSimplificationEngine };
