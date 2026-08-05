import type { Decorator, Preview } from '@storybook/vue3-vite'

import { fr } from '../src/i18n/fr'
import { registerMessages, setLocale } from '../src/i18n/state'

import '../src/styles/index.css'
import './preview.css'

/*
 * Theme, direction and locale are applied as side effects rather than through
 * the state of a templated wrapper: Storybook's vue3 renderer does not re-mount
 * the tree when a toolbar global changes (it only patches reactive args), so
 * state captured in setup() would stay frozen. The decorator body, however, is
 * re-run on every change — and the DS locale is a shallowRef, so already-mounted
 * components re-render on setLocale.
 */
const darkMedia = window.matchMedia('(prefers-color-scheme: dark)')

// `en` is the base dictionary; French is opt-in, so the toolbar needs it registered.
registerMessages('fr', fr)

const applySystemTheme = () => {
  document.documentElement.dataset.theme = darkMedia.matches ? 'dark' : 'light'
}

const applyTheme = (theme: string) => {
  darkMedia.removeEventListener('change', applySystemTheme)
  if (theme === 'system') {
    applySystemTheme()
    // Follows OS preference changes for as long as the System preset is active.
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
       * `error` and not the addon's default `todo`, which downgrades every axe violation
       * to a warning — `pnpm test:stories` would stay green through any regression. One
       * run covers ONE theme: the dark pass goes through the emulated colour scheme wired
       * in vitest.config.ts, since the stories' `theme` global resolves to
       * `prefers-color-scheme`.
       */
      test: 'error',
      /*
       * Two decorative overlays axe cannot judge: it derives an element's background
       * from the boxes that CONTAIN its rect, and both of these are painted by a
       * SIBLING they only partly cover — VProgressLinear's clipped copy sits over the
       * fill, the dial's selected numeral over the hand's tip dot. axe reads the track
       * (resp. the panel) underneath and reports ~1.1:1 where the rendering is 6.5:1.
       * Both are aria-hidden duplicates whose colour is derived FROM the overlay they
       * sit on (contrast-color() / --tone-text-fallback), so the contrast is guaranteed
       * by construction, not by this rule.
       */
      context: {
        exclude: ['.v-progress-linear-text[data-on-fill]', '.v-timepicker-number[data-selected]'],
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
