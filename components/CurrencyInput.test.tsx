import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CurrencyInput from './CurrencyInput'

describe('CurrencyInput', () => {
  it('links input to inline error with aria attributes', () => {
    const onChange = jest.fn()

    render(
      <CurrencyInput
        value=""
        onChange={onChange}
        error="Amount must be greater than zero"
      />
    )

    const input = screen.getByLabelText('Amount')
    const errorMessage = screen.getByRole('alert')

    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'amount-error')
    expect(errorMessage).toHaveAttribute('id', 'amount-error')
    expect(errorMessage).toHaveTextContent('Amount must be greater than zero')
  })

  it('clears aria error attributes when no error is present', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(<CurrencyInput value="" onChange={onChange} />)

    const input = screen.getByLabelText('Amount')
    expect(input).toHaveAttribute('aria-invalid', 'false')
    expect(input).not.toHaveAttribute('aria-describedby')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await user.type(input, '12')
    expect(onChange).toHaveBeenCalled()
  })
})