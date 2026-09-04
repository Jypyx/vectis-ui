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
 * What is here is what SELECTION decides, and nothing else. The size, the density, the
 * elevation and the disabled state are the row's appearance, so they travel down the
 * VButtonGroup the group renders and reach each item's button through `buttonGroupKey`
 * instead. The variant and the tone stay here because they are read per item: which of
 * the two variants applies, and whether the tone or a quiet neutral is used, is decided
 * by whether that item is the selected one.
 */

import type { InjectionKey } from 'vue'

import type { ToggleSelectedVariant, ToggleTone, ToggleValue, ToggleVariant } from './VToggle.vue'

export interface ToggleContext {
  /** Whether the item carrying this value is currently selected. */
  isSelected: (value: ToggleValue) => boolean
  /** Reports that an item was clicked; the group decides what it does to the selection. */
  select: (value: ToggleValue) => void
  /** How the unselected items are drawn. */
  readonly variant: ToggleVariant
  /** How the selected item is drawn. */
  readonly selectedVariant: ToggleSelectedVariant
  /** The colour a selected item takes. */
  readonly tone: ToggleTone
  /** Whether the selected item draws its icon filled. */
  readonly selectedIconFilled: boolean
}

export const toggleKey: InjectionKey<ToggleContext> = Symbol('v-toggle')
