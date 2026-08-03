import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import vue from '@vitejs/plugin-vue'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

/**
 * Two projects, one per test layer (strict split, see CLAUDE.md):
 * - `unit`: component LOGIC in jsdom (`pnpm test`);
 * - `storybook`: the play functions in a real browser, the only layer that covers
 *   browser behaviour (popover, top layer, :user-invalid…) — `pnpm test:stories`,
 *   excluded from the checkpoint because it requires the Playwright binaries
 *   (`pnpm exec playwright install chromium`).
 *
 * Known noise from the `storybook` project: one
 * "[@vue/compiler-core] decodeEntities option is passed" line per template
 * compiled at runtime (the stories declare their templates as strings). Emitted
 * by Vue, relayed by Vite's console forwarding; harmless. Neither `onConsoleLog`
 * (Vitest) nor a literal filter intercepts it, and turning off
 * `server.forwardConsole` would hide ALL browser warnings — noise is preferable
 * to blindness.
 */
export default defineConfig({
  test: {
    projects: [
      {
        plugins: [vue()],
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['src/**/*.test.ts'],
          setupFiles: ['./vitest.setup.ts'],
          // required for @testing-library/vue's automatic cleanup between tests
          globals: true,
        },
      },
      {
        // `vue()` is indispensable here: a Vitest project does not inherit the
        // root's plugins, and storybookTest only brings the Storybook ones —
        // without it, the .vue files imported by the stories fail with "invalid JS
        // syntax" during import analysis.
        // The plugin reuses the Storybook config as-is and applies the preview.ts
        // annotations (theme, direction, locale) itself: no setup file to write here.
        plugins: [vue(), storybookTest({ configDir: '.storybook' })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
