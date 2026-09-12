/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VHotkeys',
      props: [
        { name: 'keys', type: 'string' },
        { name: 'variant', type: 'HotkeysVariant', values: "'flat' | 'outlined' | 'elevated'", default: "'flat'" },
        { name: 'attached', type: 'boolean', default: 'false' },
        { name: 'size', type: 'HotkeysSize', values: "'xs' | 'sm'", default: "'xs'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'platform', type: 'HotkeysPlatform', values: "'mac' | 'windows' | 'linux' | 'other'" },
        { name: 'separator', type: 'string', default: "'+'" },
        { name: 'listen', type: 'boolean', default: 'false' },
        { name: 'allowDefault', type: 'boolean', default: 'false' },
        { name: 'allowInInput', type: 'boolean', default: 'false' },
        { name: 'label', type: 'string' },
      ],
      events: [
        { name: 'trigger', type: '[event: KeyboardEvent]' },
      ],
    },
  ],
} satisfies PageApi
