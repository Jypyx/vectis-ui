import type { Decorator, Preview } from '@storybook/vue3-vite'

import { fr } from '../src/i18n/fr'
import { registerMessages, setLocale } from '../src/i18n/state'

import '../src/styles/index.css'
import './preview.css'

/*
 * Apply toolbar globals in the decorator body: Storybook reruns it without remounting Vue
 * setup. Reactive library locale state updates mounted components.
 */
const darkMedia = window.matchMedia('(prefers-color-scheme: dark)')

registerMessages('fr', fr)

const applySystemTheme = () => {
  document.documentElement.dataset.theme = darkMedia.matches ? 'dark' : 'light'
}

const applyTheme = (theme: string) => {
  darkMedia.removeEventListener('change', applySystemTheme)
  if (theme === 'system') {
    applySystemTheme()
    darkMedia.addEventListener('change', applySystemTheme)
  } else {
    document.documentElement.dataset.theme = theme
  }
}

const withGlobals: Decorator = (story, context) => {
  applyTheme((context.globals.theme as string | undefined) ?? 'system')
  document.documentElement.dir = (context.globals.direction as string | undefined) ?? 'ltr'
  setLocale((context.globals.locale as string | undefined) ?? 'en-US')
  return {
    components: { story },
    template: '<div class="sb-theme-root"><story /></div>',
  }
}

const preview: Preview = {
  parameters: {
    a11y: {
      /*
       * `error` and not the addon's default `todo`, which downgrades every axe violation to a
       * warning; `pnpm test:stories` would stay green through any regression. One run covers
       * ONE theme: the dark pass goes through the emulated colour scheme wired in
       * vitest.config.ts, since the stories' `theme` global resolves to `prefers-color-scheme`.
       */
      test: 'error',
      /*
       * axe cannot resolve these aria-hidden overlays' sibling backgrounds. Their foregrounds
       * derive from the fill or hand they overlap, rather than the track or panel axe measures.
       */
      context: {
        exclude: ['.v-progress-linear-text[data-on-fill]', '.v-time-picker-number[data-selected]'],
      },
      /*
       * Dispose timers and queue state between Storybook navigations; the preview process
       * retains module-level state.
       */
      options: {
        resultTypes: ['violations'],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Design system theme',
      toolbar: {
        title: 'Theme',
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
      description: 'Text direction',
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
    locale: {
      description: 'Design system locale',
      toolbar: {
        title: 'Locale',
        icon: 'globe',
        items: [
          { value: 'en-US', title: 'English' },
          { value: 'fr-FR', title: 'Français' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'system',
    direction: 'ltr',
    locale: 'en-US',
  },
  decorators: [withGlobals],
}

export default preview
