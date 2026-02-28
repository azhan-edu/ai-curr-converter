import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CurrencyConverter from './page'
import { addFavoriteCurrency, getFavoriteCurrencies, removeFavoriteCurrency, saveConversion } from '@/utils/storage'

jest.mock('@/utils/storage', () => ({
  getConversionHistory: jest.fn(() => []),
  saveConversion: jest.fn(),
  clearConversionHistory: jest.fn(),
  getFavoriteCurrencies: jest.fn(() => []),
  addFavoriteCurrency: jest.fn((code: string) => ({ success: true, favorites: [code] })),
  removeFavoriteCurrency: jest.fn((code: string) => ({ success: true, favorites: [], removed: code })),
  MAX_FAVORITES: 5,
  getUrlParams: jest.fn(() => ({})),
  updateUrlParams: jest.fn(),
}))

describe('CurrencyConverter currency selection behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    ;(getFavoriteCurrencies as jest.Mock).mockReturnValue([])
    ;(addFavoriteCurrency as jest.Mock).mockImplementation((code: string) => ({
      success: true,
      favorites: [code],
    }))
    ;(removeFavoriteCurrency as jest.Mock).mockImplementation(() => ({
      success: true,
      favorites: [],
    }))

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

  it('marks and unmarks selected currency as favorite from selector controls', async () => {
    const user = userEvent.setup()

    ;(addFavoriteCurrency as jest.Mock).mockImplementation((code: string) => ({
      success: true,
      favorites: [code],
    }))
    ;(removeFavoriteCurrency as jest.Mock).mockImplementation(() => ({
      success: true,
      favorites: [],
    }))

    render(<CurrencyConverter />)

    const addButton = screen.getByRole('button', { name: 'Add USD to favorites' })
    await user.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('USD added to favorites.')).toBeInTheDocument()
    })
    expect(addFavoriteCurrency).toHaveBeenCalledWith('USD')

    const removeButton = screen.getByRole('button', { name: 'Remove USD from favorites' })
    await user.click(removeButton)

    await waitFor(() => {
      expect(screen.getByText('USD removed from favorites.')).toBeInTheDocument()
    })
    expect(removeFavoriteCurrency).toHaveBeenCalledWith('USD')
  })

  it('renders favorites at top of both selectors when favorites exist', async () => {
    const user = userEvent.setup()

    ;(addFavoriteCurrency as jest.Mock).mockImplementation((code: string) => ({
      success: true,
      favorites: ['GBP', code],
    }))

    render(<CurrencyConverter />)

    const [fromSelect, toSelect] = screen.getAllByRole('combobox') as HTMLSelectElement[]
    await user.selectOptions(fromSelect, 'GBP')
    await user.click(screen.getByRole('button', { name: 'Add GBP to favorites' }))

    await waitFor(() => {
      const fromOptions = Array.from(fromSelect.options).map((option) => option.value)
      const toOptions = Array.from(toSelect.options).map((option) => option.value)

      expect(fromOptions[0]).toBe('GBP')
      expect(toOptions[0]).toBe('GBP')
    })
  })

  it('hydrates favorites from storage on load and blocks adding when max limit is reached', async () => {
    const user = userEvent.setup()

    ;(getFavoriteCurrencies as jest.Mock).mockReturnValue(['USD', 'EUR', 'GBP', 'JPY', 'CAD'])
    ;(addFavoriteCurrency as jest.Mock).mockReturnValue({
      success: false,
      favorites: ['USD', 'EUR', 'GBP', 'JPY', 'CAD'],
      error: 'You can only have up to 5 favorite currencies.',
    })

    render(<CurrencyConverter />)

    const [fromSelect] = screen.getAllByRole('combobox') as HTMLSelectElement[]
    await user.selectOptions(fromSelect, 'AUD')

    const addAudButton = screen.getByRole('button', { name: 'Add AUD to favorites' })
    await user.click(addAudButton)

    await waitFor(() => {
      expect(screen.getByText('You can only have up to 5 favorite currencies.')).toBeInTheDocument()
    })

    expect(addFavoriteCurrency).toHaveBeenCalledWith('AUD')

    expect(getFavoriteCurrencies).toHaveBeenCalled()
  })
})
