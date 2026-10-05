/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VField',
      props: [
        { name: 'label', type: 'string' },
        { name: 'hint', type: 'string' },
        { name: 'error', type: 'string' },
        { name: 'required', type: 'boolean', default: 'false' },
        { name: 'hideLabel', type: 'boolean', default: 'false' },
        { name: 'labelPosition', type: 'FieldLabelPosition', values: "'top' | 'start'", default: "'top'" },
      ],
      slots: [
        { name: 'default', type: '{ fieldProps: FieldControlProps; }' },
      ],
    },
  ],
  types: [
    {
      name: 'FieldControlProps',
      definition: `export type FieldControlProps = {
  id: string
  'aria-describedby'?: string
  'aria-invalid'?: 'true'
  required?: true
} & Record<string, unknown>`,
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-field-label', value: '10rem' },
    { name: '--vectis-control-size-field-control-min', value: '16rem' },
  ],
} satisfies PageApi
