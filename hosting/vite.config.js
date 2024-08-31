import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['tailwindcss']
  },
  server: {
    port: 5000, // Set a fixed port

    strictPort: true // Prevents Vite from switching to a different port if 5000 is in use
  }
})
