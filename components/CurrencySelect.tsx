'use client'

import { Currency } from '@/types'

interface CurrencySelectProps {
  value: string
  onChange: (value: string) => void
  currencies: Currency[]
  label: string
  disabled?: boolean
  isFavorite?: boolean
  onToggleFavorite?: (currencyCode: string) => void
}

export default function CurrencySelect({
  value,
  onChange,
  currencies,
  label,
  disabled = false,
  isFavorite = false,
  onToggleFavorite,
}: CurrencySelectProps) {
  const favoriteActionLabel = isFavorite ? `Remove ${value} from favorites` : `Add ${value} to favorites`

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {currencies.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.code} - {currency.name}
            </option>
          ))}
        </select>

        {onToggleFavorite && (
          <button
            type="button"
            aria-label={favoriteActionLabel}
            aria-pressed={isFavorite}
            onClick={() => onToggleFavorite(value)}
            disabled={disabled}
            className="h-10 px-3 rounded-md border border-gray-300 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFavorite ? '★ Favorite' : '☆ Favorite'}
          </button>
        )}
      </div>
    </div>
  )
}