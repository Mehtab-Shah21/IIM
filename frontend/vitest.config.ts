import {fileURLToPath} from 'node:url'

import {defineConfig} from 'vitest/config'

export default defineConfig({
  resolve: {alias: {'@': fileURLToPath(new URL('./', import.meta.url))}},
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    env: {NEXT_PUBLIC_SITE_URL: 'https://www.iimtechnicalservices.com', SITE_ENV: 'test'},
  },
})
