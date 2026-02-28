import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_API_URL is the backend URL — set in .env
// During development, Vite proxies /api calls to the backend so the browser
// never hits a CORS preflight (same origin from the browser's perspective).
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      // All /api and /health requests are forwarded to the backend.
      // changeOrigin rewrites the Host header so the backend accepts the request.
      '/api': {
        target: 'http://backend:4000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://backend:4000',
        changeOrigin: true,
      },
    },
  },
})
