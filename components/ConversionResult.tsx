'use client'

import { formatCurrency } from '@/utils/currency'

interface ConversionResultProps {
  amount: number
  from: string
  to: string
  result: number
  rate: number
}

export default function ConversionResult({ amount, from, to, result, rate }: ConversionResultProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-md text-center">
      <div className="text-lg font-semibold text-gray-900 mb-2">
        {formatCurrency(amount, from)} = {formatCurrency(result, to)}
      </div>
      <div className="text-sm text-gray-600">
        1 {from} = {rate.toFixed(4)} {to}
      </div>
    </div>
  )
}