// @core
/**
 * A dimension always in pixels: `12` and `'12'` both give `12px`.
 *
 * Anything non-numeric yields `undefined` rather than a custom property CSS cannot read —
 * an invalid value breaks the geometry outright, where nothing at all lets the component's
 * own default apply.
 *
 * TRAP — `Number`, never `parseFloat`: the latter reads a numeric PREFIX, so `'12rem'`
 * would come out as `12px`, a wrong size with nothing to say so. `Number('')` being 0, a
 * blank string is refused before it gets there.
 */
export function px(v: number | string | undefined): string | undefined {
  if (v === undefined) return undefined
  const n = typeof v === 'number' ? v : v.trim() === '' ? Number.NaN : Number(v)
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
