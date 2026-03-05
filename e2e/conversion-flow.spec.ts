import { expect, test } from '@playwright/test'

test.describe('Currency conversion flow', () => {
  test('converts entered amount and updates result when currencies change', async ({ page }) => {
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

    await page.getByLabel('Amount').fill('10')

    await expect(page.getByText('1 USD = 0.9000 EUR')).toBeVisible()
    await expect(page.getByText(/\$10\.00\s*=\s*€9\.00/)).toBeVisible()

    await page.locator('#currency-from').selectOption('EUR')
    await page.locator('#currency-to').selectOption('GBP')

    await expect(page.getByText('1 EUR = 0.8889 GBP')).toBeVisible()
    await expect(page.getByText(/€10\.00\s*=\s*£8\.89/)).toBeVisible()
  })
})