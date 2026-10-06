/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VHoverCard',
      props: [
        { name: 'placement', type: 'HoverCardPlacement', values: "'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end'", default: "'bottom'" },
        { name: 'openDelay', type: 'number', default: '500' },
        { name: 'closeDelay', type: 'number', default: '300' },
        { name: 'v-model:open', key: 'vModelOpen', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'default', type: '{ triggerProps: HoverCardTriggerProps; }' },
        { name: 'content', type: '{}' },
      ],
    },
  ],
  types: [
    {
      name: 'HoverCardTriggerProps',
      definition: `export type HoverCardTriggerProps = {
  'aria-details': string
}`,
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-hover-card-max', value: '20rem' },
  ],
} satisfies PageApi
