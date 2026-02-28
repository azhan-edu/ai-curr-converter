'use client'

import { ExchangeRate } from '@/types'

interface CurrencyRatesPanelProps {
  lastUpdated: string | null
  showRefreshButton: boolean
  isRefreshing: boolean
  onRefresh: () => void
  sourceUrl?: string | null
  baseCurrency?: string | null
  rates?: ExchangeRate | null
}

export default function CurrencyRatesPanel({
  lastUpdated,
  showRefreshButton,
  isRefreshing,
  onRefresh,
  sourceUrl,
  baseCurrency,
  rates,
}: CurrencyRatesPanelProps) {
  const formattedLastUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleString()
    : 'N/A'

  const formattedSourceUrl = sourceUrl
    ? (() => {
        try {
          const parsedUrl = new URL(sourceUrl)
          return `${parsedUrl.origin}${parsedUrl.pathname}`
        } catch {
          return sourceUrl
        }
      })()
    : 'N/A'

  const sortedRates = rates
    ? Object.entries(rates).sort(([firstCode], [secondCode]) => firstCode.localeCompare(secondCode))
    : []

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Currency Rates</h2>
          <p className="text-sm text-gray-600">Last rates update: {formattedLastUpdated}</p>
        </div>

        {showRefreshButton && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isRefreshing && (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            )}
            {isRefreshing ? 'Refreshing...' : 'Refresh Rates'}
          </button>
        )}
      </div>

      <details className="mt-4 bg-white border border-gray-200 rounded-md">
        <summary className="px-3 py-2 text-sm font-medium text-gray-800 cursor-pointer">
          Rates Details
        </summary>

        <div className="px-3 pb-3">
          <p className="text-sm text-gray-600 mb-2">
            Source URL: {formattedSourceUrl}
          </p>

          {sortedRates.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th scope="col" className="px-3 py-2 border-b border-gray-200">Currency</th>
                    <th scope="col" className="px-3 py-2 border-b border-gray-200">Rate (Base {baseCurrency ?? 'N/A'})</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRates.map(([code, value]) => (
                    <tr key={code} className="border-b border-gray-100">
                      <td className="px-3 py-2 font-medium text-gray-800">{code}</td>
                      <td className="px-3 py-2 text-gray-700">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No rates loaded.</p>
          )}
        </div>
      </details>
    </div>
  )
}