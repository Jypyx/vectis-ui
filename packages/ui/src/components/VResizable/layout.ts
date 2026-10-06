// @core
/**
 * Panel sizes are percentages of the space the panels share, summing to 100. These functions are
 * pure: the component measures the DOM and converts CSS lengths before calling them.
 */

/** The limits of one panel, already converted to percentages. */
export interface PanelLimits {
  min: number
  max: number
  collapsible: boolean
  collapsedSize: number
}

/** Below this difference two sizes are equal, which absorbs the rounding of written sizes. */
const EPSILON = 0.01

export const isCollapsedAt = (size: number, limits: PanelLimits) =>
  limits.collapsible && size <= limits.collapsedSize + EPSILON

/** Rounds a written size so the model does not carry floating-point noise. */
export const roundSize = (size: number) => Math.round(size * 1000) / 1000

/**
 * The starting sizes: each panel's `defaultSize` where given, the rest shared equally. Sizes that
 * do not add up to 100 are scaled to.
 */
export function defaultSizes(defaults: (number | undefined)[]): number[] {
  const given = defaults.reduce<number>((sum, size) => sum + (size ?? 0), 0)
  const free = defaults.filter((size) => size === undefined).length
  const share = free ? Math.max(0, 100 - given) / free : 0
  const sizes = defaults.map((size) => size ?? share)
  const total = sizes.reduce((sum, size) => sum + size, 0)
  if (!total) return defaults.map(() => roundSize(100 / (defaults.length || 1)))
  return sizes.map((size) => roundSize((size / total) * 100))
}

/**
 * Moves handle `handle`, which sits between panels `handle` and `handle + 1`, so that the panel
 * before it grows by `delta` (or shrinks, when negative). The space is taken from the panels on
 * the other side, nearest first, each down to its minimum; and given to the panels on this side,
 * nearest first, each up to its maximum.
 *
 * `snap` places the collapse point of the two neighbours between their collapsed size and their
 * minimum: 0.5 for a pointer, which must travel half that distance, 1 for the keyboard, which
 * collapses or reopens on the first press.
 */
export function resizeAt(
  base: readonly number[],
  handle: number,
  delta: number,
  limits: readonly PanelLimits[],
  snap = 0.5,
): number[] {
  if (Math.abs(delta) < EPSILON) return [...base]
  const growing = delta > 0
  const growFirst = growing ? handle : handle + 1
  const growStep = growing ? -1 : 1
  const shrinkFirst = growing ? handle + 1 : handle
  const shrinkStep = growing ? 1 : -1
  const inRange = (i: number) => i >= 0 && i < base.length

  let want = Math.abs(delta)

  // A collapsed neighbour stays shut until the pull passes its collapse point, then opens at
  // its minimum at once: a panel narrower than its minimum is a state no rule allows.
  const opener = limits[growFirst]!
  const opening = isCollapsedAt(base[growFirst]!, opener)
  const openGap = Math.max(0, opener.min - opener.collapsedSize)
  if (opening) {
    if (want < openGap * (1 - snap) - EPSILON) return [...base]
    want = Math.max(want, openGap)
  }

  // A collapsed panel further away is not reopened by a drag that only passes by.
  let room = 0
  for (let i = growFirst; inRange(i); i += growStep) {
    if (i !== growFirst && isCollapsedAt(base[i]!, limits[i]!)) continue
    room += Math.max(0, limits[i]!.max - base[i]!)
  }
  want = Math.min(want, room)

  const next = [...base]
  let taken = 0
  for (let i = shrinkFirst; inRange(i) && want - taken > EPSILON; i += shrinkStep) {
    const lim = limits[i]!
    const size = base[i]!
    if (isCollapsedAt(size, lim)) continue
    let target = size - (want - taken)
    if (target < lim.min) {
      const collapsePoint = lim.collapsedSize + (lim.min - lim.collapsedSize) * snap
      const canCollapse =
        lim.collapsible &&
        i === shrinkFirst &&
        target < collapsePoint - EPSILON &&
        taken + size - lim.collapsedSize <= room + EPSILON
      target = canCollapse ? lim.collapsedSize : lim.min
    }
    target = Math.min(target, size)
    taken += size - target
    next[i] = target
  }

  if (opening && taken < openGap - EPSILON) return [...base]

  let left = taken
  for (let i = growFirst; inRange(i) && left > EPSILON; i += growStep) {
    const lim = limits[i]!
    if (i !== growFirst && isCollapsedAt(base[i]!, lim)) continue
    const size = next[i]!
    const target = Math.min(lim.max, size + left)
    left -= target - size
    next[i] = target
  }
  if (left > EPSILON) return [...base]

  return next.map(roundSize)
}
