# End-to-end browser tests (R3)

Playwright-driven smoke suite covering the critical user flows we promised
Meridian in the proposal:

- Dashboard / Overview KPIs and Pareto card render
- Pareto / ABC class filter dims non-selected bars
- Pareto metric switcher updates the Y-axis label
- Language switcher (English / Italian / Japanese) translates the navigation
- Italian locale flips currency display to EUR
- Period range filter sends `month=YYYY-MM:YYYY-MM` to `/api/orders`
- Reports page re-fetches when the period range changes (R1 regression)
- Restocking page lists recommendations, KPIs, and budget input
- Generating POs creates real draft records on the backend (R2)

## Prerequisites

The dev servers must be running on the standard ports:

- Frontend (Vite) — http://localhost:3000
- Backend (FastAPI) — http://localhost:8001

The repo's `/start` slash command (or `scripts/start.sh`) brings both up.

## Running

```bash
cd tests/e2e
npm install
npx playwright install chromium
npm test
```

For an interactive run with the browser visible:

```bash
npm run test:headed
```

For Playwright's UI mode (test explorer):

```bash
npm run test:ui
```

After a run, view the HTML report with:

```bash
npm run report
```

## CI integration

```yaml
- name: E2E tests
  working-directory: tests/e2e
  run: |
    npm ci
    npx playwright install --with-deps chromium
    npm test
  env:
    CI: '1'
```

## Configuration

Override the URLs the suite hits:

```bash
E2E_BASE_URL=http://staging-app:3000 \
E2E_BACKEND_URL=http://staging-api:8001 \
npm test
```

## Notes

- The suite is intentionally small and high-signal — Meridian's ask was
  "automated coverage for critical flows so IT can approve future changes."
  A handful of robust tests that catch regressions on the things that matter
  beats a hundred that flake.
- We do **not** mock the backend. The Restocking PO test posts a real record;
  resetting the backend (`/api/purchase-orders` is in-memory) wipes the state
  between local runs.
