/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VTimeline',
      props: [
        { name: 'orientation', type: 'TimelineOrientation', values: "'vertical' | 'horizontal'", default: "'vertical'" },
        { name: 'layout', type: 'TimelineLayout', values: "'stacked' | 'split' | 'alternate'", default: "'stacked'" },
        { name: 'size', type: 'TimelineSize', values: "'sm' | 'md'", default: "'md'" },
        { name: 'headingLevel', type: 'TimelineHeadingLevel', values: '1 | 2 | 3 | 4 | 5 | 6' },
        { name: 'locale', type: 'string' },
        { name: 'formatOptions', type: 'Intl.DateTimeFormatOptions' },
      ],
      slots: [
        { name: 'default', type: '{}' },
      ],
    },
    {
      name: 'VTimelineItem',
      props: [
        { name: 'datetime', type: 'string' },
        { name: 'timeText', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'tone', type: 'TimelineItemTone', values: "'neutral' | 'accent' | 'danger' | 'success' | 'warning'", default: "'accent'" },
        { name: 'icon', type: 'IconSource' },
      ],
      slots: [
        { name: 'default', type: '{}' },
        { name: 'title', type: '{}' },
        { name: 'marker', type: '{}' },
      ],
    },
  ],
  types: [
    {
      name: 'BuiltinIcon',
      definition: `export interface BuiltinIcon {
  name: string
  paths: readonly [string] | readonly [string, string]
}`,
    },
    {
      name: 'IconRender',
      definition: `export type IconRender =
  | { path: string; viewBox?: string }
  | { component: Component; props?: Record<string, unknown> }
  | { src: string }
  | { text: string; class?: string }
  | { class: string }`,
    },
    {
      name: 'IconSource',
      definition: `export type IconSource = string | BuiltinIcon | IconRender`,
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-timeline-dot-sm', value: '0.5rem' },
    { name: '--vectis-control-size-timeline-dot-md', value: '0.625rem' },
    { name: '--vectis-control-size-timeline-icon-sm', value: '1.5rem' },
    { name: '--vectis-control-size-timeline-icon-md', value: '2rem' },
    { name: '--vectis-control-size-timeline-item-min', value: '12rem' },
  ],
} satisfies PageApi
