import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['tailwindcss']
  },
  server: {
    port: 3000, // Use a different port for Vite's dev server
    strictPort: true, // Prevents Vite from switching to a different port if 3000 is in use
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Your backend server URL
        changeOrigin: true,
        secure: false, // Set to true if you're using HTTPS for your backend
      },
    },
  }
})

