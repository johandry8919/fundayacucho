import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash][extname]'
      }
    }
  },
  server: {
    historyApiFallback: true,
    port: 3000,
    strictPort: true,
    host: true
  },
  publicDir: 'public',
  css: {
    devSourcemap: true
  }
})
