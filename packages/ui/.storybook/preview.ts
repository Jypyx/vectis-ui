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
        exclude: ['.v-progress-linear-text[data-on-fill]', '.v-time-picker-number[data-selected]'],
      },
      /*
       * axe is asked for VIOLATIONS ALONE, and that is a MEMORY decision rather than a
       * reporting one — deleting these three lines makes `pnpm storybook` die, not the
       * suite go quiet. The Vitest addon attaches the whole axe result to every story's
       * test report and keeps the accumulated reports in the DEV SERVER's state (that is
       * what feeds the Accessibility panel), pushing them to the manager as the run goes:
       * measured at ~20 MB of heap per test, which crosses Node's ~4 GB limit around test
       * 155 of 458 and kills `storybook dev` with "FATAL ERROR: Reached heap limit".
       * Trimmed, the same run holds at ~400 MB. The weight is in `passes`, which nobody
       * reads: VDatePicker/Default alone returns 839 passing nodes, 423 kB of JSON against
       * 42 kB here. `violations` are returned IN FULL whatever this is set to (verified
       * rule by rule), so nothing that fails today can pass; what the panel loses is the
       * node list of the rules that PASSED, of which axe keeps one per rule. The CLI
       * (`pnpm test:stories`) never had the problem — it has no store to accumulate into.
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
