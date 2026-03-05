import { ConversionHistory } from '@/types'

const STORAGE_KEY = 'currency-converter-history'
const MAX_HISTORY = 10

/**
 * Reads conversion history records from localStorage.
 *
 * @returns Parsed conversion history entries sorted by most recent first, or an empty array when unavailable/invalid.
 *
 * @example
 * const history = getConversionHistory()
 * if (history.length > 0) {
 *   console.log(history[0].from, history[0].to)
 * }
 */
export function getConversionHistory(): ConversionHistory[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return parsed.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }))
  } catch {
    return []
  }
}

/**
 * Persists a conversion entry to localStorage and keeps only the latest ten records.
 *
 * @param conversion - Conversion payload without generated `id` and `timestamp` fields.
 * @returns Nothing. The function updates browser storage as a side effect.
 *
 * @example
 * saveConversion({
 *   from: 'USD',
 *   to: 'EUR',
 *   amount: 10,
 *   result: 9,
 *   rate: 0.9,
 * })
 */
export function saveConversion(conversion: Omit<ConversionHistory, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return
  const history = getConversionHistory()
  const newConversion: ConversionHistory = {
    ...conversion,
    id: Date.now().toString(),
    timestamp: new Date(),
  }
  history.unshift(newConversion)
  const limited = history.slice(0, MAX_HISTORY)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(limited))
}

/**
 * Removes all stored conversion history entries from localStorage.
 *
 * @returns Nothing. The function clears browser storage as a side effect.
 *
 * @example
 * clearConversionHistory()
 */
export function clearConversionHistory(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Extracts converter query parameters from the current browser URL.
 *
 * @returns Object containing optional `from`, `to`, and `amount` values.
 *
 * @example
 * // URL: /?from=USD&to=EUR&amount=10
 * getUrlParams()
 * // { from: 'USD', to: 'EUR', amount: '10' }
 */
export function getUrlParams(): { from?: string; to?: string; amount?: string } {
  if (typeof window === 'undefined') return {}
  const urlParams = new URLSearchParams(window.location.search)
  return {
    from: urlParams.get('from') || undefined,
    to: urlParams.get('to') || undefined,
    amount: urlParams.get('amount') || undefined,
  }
}

/**
 * Updates the current URL query string with converter state without reloading the page.
 *
 * @param from - Source currency code.
 * @param to - Target currency code.
 * @param amount - Amount string as entered by the user.
 * @returns Nothing. The function calls `window.history.replaceState`.
 *
 * @example
 * updateUrlParams('USD', 'EUR', '10')
 * // URL becomes ...?from=USD&to=EUR&amount=10
 */
export function updateUrlParams(from: string, to: string, amount: string): void {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.set('from', from)
  url.searchParams.set('to', to)
  url.searchParams.set('amount', amount)
  window.history.replaceState({}, '', url.toString())
}