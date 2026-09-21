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
        { name: 'placement', type: 'TooltipPlacement', values: "'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end'", default: "'top'" },
        { name: 'delay', type: 'number', default: '300' },
      ],
      slots: [
        { name: 'default', type: '{ triggerProps: TooltipTriggerProps; }' },
        { name: 'content', type: '{}' },
      ],
    },
  ],
  types: [
    {
      name: 'TooltipTriggerProps',
      definition: `export type TooltipTriggerProps = {
  'aria-describedby': string
}`,
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-tooltip-max', value: '18rem' },
  ],
} satisfies PageApi
