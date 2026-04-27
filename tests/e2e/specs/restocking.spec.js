// @ts-check
const { test, expect, request } = require('@playwright/test')

const BACKEND_URL = process.env.E2E_BACKEND_URL || 'http://localhost:8001'

test.describe('Restocking → real PO creation (R2)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('app-locale', 'en'))
  })

  test('Restocking page lists recommendations and shows budget KPIs', async ({ page }) => {
    await page.goto('/restocking')

    // Either the recommendations table OR the empty-state message — both are valid
    const hasTable = await page.locator('.restocking-table').count()
    const hasEmpty = await page.locator('.empty-row-block').count()
    expect(hasTable + hasEmpty).toBeGreaterThan(0)

    // The four KPIs should render
    await expect(page.locator('.mini-kpi')).toHaveCount(4)

    // Budget input is editable
    const budget = page.locator('.budget-input')
    await expect(budget).toBeVisible()
    await budget.fill('1000')
    // After dropping budget some rows go deferred — at least one row should exist
    if ((await page.locator('.restocking-table').count()) > 0) {
      await expect(page.locator('tr.row-deferred').first()).toBeVisible({ timeout: 5_000 })
    }
  })

  test('generating POs creates draft records on the backend', async ({ page }) => {
    const apiCtx = await request.newContext()

    // Snapshot count before
    const beforeRes = await apiCtx.get(`${BACKEND_URL}/api/purchase-orders`)
    const before = (await beforeRes.json()).length

    await page.goto('/restocking')
    const tableExists = await page.locator('.restocking-table').count()
    test.skip(!tableExists, 'No recommendations available — cannot exercise PO creation flow')

    // Set a generous budget so nothing gets deferred
    await page.locator('.budget-input').fill('500000')

    // Open the confirmation modal
    await page.getByRole('button', { name: /Generate POs/i }).click()
    await expect(page.locator('.modal-container')).toBeVisible()

    // Confirm
    await page.getByRole('button', { name: /^Generate$/ }).click()

    // Result banner appears (success or mixed)
    await expect(page.locator('.result-banner')).toBeVisible({ timeout: 10_000 })

    // Backend should now have at least one new PO
    const afterRes = await apiCtx.get(`${BACKEND_URL}/api/purchase-orders`)
    const after = (await afterRes.json()).length
    expect(after).toBeGreaterThan(before)

    await apiCtx.dispose()
  })
})
