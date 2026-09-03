/**
 * The parent→items contract: the shared name set on each <details> is what makes the
 * BROWSER close the previous item (the `name` attribute, Baseline 2024) — a single item
 * open, with no JS at all. The icons are set on the group (homogeneous density and iconography);
 * `compact` does NOT travel here, it descends through CSS inheritance (the
 * --accordion-* variables set on the root).
 */

import type { InjectionKey } from 'vue'

import type { IconSource } from '../VIcon/types'

export interface AccordionContext {
  /** Group name for <details name>; undefined = several items may stay open at once. */
  name: string | undefined
  /** Icon in the closed state: an icon name, or an explicit render. */
  expandIcon: IconSource
  /** Icon in the open state; undefined = a rotation of `expandIcon`. */
  collapseIcon: IconSource | undefined
}

export const accordionKey: InjectionKey<AccordionContext> = Symbol('v-accordion')
