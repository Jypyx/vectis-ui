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
   * Match the library CSS target so dir selectors retain direction semantics rather than being
   * lowered into locale approximations.
   */
  viteFinal: async (config) => {
    config.build = {
      ...config.build,
      cssTarget: ['chrome134', 'edge134', 'safari26', 'firefox147'],
    }
    return config
  },
}

export default config
