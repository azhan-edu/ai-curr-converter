'use client'

import { Currency } from '@/types'

interface CurrencySelectProps {
  value: string
  onChange: (value: string) => void
  currencies: Currency[]
  label: string
  disabled?: boolean
}

export default function CurrencySelect({ value, onChange, currencies, label, disabled = false }: CurrencySelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
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
    </div>
  )
}