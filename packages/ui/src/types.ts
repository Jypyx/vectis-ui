/**
 * Types shared across unrelated components; component-owned contracts stay in their own
 * modules.
 */
import type { ChipSize } from './components/VChip/VChip.vue'
import type { IconSource } from './components/VIcon/types'

/** What identifies one item among several: a tab, a toggle item, an option in a list. */
export type ItemValue = string | number

/** One thing that can be chosen in a list of options. */
export interface ListboxOption {
  /**
   * What choosing it means: this is what the value holds. A number is admitted because a
   * list of options almost always comes from somewhere that keys its rows by one.
   */
  value: ItemValue
  /** What it is called on screen, and what a search or a typed prefix matches against. */
  label: string
  /** An icon before the label: an icon name, or an explicit render. */
  icon?: IconSource
  /** Shows the option without allowing it to be chosen. */
  disabled?: boolean
}

/**
 * A named block of options, the equivalent of a native `<optgroup>`. A group none of whose
 * options survive a search disappears entirely, its name included.
 */
export interface ListboxGroup {
  /** The name of the block. */
  label: string
  /** The options it holds. */
  options: ListboxOption[]
}

/**
 * A rule drawn between two blocks of options. It is purely decorative, and a separator left
 * stranded (at the top, at the bottom, or against another one) is simply not drawn.
 */
export interface ListboxSeparator {
  separator: true
}

/** Anything a list of options may hold: an option, a named block, or a separator. */
export type ListboxItem = ListboxOption | ListboxGroup | ListboxSeparator

/** What the `#option` slot of VCombobox and VSelect receives. */
export interface ListboxOptionSlotProps {
  option: ListboxOption
  index: number
  active: boolean
  selected: boolean
}

/** What the `#chip` slot of VCombobox and VSelect receives. */
export interface ListboxChipSlotProps {
  value: ItemValue
  option: ListboxOption | undefined
  label: string
  remove: () => void
  size: ChipSize
  compact: boolean
}

/** What the `#overflow` slot of VCombobox and VSelect receives. */
export interface ListboxOverflowSlotProps {
  count: number
  size: ChipSize
  compact: boolean
}
