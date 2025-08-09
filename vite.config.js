import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/fundayacucho/'  // 👈 Asegúrate que coincida con tu repo
})