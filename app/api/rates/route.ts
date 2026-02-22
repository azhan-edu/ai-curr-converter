import { NextRequest, NextResponse } from 'next/server'

const API_SOURCES = [
  'https://api.exchangerate.host/latest',
  'https://api.exchangerate-api.com/v4/latest/USD',
  'https://open.er-api.com/v6/latest/USD',
]

const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

// Fallback exchange rates for when APIs are unavailable
const FALLBACK_RATES: { [key: string]: number } = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CAD: 1.36,
  AUD: 1.53,
  CHF: 0.88,
  CNY: 7.24,
  INR: 83.12,
  KRW: 1319.50,
}

let cachedRates: any = null
let cacheTime: number = 0

async function fetchFromSource(url: string): Promise<any> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    })
    clearTimeout(timeoutId)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.warn(`Failed to fetch from ${url}: ${errorMsg}`)
    throw error
  }
}

async function getExchangeRates(): Promise<any> {
  const now = Date.now()
  if (cachedRates && now - cacheTime < CACHE_DURATION) {
    return cachedRates
  }

  for (const source of API_SOURCES) {
    try {
      const data = await fetchFromSource(source)
      let rates: any
      let base: string
      
      if (data.rates) {
        rates = data.rates
        base = data.base || 'USD'
      } else if (data.conversion_rates) {
        rates = data.conversion_rates
        base = data.base_code || 'USD'
      } else {
        throw new Error('Invalid response format')
      }

      cachedRates = { rates, base, date: data.date || new Date().toISOString().split('T')[0] }
      cacheTime = now
      return cachedRates
    } catch (error) {
      continue
    }
  }

  // Use fallback rates when all external APIs fail
  console.warn('All external API sources failed, using fallback rates')
  cachedRates = { 
    rates: FALLBACK_RATES, 
    base: 'USD', 
    date: new Date().toISOString().split('T')[0],
    isFallback: true,
  }
  cacheTime = now
  return cachedRates
}

export async function GET(request: NextRequest) {
  try {
    const data = await getExchangeRates()
    return NextResponse.json({
      success: true,
      ...data,
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch exchange rates',
      },
      { status: 500 }
    )
  }
}