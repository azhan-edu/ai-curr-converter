import { ConversionHistory } from '@/types'

const STORAGE_KEY = 'currency-converter-history'
const MAX_HISTORY = 10

// Get conversion history from localStorage
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

// Save conversion to history
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

// Clear all conversion history
export function clearConversionHistory(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

// Get URL query parameters
export function getUrlParams(): { from?: string; to?: string; amount?: string } {
  if (typeof window === 'undefined') return {}
  const urlParams = new URLSearchParams(window.location.search)
  return {
    from: urlParams.get('from') || undefined,
    to: urlParams.get('to') || undefined,
    amount: urlParams.get('amount') || undefined,
  }
}

// Update URL query parameters
export function updateUrlParams(from: string, to: string, amount: string): void {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.set('from', from)
  url.searchParams.set('to', to)
  url.searchParams.set('amount', amount)
  window.history.replaceState({}, '', url.toString())
}