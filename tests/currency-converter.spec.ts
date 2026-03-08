import { test, expect } from '@playwright/test';

type RatesPayload = {
  success: true;
  date: string;
  base: string;
  source: string;
  rates: Record<string, number>;
};

const defaultRates: RatesPayload = {
  success: true,
  date: '2026-03-05',
  base: 'USD',
  source: 'https://api.frankfurter.app/latest?from=USD',
  rates: {
    USD: 1,
    EUR: 0.9,
    GBP: 0.8,
    JPY: 150,
    CAD: 1.35,
  },
};

test.describe('Currency Converter - Core user journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/rates**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(defaultRates),
      });
    });

    await page.goto('/');
  });

  test('Conversion - updates result and rate when amount and currencies change', async ({ page }) => {
    await test.step('Enter amount and verify initial conversion', async () => {
      await page.getByLabel('Amount').fill('10');

      await expect(page.getByText('1 USD = 0.9000 EUR')).toHaveText('1 USD = 0.9000 EUR');
      await expect(page.getByText('$10.00 = €9.00')).toHaveText('$10.00 = €9.00');
    });

    await test.step('Change source and target currencies and verify recalculation', async () => {
      await page.getByLabel('From').selectOption('EUR');
      await page.getByLabel('To').selectOption('GBP');

      await expect(page.getByText('1 EUR = 0.8889 GBP')).toHaveText('1 EUR = 0.8889 GBP');
      await expect(page.getByText('€10.00 = £8.89')).toHaveText('€10.00 = £8.89');
    });

    await test.step('Swap currencies and verify reverse conversion', async () => {
      await page.getByRole('button', { name: 'Swap currencies' }).click();

      await expect(page.getByLabel('From')).toHaveValue('GBP');
      await expect(page.getByLabel('To')).toHaveValue('EUR');
      await expect(page.getByText('1 GBP = 1.1250 EUR')).toHaveText('1 GBP = 1.1250 EUR');
      await expect(page.getByText('£10.00 = €11.25')).toHaveText('£10.00 = €11.25');
    });
  });

  test('Validation and URL state - shows error for invalid value and persists valid query params', async ({ page }) => {
    await test.step('Validate amount errors for zero value', async () => {
      await page.getByLabel('Amount').fill('0');
      await expect(page.getByText('Amount must be greater than 0')).toHaveText('Amount must be greater than 0');
    });

    await test.step('Set valid conversion values and verify URL query params', async () => {
      await page.getByLabel('Amount').fill('123.45');
      await page.getByLabel('From').selectOption('CAD');
      await page.getByLabel('To').selectOption('JPY');

      await expect(page).toHaveURL(/\?from=CAD&to=JPY&amount=123.45$/);
      await expect(page.getByText('C$123.45 = ¥13,716.67')).toHaveText('C$123.45 = ¥13,716.67');
    });

    await test.step('Reload page and verify query params are restored in form controls', async () => {
      await page.reload();

      await expect(page.getByLabel('Amount')).toHaveValue('123.45');
      await expect(page.getByLabel('From')).toHaveValue('CAD');
      await expect(page.getByLabel('To')).toHaveValue('JPY');
      await expect(page.getByText('C$123.45 = ¥13,716.67')).toHaveText('C$123.45 = ¥13,716.67');
    });
  });

  test('History - keeps the latest 10 conversions and allows clearing history', async ({ page }) => {
    await test.step('Create more than ten conversions', async () => {
      await page.getByLabel('From').selectOption('USD');
      await page.getByLabel('To').selectOption('EUR');

      for (let amount = 1; amount <= 11; amount += 1) {
        await page.getByLabel('Amount').fill(String(amount));
      }
    });

    await test.step('Verify history list is capped at 10 entries', async () => {
      await expect(page.getByRole('heading', { name: 'Conversion History' })).toHaveText('Conversion History');
      await expect(page.getByRole('button', { name: 'Reload' })).toHaveCount(10);

      const historyRows = page.locator('div.bg-gray-50.rounded-md');
      await expect(historyRows.first()).toContainText('$11.00 → €9.90');
      await expect(historyRows.nth(9)).toContainText('$2.00 → €1.80');
    });

    await test.step('Clear history and verify it is removed', async () => {
      await page.getByRole('button', { name: 'Clear History' }).click();
      await expect(page.getByRole('heading', { name: 'Conversion History' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Reload' })).toHaveCount(0);
    });
  });

  test('Rates refresh - refreshes rates and shows success notification', async ({ page }) => {
    await page.unroute('**/api/rates**');

    await page.route('**/api/rates**', async (route) => {
      const requestUrl = route.request().url();
      const isRefreshRequest = requestUrl.includes('refresh=1');

      const payload: RatesPayload = isRefreshRequest
        ? {
            ...defaultRates,
            date: '2026-03-06',
            rates: {
              ...defaultRates.rates,
              EUR: 0.95,
            },
          }
        : defaultRates;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(payload),
      });
    });

    await test.step('Create a conversion before refresh', async () => {
      await page.goto('/');
      await page.getByLabel('Amount').fill('10');

      await expect(page.getByText('1 USD = 0.9000 EUR')).toHaveText('1 USD = 0.9000 EUR');
      await expect(page.getByRole('button', { name: 'Refresh Rates' })).toHaveText('Refresh Rates');
    });

    await test.step('Refresh rates and verify notification and recalculated result', async () => {
      await page.getByRole('button', { name: 'Refresh Rates' }).click();

      await expect(page.getByRole('status')).toContainText('Currency rates are refreshed');
      await expect(page.getByText('1 USD = 0.9500 EUR')).toHaveText('1 USD = 0.9500 EUR');
      await expect(page.getByText('$10.00 = €9.50')).toHaveText('$10.00 = €9.50');
    });
  });
});
