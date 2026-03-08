import type { ConversionHistory as AppConversionHistory } from '@/types'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

type DbConversionHistoryRecord = {
  id: string
  fromCurrency: string
  toCurrency: string
  amount: number
  result: number
  rate: number
  timestamp: Date
}

const DEFAULT_LIST_LIMIT = 10
const MAX_LIST_LIMIT = 100
const CURRENCY_CODE_REGEX = /^[A-Z]{3}$/

const createConversionHistoryInputSchema = z.object({
  from: z.string().regex(CURRENCY_CODE_REGEX),
  to: z.string().regex(CURRENCY_CODE_REGEX),
  amount: z.number().finite().gt(0),
  result: z.number().finite().gt(0),
  rate: z.number().finite().gt(0),
})

function normalizeListLimit(limit: number): number {
  if (!Number.isFinite(limit) || limit <= 0) {
    return DEFAULT_LIST_LIMIT
  }

  return Math.min(Math.trunc(limit), MAX_LIST_LIMIT)
}

export function mapDbRecordToConversionHistory(record: DbConversionHistoryRecord): AppConversionHistory {
  return {
    id: record.id,
    from: record.fromCurrency,
    to: record.toCurrency,
    amount: record.amount,
    result: record.result,
    rate: record.rate,
    timestamp: record.timestamp,
  }
}

export async function listConversionHistory(limit = DEFAULT_LIST_LIMIT): Promise<AppConversionHistory[]> {
  const rows = await prisma.conversionHistory.findMany({
    orderBy: { timestamp: 'desc' },
    take: normalizeListLimit(limit),
  })

  return rows.map(mapDbRecordToConversionHistory)
}

export async function createConversionHistory(
  input: Omit<AppConversionHistory, 'id' | 'timestamp'>
): Promise<AppConversionHistory> {
  const parsedInput = createConversionHistoryInputSchema.safeParse(input)

  if (!parsedInput.success) {
    throw new Error('Invalid conversion history input')
  }

  const row = await prisma.conversionHistory.create({
    data: {
      fromCurrency: parsedInput.data.from,
      toCurrency: parsedInput.data.to,
      amount: parsedInput.data.amount,
      result: parsedInput.data.result,
      rate: parsedInput.data.rate,
    },
  })

  return mapDbRecordToConversionHistory(row)
}

export async function clearConversionHistory(): Promise<void> {
  await prisma.conversionHistory.deleteMany()
}