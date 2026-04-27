// @ts-check
const { test, expect } = require('@playwright/test')

test.describe('Internationalization', () => {
  test.beforeEach(async ({ page }) => {
    // Reset locale via localStorage so each test starts in English
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('app-locale', 'en'))
    await page.reload()
  })

  test('language switcher shows three locales', async ({ page }) => {
    await page.locator('.language-button').click()
    const options = page.locator('.dropdown-item .language-name')
    await expect(options).toHaveCount(3)
    await expect(options.nth(0)).toHaveText('English')
    await expect(options.nth(1)).toHaveText('日本語')
    await expect(options.nth(2)).toHaveText('Italiano')
  })

  test('switching to Italian translates the navigation', async ({ page }) => {
    // Switch to Italian
    await page.locator('.language-button').click()
    await page.getByText('Italiano', { exact: true }).click()

    // Nav tabs should show Italian labels
    await expect(page.getByRole('link', { name: 'Panoramica' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Inventario' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Ordini' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Riordino' })).toBeVisible()
  })

  test('Italian locale switches currency to EUR', async ({ page }) => {
    await page.locator('.language-button').click()
    await page.getByText('Italiano', { exact: true }).click()

    // Inventory Value-by-Category card uses formatted currency in EUR
    await page.locator('.kpi-card').first().waitFor()
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toContain('€')
  })
})
