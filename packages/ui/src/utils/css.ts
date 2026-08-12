// @core
/**
 * A dimension that is always expressed in pixels: both the number twelve and the text
 * "12" come out as "12px".
 *
 * Anything that is not a number at all yields nothing rather than a value CSS cannot
 * read. That distinction matters: a nonsensical value would break the geometry outright,
 * where nothing at all simply lets the component's own default apply.
 */
export function px(v: number | string | undefined): string | undefined {
  if (v === undefined) return undefined
  const n = typeof v === 'number' ? v : Number.parseFloat(v)
  return Number.isFinite(n) ? `${n}px` : undefined
}

// @core
/**
 * A dimension in whatever unit the caller likes: a bare number is read as pixels, and any
 * text goes through untouched — a percentage, a fraction of the window, "as wide as the
 * content".
 *
 * The text is deliberately not examined, unlike the pixels-only version above. CSS is
 * left to judge it, and a value it cannot make sense of falls back to what the component
 * declares for itself.
 */
export function cssSize(v: number | string | undefined): string | undefined {
  if (v === undefined) return undefined
  return typeof v === 'number' ? `${v}px` : v
}
