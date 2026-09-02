/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VPagination',
      props: [
        { name: 'length', type: 'number', default: '1' },
        { name: 'totalVisible', type: 'number' },
        { name: 'attached', type: 'boolean', default: 'false' },
        { name: 'variant', type: "'ghost' | 'outline'", default: "'ghost'" },
        { name: 'tone', type: "'accent' | 'neutral' | 'danger'", default: "'accent'" },
        { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'" },
        { name: 'compact', type: 'boolean', default: 'false' },
        { name: 'align', type: "'start' | 'center' | 'end'", default: "'start'" },
        { name: 'showControls', type: 'boolean', default: 'true' },
        { name: 'controlsDisplay', type: "'icon' | 'text' | 'both'", default: "'icon'" },
        { name: 'prevIcon', type: 'IconSource', default: 'chevron_left' },
        { name: 'nextIcon', type: 'IconSource', default: 'chevron_right' },
        { name: 'prevLabel', type: 'string' },
        { name: 'nextLabel', type: 'string' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'disabledPages', type: 'number[] | ((page: number) => boolean)' },
        { name: 'responsive', type: 'boolean', default: 'false' },
        { name: 'label', type: 'string' },
        { name: 'pageLabel', type: '(page: number) => string' },
        { name: 'v-model', key: 'vModel', type: 'number', default: '1' },
      ],
    },
  ],
} satisfies PageApi
