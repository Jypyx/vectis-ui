// @core
/**
 * Whether an element is laid out right to left.
 *
 * The design system does almost everything in LOGICAL properties, which mirror themselves
 * and need no help. This exists for the handful of places that cannot: a key name
 * (`ArrowRight`), a pointer coordinate and a scroll delta are all PHYSICAL, so the code
 * reading them has to know which way the inline axis runs before it can decide what
 * "forward" means.
 *
 * It reads the COMPUTED direction rather than the `dir` attribute on purpose: `dir` may sit
 * on any ancestor, or come from a stylesheet, and only the computed value accounts for both.
 * That read forces a style recalculation, so callers ask at event time — never in a render
 * or a loop.
 *
 * A null element answers `false`: a component whose ref is not set yet has nothing laid out,
 * and left to right is the assumption the rest of the code already makes.
 */
export function isRtl(el: Element | null | undefined): boolean {
  return el != null && getComputedStyle(el).direction === 'rtl'
}
