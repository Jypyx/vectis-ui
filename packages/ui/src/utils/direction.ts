// @core
/**
 * Whether an element is laid out right to left.
 *
 * Logical properties mirror themselves, so this exists only for what cannot: key names
 * (`ArrowRight`), pointer coordinates and scroll deltas are physical, and the code reading
 * them has to know which way the inline axis runs before "forward" means anything.
 *
 * The COMPUTED direction, not the `dir` attribute, which may sit on any ancestor or come
 * from a stylesheet. That read forces a style recalculation — ask at event time, never in a
 * render or a loop. A null element answers `false`, the assumption the rest of the code makes.
 */
export function isRtl(el: Element | null | undefined): boolean {
  return el != null && getComputedStyle(el).direction === 'rtl'
}
