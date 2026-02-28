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

  it('calls onToggleFavorite and exposes pressed state for selected currency', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    const onToggleFavorite = jest.fn()

    render(
      <CurrencySelect
        value="USD"
        onChange={onChange}
        currencies={currencies}
        label="From"
        isFavorite
        onToggleFavorite={onToggleFavorite}
      />
    )

    const favoriteButton = screen.getByRole('button', { name: 'Remove USD from favorites' })
    expect(favoriteButton).toHaveAttribute('aria-pressed', 'true')

    await user.click(favoriteButton)

    expect(onToggleFavorite).toHaveBeenCalledTimes(1)
    expect(onToggleFavorite).toHaveBeenCalledWith('USD')
  })

  it('renders favorites first when provided ordered currencies', () => {
    const onChange = jest.fn()
    const orderedCurrencies: Currency[] = [currencies[2], currencies[0], currencies[1]]

    const { container } = render(
      <CurrencySelect
        value="GBP"
        onChange={onChange}
        currencies={orderedCurrencies}
        label="From"
      />
    )

    const options = Array.from(container.querySelectorAll('option')).map((option) => option.textContent)
    expect(options[0]).toBe('GBP - British Pound')
    expect(options[1]).toBe('USD - US Dollar')
    expect(options[2]).toBe('EUR - Euro')
  })
})
