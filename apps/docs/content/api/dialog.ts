/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VDialog',
      props: [
        { name: 'title', type: 'string' },
        { name: 'subtitle', type: 'string' },
        { name: 'width', type: 'string', default: "'400px'" },
        { name: 'role', type: "'dialog' | 'alertdialog'", default: "'dialog'" },
        { name: 'closable', type: 'boolean', default: 'true' },
        { name: 'closeOnBackdrop', type: 'boolean', default: 'true' },
        { name: 'closeOnEscape', type: 'boolean', default: 'true' },
        { name: 'closeLabel', type: 'string' },
        { name: 'v-model:open', key: 'vModelOpen', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'default', type: '{}' },
        { name: 'header', type: '{}' },
        { name: 'headerActions', type: '{}' },
        { name: 'footer', type: '{}' },
        { name: 'trigger', type: '{ triggerProps: TriggerProps; }' },
      ],
    },
    {
      name: 'VDialogAlert',
      props: [
        { name: 'title', type: 'string' },
        { name: 'subtitle', type: 'string' },
        { name: 'width', type: 'string', default: "'400px'" },
        { name: 'v-model:open', key: 'vModelOpen', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'default', type: '{}' },
        { name: 'header', type: '{}' },
        { name: 'footer', type: '{}' },
        { name: 'trigger', type: '{ triggerProps: TriggerProps; }' },
      ],
    },
  ],
} satisfies PageApi
