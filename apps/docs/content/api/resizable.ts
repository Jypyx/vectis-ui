/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VResizable',
      props: [
        { name: 'orientation', type: 'ResizableOrientation', values: "'horizontal' | 'vertical'", default: "'horizontal'" },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'grip', type: 'boolean', default: 'false' },
        { name: 'step', type: 'number', default: '5' },
        { name: 'v-model', key: 'vModel', type: 'number[]' },
      ],
      events: [
        { name: 'change', type: '[sizes: number[]]' },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
    {
      name: 'VResizablePanel',
      props: [
        { name: 'index', type: 'number', default: '0' },
        { name: 'defaultSize', type: 'number' },
        { name: 'minSize', type: 'ResizableLength', default: '0' },
        { name: 'maxSize', type: 'ResizableLength' },
        { name: 'collapsible', type: 'boolean', default: 'false' },
        { name: 'collapsedSize', type: 'ResizableLength', default: '0' },
        { name: 'label', type: 'string' },
        { name: 'v-model:collapsed', key: 'vModelCollapsed', type: 'boolean', default: 'false' },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
  ],
  types: [
    {
      name: 'ResizableLength',
      definition: `export type ResizableLength = number | string`,
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-resizable-hit', value: '0.75rem' },
    { name: '--vectis-control-size-resizable-grip-length', value: '1.5rem' },
    { name: '--vectis-control-size-resizable-grip-thickness', value: '0.5rem' },
  ],
} satisfies PageApi
