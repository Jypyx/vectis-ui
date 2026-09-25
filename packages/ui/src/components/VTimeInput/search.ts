// @core
/**
 * How VTimeInput reads a time out of free text: a search matching a row of its list, and a
 * pasted time read as a whole.
 *
 * It sits in the component's folder rather than in `utils/time.ts` for two reasons. There
 * is one consumer, so it fails that folder's admission rule — the `VCombobox/infiniteScroll`
 * and `VHotkeys/platform` precedent. And `utils/time.ts` is in the import closure of every
 * VCalendar component, through `VCalendar/layout`, which reads `minutesOf` from it: a rule
 * only a time FIELD needs would be weighed on every calendar that never offers a list.
 *
 * Pure, so it is testable without a mount — which matters here, since what makes the rule
 * worth having is the handful of entries it must and must not accept.
 */
import { formatTime, parseTime } from '../../utils/time'
import { to24h } from '../../utils/clock'
import type { Meridiem } from '../../utils/time'
import { digitsOf, normalizeText, pad2 } from '../../utils/text'

/** Everything but the letters, so that "9:30 PM" and "pm" can be compared as words. */
const lettersOf = (s: string): string => normalizeText(s).replace(/[^a-z]/g, '')

/**
 * Whether a row of times answers to what is being searched for.
 *
 * Two ways in, because a time is typed in two ways. The plain one is a substring of the
 * label, which is what finds "PM" or ":30". The other is the DIGIT RUN: "930" finds 9:30
 * even though the label carries a colon that was never typed. That second route rests on
 * the same premise the typed form is built on, where the whole mask only ever knows the
 * digits and places the separator itself.
 *
 * The digit route is ADDITIVE: it only ever answers what the label route already refused,
 * which is why a plain "30" still returns every half past the hour: that is the substring
 * search doing its ordinary job, and it is the least surprising thing a search box can do.
 *
 * Three things keep the digit route precise. It matches a run from its START, never inside
 * it, so "035" does not reach 10:35 through the middle of its digits. Every run it compares
 * against is one the reader could have READ: the label as shown, its hour padded and
 * unpadded (the reader pads or not whatever is on screen), and the canonical 24-hour form,
 * so "2130" reaches a row a 12-hour clock writes "9:30 PM". Nothing is synthesized the
 * other way round: reading a 24-hour label as a 12-hour one would make "930" return half
 * past NINE and half past TWENTY-ONE from the same list. And whatever LETTERS were typed
 * still have to be in the label, so "930pm" leaves the morning behind while "930" keeps
 * both halves of the day.
 */
export function timeMatches(label: string, value: string, query: string): boolean {
  const q = query.trim()
  if (!q) return true
  if (normalizeText(label).includes(normalizeText(q))) return true

  const needle = digitsOf(q)
  if (!needle) return false

  // The minutes are always written on two digits, so what comes before them is the hour as
  // this label spells it — which is what the reader has in front of them.
  const shown = digitsOf(label)
  const minutes = shown.slice(-2)
  const hour = shown.slice(0, -2)
  const runs = [shown, hour.padStart(2, '0') + minutes, String(Number(hour)) + minutes]
  const parts = parseTime(value)
  if (parts) runs.push(pad2(parts.hour) + pad2(parts.minute))
  if (!runs.some((run) => run.startsWith(needle))) return false

  const letters = lettersOf(q)
  return !letters || lettersOf(label).includes(letters)
}

const WRITTEN_TIME_RE = /^(\d{1,2})\s*[:.hH]\s*(\d{2})\s*(?:([aApP])\.?\s*[mM]?\.?)?$/

/**
 * A pasted time read as a whole, in canonical `HH:mm`, or `null` for anything the digits
 * alone should handle.
 *
 * It takes a time written the way people write one rather than only the canonical form:
 * an unpadded hour (`9:30`), a dot or an `h` between the two (`19.05`, `9h30`) and an
 * AM/PM marker in any of its spellings (`9:30 PM`, `9:30pm`, `12:15 a.m.`). Read by its
 * digits alone, `9:30` would become the mask `93:0`.
 *
 * An hour the marker does not settle is read on the clock on display: a 12-hour clock
 * puts `9:30` in the half of the day the field is showing, where `19:05` can only ever be
 * the evening, whatever clock is shown.
 */
export function readWrittenTime(
  text: string,
  format: '12h' | '24h',
  meridiem: Meridiem,
): string | null {
  const match = WRITTEN_TIME_RE.exec(text.trim())
  if (!match) return null
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (minute > 59) return null
  const marker = match[3]?.toUpperCase()
  if (marker) {
    if (hour < 1 || hour > 12) return null
    return formatTime(to24h(hour, marker === 'P' ? 'PM' : 'AM'), minute)
  }
  if (hour > 23) return null
  if (format === '12h' && hour >= 1 && hour <= 12) return formatTime(to24h(hour, meridiem), minute)
  return formatTime(hour, minute)
}
