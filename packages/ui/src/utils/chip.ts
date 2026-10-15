import type { ChipSize } from '../components/VChip/VChip.vue'

// @core
/**
 * The scale of a VChip rendered INSIDE a text field: VCombobox's values, VFileInput's files.
 * An `sm` field has no smaller chip size left to fit, so its chips take the xs height less one
 * step, whatever the density: the floor the compact scale reaches.
 */
export type ChipFieldSize = 'sm' | 'md' | 'lg'

export interface ChipScale {
  size: ChipSize
  /** The chips' height, set on the field so its text and its chips match. */
  height: string
}

export function chipScaleFor(size: ChipFieldSize): ChipScale {
  if (size === 'sm')
    return { size: 'xs', height: 'calc(var(--vectis-control-height-xs) - var(--vectis-space-1))' }
  const chipSize = size === 'lg' ? 'sm' : 'xs'
  return {
    size: chipSize,
    height: `calc(var(--vectis-control-height-${chipSize}) - var(--vectis-density-delta))`,
  }
}
