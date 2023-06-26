import { defineConfig } from 'vite'
import { createServer } from 'vite'
import { readFileSync } from 'fs'

export default defineConfig({
  server: {
    port: 5173
  },
  build: {
    rollupOptions: {
      // ...
    }
  },
  optimizeDeps: {
    include: ["mapsindoors"]
  }
})