import {defineConfig, globalIgnores} from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': ['error', {allow: ['warn', 'error', 'info']}],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {argsIgnorePattern: '^_', varsIgnorePattern: '^_'},
      ],
      // next/image adds a client chunk to every route that imports it (ADR-005).
      'no-restricted-imports': [
        'error',
        {paths: [{name: 'next/image', message: 'Use Img from @/components/ui/Img.'}]},
      ],
    },
  },
  {
    // Command-line scripts report to the terminal.
    files: ['scripts/**'],
    rules: {'no-console': 'off'},
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'sanity.types.ts',
    'playwright-report/**',
    'test-results/**',
    '.lighthouseci/**',
  ]),
])
