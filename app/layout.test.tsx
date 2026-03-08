import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import RootLayout from './layout'

describe('RootLayout footer', () => {
  it('renders a footer with the copyright notice', () => {
    const { container } = render(
      <RootLayout>
        <div />
      </RootLayout>
    )

    expect(container.querySelector('footer')).toBeInTheDocument()
  })

  it('displays the current year in the copyright notice', () => {
    const { container } = render(
      <RootLayout>
        <div />
      </RootLayout>
    )

    const currentYear = new Date().getFullYear()
    expect(container.querySelector('footer')).toHaveTextContent(
      `© ${currentYear} GoWell Technologies. All rights reserved.`
    )
  })
})
