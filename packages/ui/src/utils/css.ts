// @core
/**
 * A dimension always in pixels: `12` and `'12'` both give `12px`.
 *
 * Anything non-numeric yields `undefined` rather than a custom property CSS cannot read —
 * an invalid value breaks the geometry outright, where nothing at all lets the component's
 * own default apply.
 */
export function px(v: number | string | undefined): string | undefined {
  if (v === undefined) return undefined
  const n = typeof v === 'number' ? v : Number.parseFloat(v)
  return Number.isFinite(n) ? `${n}px` : undefined
}

// @core
/**
 * A dimension in any unit: a bare number is read as pixels, a string passes through
 * untouched — `50%`, `20vw`, `max-content`.
 *
 * Unlike `px` above, the string is deliberately not examined: CSS judges it, and one it
 * cannot parse falls back to whatever the component declares for itself.
 */
export function cssSize(v: number | string | undefined): string | undefined {
  if (v === undefined) return undefined
  return typeof v === 'number' ? `${v}px` : v
}
