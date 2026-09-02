/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VToaster',
      props: [
        { name: 'placement', type: 'ToastPlacement', default: "'bottom-right'" },
        { name: 'duration', type: 'number', default: '5000' },
        { name: 'closeLabel', type: 'string' },
        { name: 'label', type: 'string' },
      ],
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-toast-width', value: '22rem' },
  ],
} satisfies PageApi
