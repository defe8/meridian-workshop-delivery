import axios from 'axios'

// Demo mode: when VITE_DEMO=1 (e.g. the GitHub Pages build) the SPA has no
// backend. We fetch the seed JSON from /data/*.json and filter client-side,
// so reads behave exactly like the live API. Writes resolve as no-ops with a
// short delay so the UI flow still feels real.
const DEMO_MODE = import.meta.env.VITE_DEMO === '1'

const API_BASE_URL = 'http://localhost:8001/api'
// import.meta.env.BASE_URL respects the configured Vite base path
// ("/meridian-workshop-delivery/" on Pages, "/" in dev)
const DATA_BASE = `${import.meta.env.BASE_URL || '/'}data/`

// ─── Demo helpers ────────────────────────────────────────────
const cache = new Map()
async function loadJson(name) {
  if (cache.has(name)) return cache.get(name)
  const res = await fetch(`${DATA_BASE}${name}.json`)
  if (!res.ok) throw new Error(`Failed to load /data/${name}.json (HTTP ${res.status})`)
  const data = await res.json()
  cache.set(name, data)
  return data
}

const QUARTER_MAP = {
  'Q1-2025': ['2025-01', '2025-02', '2025-03'],
  'Q2-2025': ['2025-04', '2025-05', '2025-06'],
  'Q3-2025': ['2025-07', '2025-08', '2025-09'],
  'Q4-2025': ['2025-10', '2025-11', '2025-12']
}

