/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VAvatar',
      props: [
        { name: 'src', type: 'string' },
        { name: 'icon', type: 'IconSource' },
        { name: 'name', type: 'string' },
        { name: 'alt', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'size', type: 'AvatarSize' },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'href', type: 'string' },
        { name: 'clickable', type: 'boolean', default: 'false' },
        { name: 'disabled', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-avatar-ring', value: '2px' },
  ],
} satisfies PageApi
