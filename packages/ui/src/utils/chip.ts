/**
 * The scale of a VChip rendered INSIDE a text field (VCombobox's values,
 * VFilePicker's files).
 *
 * A chip sits one step below its field so that a row of them fits without making
 * the field grow: `xs` up to a `md` field, `sm` at `lg`. Below the lowest step of
 * each pair the catch-up goes through `compact` rather than one size less — hence
 * `sm` → xs compact (20px inside 32px) and `lg` compact → sm compact (28px inside
 * 44px). At `md` the margin is already enough, so the field's `compact` does not
 * reach the chips.
 *
 * `height` is the point of this module. The field must force its `<input>` to the
 * chips' height, or the input's intrinsic height exceeds them and the field grows
 * on focus — but that height lives inside the VChip subtree, out of the field's
 * reach. It used to be restated as a four-rule `--chip-height` CSS table in EACH
 * consumer, with a comment in both asking that the two be kept in step by hand.
 * Deriving it from the same `(size, compact)` pair makes them incapable of drifting.
 */
export type ChipFieldSize = 'sm' | 'md' | 'lg'

export interface ChipScale {
  size: 'xs' | 'sm'
  compact: boolean
  /** CSS length for `--chip-height`, to be set inline on the field's root. */
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
