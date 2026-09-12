/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VPopover',
      props: [
        { name: 'id', type: 'string' },
        { name: 'placement', type: 'PopoverPlacement', values: "'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end'", default: "'bottom-start'" },
        { name: 'mode', type: 'PopoverMode', values: "'auto' | 'manual'", default: "'auto'" },
        { name: 'anchor', type: 'string' },
        { name: 'bare', type: 'boolean', default: 'false' },
        { name: 'matchTrigger', type: 'boolean', default: 'false' },
        { name: 'v-model:open', key: 'vModelOpen', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'trigger', type: '{ triggerProps: PopoverTriggerProps; }' },
        { name: 'default', type: '{}' },
      ],
    },
  ],
  types: [
    {
      name: 'PopoverTriggerProps',
      definition: `export type PopoverTriggerProps = {
  popovertarget: string
  'aria-expanded': boolean
  'aria-controls': string
}`,
    },
  ],
} satisfies PageApi
