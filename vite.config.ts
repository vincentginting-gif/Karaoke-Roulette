import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Spotify erlaubt fuer Loopback-Redirects nur 127.0.0.1 (nicht "localhost").
    host: '127.0.0.1',
    port: 5173,
  },
})
