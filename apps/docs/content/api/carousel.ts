/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VCarousel',
      props: [
        { name: 'itemsPerView', type: 'number', default: '1' },
        { name: 'itemMinSize', type: 'number | string' },
        { name: 'peek', type: 'number | string' },
        { name: 'gap', type: 'number | string' },
        { name: 'orientation', type: 'CarouselOrientation', default: "'horizontal'" },
        { name: 'effect', type: 'CarouselEffect', default: "'slide'" },
        { name: 'height', type: 'number | string' },
        { name: 'loop', type: 'boolean', default: 'false' },
        { name: 'autoplay', type: 'number', default: '0' },
        { name: 'controls', type: 'CarouselControls', default: "'inside'" },
        { name: 'indicators', type: 'CarouselIndicators', default: "'outside'" },
        { name: 'controlsVisibility', type: 'CarouselControlsVisibility', default: "'always'" },
        { name: 'prevIcon', type: 'IconSource' },
        { name: 'nextIcon', type: 'IconSource' },
        { name: 'prevLabel', type: 'string' },
        { name: 'nextLabel', type: 'string' },
        { name: 'label', type: 'string' },
        { name: 'v-model', key: 'vModel', type: 'number', default: '0' },
      ],
      slots: [
        { name: 'default', type: '{}' },
        { name: 'controls', type: '{ previous: () => void; next: () => void; atStart: boolean; atEnd: boolean; index: number; count: number; pageCount: number; orientation: CarouselOrientation; }' },
        { name: 'indicators', type: '{ index: number; count: number; pageCount: number; goTo: (index: number) => void; orientation: CarouselOrientation; }' },
        { name: 'indicator', type: '{ index: number; active: boolean; }' },
      ],
    },
    {
      name: 'VCarouselItem',
      props: [
        { name: 'index', type: 'number', default: '0' },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-carousel-block', value: '24rem' },
    { name: '--vectis-control-size-carousel-indicator', value: '0.625rem' },
    { name: '--vectis-control-size-carousel-indicator-active', value: '1.25rem' },
  ],
} satisfies PageApi
