import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CurrencyConverter from './page'
import { saveConversion } from '@/utils/storage'

jest.mock('@/utils/storage', () => ({
  getConversionHistory: jest.fn(() => []),
  saveConversion: jest.fn(),
  clearConversionHistory: jest.fn(),
  getUrlParams: jest.fn(() => ({})),
  updateUrlParams: jest.fn(),
}))

describe('CurrencyConverter currency selection behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({
        success: true,
        date: '2026-02-28',
        rates: {
          USD: 1,
          EUR: 0.92,
          GBP: 0.8,
        },
      }),
    }) as jest.Mock
  })

  it('swaps currencies when selecting To equal to current From', async () => {
    const user = userEvent.setup()
    render(<CurrencyConverter />)

    const [fromSelect, toSelect] = screen.getAllByRole('combobox')

    expect(fromSelect).toHaveValue('USD')
    expect(toSelect).toHaveValue('EUR')

    await user.selectOptions(toSelect, 'USD')

    await waitFor(() => {
      expect(fromSelect).toHaveValue('EUR')
      expect(toSelect).toHaveValue('USD')
    })
  })

  it('swaps currencies when selecting From equal to current To', async () => {
    const user = userEvent.setup()
    render(<CurrencyConverter />)

    const [fromSelect, toSelect] = screen.getAllByRole('combobox')

    expect(fromSelect).toHaveValue('USD')
    expect(toSelect).toHaveValue('EUR')

    await user.selectOptions(fromSelect, 'EUR')

    await waitFor(() => {
      expect(fromSelect).toHaveValue('EUR')
      expect(toSelect).toHaveValue('USD')
    })
  })

  it('updates only selected side when selected value differs from opposite currency', async () => {
    const user = userEvent.setup()
    render(<CurrencyConverter />)

    const [fromSelect, toSelect] = screen.getAllByRole('combobox')

    expect(fromSelect).toHaveValue('USD')
    expect(toSelect).toHaveValue('EUR')

    await user.selectOptions(toSelect, 'GBP')

    await waitFor(() => {
      expect(fromSelect).toHaveValue('USD')
      expect(toSelect).toHaveValue('GBP')
    })
  })

  it('shows refresh button only when amount is greater than zero', async () => {
    const user = userEvent.setup()
    render(<CurrencyConverter />)

    expect(screen.queryByRole('button', { name: 'Refresh Rates' })).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Amount'), '10')

    expect(screen.getByRole('button', { name: 'Refresh Rates' })).toBeInTheDocument()
  })

  it('shows refreshing state and disables controls while refresh is in progress', async () => {
    const user = userEvent.setup()
    let resolveRefresh: (() => void) | undefined

    global.fetch = jest.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('refresh=1')) {
        return new Promise((resolve) => {
          resolveRefresh = () => {
            resolve({
              json: async () => ({
                success: true,
                date: '2026-02-28',
                rates: {
                  USD: 1,
                  EUR: 0.95,
                  GBP: 0.8,
                },
              }),
            })
          }
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

    render(<CurrencyConverter />)
    await user.type(screen.getByLabelText('Amount'), '10')
    await user.click(screen.getByRole('button', { name: 'Refresh Rates' }))

    expect(screen.getByRole('button', { name: 'Refreshing...' })).toBeDisabled()
    expect(screen.getByLabelText('Amount')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Swap currencies' })).toBeDisabled()

    const selects = screen.getAllByRole('combobox')
    expect(selects[0]).toBeDisabled()
    expect(selects[1]).toBeDisabled()

    if (resolveRefresh) {
      resolveRefresh()
    }

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Refresh Rates' })).toBeEnabled()
    })
  })

  it('updates rates on refresh and does not write conversion history again', async () => {
    const user = userEvent.setup()
    const saveConversionMock = saveConversion as jest.Mock

    global.fetch = jest.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = String(input)

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

    render(<CurrencyConverter />)
    await user.type(screen.getByLabelText('Amount'), '10')

    await waitFor(() => {
      expect(screen.getByText('1 USD = 0.9200 EUR')).toBeInTheDocument()
    })

    const callsBeforeRefresh = saveConversionMock.mock.calls.length
    expect(callsBeforeRefresh).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Refresh Rates' }))

    await waitFor(() => {
      expect(screen.getByText('Currency rates are refreshed')).toBeInTheDocument()
    })

    expect(screen.getByText('1 USD = 0.9500 EUR')).toBeInTheDocument()
    expect(saveConversionMock).toHaveBeenCalledTimes(callsBeforeRefresh)
  })

  it('shows failure notification and keeps previous successful rate when refresh fails', async () => {
    const user = userEvent.setup()

    global.fetch = jest.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = String(input)

      if (url.includes('refresh=1')) {
        return Promise.resolve({
          json: async () => ({
            success: false,
            error: 'network error',
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

    render(<CurrencyConverter />)
    await user.type(screen.getByLabelText('Amount'), '10')

    await waitFor(() => {
      expect(screen.getByText('1 USD = 0.9200 EUR')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Refresh Rates' }))

    await waitFor(() => {
      expect(screen.getByText('Currency rates refresh failed.')).toBeInTheDocument()
    })

    expect(screen.getByText('1 USD = 0.9200 EUR')).toBeInTheDocument()
  })
})
