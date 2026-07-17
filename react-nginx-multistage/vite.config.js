import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // `vite build` writes the optimised, minified static site here. The
  // multi-stage Dockerfile copies this folder into the nginx image.
  build: {
    outDir: 'dist',
  },
})
