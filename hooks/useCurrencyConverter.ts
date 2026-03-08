'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ExchangeRate, ConversionHistory as ConversionHistoryEntry, RatesApiResponse } from '@/types'
import { convertCurrency, validateAmount } from '@/utils/currency'
import { getUrlParams, updateUrlParams } from '@/utils/storage'

type NotificationState = {
  type: 'success' | 'error'
  message: string
}

export default function useCurrencyConverter() {
  const [amount, setAmount] = useState('')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('EUR')
  const [rates, setRates] = useState<ExchangeRate | null>(null)
  const [loading, setLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<number | null>(null)
  const [history, setHistory] = useState<ConversionHistoryEntry[]>([])
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [ratesSourceUrl, setRatesSourceUrl] = useState<string | null>(null)
  const [ratesBaseCurrency, setRatesBaseCurrency] = useState<string | null>(null)
  const [notification, setNotification] = useState<NotificationState | null>(null)
  const suppressNextHistorySaveRef = useRef(false)

  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/conversions')
      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        const parsedHistory: ConversionHistoryEntry[] = data.data.map((item: ConversionHistoryEntry) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))
        setHistory(parsedHistory)
      }
    } catch {
      setHistory([])
    }
  }, [])

  const createHistoryEntry = useCallback(async (entry: Omit<ConversionHistoryEntry, 'id' | 'timestamp'>) => {
    try {
      await fetch('/api/conversions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      })
      await loadHistory()
    } catch {
      // Ignore history write failures to keep conversion UX responsive.
    }
  }, [loadHistory])

  useEffect(() => {
    const params = getUrlParams()
    if (params.from) setFromCurrency(params.from)
    if (params.to) setToCurrency(params.to)
    if (params.amount) setAmount(params.amount)
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

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

  const performConversion = useCallback((shouldSaveHistory: boolean = true) => {
    if (!rates || !amount) return

    const validation = validateAmount(amount)
    if (!validation.isValid) {
      setError(validation.error ?? 'Invalid amount')
      setResult(null)
      return
    }

    const numAmount = parseFloat(amount)
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

    updateUrlParams(fromCurrency, toCurrency, amount)
  }, [amount, fromCurrency, toCurrency, rates])

  useEffect(() => {
    if (rates && amount) {
      performConversion()
    } else {
      setResult(null)
    }
  }, [amount, fromCurrency, toCurrency, rates, performConversion])

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

  const handleClearHistory = useCallback(() => {
    void (async () => {
      try {
        await fetch('/api/conversions', {
          method: 'DELETE',
        })
        setHistory([])
      } catch {
        // Ignore clear failures and keep current UI state.
      }
    })()
  }, [])

  const handleReloadConversion = useCallback((conversion: ConversionHistoryEntry) => {
    setAmount(conversion.amount.toString())
    setFromCurrency(conversion.from)
    setToCurrency(conversion.to)
  }, [])

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
    history,
    lastUpdated,
    ratesSourceUrl,
    ratesBaseCurrency,
    notification,
    hasPositiveAmount,
    handleSwap,
    handleFromCurrencyChange,
    handleToCurrencyChange,
    handleClearHistory,
    handleReloadConversion,
    handleRefreshRates,
  }
}