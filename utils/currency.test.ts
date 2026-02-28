import {
  convertCurrency,
  formatCurrency,
  getExchangeRate,
  sortCurrenciesByFavorites,
  validateAmount,
} from './currency'
import type { Currency } from '@/types'

const currencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
]

describe('sortCurrenciesByFavorites', () => {
  it('keeps original order when no favorites are provided', () => {
    const result = sortCurrenciesByFavorites(currencies, [])

    expect(result.map((currency) => currency.code)).toEqual(['USD', 'EUR', 'GBP', 'JPY'])
  })

  it('moves favorites to the top while preserving canonical order', () => {
    const result = sortCurrenciesByFavorites(currencies, ['GBP', 'USD'])

    expect(result.map((currency) => currency.code)).toEqual(['USD', 'GBP', 'EUR', 'JPY'])
  })
})

describe('currency helpers', () => {
  it('formats amount as currency string', () => {
    const formatted = formatCurrency(12.5, 'USD')

    expect(formatted).toContain('$')
    expect(formatted).toContain('12.50')
  })

  it('converts currency using relative rates', () => {
    const rates = { USD: 1, EUR: 0.9, GBP: 0.8 }

    expect(convertCurrency(10, 'USD', 'EUR', rates)).toBeCloseTo(9)
    expect(convertCurrency(10, 'EUR', 'USD', rates)).toBeCloseTo(11.111111, 4)
    expect(convertCurrency(10, 'USD', 'USD', rates)).toBe(10)
  })

  it('calculates exchange rate between currencies', () => {
    const rates = { USD: 1, EUR: 0.9, GBP: 0.8 }

    expect(getExchangeRate('USD', 'EUR', rates)).toBeCloseTo(0.9)
    expect(getExchangeRate('EUR', 'USD', rates)).toBeCloseTo(1.111111, 4)
    expect(getExchangeRate('GBP', 'GBP', rates)).toBe(1)
  })

  it('validates amount input and returns specific errors', () => {
    expect(validateAmount('')).toEqual({ isValid: false, error: 'Amount is required' })
    expect(validateAmount('abc')).toEqual({ isValid: false, error: 'Please enter a valid number' })
    expect(validateAmount('0')).toEqual({ isValid: false, error: 'Amount must be greater than 0' })
    expect(validateAmount('-5')).toEqual({ isValid: false, error: 'Amount must be greater than 0' })
    expect(validateAmount('1000000001')).toEqual({ isValid: false, error: 'Amount is too large' })
    expect(validateAmount('100')).toEqual({ isValid: true })
  })
})
