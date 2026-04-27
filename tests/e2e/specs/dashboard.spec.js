// @ts-check
const { test, expect } = require('@playwright/test')

test.describe('Dashboard / Overview', () => {
  test('loads with KPIs and Pareto card visible', async ({ page }) => {
    await page.goto('/')

    // Page header
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible()

    // KPI cards — five of them on the Overview
    const kpiCards = page.locator('.kpi-card')
    await expect(kpiCards).toHaveCount(5)

    // KPI delta colour coding — the spans we added in fix #2
    const deltaSpans = page.locator('.kpi-delta')
    await expect(deltaSpans.first()).toBeVisible()

    // Pareto / ABC card landed in fix #3
    await expect(page.locator('.pareto-card')).toBeVisible()
    await expect(page.locator('.pareto-class-card')).toHaveCount(3)
  })

  test('Pareto class filter activates and clears', async ({ page }) => {
    await page.goto('/')
    await page.locator('.pareto-card').waitFor()

    const classA = page.locator('.pareto-class-card.class-a')
    const classB = page.locator('.pareto-class-card.class-b')
    await classA.click()

    // Active state on the clicked card; the blue banner appears
    await expect(classA).toHaveClass(/active/)
    await expect(classB).toHaveClass(/dimmed/)
    await expect(page.locator('.pareto-filter-banner')).toBeVisible()

    // Clicking the same card a second time clears the filter
    await classA.click()
    await expect(page.locator('.pareto-filter-banner')).toHaveCount(0)
    await expect(classA).not.toHaveClass(/active/)
  })

  test('Pareto metric switcher updates Y-axis label', async ({ page }) => {
    await page.goto('/')
    await page.locator('.pareto-card').waitFor()

    const yLabelLeft = page.locator('.pareto-y-label-left')
    const initial = (await yLabelLeft.textContent())?.trim()

    await page.locator('.pareto-metric-select').selectOption('itemCount')
    await expect(yLabelLeft).not.toHaveText(initial || '')
  })
})
