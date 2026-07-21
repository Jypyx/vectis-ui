import type { Decorator, Preview } from '@storybook/vue3-vite'

import '../src/styles/index.css'
import './preview.css'

/*
 * Thème et direction sont appliqués en effets de bord sur <html> plutôt que
 * via l'état d'un wrapper templaté : le renderer vue3 de Storybook ne
 * remonte pas l'arbre quand un global du toolbar change (il ne patche que
 * les args réactifs), un état capturé dans setup() resterait donc figé. Le
 * corps du decorator, lui, est bien ré-exécuté à chaque changement.
 */
const darkMedia = window.matchMedia('(prefers-color-scheme: dark)')

const applySystemTheme = () => {
  document.documentElement.dataset.theme = darkMedia.matches ? 'dark' : 'light'
}

const applyTheme = (theme: string) => {
  darkMedia.removeEventListener('change', applySystemTheme)
  if (theme === 'system') {
    applySystemTheme()
    // Suit les changements de préférence OS tant que le preset System est actif.
    darkMedia.addEventListener('change', applySystemTheme)
  } else {
    document.documentElement.dataset.theme = theme
  }
}

const withTheme: Decorator = (story, context) => {
  applyTheme((context.globals.theme as string | undefined) ?? 'system')
  document.documentElement.dir = (context.globals.direction as string | undefined) ?? 'ltr'
  return {
    components: { story },
    template: '<div class="sb-theme-root"><story /></div>',
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
          { value: 'system', title: 'System' },
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
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
    theme: 'system',
    direction: 'ltr',
  },
  decorators: [withTheme],
}

export default preview
