import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/fundayacucho/',
  build: {
    assetsDir: 'assets', // Asegura que los recursos estén en /assets
    outDir: 'dist',
  }
});