import { z } from 'zod'

const CURRENCY_CODE_REGEX = /^[A-Z]{3}$/
const MAX_ALLOWED_RATE = 1_000_000

const rateValueSchema = z.number().finite().gt(0).lte(MAX_ALLOWED_RATE)

const ratesSchema = z
  .record(z.string().regex(CURRENCY_CODE_REGEX), rateValueSchema)
  .refine((rates) => Object.keys(rates).length > 0, {
    message: 'At least one currency rate is required',
  })

/**
 * Runtime schema for normalized exchange-rate payloads used by the rates API route.
 *
 * @example
 * const parsed = normalizedRatesPayloadSchema.parse({
 *   rates: { USD: 1, EUR: 0.92 },
 *   base: 'USD',
 *   date: '2026-03-05',
 *   source: 'https://api.frankfurter.app/latest?from=USD',
 * })
 */
export const normalizedRatesPayloadSchema = z.object({
  rates: ratesSchema,
  base: z.string().regex(CURRENCY_CODE_REGEX),
  date: z.string().min(1),
  source: z.string().min(1),
})

/**
 * Strongly-typed normalized payload derived from `normalizedRatesPayloadSchema`.
 *
 * @example
 * const payload: NormalizedRatesPayload = {
 *   rates: { USD: 1, EUR: 0.92 },
 *   base: 'USD',
 *   date: '2026-03-05',
 *   source: 'manual',
 * }
 */
export type NormalizedRatesPayload = z.infer<typeof normalizedRatesPayloadSchema>

/**
 * Validates an unknown payload against the normalized rates schema.
 *
 * @param input - Unknown value from external API or normalized provider response.
 * @returns A discriminated union with validated data on success, or a human-readable error message on failure.
 *
 * @example
 * validateNormalizedRatesPayload({
 *   rates: { USD: 1, EUR: 0.92 },
 *   base: 'USD',
 *   date: '2026-03-05',
 *   source: 'https://api.frankfurter.app/latest?from=USD',
 * })
 * // { success: true, data: ... }
 *
 * @example
 * validateNormalizedRatesPayload({ rates: { usd: 1 }, base: 'usd', date: '', source: '' })
 * // { success: false, error: '...' }
 */
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