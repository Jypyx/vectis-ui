/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VIcon',
      props: [
        { name: 'name', type: 'string | BuiltinIcon' },
        { name: 'render', type: 'IconRender' },
        { name: 'src', type: 'string' },
        { name: 'size', type: 'number' },
        { name: 'label', type: 'string' },
        { name: 'filled', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
  ],
} satisfies PageApi
