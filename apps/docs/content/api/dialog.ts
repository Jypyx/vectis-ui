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
        { name: 'width', type: 'number | string', default: "'400px'" },
        { name: 'role', type: 'DialogRole', values: "'dialog' | 'alertdialog'", default: "'dialog'" },
        { name: 'hideClose', type: 'boolean', default: 'false' },
        { name: 'persistentBackdrop', type: 'boolean', default: 'false' },
        { name: 'persistentEscape', type: 'boolean', default: 'false' },
        { name: 'closeLabel', type: 'string' },
        { name: 'v-model:open', key: 'vModelOpen', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'default', type: '{}' },
        { name: 'header', type: '{}' },
        { name: 'header-actions', key: 'headerActions', type: '{}' },
        { name: 'footer', type: '{}' },
        { name: 'trigger', type: '{ triggerProps: DialogTriggerProps; }' },
      ],
    },
    {
      name: 'VDialogAlert',
      props: [
        { name: 'title', type: 'string' },
        { name: 'subtitle', type: 'string' },
        { name: 'width', type: 'number | string', default: "'400px'" },
        { name: 'v-model:open', key: 'vModelOpen', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'default', type: '{}' },
        { name: 'header', type: '{}' },
        { name: 'footer', type: '{}' },
        { name: 'trigger', type: '{ triggerProps: DialogTriggerProps; }' },
      ],
    },
  ],
  types: [
    {
      name: 'DialogTriggerProps',
      definition: `export type DialogTriggerProps = {
  onClick: () => void
  'aria-haspopup': 'dialog'
}`,
    },
  ],
} satisfies PageApi
