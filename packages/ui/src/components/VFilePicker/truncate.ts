/**
 * Middle truncation, for text whose END carries as much meaning as its start.
 * A file name is the canonical case: `text-overflow: ellipsis` would drop the
 * extension, which is often the only thing distinguishing two entries
 * (`invoice.pdf` and `invoice.png`), and the tail is also where the version or
 * date suffixes live.
 *
 * Pure, no Vue — the `VHotkeys/platform.ts` precedent, like its two neighbours
 * in this folder. Kept apart from them on purpose: formatting a size, matching
 * an `accept` and cutting a string share no body, and a `helpers.ts` grab-bag is
 * not how this repo is written.
 */

/** Ceiling of a chip's label, ellipsis included. Chips wrap, so the point is not
    the field's width but keeping a row readable at a glance. */
export const CHIP_NAME_MAX = 20

/**
 * `truncateMiddle('annual_report_2026_final.pdf')` → `annual_rep…_final.pdf`.
 *
 * The result is EXACTLY `max` characters long: the ellipsis takes one of them,
 * and the odd one goes to the head — the start of a name is what makes it
 * recognizable, the end is what disambiguates it.
 *
 * Counted in CODE POINTS (`[...text]`) and not in UTF-16 units: an emoji in a
 * name would otherwise be cut between its two halves and render as a
 * replacement character. Combining marks stay out of scope — a grapheme
 * segmenter for a chip label would be a lot of machinery for a rounding error.
 */
export function truncateMiddle(text: string, max: number = CHIP_NAME_MAX): string {
  const chars = [...text]
  if (chars.length <= max) return text

  const budget = Math.max(0, max - 1)
  const head = Math.ceil(budget / 2)
  const tail = budget - head

  return `${chars.slice(0, head).join('')}…${chars.slice(chars.length - tail).join('')}`
}
