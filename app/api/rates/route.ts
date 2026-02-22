import { NextRequest, NextResponse } from 'next/server'

const API_SOURCES = [
  'https://api.exchangerate.host/latest',
  'https://api.exchangerate-api.com/v4/latest/USD',
  'https://open.er-api.com/v6/latest/USD',
]

const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

let cachedRates: any = null
let cacheTime: number = 0

async function fetchFromSource(url: string): Promise<any> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    clearTimeout(timeoutId)
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
      // Normalize the response format
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
      console.warn(`Failed to fetch from ${source}:`, error instanceof Error ? error.message : String(error))
      continue
    }
  }

  throw new Error('All API sources failed')
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