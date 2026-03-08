import '@testing-library/jest-dom'
import { renderHook, act, waitFor } from '@testing-library/react'

import useCurrencyConverter from './useCurrencyConverter'
import { updateUrlParams } from '@/utils/storage'

jest.mock('@/utils/storage', () => ({
  getUrlParams: jest.fn(() => ({})),
  updateUrlParams: jest.fn(),
}))

describe('useCurrencyConverter', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({
        success: true,
        data: [],
      }),
    }) as jest.Mock

    ;(global.fetch as jest.Mock).mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)

      if (url.includes('/api/rates')) {
        return Promise.resolve({
          json: async () => ({
            success: true,
            date: '2026-02-28',
            rates: {
              USD: 1,
              EUR: 0.92,
              GBP: 0.8,
            },
          }),
        })
      }

      if (url.includes('/api/conversions') && init?.method === 'POST') {
        return Promise.resolve({
          json: async () => ({ success: true }),
        })
      }

      if (url.includes('/api/conversions') && init?.method === 'DELETE') {
        return Promise.resolve({
          json: async () => ({ success: true }),
        })
      }

      return Promise.resolve({
        json: async () => ({
          success: true,
          data: [],
        }),
      })
    })
  })

  it('updates URL params after a valid conversion', async () => {
    const { result } = renderHook(() => useCurrencyConverter())

    await act(async () => {
      result.current.setAmount('10')
    })

    await waitFor(() => {
      expect(result.current.result).toBeCloseTo(9.2)
    })

    expect(updateUrlParams).toHaveBeenCalledWith('USD', 'EUR', '10')
  })

  it('refreshes rates and skips writing conversion history during refresh-triggered recompute', async () => {
    let createHistoryCalls = 0

    ;(global.fetch as jest.Mock).mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)

      if (url.includes('/api/conversions') && init?.method === 'POST') {
        createHistoryCalls += 1
        return Promise.resolve({
          json: async () => ({ success: true }),
        })
      }

      if (url.includes('/api/conversions')) {
        return Promise.resolve({
          json: async () => ({
            success: true,
            data: [],
          }),
        })
      }

      if (url.includes('refresh=1')) {
        return Promise.resolve({
          json: async () => ({
            success: true,
            date: '2026-03-01',
            rates: {
              USD: 1,
              EUR: 0.95,
              GBP: 0.8,
            },
          }),
        })
      }

      return Promise.resolve({
        json: async () => ({
          success: true,
          date: '2026-02-28',
          rates: {
            USD: 1,
            EUR: 0.92,
            GBP: 0.8,
          },
        }),
      })
    }) as jest.Mock

    const { result } = renderHook(() => useCurrencyConverter())

    await act(async () => {
      result.current.setAmount('10')
    })

    await waitFor(() => {
      expect(result.current.result).toBeCloseTo(9.2)
    })

    const callsBeforeRefresh = createHistoryCalls
    expect(callsBeforeRefresh).toBeGreaterThan(0)

    await act(async () => {
      await result.current.handleRefreshRates()
    })

    await waitFor(() => {
      expect(result.current.notification?.message).toBe('Currency rates are refreshed')
      expect(result.current.result).toBeCloseTo(9.5)
    })

    expect(createHistoryCalls).toBe(callsBeforeRefresh)
  })

})