'use client'

interface CurrencyInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export default function CurrencyInput({ value, onChange, error, disabled = false }: CurrencyInputProps) {
  return (
    <div>
      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
        Amount
      </label>
      <input
        id="amount"
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Enter amount"
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        min="0"
        step="0.01"
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}