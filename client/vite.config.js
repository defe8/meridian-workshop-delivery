import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// In production we serve from a GitHub Pages subpath. Override via
// VITE_BASE_PATH if you fork this repo under a different name.
const base = process.env.VITE_BASE_PATH || '/meridian-workshop-delivery/'

export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  base: mode === 'production' ? base : '/',
  server: {
    port: 3000
  }
}))
