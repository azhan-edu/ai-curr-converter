import { ConversionHistory, FavoriteMutationResult } from '@/types'
import { CURRENCIES } from '@/utils/currency'

const STORAGE_KEY = 'currency-converter-history'
const MAX_HISTORY = 10
export const FAVORITES_STORAGE_KEY = 'currency-converter-favorites'
export const MAX_FAVORITES = 5

const SUPPORTED_CURRENCY_CODES = new Set(CURRENCIES.map((currency) => currency.code))

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function sanitizeFavoriteCodes(value: unknown): string[] {
  if (!isStringArray(value)) {
    return []
  }

  const uniqueValidCodes = new Set<string>()

  for (const code of value) {
    if (!SUPPORTED_CURRENCY_CODES.has(code)) {
      continue
    }

    uniqueValidCodes.add(code)

    if (uniqueValidCodes.size >= MAX_FAVORITES) {
      break
    }
  }

  return [...uniqueValidCodes]
}

function setFavoriteCurrencies(codes: string[]): void {
  if (typeof window === 'undefined') return

  const sanitizedCodes = sanitizeFavoriteCodes(codes)
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(sanitizedCodes))
}

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

export function getFavoriteCurrencies(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (!stored) return []

    const parsed: unknown = JSON.parse(stored)
    return sanitizeFavoriteCodes(parsed)
  } catch {
    return []
  }
}

export function addFavoriteCurrency(code: string): FavoriteMutationResult {
  if (!SUPPORTED_CURRENCY_CODES.has(code)) {
    return {
      success: false,
      favorites: getFavoriteCurrencies(),
      error: 'Unsupported currency cannot be favorited.',
    }
  }

  const favorites = getFavoriteCurrencies()

  if (favorites.includes(code)) {
    return { success: true, favorites }
  }

  if (favorites.length >= MAX_FAVORITES) {
    return {
      success: false,
      favorites,
      error: `You can only have up to ${MAX_FAVORITES} favorite currencies.`,
    }
  }

  const nextFavorites = [...favorites, code]
  setFavoriteCurrencies(nextFavorites)

  return {
    success: true,
    favorites: nextFavorites,
  }
}

export function removeFavoriteCurrency(code: string): FavoriteMutationResult {
  const favorites = getFavoriteCurrencies()
  const nextFavorites = favorites.filter((favoriteCode) => favoriteCode !== code)

  if (nextFavorites.length === favorites.length) {
    return {
      success: true,
      favorites,
    }
  }

  setFavoriteCurrencies(nextFavorites)

  return {
    success: true,
    favorites: nextFavorites,
  }
}