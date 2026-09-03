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
        { name: 'placement', type: 'PopoverPlacement', default: "'bottom-start'" },
        { name: 'mode', type: "'auto' | 'manual'", default: "'auto'" },
        { name: 'anchor', type: 'string' },
        { name: 'bare', type: 'boolean', default: 'false' },
        { name: 'v-model:open', key: 'vModelOpen', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'trigger', type: '{ triggerProps: PopoverTriggerProps; }' },
        { name: 'default', type: '{}' },
      ],
    },
  ],
} satisfies PageApi
