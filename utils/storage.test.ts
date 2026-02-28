import {
  addFavoriteCurrency,
  clearConversionHistory,
  FAVORITES_STORAGE_KEY,
  getConversionHistory,
  getFavoriteCurrencies,
  getUrlParams,
  MAX_FAVORITES,
  removeFavoriteCurrency,
  saveConversion,
  updateUrlParams,
} from './storage'

describe('favorites storage helpers', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns empty array for malformed favorites payload', () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, '{bad json')

    expect(getFavoriteCurrencies()).toEqual([])
  })

  it('sanitizes favorites by deduplicating, dropping unknown codes, and enforcing max limit', () => {
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(['USD', 'USD', 'INVALID', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'])
    )

    expect(getFavoriteCurrencies()).toEqual(['USD', 'EUR', 'GBP', 'JPY', 'CAD'])
  })

  it('adds favorite until limit is reached and blocks sixth addition', () => {
    addFavoriteCurrency('USD')
    addFavoriteCurrency('EUR')
    addFavoriteCurrency('GBP')
    addFavoriteCurrency('JPY')
    addFavoriteCurrency('CAD')

    const result = addFavoriteCurrency('AUD')

    expect(result.success).toBe(false)
    expect(result.error).toContain(`${MAX_FAVORITES}`)
    expect(result.favorites).toEqual(['USD', 'EUR', 'GBP', 'JPY', 'CAD'])
  })

  it('removes favorite currency and keeps remaining order', () => {
    addFavoriteCurrency('USD')
    addFavoriteCurrency('EUR')
    addFavoriteCurrency('GBP')

    const result = removeFavoriteCurrency('EUR')

    expect(result.success).toBe(true)
    expect(result.favorites).toEqual(['USD', 'GBP'])
    expect(getFavoriteCurrencies()).toEqual(['USD', 'GBP'])
  })
})

describe('conversion history and URL helpers', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState({}, '', 'http://localhost/')
  })

  it('saves and returns conversion history with timestamp objects', () => {
    saveConversion({
      from: 'USD',
      to: 'EUR',
      amount: 10,
      result: 9,
      rate: 0.9,
    })

    const history = getConversionHistory()

    expect(history).toHaveLength(1)
    expect(history[0].from).toBe('USD')
    expect(history[0].to).toBe('EUR')
    expect(history[0].timestamp).toBeInstanceOf(Date)
  })

  it('clears conversion history from localStorage', () => {
    saveConversion({
      from: 'USD',
      to: 'GBP',
      amount: 10,
      result: 8,
      rate: 0.8,
    })

    clearConversionHistory()

    expect(getConversionHistory()).toEqual([])
  })

  it('returns empty conversion history for malformed storage payload', () => {
    localStorage.setItem('currency-converter-history', '{invalid json')

    expect(getConversionHistory()).toEqual([])
  })

  it('updates URL params and reads them back', () => {
    updateUrlParams('USD', 'EUR', '100')

    expect(getUrlParams()).toEqual({ from: 'USD', to: 'EUR', amount: '100' })
  })
})
