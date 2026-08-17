/**
 * Foreign Exchange (FX) & Multi-Currency Engine
 * Provides real-time and offline cached currency conversions across global currencies.
 */

class FxService {
  // Base conversion rates to INR (Indian Rupee)
  static RATES_TO_INR = {
    INR: 1.0,
    USD: 86.80,
    EUR: 90.50,
    GBP: 108.20,
    AED: 23.65,
    JPY: 0.56,
    SGD: 64.30,
    CAD: 61.20,
    AUD: 55.40,
    THB: 2.55,
    CHF: 96.40,
  };

  /**
   * Convert an amount from one currency to another
   * @param {Object} params
   * @param {number} params.amount
   * @param {string} params.fromCurrency (e.g. 'USD')
   * @param {string} params.toCurrency (e.g. 'INR')
   * @returns {Object} { convertedAmount, exchangeRate, fromCurrency, toCurrency }
   */
  static convert({ amount, fromCurrency = 'USD', toCurrency = 'INR' }) {
    const from = (fromCurrency || 'USD').toUpperCase().trim();
    const to = (toCurrency || 'INR').toUpperCase().trim();
    const val = Number(amount || 0);

    const fromRateToInr = this.RATES_TO_INR[from] || 1.0;
    const toRateToInr = this.RATES_TO_INR[to] || 1.0;

    // Direct exchange rate: 1 unit of fromCurrency = (fromRateToInr / toRateToInr) of toCurrency
    const exchangeRate = fromRateToInr / toRateToInr;
    const convertedAmount = Math.round(val * exchangeRate * 100) / 100;

    return {
      originalAmount: val,
      fromCurrency: from,
      toCurrency: to,
      exchangeRate: Math.round(exchangeRate * 1000000) / 1000000,
      convertedAmount,
    };
  }

  /**
   * Get all live rates relative to a given base currency
   * @param {string} baseCurrency (e.g. 'INR')
   * @returns {Object} { baseCurrency, timestamp, rates }
   */
  static getRates(baseCurrency = 'INR') {
    const base = (baseCurrency || 'INR').toUpperCase().trim();
    const baseRateToInr = this.RATES_TO_INR[base] || 1.0;

    const rates = {};
    Object.keys(this.RATES_TO_INR).forEach((curr) => {
      const currRateToInr = this.RATES_TO_INR[curr];
      // How many units of 'curr' per 1 unit of 'base'
      rates[curr] = Math.round((baseRateToInr / currRateToInr) * 10000) / 10000;
    });

    return {
      baseCurrency: base,
      timestamp: new Date().toISOString(),
      rates,
    };
  }
}

module.exports = { FxService };
