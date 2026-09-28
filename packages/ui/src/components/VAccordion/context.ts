/** Share group icons through context; compact spacing inherits through CSS variables. */

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

/**
 * `null` is what an item provides to its own content: an item placed straight inside
 * another one must not join the outer group, since opening it would then close the section
 * that holds it.
 */
export const accordionKey: InjectionKey<AccordionContext | null> = Symbol('v-accordion')
