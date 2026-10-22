import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/helpers/setup-globals.ts', 'tests/helpers/setup-mocks.ts'],
    // Les tests partagent un état en mémoire (rate-limit, fausse base) : exécution séquentielle.
    fileParallelism: false,
    testTimeout: 20000,
    env: {
      NODE_ENV: 'test',
      CSRF_SECRET: 'test-csrf-secret',
      NUXT_PUBLIC_SITE_URL: 'https://boursefi.test',
    },
  },
})
