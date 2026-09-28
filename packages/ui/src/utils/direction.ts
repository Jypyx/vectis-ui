// @core
/**
 * Read computed direction for physical keys and coordinates; dir may be inherited or supplied
 * through CSS.
 */
export function isRtl(el: Element | null | undefined): boolean {
  return el != null && getComputedStyle(el).direction === 'rtl'
}
