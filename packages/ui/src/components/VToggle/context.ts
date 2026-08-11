import type { InjectionKey } from 'vue'

import type { ToggleSize, ToggleTone, ToggleValue, ToggleVariant } from './VToggle.vue'

/**
 * What a VToggle passes down to the items inside it. Everything is exposed through
 * getters, which is what keeps the group's props reactive on the other side of the
 * injection.
 *
 * There is no identifier and no registry here, unlike VTabs: nothing in this pattern
 * points at anything else, and whether an item is selected is a plain comparison of
 * values — so the server and the browser reach the same answer with nothing exchanged.
 *
 * That comparison is offered as a QUESTION rather than as the current value, because
 * with several choices allowed it is no longer a simple equality, and only the group
 * knows which of the two it is doing.
 *
 * The size travels through here rather than through CSS inheritance, as it does in
 * VAccordion, because each item renders a button that declares its own size on itself.
 */
export interface ToggleContext {
  /** Whether the item carrying this value is currently selected. */
  isSelected: (value: ToggleValue) => boolean
  /** Reports that an item was clicked; the group decides what it does to the selection. */
  select: (value: ToggleValue) => void
  /** How the unselected items are drawn. */
  readonly variant: ToggleVariant
  /** The colour a selected item takes. */
  readonly tone: ToggleTone
  /** The height of the items. */
  readonly size: ToggleSize
  /** The reduced density. */
  readonly compact: boolean
  /** Whether the whole group is unusable. */
  readonly disabled: boolean
  /** Whether the selected item draws its icon filled. */
  readonly selectedIconFilled: boolean
}

export const toggleKey: InjectionKey<ToggleContext> = Symbol('v-toggle')
