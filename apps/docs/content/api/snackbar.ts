/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VSnackbar',
      props: [
        { name: 'placement', type: 'SnackbarPlacement', default: "'bottom-center'" },
        { name: 'duration', type: 'number', default: '4000' },
        { name: 'actionLabel', type: 'string' },
        { name: 'label', type: 'string' },
      ],
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-snackbar-min', value: '18rem' },
    { name: '--vectis-control-size-snackbar-max', value: '36rem' },
  ],
} satisfies PageApi
