import { test, expect } from '@playwright/test'

test.describe('Currency conversion flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/rates**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          date: '2026-03-05',
          base: 'USD',
          rates: {
            USD: 1,
            EUR: 0.9,
            GBP: 0.8,
            JPY: 150,
          },
        }),
      })
    })

    await page.goto('/')
  })

  test('Conversion Flow - converts amount and recalculates after currency changes', async ({ page }) => {
    const amountInput = page.getByLabel('Amount', { exact: true })
    const fromCurrencySelect = page.getByLabel('From', { exact: true })
    const toCurrencySelect = page.getByLabel('To', { exact: true })
    const converterHeading = page.getByRole('heading', {
      level: 1,
      name: 'Currency Converter',
    })

    await test.step('Verify page shell and initial URL', async () => {
      await expect(converterHeading).toContainText('Currency Converter')
      await expect(page).toHaveURL(/\/$/)
    })

    await test.step('Enter amount and verify initial conversion', async () => {
      await amountInput.fill('10')

      await expect(amountInput).toHaveValue('10')
      await expect(page.getByText(/\$10\.00\s*=\s*€9\.00/)).toContainText(/\$10\.00\s*=\s*€9\.00/)
      await expect(page.getByText('1 USD = 0.9000 EUR')).toContainText('1 USD = 0.9000 EUR')
    })

    await test.step('Change from and to currencies', async () => {
      await fromCurrencySelect.selectOption('EUR')
      await toCurrencySelect.selectOption('GBP')

      await expect(fromCurrencySelect).toHaveValue('EUR')
      await expect(toCurrencySelect).toHaveValue('GBP')
      await expect(page).toHaveURL(/\?from=EUR&to=GBP&amount=10/)
    })

    await test.step('Verify updated conversion and accessibility structure', async () => {
      await expect(page.getByText(/€10\.00\s*=\s*£8\.89/)).toContainText(/€10\.00\s*=\s*£8\.89/)
      await expect(page.getByText('1 EUR = 0.8889 GBP')).toContainText('1 EUR = 0.8889 GBP')
      await expect(page.getByRole('combobox')).toHaveCount(2)
      await expect(converterHeading).toMatchAriaSnapshot(`
        - heading "Currency Converter" [level=1]
      `)
    })

    await test.step('Verify footer copyright notice', async () => {
      const currentYear = new Date().getFullYear()
      const footer = page.getByRole('contentinfo')
      await expect(footer).toContainText(
        `© ${currentYear} GoWell Technologies. All rights reserved.`
      )
    })
  })
})