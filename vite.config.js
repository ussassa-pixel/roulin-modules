import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // roulin.ai/care 경로로 프록시되어 서빙되므로 에셋 경로를 /care/ 기준으로 빌드.
  base: '/care/',
  plugins: [react()],
  server: process.env.PORT ? { port: Number(process.env.PORT), strictPort: true } : undefined,
})
