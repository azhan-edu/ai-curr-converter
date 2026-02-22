import { NextRequest, NextResponse } from 'next/server'

const API_SOURCES = [
  // Primary source - frankfurter.app (most reliable)
  'https://api.frankfurter.app/latest?from=USD',
  // Fallback sources
//   'https://api.exchangerate.host/latest',

//   'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
]

const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

// Fallback exchange rates for when APIs are unavailable
// Updated: 2026-02-22 - These are realistic rates based on historical data
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
  PLN: 3.70,
}

let cachedRates: any = null
let cacheTime: number = 0

async function fetchFromSource(url: string): Promise<any> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

    console.log(`[API] Attempting to fetch from: ${url}`)
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "cache": "no-store",
        "agent": new (require('https').Agent)({ family: 4 }),
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })
    clearTimeout(timeoutId)
    console.log(`[API] Response status from ${url}: ${response.status}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    console.log(`[API] Successfully fetched from ${url}`)
    return data
  } catch (error) {
    clearTimeout(timeoutId)
    const errorMsg = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : ''
    console.error(`[API] Failed to fetch from ${url}`)
    console.error(`[API] Error message: ${errorMsg}`)
    console.error(`[API] Error stack: ${errorStack}`)
    throw error
  }
}

async function getExchangeRates(): Promise<any> {
  const now = Date.now()
  if (cachedRates && now - cacheTime < CACHE_DURATION) {
    console.log('[API] Using cached rates')
    return cachedRates
  }

  console.log('[API] Cache expired or empty, fetching fresh rates...')

  for (const source of API_SOURCES) {
    try {
      const data = await fetchFromSource(source)
      let rates: any
      let base: string
      
      // Handle different API response formats
      if (source.includes('frankfurter.app')) {
        // frankfurter.app format - has rate object directly
        rates = data.rates
        base = data.base || 'USD'
        console.log(`!!![API] frankfurter.app data:`, data)
      } else if (data.rates && !data.conversion_rates && !data.usd) {
        // exchangerate.host format
        rates = data.rates
        base = data.base || 'USD'
      } else if (data.conversion_rates) {
        // exchangerate-api.com format
        rates = data.conversion_rates
        base = data.base_code || 'USD'
      } else if (data.usd) {
        // jsdelivr/fawazahmed0 currency-api format
        rates = data.usd
        base = 'USD'
      } else {
        console.warn(`[API] Unknown response format from ${source}`)
        throw new Error('Invalid response format')
      }

      // Ensure base currency is included in rates with value of 1.0
      if (!rates[base]) {
        rates = { ...rates, [base]: 1.0 }
      }

      console.log(`[API] Successfully obtained rates from ${source}`)
      cachedRates = { 
        rates, 
        base, 
        date: data.date || new Date().toISOString().split('T')[0],
        source: source,
      }
      cacheTime = now
      return cachedRates
    } catch (error) {
      console.log(`[API] Source ${source} failed, trying next...`)
      continue
    }
  }

  // Use fallback rates when all external APIs fail
  console.error('[API] All external API sources failed, using fallback rates')
  cachedRates = { 
    rates: FALLBACK_RATES, 
    base: 'USD', 
    date: new Date().toISOString().split('T')[0],
    isFallback: true,
    warning: 'Using cached fallback rates. Live rates are unavailable.',
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

// Endpoint to manually update rates (for development/testing)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.rates || typeof body.rates !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid rates object' },
        { status: 400 }
      )
    }

    cachedRates = {
      rates: body.rates,
      base: 'USD',
      date: new Date().toISOString().split('T')[0],
      source: 'manual',
    }
    cacheTime = Date.now()

    console.log('[API] Rates manually updated')
    return NextResponse.json({
      success: true,
      message: 'Rates updated successfully',
      rates: body.rates,
    })
  } catch (error) {
    console.error('POST Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update rates',
      },
      { status: 500 }
    )
  }
}