function monthsInRange(from, to) {
  if (!from || !to) return []
  const [fy, fm] = from.split('-').map(Number)
  const [ty, tm] = to.split('-').map(Number)
  let [y, m, ey, em] = [fy, fm, ty, tm]
  if (y > ey || (y === ey && m > em)) [y, m, ey, em] = [ty, tm, fy, fm]
  const out = []
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${String(m).padStart(2, '0')}`)
    m += 1
    if (m > 12) { m = 1; y += 1 }
  }
  return out
}

function filterByMonth(items, month) {
  if (!month || month === 'all') return items
  if (month.includes(':')) {
    const [from, to] = month.split(':', 2)
    const months = monthsInRange(from, to)
    return items.filter(it => months.some(m => (it.order_date || '').includes(m)))
  }
  if (month.startsWith('Q')) {
    const months = QUARTER_MAP[month] || []
    return items.filter(it => months.some(m => (it.order_date || '').includes(m)))
  }
  return items.filter(it => (it.order_date || '').includes(month))
}

function applyFilters(items, { warehouse, category, status } = {}) {
  let out = items
  if (warehouse && warehouse !== 'all') out = out.filter(it => it.warehouse === warehouse)
  if (category && category !== 'all') out = out.filter(it => (it.category || '').toLowerCase() === category.toLowerCase())
  if (status && status !== 'all') out = out.filter(it => (it.status || '').toLowerCase() === status.toLowerCase())
  return out
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// In-memory mutations for demo mode (reset on page reload)
const demoTasks = []
const demoPOs = []
let demoIdCounter = 0
const nextId = (prefix) => `${prefix}-${(++demoIdCounter).toString().padStart(4, '0')}`

// ─── Demo API ────────────────────────────────────────────────
const demoApi = {
  isDemo: true,

  async getInventory(filters = {}) {
    const items = await loadJson('inventory')
    return applyFilters(items, filters)
  },
  async getInventoryItem(id) {
    const items = await loadJson('inventory')
    const item = items.find(i => i.id === id)
    if (!item) throw new Error(`Inventory item ${id} not found`)
    return item
  },
  async getOrders(filters = {}) {
    const items = await loadJson('orders')
    return applyFilters(filterByMonth(items, filters.month), filters)
  },
  async getOrder(id) {
    const items = await loadJson('orders')
    const order = items.find(o => o.id === id || o.order_number === id)
    if (!order) throw new Error(`Order ${id} not found`)
    return order
  },
  async getDemandForecasts() {
    return loadJson('demand_forecasts')
  },
  async getBacklog() {
    const list = await loadJson('backlog_items')
    return list.map(b => ({ ...b, has_purchase_order: demoPOs.some(po => po.backlog_item_id === b.id) }))
  },
  async getDashboardSummary(filters = {}) {
    const [inventory, orders] = await Promise.all([loadJson('inventory'), loadJson('orders')])
    const filteredInventory = applyFilters(inventory, { warehouse: filters.warehouse, category: filters.category })
    const filteredOrders = applyFilters(filterByMonth(orders, filters.month), filters)
    const total_inventory_value = filteredInventory.reduce((s, i) => s + (i.quantity_on_hand || 0) * (i.unit_cost || 0), 0)
    const low_stock_items = filteredInventory.filter(i => (i.quantity_on_hand || 0) <= (i.reorder_point || 0)).length
    const pending_orders = filteredOrders.filter(o => ['Processing', 'Backordered'].includes(o.status)).length
    const backlog_items = await loadJson('backlog_items')
    return {
      total_inventory_value: Math.round(total_inventory_value * 100) / 100,
      low_stock_items,
      pending_orders,
      total_backlog_items: backlog_items.length,
      total_orders_value: filteredOrders.reduce((s, o) => s + (o.total_value || 0), 0)
    }
  },
  async getSpendingSummary() {
    return (await loadJson('spending')).spending_summary
  },
  async getMonthlySpending() {
    return (await loadJson('spending')).monthly_spending
  },
  async getCategorySpending() {
    return (await loadJson('spending')).category_spending
  },
  async getTransactions() {
    return loadJson('transactions')
  },
  async getTasks() {
    return [...demoTasks].reverse()
  },
  async createTask(taskData) {
    await sleep(120)
    const t = {
      id: nextId('T'),
      title: taskData.title,
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || null,
      status: 'pending',
      created_at: new Date().toISOString()
    }
    demoTasks.push(t)
    return t
  },
  async deleteTask(taskId) {
    const idx = demoTasks.findIndex(t => t.id === taskId)
    if (idx >= 0) demoTasks.splice(idx, 1)
    return { deleted: taskId }
  },
  async toggleTask(taskId) {
    const t = demoTasks.find(x => x.id === taskId)
    if (!t) throw new Error('Task not found')
    t.status = t.status === 'completed' ? 'pending' : 'completed'
    return t
  },
  async getQuarterlyReport(filters = {}) {
    const orders = filterByMonth(applyFilters(await loadJson('orders'), filters), filters.month)
    const groups = {}
    for (const o of orders) {
      const d = o.order_date || ''
      let q = null
      if (['2025-01','2025-02','2025-03'].some(m => d.includes(m))) q = 'Q1-2025'
      else if (['2025-04','2025-05','2025-06'].some(m => d.includes(m))) q = 'Q2-2025'
      else if (['2025-07','2025-08','2025-09'].some(m => d.includes(m))) q = 'Q3-2025'
      else if (['2025-10','2025-11','2025-12'].some(m => d.includes(m))) q = 'Q4-2025'
      else continue
      if (!groups[q]) groups[q] = { quarter: q, total_orders: 0, total_revenue: 0, delivered_orders: 0, avg_order_value: 0 }
      groups[q].total_orders += 1
      groups[q].total_revenue += o.total_value || 0
      if (o.status === 'Delivered') groups[q].delivered_orders += 1
    }
    return Object.values(groups).map(d => ({
      ...d,
      avg_order_value: d.total_orders ? Math.round((d.total_revenue / d.total_orders) * 100) / 100 : 0,
      fulfillment_rate: d.total_orders ? Math.round((d.delivered_orders / d.total_orders) * 1000) / 10 : 0
    })).sort((a, b) => a.quarter.localeCompare(b.quarter))
  },
  async getMonthlyTrends(filters = {}) {
    const orders = filterByMonth(applyFilters(await loadJson('orders'), filters), filters.month)
    const months = {}
    for (const o of orders) {
      const m = (o.order_date || '').slice(0, 7)
      if (!m) continue
      if (!months[m]) months[m] = { month: m, order_count: 0, revenue: 0, delivered_count: 0 }
      months[m].order_count += 1
      months[m].revenue += o.total_value || 0
      if (o.status === 'Delivered') months[m].delivered_count += 1
    }
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month))
  },
  async createPurchaseOrder(req) {
    await sleep(120)
    const inventory = await loadJson('inventory')
    let sku = req.sku
    let item_name = ''
    if (req.backlog_item_id) {
      const backlog = await loadJson('backlog_items')
      const bl = backlog.find(b => b.id === req.backlog_item_id)
      if (bl) { sku = bl.item_sku; item_name = bl.item_name }
    } else if (sku) {
      const inv = inventory.find(i => i.sku === sku)
      if (inv) item_name = inv.name
    } else {
      throw new Error('Either backlog_item_id or sku must be provided')
    }
    const today = new Date()
    const eta = new Date(today.getTime() + 14 * 86400000)
    const po = {
      id: nextId('PO'),
      backlog_item_id: req.backlog_item_id || '',
      sku,
      item_name,
      warehouse: req.warehouse || '',
      supplier_name: req.supplier_name || 'TBD — Awaiting Procurement',
      quantity: req.quantity,
      unit_cost: req.unit_cost,
      expected_delivery_date: eta.toISOString().slice(0, 10),
      status: 'Draft',
      created_date: today.toISOString().slice(0, 10),
      notes: req.notes || null
    }
    demoPOs.push(po)
    return po
  },
  async getPurchaseOrderByBacklogItem(backlogItemId) {
    const po = demoPOs.find(p => p.backlog_item_id === backlogItemId)
    if (!po) throw new Error('Not found')
    return po
  }
}

// ─── Real API ────────────────────────────────────────────────
const realApi = {
  isDemo: false,

  async getInventory(filters = {}) {
    const params = new URLSearchParams()
    if (filters.warehouse && filters.warehouse !== 'all') params.append('warehouse', filters.warehouse)
    if (filters.category && filters.category !== 'all') params.append('category', filters.category)
    const response = await axios.get(`${API_BASE_URL}/inventory?${params.toString()}`)
    return response.data
  },

  async getInventoryItem(id) {
    const response = await axios.get(`${API_BASE_URL}/inventory/${id}`)
    return response.data
  },

  async getOrders(filters = {}) {
    const params = new URLSearchParams()
    if (filters.warehouse && filters.warehouse !== 'all') params.append('warehouse', filters.warehouse)
    if (filters.category && filters.category !== 'all') params.append('category', filters.category)
    if (filters.status && filters.status !== 'all') params.append('status', filters.status)
    if (filters.month && filters.month !== 'all') params.append('month', filters.month)
    const response = await axios.get(`${API_BASE_URL}/orders?${params.toString()}`)
    return response.data
  },

  async getOrder(id) {
    const response = await axios.get(`${API_BASE_URL}/orders/${id}`)
    return response.data
  },

  async getDemandForecasts() {
    const response = await axios.get(`${API_BASE_URL}/demand`)
    return response.data
  },

  async getBacklog() {
    const response = await axios.get(`${API_BASE_URL}/backlog`)
    return response.data
  },

  async getDashboardSummary(filters = {}) {
    const params = new URLSearchParams()
    if (filters.warehouse && filters.warehouse !== 'all') params.append('warehouse', filters.warehouse)
    if (filters.category && filters.category !== 'all') params.append('category', filters.category)
    if (filters.status && filters.status !== 'all') params.append('status', filters.status)
    if (filters.month && filters.month !== 'all') params.append('month', filters.month)
    const response = await axios.get(`${API_BASE_URL}/dashboard/summary?${params.toString()}`)
    return response.data
  },

  async getSpendingSummary() {
    const response = await axios.get(`${API_BASE_URL}/spending/summary`)
    return response.data
  },

  async getMonthlySpending() {
    const response = await axios.get(`${API_BASE_URL}/spending/monthly`)
    return response.data
  },

  async getCategorySpending() {
    const response = await axios.get(`${API_BASE_URL}/spending/categories`)
    return response.data
  },

  async getTransactions() {
    const response = await axios.get(`${API_BASE_URL}/spending/transactions`)
    return response.data
  },

  async getTasks() {
    const response = await axios.get(`${API_BASE_URL}/tasks`)
    return response.data
  },

  async createTask(taskData) {
    const response = await axios.post(`${API_BASE_URL}/tasks`, taskData)
    return response.data
  },

  async deleteTask(taskId) {
    const response = await axios.delete(`${API_BASE_URL}/tasks/${taskId}`)
    return response.data
  },

  async toggleTask(taskId) {
    const response = await axios.patch(`${API_BASE_URL}/tasks/${taskId}`)
    return response.data
  },

  async createPurchaseOrder(purchaseOrderData) {
    const response = await axios.post(`${API_BASE_URL}/purchase-orders`, purchaseOrderData)
    return response.data
  },

  async getPurchaseOrderByBacklogItem(backlogItemId) {
    const response = await axios.get(`${API_BASE_URL}/purchase-orders/${backlogItemId}`)
    return response.data
  },

  async getQuarterlyReport(filters = {}) {
    const params = new URLSearchParams()
    if (filters.warehouse && filters.warehouse !== 'all') params.append('warehouse', filters.warehouse)
    if (filters.category && filters.category !== 'all') params.append('category', filters.category)
    if (filters.status && filters.status !== 'all') params.append('status', filters.status)
    if (filters.month && filters.month !== 'all') params.append('month', filters.month)
    const response = await axios.get(`${API_BASE_URL}/reports/quarterly?${params.toString()}`)
    return response.data
  },

  async getMonthlyTrends(filters = {}) {
    const params = new URLSearchParams()
    if (filters.warehouse && filters.warehouse !== 'all') params.append('warehouse', filters.warehouse)
    if (filters.category && filters.category !== 'all') params.append('category', filters.category)
    if (filters.status && filters.status !== 'all') params.append('status', filters.status)
    if (filters.month && filters.month !== 'all') params.append('month', filters.month)
    const response = await axios.get(`${API_BASE_URL}/reports/monthly-trends?${params.toString()}`)
    return response.data
  }
}

export const api = DEMO_MODE ? demoApi : realApi
export const isDemoMode = DEMO_MODE
