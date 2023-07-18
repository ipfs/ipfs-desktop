import { defineConfig } from '@playwright/test'

export default defineConfig({
  // Glob patterns or regular expressions to ignore test files.
  headless: false, // electron can't run headless...

  // Glob patterns or regular expressions that match test files.
  testMatch: '**/*.e2e.test.*'
})
