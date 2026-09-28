import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import vue from '@vitejs/plugin-vue'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

/**
 * Separate jsdom logic, Chromium play functions and pure benchmarks; see AGENTS.md for
 * validation commands.
 */

/*
 * Apply coverage thresholds only to the merged unit/browser run; either project alone
 * intentionally covers only part of the library.
 */
const partialRun =
  process.env.VITEST_STORYBOOK === 'true' ||
  process.argv.some((arg) => arg === '--project' || arg.startsWith('--project='))

export default defineConfig({
  test: {
    /* Root-level coverage merges the selected projects; test:coverage selects both test layers. */
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,vue}'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.stories.ts',
        'src/stories/**',
        'src/index.ts',
        'src/components/VIcon/icons.ts',
      ],
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      /* Raise coverage thresholds with improved coverage; do not lower them to hide failures. */
      thresholds: partialRun
        ? undefined
        : {
            statements: 90,
            branches: 88,
            functions: 90,
            lines: 90,
          },
    },
    projects: [
      {
        plugins: [vue()],
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['src/**/*.test.ts'],
          /* Allow compilation headroom when unit workers and Chromium share the coverage run. */
          testTimeout: 20_000,
          setupFiles: ['./vitest.setup.ts'],
          globals: true,
        },
      },
      {
        /* Benchmark pure modules in Node so DOM setup does not distort timings. */
        plugins: [vue()],
        test: {
          name: 'bench',
          environment: 'node',
          include: [],
          benchmark: { include: ['src/**/*.bench.ts'] },
        },
      },
      {
        // Repeat vue() because projects do not inherit root plugins. storybookTest applies
        // preview annotations itself.
        plugins: [vue(), storybookTest({ configDir: '.storybook' })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            /*
             * Emulate each colour scheme so system-theme stories and axe run against the chosen
             * theme. Contrast needs separate light and dark runs.
             */
            provider: playwright({
              contextOptions: {
                colorScheme: process.env.VECTIS_THEME === 'dark' ? 'dark' : 'light',
              },
            }),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
