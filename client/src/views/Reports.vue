<template>
  <div class="reports">
    <div class="page-header">
      <h2>{{ t('reports.title') }}</h2>
      <p>{{ t('reports.subtitle') }}</p>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <!-- Quarterly Performance -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('reports.quarterlyTitle') }}</h3>
        </div>
        <div class="table-container">
          <table class="reports-table">
            <thead>
              <tr>
                <th>{{ t('reports.quarter') }}</th>
                <th>{{ t('reports.totalOrders') }}</th>
                <th>{{ t('reports.totalRevenue') }}</th>
                <th>{{ t('reports.avgOrderValue') }}</th>
                <th>{{ t('reports.fulfillmentRate') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(q, index) in quarterlyData" :key="index">
                <td><strong>{{ q.quarter }}</strong></td>
                <td>{{ q.total_orders }}</td>
                <td>{{ formatCurrency(q.total_revenue, currentCurrency) }}</td>
                <td>{{ formatCurrency(q.avg_order_value, currentCurrency) }}</td>
                <td>
                  <span :class="getFulfillmentClass(q.fulfillment_rate)">
                    {{ q.fulfillment_rate }}%
                  </span>
                </td>
              </tr>
              <tr v-if="quarterlyData.length === 0">
                <td colspan="5" class="empty-row">{{ t('common.noData') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Monthly Trends Chart -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('reports.monthlyTrendTitle') }}</h3>
        </div>
        <div class="chart-container">
          <div v-if="monthlyData.length === 0" class="empty-chart">{{ t('common.noData') }}</div>
          <div v-else class="bar-chart">
            <div v-for="(month, index) in monthlyData" :key="index" class="bar-wrapper">
              <div class="bar-container">
                <div
                  class="bar"
                  :style="{ height: getBarHeight(month.revenue) + 'px' }"
                  :title="formatCurrency(month.revenue, currentCurrency)"
                ></div>
              </div>
              <div class="bar-label">{{ formatMonth(month.month) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Month-over-Month Comparison -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('reports.momTitle') }}</h3>
        </div>
        <div class="table-container">
          <table class="reports-table">
            <thead>
              <tr>
                <th>{{ t('reports.month') }}</th>
                <th>{{ t('reports.orders') }}</th>
                <th>{{ t('reports.revenue') }}</th>
                <th>{{ t('reports.change') }}</th>
                <th>{{ t('reports.growthRate') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(month, index) in monthlyData" :key="index">
                <td><strong>{{ formatMonth(month.month) }}</strong></td>
                <td>{{ month.order_count }}</td>
                <td>{{ formatCurrency(month.revenue, currentCurrency) }}</td>
                <td>
                  <span v-if="index > 0" :class="getChangeClass(month.revenue, monthlyData[index - 1].revenue)">
                    {{ getChangeValue(month.revenue, monthlyData[index - 1].revenue) }}
                  </span>
                  <span v-else>—</span>
                </td>
                <td>
                  <span v-if="index > 0" :class="getChangeClass(month.revenue, monthlyData[index - 1].revenue)">
                    {{ getGrowthRate(month.revenue, monthlyData[index - 1].revenue) }}
                  </span>
                  <span v-else>—</span>
                </td>
              </tr>
              <tr v-if="monthlyData.length === 0">
                <td colspan="5" class="empty-row">{{ t('common.noData') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">{{ t('reports.summaryRevenue') }}</div>
          <div class="stat-value">{{ formatCurrency(totalRevenue, currentCurrency) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('reports.summaryAvgMonthly') }}</div>
          <div class="stat-value">{{ formatCurrency(avgMonthlyRevenue, currentCurrency) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('reports.summaryTotalOrders') }}</div>
          <div class="stat-value">{{ totalOrders }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('reports.summaryBestQuarter') }}</div>
          <div class="stat-value">{{ bestQuarter || '—' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '../api'
import { useI18n } from '../composables/useI18n'
import { useFilters } from '../composables/useFilters'
import { formatCurrency } from '../utils/currency'

export default {
  name: 'Reports',
  setup() {
    const { t, currentCurrency, currentLocale } = useI18n()
    const {
      selectedPeriod,
      selectedLocation,
      selectedCategory,
      selectedStatus,
      getCurrentFilters
    } = useFilters()

    const loading = ref(true)
    const error = ref(null)
    const quarterlyData = ref([])
    const monthlyData = ref([])

    const totalRevenue = computed(() =>
      monthlyData.value.reduce((sum, m) => sum + (m.revenue || 0), 0)
    )

    const avgMonthlyRevenue = computed(() =>
      monthlyData.value.length > 0 ? totalRevenue.value / monthlyData.value.length : 0
    )

    const totalOrders = computed(() =>
      monthlyData.value.reduce((sum, m) => sum + (m.order_count || 0), 0)
    )

    const bestQuarter = computed(() => {
      if (quarterlyData.value.length === 0) return ''
      return quarterlyData.value.reduce((best, q) =>
        (q.total_revenue || 0) > (best.total_revenue || 0) ? q : best,
        quarterlyData.value[0]
      ).quarter
    })

    const maxMonthlyRevenue = computed(() => {
      if (monthlyData.value.length === 0) return 0
      return Math.max(...monthlyData.value.map(m => m.revenue || 0))
    })

    const loadData = async () => {
      try {
        loading.value = true
        error.value = null
        const filters = getCurrentFilters()
        const [quarterly, monthly] = await Promise.all([
          api.getQuarterlyReport(filters),
          api.getMonthlyTrends(filters)
        ])
        quarterlyData.value = quarterly
        monthlyData.value = monthly
      } catch (err) {
        console.error('Failed to load reports', err)
        error.value = t('reports.loadError') + ': ' + (err.message || err)
      } finally {
        loading.value = false
      }
    }

    const formatMonth = (monthStr) => {
      if (!monthStr || typeof monthStr !== 'string') return ''
      const [year, month] = monthStr.split('-')
      const monthIndex = parseInt(month, 10) - 1
      if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return monthStr
      const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
      return `${t('months.' + monthKeys[monthIndex])} ${year}`
    }

    const getBarHeight = (revenue) => {
      const max = maxMonthlyRevenue.value
      if (!max || !revenue) return 0
      return (revenue / max) * 200
    }

    const getFulfillmentClass = (rate) => {
      if (rate >= 90) return 'badge success'
      if (rate >= 75) return 'badge warning'
      return 'badge danger'
    }

    const getChangeValue = (current, previous) => {
      const change = (current || 0) - (previous || 0)
      const sign = change > 0 ? '+' : change < 0 ? '−' : ''
      return sign + formatCurrency(Math.abs(change), currentCurrency.value)
    }

    const getChangeClass = (current, previous) => {
      const change = (current || 0) - (previous || 0)
      if (change > 0) return 'positive-change'
      if (change < 0) return 'negative-change'
      return ''
    }

    const getGrowthRate = (current, previous) => {
      if (!previous) return 'N/A'
      const rate = ((current - previous) / previous) * 100
      const sign = rate > 0 ? '+' : ''
      return `${sign}${rate.toFixed(1)}%`
    }

    // Reload when any global filter changes
    watch(
      [selectedPeriod, selectedLocation, selectedCategory, selectedStatus, currentLocale],
      () => loadData()
    )

    onMounted(loadData)

    return {
      t,
      currentCurrency,
      formatCurrency,
      loading,
      error,
      quarterlyData,
      monthlyData,
      totalRevenue,
      avgMonthlyRevenue,
      totalOrders,
      bestQuarter,
      formatMonth,
      getBarHeight,
      getFulfillmentClass,
      getChangeValue,
      getChangeClass,
      getGrowthRate
    }
  }
}
</script>

<style scoped>
.reports {
  padding: 0;
}

.card {
  background: var(--bg-surface);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
}

.card-header {
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--fg-primary);
  margin: 0;
}

.reports-table {
  width: 100%;
  border-collapse: collapse;
}

.reports-table th {
  background: var(--bg-surface-alt);
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: var(--fg-muted);
  border-bottom: 2px solid var(--border);
}

.reports-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border);
  color: var(--fg-secondary);
}

.reports-table tr:hover {
  background: var(--bg-hover);
}

.empty-row {
  text-align: center;
  color: var(--fg-faint);
  font-style: italic;
}

.empty-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 250px;
  color: var(--fg-faint);
  font-style: italic;
}

.chart-container {
  padding: 2rem 1rem;
  min-height: 300px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 250px;
  gap: 0.5rem;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 80px;
}

.bar-container {
  height: 200px;
  display: flex;
  align-items: flex-end;
  width: 100%;
}

.bar {
  width: 100%;
  background: linear-gradient(to top, #3b82f6, #60a5fa);
  border-radius: 4px 4px 0 0;
  transition: all 0.3s;
  cursor: pointer;
}

.bar:hover {
  background: linear-gradient(to top, #2563eb, #3b82f6);
}

.bar-label {
  margin-top: 1.5rem;
  font-size: 0.75rem;
  color: var(--fg-muted);
  text-align: center;
  transform: rotate(-45deg);
  white-space: nowrap;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.stat-card {
  background: var(--bg-surface);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  border-left: 4px solid var(--accent);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--fg-muted);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--fg-primary);
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge.success {
  background: var(--success-soft);
  color: var(--success);
}

.badge.warning {
  background: var(--warning-soft);
  color: var(--warning);
}

.badge.danger {
  background: var(--danger-soft);
  color: var(--danger);
}

.positive-change {
  color: var(--success);
  font-weight: 600;
}

.negative-change {
  color: var(--danger);
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--fg-muted);
}

.error {
  background: var(--danger-soft);
  color: var(--danger);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}
</style>
