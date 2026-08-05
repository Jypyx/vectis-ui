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
    /*
     * Coverage is a ROOT option, never a project one: it sits next to `projects` and
     * spans whichever of them the run selected. `pnpm test:coverage` filters neither,
     * so the report merges the jsdom layer and the browser layer — the coverage of
     * what actually ships.
     *
     * `include` is what makes a file NEVER imported by a test show up at 0%: without
     * it only the loaded modules are counted, and the figure flatters. `exclude`
     * carries the two GENERATED artefacts (`pnpm icons`, `pnpm tokens`) and the barrel,
     * which is nothing but re-exports.
     */
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
      /*
       * `lcov` and `json-summary` are what a CI job can read; `text`/`html` are for
       * a human. All four come out of the same run.
       */
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      /*
       * A RATCHET, set just under the measured figures — the point is to catch a
       * drop, not to chase a number. Raise it when the suite genuinely climbs;
       * never lower it to make a red run green.
       */
      thresholds: {
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
          /*
           * Above the 5 s default because `pnpm test:coverage` runs this project
           * ALONGSIDE the browser one: the jsdom workers then share the machine with
           * Chromium and the Vite transforms feeding it, and the first render of a
           * file — the one that compiles it — overran. A ceiling, not a delay: it
           * costs `pnpm test` nothing.
           */
          testTimeout: 20_000,
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
            /*
             * The theme lever of the a11y pass. `initialGlobals.theme` is `system` and
             * the preview decorator resolves that through `prefers-color-scheme`, so
             * emulating the browser's colour scheme replays the WHOLE suite in dark
             * without touching a single story: `VECTIS_THEME=dark pnpm test:stories`.
             * One run covers one theme — axe reads computed colours, so contrast has to
             * be checked in both.
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
