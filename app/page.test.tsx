import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CurrencyConverter from './page'

jest.mock('@/utils/storage', () => ({
  getConversionHistory: jest.fn(() => []),
  saveConversion: jest.fn(),
  clearConversionHistory: jest.fn(),
  getUrlParams: jest.fn(() => ({})),
  updateUrlParams: jest.fn(),
}))

describe('CurrencyConverter currency selection behavior', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({
        success: true,
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
})
