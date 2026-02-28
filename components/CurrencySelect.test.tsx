import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CurrencySelect from './CurrencySelect'
import type { Currency } from '@/types'

const currencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
]

describe('CurrencySelect', () => {
  it('renders label and all currency options', () => {
    const onChange = jest.fn()

    const { container } = render(
      <CurrencySelect
        value="USD"
        onChange={onChange}
        currencies={currencies}
        label="From"
      />
    )

    expect(screen.getByText('From')).toBeInTheDocument()

    const select = container.querySelector('select')
    expect(select).toBeInTheDocument()
    expect(select).toHaveValue('USD')

    expect(screen.getByRole('option', { name: 'USD - US Dollar' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'EUR - Euro' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'GBP - British Pound' })).toBeInTheDocument()
  })

  it('calls onChange with selected currency code', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    const { container } = render(
      <CurrencySelect
        value="USD"
        onChange={onChange}
        currencies={currencies}
        label="To"
      />
    )

    const select = container.querySelector('select')
    expect(select).toBeInTheDocument()

    await user.selectOptions(select as HTMLSelectElement, 'EUR')

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('EUR')
  })

  it('renders as disabled when disabled prop is true', () => {
    const onChange = jest.fn()

    const { container } = render(
      <CurrencySelect
        value="USD"
        onChange={onChange}
        currencies={currencies}
        label="From"
        disabled
      />
    )

    const select = container.querySelector('select')
    expect(select).toBeDisabled()
  })
})
