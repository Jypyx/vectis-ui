// @core
/**
 * Accept complete numeric strings; parseFloat would silently reinterpret 12rem as 12px. Reject
 * blanks before Number converts them to zero.
 */
export function px(v: number | string | undefined): string | undefined {
  if (v === undefined) return undefined
  const n = typeof v === 'number' ? v : v.trim() === '' ? Number.NaN : Number(v)
  return Number.isFinite(n) && n >= 0 ? `${n}px` : undefined
}

// @core
/**
 * A dimension in any unit: a bare number is read as pixels, a string passes through untouched:
 * `50%`, `20vw`, `max-content`. Unlike `px` above, the string is deliberately not examined: CSS
 * judges it, and one it cannot parse falls back to whatever the component declares for itself.
 */
export function cssSize(v: number | string | undefined): string | undefined {
  if (v === undefined || v === '') return undefined
  if (typeof v === 'string') return v
  return Number.isFinite(v) && v >= 0 ? `${v}px` : undefined
}

// @core
/**
 * The inline style carrying a consumer's own colour to a component's sheet, which derives
 * every shade from `--custom-color`: VChip, VAvatar and VBadge.
 *
 * `undefined` when no colour was given, so a style array holding it binds nothing and the
 * tone the sheet already paints stays in force.
 */
export function customColorStyle(
  color: string | undefined,
): { '--custom-color': string } | undefined {
  return color === undefined ? undefined : { '--custom-color': color }
}
