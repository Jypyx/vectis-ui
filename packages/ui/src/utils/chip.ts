import type { ChipSize } from '../components/VChip/VChip.vue'

// @core
/**
 * The scale of a VChip rendered INSIDE a text field: VCombobox's values, VFileInput's files.
 * Below the lowest step of each pair there is no smaller size left, and `compact` makes up the
 * difference instead, which is why an `sm` field forces it and an `md` one, already having
 * room, does not pass its own through.
 */
export type ChipFieldSize = 'sm' | 'md' | 'lg'

export interface ChipScale {
  size: ChipSize
  compact: boolean
  /** The chips' height, ready to be set on the field so it can match its own text to it. */
  height: string
}

export function chipScaleFor(size: ChipFieldSize, compact: boolean): ChipScale {
  const chipSize = size === 'lg' ? 'sm' : 'xs'
  const chipCompact = size === 'lg' ? compact : size === 'sm'
  const base = `var(--vectis-control-height-${chipSize})`
  return {
    size: chipSize,
    compact: chipCompact,
    height: chipCompact ? `calc(${base} - var(--vectis-space-1))` : base,
  }
}
