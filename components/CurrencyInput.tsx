'use client'

interface CurrencyInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export default function CurrencyInput({ value, onChange, error, disabled = false }: CurrencyInputProps) {
  const errorId = 'amount-error'

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
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-600' : 'border-gray-300'
        }`}
        min="0"
        step="0.01"
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-700">{error}</p>
      )}
    </div>
  )
}