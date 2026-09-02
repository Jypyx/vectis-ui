/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VTooltip',
      props: [
        { name: 'text', type: 'string' },
        { name: 'placement', type: 'Placement', default: "'top'" },
        { name: 'delay', type: 'number', default: '300' },
      ],
      slots: [
        { name: 'default', type: "{ triggerProps: { 'aria-describedby': string; }; }" },
        { name: 'content', type: '{}' },
      ],
    },
  ],
} satisfies PageApi
