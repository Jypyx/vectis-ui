/**
 * What a VTimeline shares with its events: how they are laid out, which an event marks on itself
 * so that a timeline nested in its content keeps its own layout, and how titles and dates are
 * written.
 */

import type { InjectionKey } from 'vue'

/** The heading level the titles of the events are rendered at. */
export type TimelineHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface TimelineContext {
  orientation: 'vertical' | 'horizontal'
  layout: 'stacked' | 'split' | 'alternate'
  headingLevel: TimelineHeadingLevel | undefined
  locale: string | undefined
  formatOptions: Intl.DateTimeFormatOptions | undefined
}

export const timelineKey: InjectionKey<TimelineContext> = Symbol('v-timeline')
