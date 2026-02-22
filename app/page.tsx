'use client'

import { useState, useEffect, useCallback } from 'react'
import { Currency, ExchangeRate, ConversionHistory } from '@/types'
import { CURRENCIES, convertCurrency, formatCurrency, validateAmount } from '@/utils/currency'
import { getConversionHistory, saveConversion, clearConversionHistory, getUrlParams, updateUrlParams } from '@/utils/storage'
import CurrencyInput from '@/components/CurrencyInput'
import CurrencySelect from '@/components/CurrencySelect'
import SwapButton from '@/components/SwapButton'
import ConversionResult from '@/components/ConversionResult'
import History from '@/components/History'

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('EUR')
  const [rates, setRates] = useState<ExchangeRate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<number | null>(null)
  const [history, setHistory] = useState<ConversionHistory[]>([])

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
  }, [])

  // Fetch rates
  const fetchRates = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('/api/rates')
      const data = await response.json()
      if (data.success) {
        setRates(data.rates)
      } else {
        throw new Error(data.error || 'Failed to fetch rates')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch exchange rates')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setRates])

  // Convert currency
  const performConversion = useCallback(() => {
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

    // Save to history
    saveConversion({
      from: fromCurrency,
      to: toCurrency,
      amount: numAmount,
      result: converted,
      rate: rates[toCurrency] / rates[fromCurrency],
    })
    setHistory(getConversionHistory())

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

  // Swap currencies
  const handleSwap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  // Clear history
  const handleClearHistory = () => {
    clearConversionHistory()
    setHistory([])
  }

  // Reload conversion from history
  const handleReloadConversion = (conversion: ConversionHistory) => {
    setAmount(conversion.amount.toString())
    setFromCurrency(conversion.from)
    setToCurrency(conversion.to)
  }

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
              />
            </div>

            <div className="flex items-center gap-2">
              <CurrencySelect
                value={fromCurrency}
                onChange={setFromCurrency}
                currencies={CURRENCIES}
                label="From"
              />

              <SwapButton onClick={handleSwap} />

              <CurrencySelect
                value={toCurrency}
                onChange={setToCurrency}
                currencies={CURRENCIES}
                label="To"
              />
            </div>
          </div>

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

          {error && !loading && (
            <div className="text-center text-red-600 mt-4">
              {error}
            </div>
          )}
        </div>

        <History
          history={history}
          onClear={handleClearHistory}
          onReload={handleReloadConversion}
        />
      </div>
    </div>
  )
}