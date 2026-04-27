// Currency conversion utility (approximate rates from USD)
const USD_TO_JPY = 150
const USD_TO_EUR = 0.92

export function formatCurrency(amount, currency = 'USD') {
  const safe = Number(amount) || 0
  if (currency === 'JPY') {
    return `¥${Math.round(safe * USD_TO_JPY).toLocaleString('ja-JP')}`
  }
  if (currency === 'EUR') {
    return `€${(safe * USD_TO_EUR).toLocaleString('it-IT', { maximumFractionDigits: 0 })}`
  }
  return `$${safe.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export function formatCurrencyWithDecimals(amount, currency = 'USD', decimals = 0) {
  const safe = Number(amount) || 0
  if (currency === 'JPY') {
    return `¥${Math.round(safe * USD_TO_JPY).toLocaleString('ja-JP')}`
  }
  if (currency === 'EUR') {
    return `€${(safe * USD_TO_EUR).toLocaleString('it-IT', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
  }
  return `$${safe.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

export function convertAmount(amount, currency = 'USD') {
  const safe = Number(amount) || 0
  if (currency === 'JPY') return Math.round(safe * USD_TO_JPY)
  if (currency === 'EUR') return safe * USD_TO_EUR
  return safe
}

// Inverse: convert a user-entered budget (in the displayed currency) back to USD baseline
export function toUSD(amount, currency = 'USD') {
  const safe = Number(amount) || 0
  if (currency === 'JPY') return safe / USD_TO_JPY
  if (currency === 'EUR') return safe / USD_TO_EUR
  return safe
}
