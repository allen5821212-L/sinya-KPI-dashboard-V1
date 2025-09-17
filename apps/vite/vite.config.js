import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use BASE_PATH env to set correct path when deploying to GitHub Pages project sites
// e.g. BASE_PATH=/sinya-kpi  -> assets will resolve under /sinya-kpi/
const base = process.env.BASE_PATH || '/'

export default defineConfig({
  plugins: [react()],
  base,
})
