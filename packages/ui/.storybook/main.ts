import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    // Runs the play functions in a real browser (Vitest browser mode, the
    // `storybook` project of vitest.config.ts) and surfaces them in the UI.
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  /*
   * TRAP — the same `cssTarget` floor as vite.config.ts, and here it is CORRECTNESS
   * rather than weight. Vite's default target lowers `:dir(rtl)` into an
   * `:is(:lang(ar), :lang(he), …)` approximation, which matches on the document's
   * LANGUAGE where the design system flips its arrows on the DIRECTION: the rule then
   * never applies to an `<html dir="rtl" lang="en">` page, and every mirrored glyph
   * silently stops mirroring. Invisible in `pnpm storybook` and in `pnpm test:stories`,
   * which both serve unminified CSS — it only shows in the built artefact, i.e. on
   * Chromatic, where the two RTL play functions read `scale: none`.
   */
  viteFinal: async (config) => {
    config.build = {
      ...config.build,
      cssTarget: ['chrome125', 'edge125', 'safari26', 'firefox147'],
    }
    return config
  },
}

export default config
