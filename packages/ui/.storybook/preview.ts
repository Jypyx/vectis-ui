import type { Decorator, Preview } from '@storybook/vue3-vite'

import '../src/styles/index.css'
import './preview.css'

/**
 * Preset « custom » du toolbar : injection de surcharges de tokens à la volée
 * sur un sous-arbre DOM, sans rebuild — préfiguration de l'app de theming.
 */
const CUSTOM_THEME_OVERRIDES: Record<string, string> = {
  '--ds-color-accent': 'oklch(58% 0.2 25)',
  '--ds-color-accent-hover': 'oklch(51% 0.19 25)',
  '--ds-color-accent-active': 'oklch(45% 0.17 25)',
  '--ds-color-accent-surface': 'oklch(96.5% 0.02 25)',
  '--ds-color-accent-border': 'oklch(88% 0.06 25)',
  '--ds-color-accent-text': 'oklch(51% 0.19 25)',
  '--ds-focus-ring-color': 'oklch(58% 0.2 25)',
  '--ds-radius-interactive': '9999px',
  '--ds-radius-surface': '1rem',
}

const withTheme: Decorator = (story, context) => {
  const theme = (context.globals.theme as string | undefined) ?? 'light'
  const direction = (context.globals.direction as string | undefined) ?? 'ltr'
  const dataTheme = theme === 'dark' ? 'dark' : 'light'
  const styleVars = theme === 'custom' ? CUSTOM_THEME_OVERRIDES : {}
  return {
    components: { story },
    setup: () => ({ dataTheme, styleVars, direction }),
    template: `
      <div class="sb-theme-root" :data-theme="dataTheme" :dir="direction" :style="styleVars">
        <story />
      </div>
    `,
  }
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Thème du design system',
      toolbar: {
        title: 'Thème',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'custom', title: 'Custom (tokens injectés)' },
        ],
        dynamicTitle: true,
      },
    },
    direction: {
      description: 'Direction du texte',
      toolbar: {
        title: 'Direction',
        icon: 'transfer',
        items: [
          { value: 'ltr', title: 'LTR' },
          { value: 'rtl', title: 'RTL' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
    direction: 'ltr',
  },
  decorators: [withTheme],
}

export default preview
