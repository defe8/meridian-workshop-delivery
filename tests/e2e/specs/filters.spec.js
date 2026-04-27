// @ts-check
const { test, expect } = require('@playwright/test')

test.describe('Period range filter (R5)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('app-locale', 'en'))
    await page.reload()
  })

  test('FilterBar shows From and To dropdowns', async ({ page }) => {
    const ranges = page.locator('.range-select')
    await expect(ranges).toHaveCount(2)
  })

  test('selecting a range narrows orders fetched from API', async ({ page }) => {
    // Capture API calls so we can check that month=YYYY-MM:YYYY-MM is sent
    /** @type {string[]} */
    const orderRequestUrls = []
    page.on('request', (req) => {
      if (req.url().includes('/api/orders')) orderRequestUrls.push(req.url())
    })

    const [from, to] = await page.locator('.range-select').all()
    await from.selectOption('2025-03')
    await to.selectOption('2025-05')

    // Wait for the dashboard to issue the new request
    await page.waitForTimeout(500)

    const matched = orderRequestUrls.some((u) => u.includes('month=2025-03%3A2025-05') || u.includes('month=2025-03:2025-05'))
    expect(matched).toBe(true)
  })
})

test.describe('Reports respects global filters (R1 regression)', () => {
  test('reports endpoint receives the period filter', async ({ page }) => {
    /** @type {string[]} */
    const reportRequestUrls = []
    page.on('request', (req) => {
      if (req.url().includes('/api/reports/')) reportRequestUrls.push(req.url())
    })

    await page.goto('/reports')

    // Initial load fires both reports endpoints
    await page.waitForTimeout(800)
    expect(reportRequestUrls.some((u) => u.includes('/api/reports/quarterly'))).toBe(true)
    expect(reportRequestUrls.some((u) => u.includes('/api/reports/monthly-trends'))).toBe(true)

    // Apply a period range — should re-fetch with month param
    const [from, to] = await page.locator('.range-select').all()
    await from.selectOption('2025-04')
    await to.selectOption('2025-06')

    await page.waitForTimeout(800)

    const filteredCalls = reportRequestUrls.filter((u) => u.includes('month=2025-04'))
    expect(filteredCalls.length).toBeGreaterThan(0)
  })
})
