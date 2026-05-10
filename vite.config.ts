import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:8081', changeOrigin: true },
      '/users': { target: 'http://localhost:8081', changeOrigin: true },
      '/admin': { target: 'http://localhost:8081', changeOrigin: true },
      '/internal': { target: 'http://localhost:8081', changeOrigin: true },
      '/notifications': { target: 'http://localhost:8081', changeOrigin: true },
    },
  },
})
