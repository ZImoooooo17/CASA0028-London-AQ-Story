import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/CASA0028-London-AQ-Story/',
  plugins: [react(), tailwindcss()],
})
