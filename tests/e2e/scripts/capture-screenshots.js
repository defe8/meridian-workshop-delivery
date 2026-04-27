// One-off Playwright script that captures screenshots of every major view
// in both light and dark themes, saving them under docs/screenshots/.
// Run from tests/e2e/:  node scripts/capture-screenshots.js
const { chromium } = require('@playwright/test')
const path = require('path')
const fs = require('fs')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const OUT_DIR = path.resolve(__dirname, '../../../docs/screenshots')

const VIEWS = [
  { route: '/', file: 'overview' },
  { route: '/inventory', file: 'inventory' },
  { route: '/orders', file: 'orders' },
  { route: '/reports', file: 'reports' },
  { route: '/restocking', file: 'restocking' }
]

async function settle(page) {
  // Wait for the dashboard to render (pareto card or any card)
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {})
  await page.waitForTimeout(800)
}

async function captureTheme(page, theme) {
  await page.evaluate((t) => {
    localStorage.setItem('app-theme', t)
    document.documentElement.setAttribute('data-theme', t)
  }, theme)
}

;(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  })
  const page = await context.newPage()

  for (const theme of ['light', 'dark']) {
    for (const v of VIEWS) {
      const url = BASE_URL + v.route
      console.log(`Capturing ${theme}/${v.file} → ${url}`)
      await page.goto(url)
      await captureTheme(page, theme)
      await page.reload()
      await settle(page)
      const out = path.join(OUT_DIR, `${v.file}-${theme}.png`)
      await page.screenshot({ path: out, fullPage: true })
    }
  }

  await browser.close()
  console.log(`Done — wrote ${VIEWS.length * 2} screenshots to ${OUT_DIR}`)
})().catch((err) => {
  console.error(err)
  process.exit(1)
})
