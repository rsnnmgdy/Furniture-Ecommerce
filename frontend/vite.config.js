import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // This proxies any request starting with /api
      // to your backend server on port 5000.
      '/api': {
        target: 'http://localhost:5000', // Your backend's port
        changeOrigin: true,
      },
    }
  }
})