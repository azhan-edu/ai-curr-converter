import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ConversionHistory from './ConversionHistory'
import type { ConversionHistory as ConversionHistoryEntry } from '@/types'
import { formatCurrency } from '@/utils/currency'

const historyEntries: ConversionHistoryEntry[] = [
  {
    id: '1',
    from: 'USD',
    to: 'EUR',
    amount: 100,
    result: 92,
    rate: 0.92,
    timestamp: new Date('2026-02-28T10:30:00.000Z'),
  },
  {
    id: '2',
    from: 'GBP',
    to: 'USD',
    amount: 50,
    result: 64,
    rate: 1.28,
    timestamp: new Date('2026-02-28T11:00:00.000Z'),
  },
]

describe('ConversionHistory', () => {
  it('renders nothing when history is empty', () => {
    const onClear = jest.fn()
    const onReload = jest.fn()

    const { container } = render(<ConversionHistory history={[]} onClear={onClear} onReload={onReload} />)

    expect(container.firstChild).toBeNull()
    expect(screen.queryByRole('heading', { name: /conversion history/i })).not.toBeInTheDocument()
  })

  it('renders history entries, rates, and timestamps', () => {
    const onClear = jest.fn()
    const onReload = jest.fn()

    render(<ConversionHistory history={historyEntries} onClear={onClear} onReload={onReload} />)

    expect(screen.getByRole('heading', { name: /conversion history/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /clear history/i })).toBeInTheDocument()

    for (const entry of historyEntries) {
      const formatted = `${formatCurrency(entry.amount, entry.from)} → ${formatCurrency(entry.result, entry.to)}`
      expect(screen.getByText(formatted)).toBeInTheDocument()
      expect(screen.getByText(entry.timestamp.toLocaleString())).toBeInTheDocument()
    }

    expect(screen.getAllByRole('button', { name: /reload/i })).toHaveLength(historyEntries.length)
  })

  it('calls onClear when clear history is clicked', async () => {
    const user = userEvent.setup()
    const onClear = jest.fn()
    const onReload = jest.fn()

    render(<ConversionHistory history={historyEntries} onClear={onClear} onReload={onReload} />)

    await user.click(screen.getByRole('button', { name: /clear history/i }))

    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('calls onReload with the selected history item', async () => {
    const user = userEvent.setup()
    const onClear = jest.fn()
    const onReload = jest.fn()

    render(<ConversionHistory history={historyEntries} onClear={onClear} onReload={onReload} />)

    await user.click(screen.getAllByRole('button', { name: /reload/i })[0])

    expect(onReload).toHaveBeenCalledTimes(1)
    expect(onReload).toHaveBeenCalledWith(historyEntries[0])
  })
})
