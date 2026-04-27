<template>
  <div class="restocking">
    <div class="page-header">
      <h2>{{ t('restocking.title') }}</h2>
      <p>{{ t('restocking.subtitle') }}</p>
    </div>

    <div
      v-if="submitResult"
      class="result-banner"
      :class="{ 'result-success': submitResult.failed === 0, 'result-mixed': submitResult.failed > 0 && submitResult.ok > 0, 'result-error': submitResult.ok === 0 }"
    >
      <div class="result-banner-text">
        <strong v-if="submitResult.failed === 0">{{ t('restocking.resultAllOk', { count: submitResult.ok }) }}</strong>
        <strong v-else-if="submitResult.ok === 0">{{ t('restocking.resultAllFailed', { count: submitResult.failed }) }}</strong>
        <strong v-else>{{ t('restocking.resultMixed', { ok: submitResult.ok, failed: submitResult.failed }) }}</strong>
        <ul v-if="submitResult.errors.length > 0" class="result-errors">
          <li v-for="(err, i) in submitResult.errors" :key="i">{{ err }}</li>
        </ul>
      </div>
      <button class="btn-secondary result-dismiss" @click="dismissResult">{{ t('restocking.cancel') }}</button>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <!-- Budget + KPIs -->
      <div class="restocking-controls card">
        <div class="budget-input-group">
          <label class="budget-label">{{ t('restocking.budgetLabel') }}</label>
          <div class="budget-field">
            <span class="currency-prefix">{{ currencySymbol }}</span>
            <input
              type="number"
              class="budget-input"
              v-model.number="budgetDisplayed"
              min="0"
              step="100"
              :placeholder="t('restocking.budgetPlaceholder')"
            />
          </div>
          <button class="reset-budget-btn" @click="resetBudget" :title="t('restocking.resetBudget')">↺</button>
        </div>

        <div class="kpi-strip">
          <div class="mini-kpi">
            <div class="mini-kpi-label">{{ t('restocking.recommendedTotal') }}</div>
            <div class="mini-kpi-value">{{ formatCurrency(recommendedCost, currentCurrency) }}</div>
          </div>
          <div class="mini-kpi" :class="{ 'over-budget': overBudget }">
            <div class="mini-kpi-label">{{ t('restocking.budgetUsed') }}</div>
            <div class="mini-kpi-value">{{ formatCurrency(usedCost, currentCurrency) }}</div>
          </div>
          <div class="mini-kpi" :class="{ 'no-remaining': remainingBudget <= 0 }">
            <div class="mini-kpi-label">{{ t('restocking.budgetRemaining') }}</div>
            <div class="mini-kpi-value">{{ formatCurrency(Math.max(0, remainingBudget), currentCurrency) }}</div>
          </div>
          <div class="mini-kpi" :class="{ 'has-deferred': deferredCount > 0 }">
            <div class="mini-kpi-label">{{ t('restocking.deferred') }}</div>
            <div class="mini-kpi-value">{{ deferredCount }}</div>
          </div>
        </div>
      </div>

      <!-- Recommendations Table -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('restocking.recommendationsTitle') }}</h3>
          <div class="header-actions">
            <button class="btn-secondary" @click="selectAllIncluded">{{ t('restocking.selectAll') }}</button>
            <button class="btn-secondary" @click="clearAll">{{ t('restocking.clearSelection') }}</button>
            <button class="btn-primary" :disabled="selectedRows.length === 0" @click="showSummary = true">
              {{ t('restocking.generatePOs') }} ({{ selectedRows.length }})
            </button>
          </div>
        </div>

        <div v-if="recommendations.length === 0" class="empty-row-block">
          {{ t('restocking.empty') }}
        </div>

        <div v-else class="table-container">
          <table class="restocking-table">
            <thead>
              <tr>
                <th class="col-include"><input type="checkbox" :checked="allIncluded" @change="toggleAllIncluded" /></th>
                <th>{{ t('restocking.priority') }}</th>
                <th>{{ t('restocking.sku') }}</th>
                <th>{{ t('restocking.itemName') }}</th>
                <th>{{ t('restocking.warehouse') }}</th>
                <th class="col-num">{{ t('restocking.onHand') }}</th>
                <th class="col-num">{{ t('restocking.reorderPoint') }}</th>
                <th class="col-num">{{ t('restocking.forecast') }}</th>
                <th class="col-num">{{ t('restocking.recommendedQty') }}</th>
                <th class="col-num">{{ t('restocking.unitCost') }}</th>
                <th class="col-num">{{ t('restocking.lineCost') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in recommendations"
                :key="row.sku"
                :class="{
                  'row-deferred': row.deferred,
                  'row-included': row.included && !row.deferred,
                  'row-excluded': !row.included
                }"
              >
                <td class="col-include">
                  <input type="checkbox" v-model="row.included" />
                </td>
                <td>
                  <span :class="['priority-pill', priorityClass(row.priority)]">{{ priorityLabel(row.priority) }}</span>
                </td>
                <td><strong>{{ row.sku }}</strong></td>
                <td>{{ translateProductName(row.name) }}</td>
                <td>{{ translateWarehouse(row.warehouse) }}</td>
                <td class="col-num">{{ row.onHand }}</td>
                <td class="col-num">{{ row.reorderPoint }}</td>
                <td class="col-num">{{ row.forecast }}</td>
                <td class="col-num">
                  <input
                    type="number"
                    class="qty-input"
                    v-model.number="row.quantity"
                    min="0"
                    @input="onQuantityChange"
                  />
                </td>
                <td class="col-num">{{ formatCurrency(row.unitCost, currentCurrency) }}</td>
                <td class="col-num"><strong>{{ formatCurrency(row.quantity * row.unitCost, currentCurrency) }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Summary Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showSummary" class="modal-overlay" @click="showSummary = false">
          <div class="modal-container" @click.stop>
            <div class="modal-header">
              <h3 class="modal-title">{{ t('restocking.summaryTitle') }}</h3>
              <button class="close-button" @click="showSummary = false">×</button>
            </div>
            <div class="modal-body">
              <p class="modal-intro">{{ t('restocking.summaryIntro', { count: selectedRows.length }) }}</p>
              <div class="summary-totals">
                <div><span>{{ t('restocking.summaryTotalCost') }}:</span> <strong>{{ formatCurrency(usedCost, currentCurrency) }}</strong></div>
                <div><span>{{ t('restocking.summaryByWarehouse') }}:</span></div>
                <ul>
                  <li v-for="(value, wh) in costsByWarehouse" :key="wh">
                    {{ translateWarehouse(wh) }} — {{ formatCurrency(value, currentCurrency) }}
                  </li>
                </ul>
              </div>
              <p class="modal-note">{{ t('restocking.summaryNote') }}</p>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" :disabled="submitting" @click="showSummary = false">{{ t('restocking.cancel') }}</button>
              <button class="btn-primary" :disabled="submitting" @click="confirmGeneratePOs">
                {{ submitting ? t('restocking.submitting') : t('restocking.confirmGenerate') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '../api'
import { useI18n } from '../composables/useI18n'
import { useFilters } from '../composables/useFilters'
import { formatCurrency, toUSD, convertAmount } from '../utils/currency'

export default {
  name: 'Restocking',
  setup() {
    const { t, currentCurrency, translateProductName, translateWarehouse } = useI18n()
    const {
      selectedLocation,
      selectedCategory,
      getCurrentFilters
    } = useFilters()

    const loading = ref(true)
    const error = ref(null)
    const inventory = ref([])
    const demand = ref([])
    const showSummary = ref(false)

    // Budget held in USD baseline; we display it converted into the active currency.
    const DEFAULT_BUDGET_USD = 50000
    const budgetUSD = ref(DEFAULT_BUDGET_USD)

    const budgetDisplayed = computed({
      get() {
        const v = convertAmount(budgetUSD.value, currentCurrency.value)
        // Show as integer when JPY, otherwise rounded for cleaner UX
        return Math.round(v)
      },
      set(val) {
        budgetUSD.value = toUSD(Number(val) || 0, currentCurrency.value)
      }
    })

    const currencySymbol = computed(() => {
      if (currentCurrency.value === 'JPY') return '¥'
      if (currentCurrency.value === 'EUR') return '€'
      return '$'
    })

    const resetBudget = () => { budgetUSD.value = DEFAULT_BUDGET_USD }

    const loadData = async () => {
      try {
        loading.value = true
        error.value = null
        const filters = getCurrentFilters()
        const [inv, dem] = await Promise.all([
          api.getInventory(filters),
          api.getDemandForecasts()
        ])
        inventory.value = inv
        demand.value = dem
      } catch (err) {
        console.error('Failed to load restocking data', err)
        error.value = t('restocking.loadError') + ': ' + (err.message || err)
      } finally {
        loading.value = false
      }
    }

    // Build the candidate list, then run greedy budget allocation
    const recommendations = ref([])

    const buildRecommendations = () => {
      // Lookup map for forecast by sku
      const forecastBySku = new Map()
      demand.value.forEach(d => {
        forecastBySku.set(d.item_sku, d.forecasted_demand || 0)
      })

      // Filter inventory by category if active (warehouse already applied via API)
      let items = inventory.value
      if (selectedCategory.value && selectedCategory.value !== 'all') {
        items = items.filter(i => (i.category || '').toLowerCase() === selectedCategory.value.toLowerCase())
      }

      const candidates = items.map(item => {
        const forecast = forecastBySku.get(item.sku) || 0
        const onHand = item.quantity_on_hand || 0
        const reorderPoint = item.reorder_point || 0
        const required = reorderPoint + forecast
        const shortage = Math.max(0, required - onHand)
        const priority = reorderPoint > 0 ? shortage / reorderPoint : (shortage > 0 ? Infinity : 0)
        return {
          sku: item.sku,
          name: item.name,
          category: item.category,
          warehouse: item.warehouse,
          onHand,
          reorderPoint,
          forecast,
          unitCost: item.unit_cost || 0,
          shortage,
          priority,
          quantity: shortage,
          included: shortage > 0,
          deferred: false
        }
      })
      .filter(r => r.shortage > 0)
      .sort((a, b) => b.priority - a.priority)

      // Greedy budget fill
      let runningCost = 0
      candidates.forEach(r => {
        const lineCost = r.quantity * r.unitCost
        if (runningCost + lineCost <= budgetUSD.value) {
          runningCost += lineCost
          r.deferred = false
        } else {
          r.deferred = true
          r.included = false
        }
      })

      recommendations.value = candidates
    }

    // Re-run greedy allocation when operator edits a quantity (preserves their picks)
    const onQuantityChange = () => {
      let runningCost = 0
      recommendations.value.forEach(r => {
        if (!r.included) {
          r.deferred = false
          return
        }
        const lineCost = (r.quantity || 0) * r.unitCost
        if (runningCost + lineCost <= budgetUSD.value) {
          runningCost += lineCost
          r.deferred = false
        } else {
          r.deferred = true
        }
      })
    }

    const recommendedCost = computed(() =>
      recommendations.value.reduce((s, r) => s + (r.quantity || 0) * r.unitCost, 0)
    )

    const usedCost = computed(() =>
      recommendations.value
        .filter(r => r.included && !r.deferred)
        .reduce((s, r) => s + (r.quantity || 0) * r.unitCost, 0)
    )

    const remainingBudget = computed(() => budgetUSD.value - usedCost.value)
    const overBudget = computed(() => usedCost.value > budgetUSD.value)
    const deferredCount = computed(() => recommendations.value.filter(r => r.deferred).length)

    const selectedRows = computed(() => recommendations.value.filter(r => r.included && !r.deferred && r.quantity > 0))

    const allIncluded = computed(() =>
      recommendations.value.length > 0 && recommendations.value.every(r => r.included || r.deferred)
    )

    const toggleAllIncluded = () => {
      const target = !allIncluded.value
      recommendations.value.forEach(r => { if (!r.deferred) r.included = target })
      onQuantityChange()
    }

    const selectAllIncluded = () => {
      recommendations.value.forEach(r => { r.included = true })
      onQuantityChange()
    }

    const clearAll = () => {
      recommendations.value.forEach(r => { r.included = false })
      onQuantityChange()
    }

    const costsByWarehouse = computed(() => {
      const out = {}
      selectedRows.value.forEach(r => {
        out[r.warehouse] = (out[r.warehouse] || 0) + (r.quantity || 0) * r.unitCost
      })
      return out
    })

    const priorityLabel = (score) => {
      if (score >= 1) return t('priority.high')
      if (score >= 0.5) return t('priority.medium')
      return t('priority.low')
    }

    const priorityClass = (score) => {
      if (score >= 1) return 'high'
      if (score >= 0.5) return 'medium'
      return 'low'
    }

    const submitting = ref(false)
    const submitResult = ref(null) // { ok: number, failed: number, errors: string[] }

    const confirmGeneratePOs = async () => {
      const rows = selectedRows.value.slice()
      if (rows.length === 0) return
      submitting.value = true
      submitResult.value = null
      const results = { ok: 0, failed: 0, errors: [] }

      for (const r of rows) {
        try {
          await api.createPurchaseOrder({
            sku: r.sku,
            warehouse: r.warehouse,
            quantity: r.quantity,
            unit_cost: r.unitCost,
            notes: 'Generated from Restocking recommendation'
          })
          results.ok += 1
        } catch (err) {
          results.failed += 1
          results.errors.push(`${r.sku}: ${err?.response?.data?.detail || err.message || 'unknown'}`)
        }
      }

      submitting.value = false
      submitResult.value = results
      showSummary.value = false

      if (results.ok > 0) {
        // Drop successfully-ordered rows from the recommendation list
        const submittedSkus = new Set(rows.filter(() => true).map(r => r.sku))
        recommendations.value = recommendations.value.filter(r => !submittedSkus.has(r.sku))
      }
    }

    const dismissResult = () => { submitResult.value = null }

    // Recompute recommendations when source data, budget, or category filter changes
    watch([inventory, demand, budgetUSD, selectedCategory], () => buildRecommendations(), { deep: false })
    watch([selectedLocation], () => loadData())

    onMounted(loadData)

    return {
      t,
      currentCurrency,
      currencySymbol,
      formatCurrency,
      translateProductName,
      translateWarehouse,
      loading,
      error,
      recommendations,
      recommendedCost,
      usedCost,
      remainingBudget,
      overBudget,
      deferredCount,
      selectedRows,
      allIncluded,
      toggleAllIncluded,
      selectAllIncluded,
      clearAll,
      onQuantityChange,
      budgetDisplayed,
      resetBudget,
      showSummary,
      costsByWarehouse,
      priorityLabel,
      priorityClass,
      confirmGeneratePOs,
      submitting,
      submitResult,
      dismissResult,
      Math
    }
  }
}
</script>

<style scoped>
.restocking { padding: 0; }

.restocking-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.budget-input-group {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 280px;
}

.budget-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--fg-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.budget-field {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
}

.currency-prefix {
  position: absolute;
  left: 0.625rem;
  color: var(--fg-faint);
  font-weight: 600;
  pointer-events: none;
}

.budget-input {
  padding: 0.5rem 0.75rem 0.5rem 1.5rem;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--fg-primary);
  background: var(--bg-surface);
  width: 100%;
  font-family: inherit;
}

.budget-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.reset-budget-btn {
  padding: 0.4rem 0.625rem;
  border: 1px solid var(--border);
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--fg-muted);
  font-family: inherit;
  font-size: 0.95rem;
}

.reset-budget-btn:hover {
  background: var(--bg-hover);
  color: var(--fg-primary);
}

.kpi-strip {
  display: flex;
  gap: 1.25rem;
  flex: 1;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.mini-kpi {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem 0.875rem;
  min-width: 140px;
}

.mini-kpi-label {
  font-size: 0.688rem;
  color: var(--fg-muted);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.mini-kpi-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--fg-primary);
  margin-top: 0.125rem;
}

.mini-kpi {
  background: var(--bg-surface-alt);
  border: 1px solid var(--border);
}

.mini-kpi.over-budget .mini-kpi-value { color: var(--danger); }
.mini-kpi.no-remaining .mini-kpi-value { color: var(--danger); }
.mini-kpi.has-deferred .mini-kpi-value { color: var(--warning); }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-secondary {
  padding: 0.5rem 0.875rem;
  background: var(--bg-hover);
  color: var(--fg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  font-size: 0.813rem;
  font-family: inherit;
}

.btn-secondary:hover { background: var(--border); }

.btn-primary {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  font-size: 0.813rem;
  font-family: inherit;
}

.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: var(--shadow-md); }
.btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

.empty-row-block {
  text-align: center;
  padding: 3rem;
  color: var(--fg-faint);
  font-style: italic;
}

.restocking-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.restocking-table th {
  background: var(--bg-surface-alt);
  padding: 0.625rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: var(--fg-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border);
}

.restocking-table th.col-num { text-align: right; }
.restocking-table th.col-include { width: 40px; text-align: center; }

.restocking-table td {
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--fg-secondary);
}

.restocking-table td.col-num { text-align: right; }
.restocking-table td.col-include { text-align: center; }

.restocking-table tr.row-included { background: var(--success-soft); }
.restocking-table tr.row-deferred { background: var(--warning-soft); }
.restocking-table tr.row-deferred td { color: var(--fg-faint); }
.restocking-table tr.row-excluded td { color: var(--fg-faint); }

.qty-input {
  width: 80px;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-strong);
  border-radius: 4px;
  text-align: right;
  font-family: inherit;
  font-size: 0.875rem;
  background: var(--bg-surface);
  color: var(--fg-primary);
}

