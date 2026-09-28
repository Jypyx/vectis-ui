// @core
/**
 * Keep list-search rules with VTimeInput so calendar imports of time.ts do not include unused
 * field logic.
 */
import { formatTime, parseTime } from '../../utils/time'
import { to24h } from '../../utils/clock'
import type { Meridiem } from '../../utils/time'
import { digitsOf, normalizeText, pad2 } from '../../utils/text'

/** Everything but the letters, so that "9:30 PM" and "pm" can be compared as words. */
const lettersOf = (s: string): string => normalizeText(s).replace(/[^a-z]/g, '')

/** Whether a row of times answers to what is being searched for. */
export function timeMatches(label: string, value: string, query: string): boolean {
  const q = query.trim()
  if (!q) return true
  if (normalizeText(label).includes(normalizeText(q))) return true

  const needle = digitsOf(q)
  if (!needle) return false

  // The minutes are always written on two digits, so what comes before them is the hour as this
  // label spells it; which the reader has in front of them.
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
 * A pasted time read as a whole, in canonical `HH:mm`, or `null` for anything the digits alone
 * should handle.
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
