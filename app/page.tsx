'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { ExchangeRate, ConversionHistory as ConversionHistoryEntry, RatesApiResponse } from '@/types'
import { CURRENCIES, convertCurrency, sortCurrenciesByFavorites, validateAmount } from '@/utils/currency'
import { addFavoriteCurrency, clearConversionHistory, getConversionHistory, getFavoriteCurrencies, getUrlParams, MAX_FAVORITES, removeFavoriteCurrency, saveConversion, updateUrlParams } from '@/utils/storage'
import CurrencyInput from '@/components/CurrencyInput'
import CurrencySelect from '@/components/CurrencySelect'
import SwapButton from '@/components/SwapButton'
import ConversionResult from '@/components/ConversionResult'
import ConversionHistory from '@/components/ConversionHistory'
import CurrencyRatesPanel from '@/components/CurrencyRatesPanel'

type NotificationState = {
  type: 'success' | 'error'
  message: string
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('EUR')
  const [rates, setRates] = useState<ExchangeRate | null>(null)
  const [loading, setLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<number | null>(null)
  const [history, setHistory] = useState<ConversionHistoryEntry[]>([])
  const [favoriteCurrencies, setFavoriteCurrencies] = useState<string[]>([])
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [ratesSourceUrl, setRatesSourceUrl] = useState<string | null>(null)
  const [ratesBaseCurrency, setRatesBaseCurrency] = useState<string | null>(null)
  const [notification, setNotification] = useState<NotificationState | null>(null)
  const suppressNextHistorySaveRef = useRef(false)

  // Load URL params on mount
  useEffect(() => {
    const params = getUrlParams()
    if (params.from) setFromCurrency(params.from)
    if (params.to) setToCurrency(params.to)
    if (params.amount) setAmount(params.amount)
  }, [])

  // Load history
  useEffect(() => {
    setHistory(getConversionHistory())
    setFavoriteCurrencies(getFavoriteCurrencies())
  }, [])

  const orderedCurrencies = useMemo(
    () => sortCurrenciesByFavorites(CURRENCIES, favoriteCurrencies),
    [favoriteCurrencies]
  )

  // Fetch rates
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
    } catch (err) {
      if (forceRefresh) {
        setNotification({ type: 'error', message: 'Currency rates refresh failed.' })
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch exchange rates')
      }
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [setLoading, setError, setRates, setLastUpdated, setRatesSourceUrl, setRatesBaseCurrency, setIsRefreshing, setNotification])

  // Convert currency
  const performConversion = useCallback((shouldSaveHistory: boolean = true) => {
    if (!rates || !amount) return

    const validation = validateAmount(amount)
    if (!validation.isValid) {
      setError(validation.error!)
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
      saveConversion({
        from: fromCurrency,
        to: toCurrency,
        amount: numAmount,
        result: converted,
        rate: rates[toCurrency] / rates[fromCurrency],
      })
      setHistory(getConversionHistory())
    }

    // Update URL
    updateUrlParams(fromCurrency, toCurrency, amount)
  }, [amount, fromCurrency, toCurrency, rates])

  // Auto convert when inputs change
  useEffect(() => {
    if (rates && amount) {
      performConversion()
    } else {
      setResult(null)
    }
  }, [amount, fromCurrency, toCurrency, rates, performConversion])

  // Fetch rates on mount
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

  // Swap currencies
  const handleSwap = () => {
    if (isRefreshing) return

    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const handleFromCurrencyChange = (nextFromCurrency: string) => {
    if (isRefreshing) return

    if (nextFromCurrency === toCurrency) {
      setToCurrency(fromCurrency)
    }

    setFromCurrency(nextFromCurrency)
  }

  const handleToCurrencyChange = (nextToCurrency: string) => {
    if (isRefreshing) return

    if (nextToCurrency === fromCurrency) {
      setFromCurrency(toCurrency)
    }

    setToCurrency(nextToCurrency)
  }

  // Clear history
  const handleClearHistory = () => {
    clearConversionHistory()
    setHistory([])
  }

  // Reload conversion from history
  const handleReloadConversion = (conversion: ConversionHistoryEntry) => {
    setAmount(conversion.amount.toString())
    setFromCurrency(conversion.from)
    setToCurrency(conversion.to)
  }

  const handleRefreshRates = async () => {
    await fetchRates({ forceRefresh: true, showNotification: true })
  }

  const handleToggleFavorite = (currencyCode: string) => {
    const isAlreadyFavorite = favoriteCurrencies.includes(currencyCode)

    if (isAlreadyFavorite) {
      const result = removeFavoriteCurrency(currencyCode)
      setFavoriteCurrencies(result.favorites)
      setNotification({ type: 'success', message: `${currencyCode} removed from favorites.` })
      return
    }

    const result = addFavoriteCurrency(currencyCode)

    if (!result.success) {
      setFavoriteCurrencies(result.favorites)
      setNotification({ type: 'error', message: result.error ?? `You can only have up to ${MAX_FAVORITES} favorite currencies.` })
      return
    }

    setFavoriteCurrencies(result.favorites)
    setNotification({ type: 'success', message: `${currencyCode} added to favorites.` })
  }

  const hasPositiveAmount = Number.isFinite(Number(amount)) && Number(amount) > 0

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          Currency Converter
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-end gap-4 mb-4">
            <div className="flex-1">
              <CurrencyInput
                value={amount}
                onChange={setAmount}
                error={error}
                disabled={isRefreshing}
              />
            </div>

            <div className="flex items-center gap-2">
              <CurrencySelect
                value={fromCurrency}
                onChange={handleFromCurrencyChange}
                currencies={orderedCurrencies}
                label="From"
                disabled={isRefreshing}
                isFavorite={favoriteCurrencies.includes(fromCurrency)}
                onToggleFavorite={handleToggleFavorite}
              />

              <SwapButton onClick={handleSwap} disabled={isRefreshing} />

              <CurrencySelect
                value={toCurrency}
                onChange={handleToCurrencyChange}
                currencies={orderedCurrencies}
                label="To"
                disabled={isRefreshing}
                isFavorite={favoriteCurrencies.includes(toCurrency)}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          </div>

          <CurrencyRatesPanel
            lastUpdated={lastUpdated}
            showRefreshButton={hasPositiveAmount}
            isRefreshing={isRefreshing}
            onRefresh={handleRefreshRates}
            sourceUrl={ratesSourceUrl}
            baseCurrency={ratesBaseCurrency}
            rates={rates}
          />

          {result !== null && (
            <ConversionResult
              amount={parseFloat(amount)}
              from={fromCurrency}
              to={toCurrency}
              result={result}
              rate={rates ? rates[toCurrency] / rates[fromCurrency] : 0}
            />
          )}

          {loading && (
            <div className="text-center text-gray-600 mt-4">
              Loading exchange rates...
            </div>
          )}

          {notification && (
            <div
              role="status"
              className={`fixed top-4 right-4 px-4 py-3 rounded-md shadow-md text-white ${
                notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
              }`}
            >
              {notification.message}
            </div>
          )}

          {error && !loading && (
            <div className="text-center text-red-600 mt-4">
              {error}
            </div>
          )}
        </div>

        <ConversionHistory
          history={history}
          onClear={handleClearHistory}
          onReload={handleReloadConversion}
        />
      </div>
    </div>
  )
}