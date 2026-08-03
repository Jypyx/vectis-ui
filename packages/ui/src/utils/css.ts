/**
 * Dimensions always in pixels: `12` and `'12'` both give `12px`. A non-numeric
 * value returns undefined rather than an invalid custom property, which would
 * break the geometry instead of falling back to the token.
 */
export function px(v: number | string | undefined): string | undefined {
  if (v === undefined) return undefined
  const n = typeof v === 'number' ? v : Number.parseFloat(v)
  return Number.isFinite(n) ? `${n}px` : undefined
}

/**
 * Dimension with a FREE unit: `12` gives `12px`, but any string passes through
 * as-is (`'100%'`, `'50vh'`, `'max-content'`). Unlike `px`, the string is not
 * interpreted — it is up to CSS to validate it, a faulty value falling back to
 * the component's own declaration.
 */
export function cssSize(v: number | string | undefined): string | undefined {
  if (v === undefined) return undefined
  return typeof v === 'number' ? `${v}px` : v
}