.qty-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-soft);
}

.priority-pill {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.688rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.priority-pill.high { background: var(--danger-soft); color: var(--danger); }
.priority-pill.medium { background: var(--warning-soft); color: var(--warning); }
.priority-pill.low { background: var(--accent-soft); color: var(--accent); }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: var(--bg-surface); border-radius: 12px;
  box-shadow: var(--shadow-lg);
  width: 90%; max-width: 560px;
  display: flex; flex-direction: column;
}

.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border);
}

.modal-title { font-size: 1.25rem; font-weight: 700; color: var(--fg-primary); margin: 0; }

.close-button {
  background: none; border: none; font-size: 1.5rem; color: var(--fg-muted);
  cursor: pointer; padding: 0 0.5rem; line-height: 1;
}

.modal-body { padding: 1.5rem; }
.modal-intro { color: var(--fg-secondary); margin-bottom: 1rem; }

.summary-totals {
  background: var(--bg-surface-alt); border: 1px solid var(--border);
  border-radius: var(--radius-sm); padding: 0.875rem 1rem;
  margin-bottom: 1rem;
}

.summary-totals div { margin-bottom: 0.375rem; color: var(--fg-secondary); font-size: 0.875rem; }
.summary-totals strong { color: var(--fg-primary); font-size: 1rem; }
.summary-totals ul { margin: 0.375rem 0 0 1.25rem; color: var(--fg-secondary); font-size: 0.875rem; }

.modal-note {
  font-size: 0.813rem; color: var(--fg-faint); font-style: italic;
}

.modal-footer {
  display: flex; justify-content: flex-end; gap: 0.625rem;
  padding: 1rem 1.5rem; border-top: 1px solid var(--border);
}

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.result-banner {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid transparent;
}

.result-banner.result-success {
  background: var(--success-soft);
  border-color: var(--success);
  color: var(--success);
}

.result-banner.result-mixed {
  background: var(--warning-soft);
  border-color: var(--warning);
  color: var(--warning);
}

.result-banner.result-error {
  background: var(--danger-soft);
  border-color: var(--danger);
  color: var(--danger);
}

.result-banner-text { flex: 1; font-size: 0.875rem; }

.result-errors {
  margin: 0.5rem 0 0 1.25rem;
  font-size: 0.813rem;
}

.result-dismiss { align-self: flex-start; }

.btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
