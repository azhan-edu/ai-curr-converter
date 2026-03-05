import { z } from 'zod'

const CURRENCY_CODE_REGEX = /^[A-Z]{3}$/
const MAX_ALLOWED_RATE = 1_000_000

const rateValueSchema = z.number().finite().gt(0).lte(MAX_ALLOWED_RATE)

const ratesSchema = z
  .record(z.string().regex(CURRENCY_CODE_REGEX), rateValueSchema)
  .refine((rates) => Object.keys(rates).length > 0, {
    message: 'At least one currency rate is required',
  })

export const normalizedRatesPayloadSchema = z.object({
  rates: ratesSchema,
  base: z.string().regex(CURRENCY_CODE_REGEX),
  date: z.string().min(1),
  source: z.string().min(1),
})

export type NormalizedRatesPayload = z.infer<typeof normalizedRatesPayloadSchema>

export function validateNormalizedRatesPayload(input: unknown): {
  success: true
  data: NormalizedRatesPayload
} | {
  success: false
  error: string
} {
  const result = normalizedRatesPayloadSchema.safeParse(input)

  if (!result.success) {
    const reason = result.error.issues.map((issue) => issue.message).join(', ')
    return {
      success: false,
      error: reason || 'Invalid external rates payload',
    }
  }

  return {
    success: true,
    data: result.data,
  }
}