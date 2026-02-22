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
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
];

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