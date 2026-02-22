'use client'

import { ConversionHistory } from '@/types'
import { formatCurrency } from '@/utils/currency'

interface HistoryProps {
  history: ConversionHistory[]
  onClear: () => void
  onReload: (conversion: ConversionHistory) => void
}

export default function History({ history, onClear, onReload }: HistoryProps) {
  if (history.length === 0) return null

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Conversion History</h2>
        <button
          onClick={onClear}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Clear History
        </button>
      </div>

      <div className="space-y-2">
        {history.map((item) => (
          <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
            <div className="flex-1">
              <div className="text-sm text-gray-600">
                {formatCurrency(item.amount, item.from)} → {formatCurrency(item.result, item.to)}
              </div>
              <div className="text-xs text-gray-500">
                {item.timestamp.toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => onReload(item)}
              className="ml-4 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Reload
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}