// @core
/**
 * How big a chip should be when it sits INSIDE a text field — the selected values in the
 * search field, the chosen files in the file field.
 *
 * A chip is always one step smaller than the field holding it, so that a row of them fits
 * without pushing the field taller. There are only three field sizes, and the two
 * smallest take the smallest chip while the largest takes the next one up. Below the
 * smallest step of each pair there is no smaller size left, so the extra reduction is
 * asked for as a "compact" chip instead. A medium field already has room to spare, which
 * is why its own compact setting does not reach the chips at all.
 *
 * The HEIGHT is what earns this module its existence. The field has to force the text
 * being typed to the same height as the chips beside it, or the natural height of that
 * text exceeds them and the field grows the moment it is focused — but the chips' height
 * is decided inside the chip, out of the field's reach. Deriving it here, from the very
 * same pair of settings that chooses the chip's size, makes the two incapable of drifting
 * apart.
 */
export type ChipFieldSize = 'sm' | 'md' | 'lg'

export interface ChipScale {
  size: 'xs' | 'sm'
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
