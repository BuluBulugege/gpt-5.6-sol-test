import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: fileURLToPath(new URL('../../ai-grading-system', import.meta.url)),
    emptyOutDir: true,
    chunkSizeWarningLimit: 800,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/vitest/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 75 },
      include: ['src/domain/**/*.ts', 'src/api/export.ts'],
    },
  },
})
