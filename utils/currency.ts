import { Currency, ExchangeRate } from '@/types';

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
];

/**
 * Formats a numeric amount as a localized currency string.
 *
 * @param amount - Numeric amount to format.
 * @param currency - ISO 4217 currency code (for example, `USD`, `EUR`).
 * @returns A formatted currency string using `en-US` locale rules.
 *
 * @example
 * formatCurrency(10, 'USD')
 * // "$10.00"
 *
 * @example
 * formatCurrency(8.89, 'GBP')
 * // "£8.89"
 */
export const formatCurrency = (amount: number, currency: string): string => {
  const currencyInfo = CURRENCIES.find(c => c.code === currency);
  const symbol = currencyInfo?.symbol || currency;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Converts an amount from one currency to another using a rates map with a shared base.
 *
 * @param amount - Source amount to convert.
 * @param from - Source ISO currency code.
 * @param to - Target ISO currency code.
 * @param rates - Exchange-rate map keyed by currency code.
 * @returns Converted numeric amount in the target currency.
 *
 * @example
 * convertCurrency(10, 'USD', 'EUR', { USD: 1, EUR: 0.9 })
 * // 9
 *
 * @example
 * convertCurrency(10, 'EUR', 'GBP', { USD: 1, EUR: 0.9, GBP: 0.8 })
 * // 8.888...
 */
export const convertCurrency = (
  amount: number,
  from: string,
  to: string,
  rates: ExchangeRate
): number => {
  if (from === to) return amount;

  const fromRate = rates[from] || 1;
  const toRate = rates[to] || 1;

  // Convert to base currency first, then to target
  const baseAmount = amount / fromRate;
  return baseAmount * toRate;
};

/**
 * Computes the exchange rate between two currencies from a base-indexed rates map.
 *
 * @param from - Source ISO currency code.
 * @param to - Target ISO currency code.
 * @param rates - Exchange-rate map keyed by currency code.
 * @returns The multiplier used to convert 1 unit of `from` into `to`.
 *
 * @example
 * getExchangeRate('USD', 'EUR', { USD: 1, EUR: 0.9 })
 * // 0.9
 *
 * @example
 * getExchangeRate('EUR', 'GBP', { USD: 1, EUR: 0.9, GBP: 0.8 })
 * // 0.888...
 */
export const getExchangeRate = (
  from: string,
  to: string,
  rates: ExchangeRate
): number => {
  if (from === to) return 1;

  const fromRate = rates[from] || 1;
  const toRate = rates[to] || 1;

  return toRate / fromRate;
};

/**
 * Validates user-entered conversion amount text.
 *
 * @param amount - Raw input string from the amount field.
 * @returns Validation result with `isValid` and optional human-readable `error`.
 *
 * @example
 * validateAmount('10')
 * // { isValid: true }
 *
 * @example
 * validateAmount('0')
 * // { isValid: false, error: 'Amount must be greater than 0' }
 */
export const validateAmount = (amount: string): { isValid: boolean; error?: string } => {
  if (!amount.trim()) {
    return { isValid: false, error: 'Amount is required' };
  }
  const num = parseFloat(amount);
  if (isNaN(num)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }
  if (num <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }
  if (num > 1000000000) {
    return { isValid: false, error: 'Amount is too large' };
  }
  return { isValid: true };
};