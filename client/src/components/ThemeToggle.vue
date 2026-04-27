<template>
  <button
    class="theme-toggle"
    @click="toggle"
    :title="theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')"
    :aria-label="theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')"
  >
    <!-- Sun icon (shown in dark mode → click to go light) -->
    <svg v-if="theme === 'dark'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
    <!-- Moon icon (shown in light mode → click to go dark) -->
    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  </button>
</template>

<script setup>
import { useTheme } from '../composables/useTheme'
import { useI18n } from '../composables/useI18n'

const { theme, toggle } = useTheme()
const { t } = useI18n()
</script>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--fg-muted);
  cursor: pointer;
  transition: all 0.18s ease;
  font-family: inherit;
}

.theme-toggle:hover {
  background: var(--bg-hover);
  color: var(--fg-primary);
  border-color: var(--border-strong);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
