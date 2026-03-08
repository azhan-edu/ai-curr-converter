import '@testing-library/jest-dom'
import { renderHook, act, waitFor } from '@testing-library/react'

import useConversionHistory from './useConversionHistory'

describe('useConversionHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    global.fetch = jest.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)

      if (url.includes('/api/conversions') && init?.method === 'DELETE') {
        return Promise.resolve({
          json: async () => ({ success: true }),
        })
      }

      return Promise.resolve({
        json: async () => ({
          success: true,
          data: [
            {
              id: 'entry-1',
              from: 'USD',
              to: 'EUR',
              amount: 10,
              result: 9.2,
              rate: 0.92,
              timestamp: '2026-03-08T10:00:00.000Z',
            },
          ],
        }),
      })
    }) as jest.Mock
  })

  it('loads conversion history on mount', async () => {
    const { result } = renderHook(() => useConversionHistory())

    await waitFor(() => {
      expect(result.current.history).toHaveLength(1)
    })

    expect(result.current.history[0].timestamp).toBeInstanceOf(Date)
  })

  it('refreshes conversion history when history-updated event is emitted', async () => {
    const { result } = renderHook(() => useConversionHistory())

    await waitFor(() => {
      expect(result.current.history).toHaveLength(1)
    })

    const fetchCallsBeforeEvent = (global.fetch as jest.Mock).mock.calls.length

    await act(async () => {
      window.dispatchEvent(new Event('conversion-history-updated'))
    })

    await waitFor(() => {
      expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(fetchCallsBeforeEvent)
    })
  })

  it('clears conversion history', async () => {
    const { result } = renderHook(() => useConversionHistory())

    await waitFor(() => {
      expect(result.current.history).toHaveLength(1)
    })

    await act(async () => {
      await result.current.clearHistory()
    })

    expect(result.current.history).toHaveLength(0)
  })
})