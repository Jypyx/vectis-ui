/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VButtonGroup',
      props: [
        { name: 'orientation', type: 'ButtonGroupOrientation', values: "'horizontal' | 'vertical'", default: "'horizontal'" },
        { name: 'detached', type: 'boolean', default: 'false' },
        { name: 'seamless', type: 'boolean', default: 'false' },
        { name: 'fullWidth', type: 'boolean', default: 'false' },
        { name: 'variant', type: 'ButtonVariant', values: "'solid' | 'outline' | 'ghost' | 'soft'" },
        { name: 'tone', type: 'ButtonTone', values: "'accent' | 'neutral' | 'danger'" },
        { name: 'size', type: 'ButtonSize', values: "'xs' | 'sm' | 'md' | 'lg' | 'xl'" },
        { name: 'compact', type: 'boolean' },
        { name: 'elevated', type: 'boolean' },
        { name: 'disabled', type: 'boolean' },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
  ],
} satisfies PageApi
