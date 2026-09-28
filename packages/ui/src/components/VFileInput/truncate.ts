/**
 * Preserve both filename ends when truncating so extensions and version suffixes remain
 * identifiable.
 */

/** Ceiling of a chip's label, ellipsis included. Chips wrap, so the point is not
    the field's width but keeping a row readable at a glance. */
export const CHIP_NAME_MAX = 20

/** `truncateMiddle('annual_report_2026_final.pdf')` → `annual_rep…_final.pdf`. */
export function truncateMiddle(text: string, max: number = CHIP_NAME_MAX): string {
  const chars = [...text]
  if (chars.length <= max) return text

  const budget = Math.max(0, max - 1)
  const head = Math.ceil(budget / 2)
  const tail = budget - head

  return `${chars.slice(0, head).join('')}…${chars.slice(chars.length - tail).join('')}`
}
