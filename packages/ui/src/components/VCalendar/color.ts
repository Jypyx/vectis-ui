// @core
/**
 * The colour an event is drawn in when it names none.
 *
 * The rule is that the same event is always the same colour, whatever order the list
 * arrives in and whatever a filter has just removed from it — so the colour is derived
 * from the event's id and from nothing else. Deriving it from the position in the array
 * would repaint the whole calendar every time one event was added at the top.
 *
 * Only the HUE is derived. The lightness and the chroma that go with it live in the token
 * layer, one pair per theme, which is what keeps the title's contrast against its card a
 * fixed quantity rather than something that varies around the colour wheel: in OKLCH the
 * L axis is perceptual, so two fixed lightnesses are the same perceived distance apart at
 * every hue. See the `color.event-*` tokens in `tokens/semantic.ts`.
 *
 * Pure, hence deterministic, hence the server and the browser derive the same hue and
 * hydration has nothing to disagree about.
 */
import type { CalendarEventId } from './types'

/**
 * Knuth's multiplicative constant — the odd integer nearest to 2³² divided by the golden
 * ratio.
 *
 * TRAP — it is not decoration, and removing it makes the palette collapse without any
 * error to show for it. A plain string hash of `"1"`, `"2"`, `"3"` produces three
 * CONSECUTIVE numbers, so taking them modulo 360 directly would give three hues one degree
 * apart: a calendar whose events are numbered in order would come out entirely one colour.
 * Multiplying first scatters neighbouring hashes across the whole circle, which is exactly
 * what the constant is for.
 */
const GOLDEN = 2654435761

/** How many degrees the colour wheel has. */
const HUES = 360

/**
 * A stable hue, 0 to 359, for an event that carries no colour of its own.
 *
 * The hash is the usual djb2 walk over the id written out as text, so a numeric id and the
 * string of the same digits agree — which matters because an id makes the round trip
 * through a consumer's JSON and may well come back as the other one.
 */
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
