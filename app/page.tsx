'use client'

import { CURRENCIES } from '@/utils/currency'
import CurrencyInput from '@/components/CurrencyInput'
import CurrencySelect from '@/components/CurrencySelect'
import SwapButton from '@/components/SwapButton'
import ConversionResult from '@/components/ConversionResult'
import ConversionHistoryPanel from '@/components/ConversionHistoryPanel'
import CurrencyRatesPanel from '@/components/CurrencyRatesPanel'
import useCurrencyConverter from '@/hooks/useCurrencyConverter'

export default function CurrencyConverter() {
  const {
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
  } = useCurrencyConverter()

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-gray-50 py-8 px-4">
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
                currencies={CURRENCIES}
                label="From"
                disabled={isRefreshing}
              />

              <SwapButton onClick={handleSwap} disabled={isRefreshing} />

              <CurrencySelect
                value={toCurrency}
                onChange={handleToCurrencyChange}
                currencies={CURRENCIES}
                label="To"
                disabled={isRefreshing}
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
              aria-live="polite"
              aria-atomic="true"
              className={`fixed top-4 right-4 px-4 py-3 rounded-md shadow-md text-white ${
                notification.type === 'success' ? 'bg-green-700' : 'bg-red-700'
              }`}
            >
              {notification.message}
            </div>
          )}

          {error && !loading && (
            <div role="alert" className="text-center text-red-700 mt-4">
              {error}
            </div>
          )}
        </div>

        <ConversionHistoryPanel />

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p suppressHydrationWarning>© {new Date().getFullYear()} Godel Technologies. All rights reserved.</p>
        </footer>
      </div>
    </main>
  )
}