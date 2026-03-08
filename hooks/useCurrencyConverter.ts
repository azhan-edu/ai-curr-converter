'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { ExchangeRate, ConversionHistory as ConversionHistoryEntry, RatesApiResponse } from '@/types'
import { convertCurrency, validateAmount } from '@/utils/currency'
import { getUrlParams, updateUrlParams } from '@/utils/storage'
import { emitConversionHistoryUpdated } from '@/utils/conversionHistoryEvents'
import debounce from 'lodash.debounce'

type NotificationState = {
  type: 'success' | 'error'
  message: string
}

const DEFAULT_CONVERSION_DEBOUNCE_MS = 800

function resolveConversionDebounceMs(): number {
  const rawValue = process.env.NEXT_PUBLIC_CONVERSION_INPUT_DEBOUNCE_MS

  if (!rawValue) {
    return DEFAULT_CONVERSION_DEBOUNCE_MS
  }

  const parsed = Number(rawValue)

  if (!Number.isFinite(parsed) || parsed < 0) {
    return DEFAULT_CONVERSION_DEBOUNCE_MS
  }

  return Math.trunc(parsed)
}

export default function useCurrencyConverter() {
  const conversionDebounceMs = resolveConversionDebounceMs()

  const [amount, setAmount] = useState('')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('EUR')
  const [rates, setRates] = useState<ExchangeRate | null>(null)
  const [loading, setLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [ratesSourceUrl, setRatesSourceUrl] = useState<string | null>(null)
  const [ratesBaseCurrency, setRatesBaseCurrency] = useState<string | null>(null)
  const [notification, setNotification] = useState<NotificationState | null>(null)
  const suppressNextHistorySaveRef = useRef(false)

  const createHistoryEntry = useCallback(async (entry: Omit<ConversionHistoryEntry, 'id' | 'timestamp'>) => {
    try {
      const response = await fetch('/api/conversions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      })

      if (response.ok) {
        emitConversionHistoryUpdated()
      }
    } catch {
      // Ignore history write failures to keep conversion UX responsive.
    }
  }, [])

  useEffect(() => {
    const params = getUrlParams()
    if (params.from) setFromCurrency(params.from)
    if (params.to) setToCurrency(params.to)
    if (params.amount) setAmount(params.amount)
  }, [])

  const fetchRates = useCallback(async (options?: { forceRefresh?: boolean; showNotification?: boolean }) => {
    const forceRefresh = options?.forceRefresh ?? false
    const showNotification = options?.showNotification ?? false

    try {
      if (forceRefresh) {
        setIsRefreshing(true)
      } else {
        setLoading(true)
      }

      setError('')
      const endpoint = forceRefresh ? '/api/rates?refresh=1' : '/api/rates'
      const response = await fetch(endpoint)
      const data: RatesApiResponse = await response.json()

      if (data.success && data.rates) {
        if (forceRefresh) {
          suppressNextHistorySaveRef.current = true
        }

        setRates(data.rates)
        setLastUpdated(data.date ?? null)
        setRatesSourceUrl(data.source ?? null)
        setRatesBaseCurrency(data.base ?? null)

        if (forceRefresh && showNotification) {
          setNotification({ type: 'success', message: 'Currency rates are refreshed' })
        }
      } else {
        throw new Error(data.error || 'Failed to fetch rates')
      }
    } catch {
      if (forceRefresh) {
        setNotification({ type: 'error', message: 'Currency rates refresh failed.' })
      } else {
        setError('Failed to fetch exchange rates')
      }
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  const performConversion = useCallback((amountToConvert: string, shouldSaveHistory: boolean = true) => {
    if (!rates || !amountToConvert) return

    const validation = validateAmount(amountToConvert)
    if (!validation.isValid) {
      setError(validation.error ?? 'Invalid amount')
      setResult(null)
      return
    }

    const numAmount = parseFloat(amountToConvert)
    const converted = convertCurrency(numAmount, fromCurrency, toCurrency, rates)
    setResult(converted)
    setError('')

    const skipHistorySave = suppressNextHistorySaveRef.current
    if (skipHistorySave) {
      suppressNextHistorySaveRef.current = false
    }

    if (shouldSaveHistory && !skipHistorySave) {
      void createHistoryEntry({
        from: fromCurrency,
        to: toCurrency,
        amount: numAmount,
        result: converted,
        rate: rates[toCurrency] / rates[fromCurrency],
      })
    }

    updateUrlParams(fromCurrency, toCurrency, amountToConvert)
  }, [fromCurrency, toCurrency, rates])

  const performConversionRef = useRef(performConversion)

  useEffect(() => {
    performConversionRef.current = performConversion
  }, [performConversion])

  const debouncedPerformConversion = useMemo(
    () =>
      debounce((amountToConvert: string) => {
        performConversionRef.current(amountToConvert)
      }, conversionDebounceMs),
    [conversionDebounceMs]
  )

  useEffect(() => {
    if (!rates || !amount) {
      setResult(null)
      return
    }

    if (conversionDebounceMs === 0) {
      performConversion(amount)
      return
    }

    debouncedPerformConversion(amount)

    return () => {
      debouncedPerformConversion.cancel()
    }
  }, [amount, fromCurrency, toCurrency, rates, performConversion, debouncedPerformConversion, conversionDebounceMs])

  useEffect(() => {
    fetchRates()
  }, [fetchRates])

  useEffect(() => {
    if (!notification) return

    const timeoutId = setTimeout(() => {
      setNotification(null)
    }, 3000)

    return () => clearTimeout(timeoutId)
  }, [notification])

  const handleSwap = useCallback(() => {
    if (isRefreshing) return

    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }, [fromCurrency, toCurrency, isRefreshing])

  const handleFromCurrencyChange = useCallback((nextFromCurrency: string) => {
    if (isRefreshing) return

    if (nextFromCurrency === toCurrency) {
      setToCurrency(fromCurrency)
    }

    setFromCurrency(nextFromCurrency)
  }, [fromCurrency, toCurrency, isRefreshing])

  const handleToCurrencyChange = useCallback((nextToCurrency: string) => {
    if (isRefreshing) return

    if (nextToCurrency === fromCurrency) {
      setFromCurrency(toCurrency)
    }

    setToCurrency(nextToCurrency)
  }, [fromCurrency, toCurrency, isRefreshing])

  const handleRefreshRates = useCallback(async () => {
    await fetchRates({ forceRefresh: true, showNotification: true })
  }, [fetchRates])

  const hasPositiveAmount = Number.isFinite(Number(amount)) && Number(amount) > 0

  return {
    amount,
    setAmount,
    fromCurrency,
    toCurrency,
    rates,
    loading,
    isRefreshing,
    error,
    result,
    lastUpdated,
    ratesSourceUrl,
    ratesBaseCurrency,
    notification,
    hasPositiveAmount,
    handleSwap,
    handleFromCurrencyChange,
    handleToCurrencyChange,
    handleRefreshRates,
  }
}