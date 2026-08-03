import type { InjectionKey } from 'vue'

import type { ToggleSize, ToggleTone, ToggleValue, ToggleVariant } from './VToggle.vue'

/**
 * The VToggle → VToggleItem contract. Getters: the root's props stay reactive
 * across the injection. No ids and no registry: there is no aria-controls in this
 * pattern, and the selection is a pure value comparison — deterministic on server
 * and client.
 *
 * `isSelected` rather than a raw `value` getter: in `multiple` mode the comparison
 * is not a simple equality, so it must live on the root.
 *
 * `size`/`compact` travel through the injection (and not through CSS inheritance
 * as in VAccordion): every VToggleItem renders a VButton, which sets
 * `v-control[data-size]` on its own element.
 */
export interface ToggleContext {
  isSelected: (value: ToggleValue) => boolean
  select: (value: ToggleValue) => void
  readonly variant: ToggleVariant
  readonly tone: ToggleTone
  readonly size: ToggleSize
  readonly compact: boolean
  readonly disabled: boolean
  readonly selectedIconFilled: boolean
}

export const toggleKey: InjectionKey<ToggleContext> = Symbol('v-toggle')
