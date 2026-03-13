import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    port: 5173,
    // allow Vite to try another port if 5173 is busy
    strictPort: false,
  },
})