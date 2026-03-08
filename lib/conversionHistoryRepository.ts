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

const conversionHistoryIdSchema = z.string().min(1)

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

export async function getConversionHistoryById(id: string): Promise<AppConversionHistory | null> {
  const parsedId = conversionHistoryIdSchema.safeParse(id)

  if (!parsedId.success) {
    throw new Error('Invalid conversion history id')
  }

  const row = await prisma.conversionHistory.findUnique({
    where: { id: parsedId.data },
  })

  if (!row) {
    return null
  }

  return mapDbRecordToConversionHistory(row)
}

export async function updateConversionHistory(
  id: string,
  input: Omit<AppConversionHistory, 'id' | 'timestamp'>
): Promise<AppConversionHistory> {
  const parsedId = conversionHistoryIdSchema.safeParse(id)
  const parsedInput = createConversionHistoryInputSchema.safeParse(input)

  if (!parsedId.success) {
    throw new Error('Invalid conversion history id')
  }

  if (!parsedInput.success) {
    throw new Error('Invalid conversion history input')
  }

  try {
    const row = await prisma.conversionHistory.update({
      where: { id: parsedId.data },
      data: {
        fromCurrency: parsedInput.data.from,
        toCurrency: parsedInput.data.to,
        amount: parsedInput.data.amount,
        result: parsedInput.data.result,
        rate: parsedInput.data.rate,
      },
    })

    return mapDbRecordToConversionHistory(row)
  } catch {
    throw new Error('Conversion history not found')
  }
}

export async function deleteConversionHistoryById(id: string): Promise<void> {
  const parsedId = conversionHistoryIdSchema.safeParse(id)

  if (!parsedId.success) {
    throw new Error('Invalid conversion history id')
  }

  try {
    await prisma.conversionHistory.delete({
      where: { id: parsedId.data },
    })
  } catch {
    throw new Error('Conversion history not found')
  }
}

export async function clearConversionHistory(): Promise<void> {
  await prisma.conversionHistory.deleteMany()
}