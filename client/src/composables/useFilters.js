import { ref, computed } from 'vue'

// Shared filter state (singleton pattern)
// Period is now a range: periodFrom / periodTo (both 'all' means unbounded)
const periodFrom = ref('all')
const periodTo = ref('all')
const selectedLocation = ref('all')
const selectedCategory = ref('all')
const selectedStatus = ref('all')

// Backwards-compat: a derived single 'selectedPeriod' that returns:
// - 'all' if no range selected
// - the single month if from === to
// - the range string 'YYYY-MM:YYYY-MM' if a multi-month range
const selectedPeriod = computed({
  get() {
    if (periodFrom.value === 'all' && periodTo.value === 'all') return 'all'
    const from = periodFrom.value === 'all' ? periodTo.value : periodFrom.value
    const to = periodTo.value === 'all' ? periodFrom.value : periodTo.value
    if (!from || !to) return 'all'
    if (from === to) return from
    return `${from}:${to}`
  },
  set(val) {
    // Accept legacy single-value writes
    if (!val || val === 'all') {
      periodFrom.value = 'all'
      periodTo.value = 'all'
    } else if (val.includes(':')) {
      const [from, to] = val.split(':', 2)
      periodFrom.value = from
      periodTo.value = to
    } else {
      periodFrom.value = val
      periodTo.value = val
    }
  }
})

export function useFilters() {
  // Check if any filters are active
  const hasActiveFilters = computed(() => {
    return selectedPeriod.value !== 'all' ||
           selectedLocation.value !== 'all' ||
           selectedCategory.value !== 'all' ||
           selectedStatus.value !== 'all'
  })

  // Reset all filters to default
  const resetFilters = () => {
    periodFrom.value = 'all'
    periodTo.value = 'all'
    selectedLocation.value = 'all'
    selectedCategory.value = 'all'
    selectedStatus.value = 'all'
  }

  // Get current filters as an object for API calls
  const getCurrentFilters = () => {
    const filters = {
      warehouse: selectedLocation.value,
      category: selectedCategory.value,
      status: selectedStatus.value
    }

    // Map period to month format for API (single, range, or omitted)
    if (selectedPeriod.value !== 'all') {
      filters.month = selectedPeriod.value
    }

    return filters
  }

  return {
    // State
    periodFrom,
    periodTo,
    selectedPeriod,
    selectedLocation,
    selectedCategory,
    selectedStatus,

    // Computed
    hasActiveFilters,

    // Methods
    resetFilters,
    getCurrentFilters
  }
}
