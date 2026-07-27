import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    // Exécute les play functions dans un vrai navigateur (Vitest browser mode,
    // projet `storybook` de vitest.config.ts) et les expose dans l'UI.
    '@storybook/addon-vitest',
    // Panneau Visual Tests : lance Chromatic depuis Storybook (jeton dans
    // chromatic.config.json).
    '@chromatic-com/storybook',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
}

export default config
