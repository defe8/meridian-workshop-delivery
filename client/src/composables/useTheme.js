import { ref, watchEffect } from 'vue'

const STORAGE_KEY = 'app-theme'

const initial = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  } catch (_) { /* SSR or restricted env */ }
  return 'light'
})()

const theme = ref(initial)

// Sync to <html data-theme="..."> and localStorage on every change
watchEffect(() => {
  try {
    document.documentElement.setAttribute('data-theme', theme.value)
    localStorage.setItem(STORAGE_KEY, theme.value)
  } catch (_) { /* ignore */ }
})

export function useTheme() {
  const toggle = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  const setTheme = (next) => {
    if (next === 'light' || next === 'dark') theme.value = next
  }

  return { theme, toggle, setTheme }
}
