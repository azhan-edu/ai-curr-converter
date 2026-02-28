import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CurrencyRatesPanel from './CurrencyRatesPanel'

describe('CurrencyRatesPanel', () => {
  it('renders title and fallback last update when value is not available', () => {
    const onRefresh = jest.fn()

    render(
      <CurrencyRatesPanel
        lastUpdated={null}
        showRefreshButton={false}
        isRefreshing={false}
        onRefresh={onRefresh}
        rates={null}
        sourceUrl={null}
        baseCurrency={null}
      />
    )

    expect(screen.getByRole('heading', { name: 'Currency Rates' })).toBeInTheDocument()
    expect(screen.getByText('Last rates update: N/A')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Refresh Rates' })).not.toBeInTheDocument()
  })

  it('renders refresh button when enabled by props', () => {
    const onRefresh = jest.fn()

    render(
      <CurrencyRatesPanel
        lastUpdated="2026-02-28"
        showRefreshButton
        isRefreshing={false}
        onRefresh={onRefresh}
        rates={null}
        sourceUrl={null}
        baseCurrency={null}
      />
    )

    expect(screen.getByRole('button', { name: 'Refresh Rates' })).toBeInTheDocument()
  })

  it('shows refreshing label and disables button while refreshing', () => {
    const onRefresh = jest.fn()

    render(
      <CurrencyRatesPanel
        lastUpdated="2026-02-28"
        showRefreshButton
        isRefreshing
        onRefresh={onRefresh}
        rates={null}
        sourceUrl={null}
        baseCurrency={null}
      />
    )

    const button = screen.getByRole('button', { name: 'Refreshing...' })
    expect(button).toBeDisabled()
  })

  it('calls onRefresh when refresh button is clicked', async () => {
    const user = userEvent.setup()
    const onRefresh = jest.fn()

    render(
      <CurrencyRatesPanel
        lastUpdated="2026-02-28"
        showRefreshButton
        isRefreshing={false}
        onRefresh={onRefresh}
        rates={null}
        sourceUrl={null}
        baseCurrency={null}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Refresh Rates' }))

    expect(onRefresh).toHaveBeenCalledTimes(1)
  })

  it('shows source URL and loaded rates table in collapsible subpanel', async () => {
    const user = userEvent.setup()
    const onRefresh = jest.fn()

    render(
      <CurrencyRatesPanel
        lastUpdated="2026-02-28"
        showRefreshButton={false}
        isRefreshing={false}
        onRefresh={onRefresh}
        sourceUrl="https://api.frankfurter.app/latest?from=USD"
        baseCurrency="USD"
        rates={{
          USD: 1,
          EUR: 0.92,
          GBP: 0.8,
        }}
      />
    )

    await user.click(screen.getByText('Rates Details'))

    expect(screen.getByText('Source URL: https://api.frankfurter.app/latest')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Currency' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Rate (Base USD)' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'USD' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'EUR' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '0.92' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'GBP' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '0.8' })).toBeInTheDocument()
  })
})
