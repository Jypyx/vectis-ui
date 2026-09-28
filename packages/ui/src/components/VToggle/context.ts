/**
 * Context getters keep selection and props reactive; comparing item values needs no
 * SSR-sensitive child registry.
 */

import type { InjectionKey } from 'vue'

import type {
  ToggleSelectedVariant,
  ToggleTone,
  ToggleValue,
  ToggleItemVariant,
} from './VToggle.vue'

export interface ToggleContext {
  /** Whether the item carrying this value is currently selected. */
  isSelected: (value: ToggleValue) => boolean
  /** Reports that an item was clicked; the group decides what it does to the selection. */
  select: (value: ToggleValue) => void
  /** How the unselected items are drawn. */
  readonly itemVariant: ToggleItemVariant
  /** How the selected item is drawn. */
  readonly selectedVariant: ToggleSelectedVariant
  /** The colour a selected item takes. */
  readonly tone: ToggleTone
  /** Whether the selected item draws its icon filled. */
  readonly selectedIconFilled: boolean
}

export const toggleKey: InjectionKey<ToggleContext> = Symbol('v-toggle')
