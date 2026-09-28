// @core
/** Derive event hues deterministically so server and browser render the same colours. */
import type { CalendarEventId } from './types'

/**
 * It is not decoration, and removing it makes the palette collapse without any error to show
 * for it. A plain string hash of `"1"`, `"2"`, `"3"` produces three CONSECUTIVE numbers, so
 * taking them modulo 360 directly would give three hues one degree apart: a calendar whose
 * events are numbered in order would come out entirely one colour.
 */
const GOLDEN = 2654435761

/** How many degrees the colour wheel has. */
const HUES = 360

/** A stable hue, 0 to 359, for an event that carries no colour of its own. */
export function hueOf(id: CalendarEventId): number {
  const text = String(id)
  let hash = 5381
  for (let i = 0; i < text.length; i++) {
    // `| 0` keeps the running value a 32-bit integer, so the result cannot depend on how
    // far a double drifts once the multiplications exceed the exactly representable range.
    hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0
  }
  return Math.abs(Math.imul(hash, GOLDEN) >>> 0) % HUES
}
