import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Listen on all interfaces so the dev server is reachable from outside the
    // container (Docker maps the host port to the container's port).
    host: '0.0.0.0',
    port: 5173,
    // Allow the dev server to be reached through ANY hostname (e.g. a reverse
    // proxy / custom domain like rnd.amdadulbari.com). By default Vite only
    // accepts localhost and blocks other Host headers with a
    // "This host is not allowed" error. `true` disables that check entirely.
    allowedHosts: true,
    // Poll the filesystem for changes. Inside a container, native file-system
    // events from a bind-mounted host directory are often NOT delivered, so
    // Hot Module Replacement (HMR) would silently stop working. Polling trades
    // a little CPU for reliable live-reload while teaching.
    watch: {
      usePolling: true,
    },
  },
})
