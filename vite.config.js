import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this from /aswaitlist/, so assets need that prefix.
  // Root-relative in dev/preview so local URLs stay clean.
  base: process.env.GITHUB_PAGES === 'true' ? '/aswaitlist/' : '/',
  plugins: [react()],
})
