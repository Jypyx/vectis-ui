// @keyboard @core
/**
 * The pure half of VCalendar's keyboard: it answers the single question "how far
 * does this key move?", and does nothing else. Actually moving the focus, calling
 * `preventDefault` and keeping the result inside the `min`/`max` bounds all stay in
 * the component, where the reactive state lives.
 *
 * It sits in VCalendar's own folder rather than in `utils/` because it has exactly
 * one consumer, which fails the admission rule for shared code, and because
 * VCalendar owns the contract (the same reasoning as `VHotkeys/platform.ts` and
 * `VCombobox/infiniteScroll.ts`). Being pure is also what makes this logic testable
 * without mounting anything: the handlers in the component only ever move DOM focus,
 * and jsdom lays nothing out to observe.
 *
 * One number has to be shared rather than repeated: `PICKER_COLUMNS` both cuts the
 * months and years grid into rows and defines what a vertical arrow steps over. Were
 * those two written as separate literals, widening the picker to four columns would
 * leave the arrows moving three cells, with no error anywhere to point at it.
 */

/**
 * How many columns the months and years pickers are laid out in. It drives BOTH the
 * cutting of those grids into rows and the distance a vertical arrow travels: these
 * are the same number, and have to stay so.
 */
export const PICKER_COLUMNS = 3

const DAYS_PER_WEEK = 7

/**
 * How far a key moves in the days view. It comes in two units because a month is not
 * a fixed number of days: `utils/date` provides one helper for each, and the caller
 * picks by looking at which shape it was handed.
 */
export type DayStep = { days: number } | { months: number }

/**
 * The step a key produces in the days view, given the key itself, whether Shift is
 * held, and how far the focused date sits from the start of its week — the last
 * being what Home and End need in order to land on the right day. Returning
 * `undefined` means the key is none of this table's business, and the event must be
 * left alone.
 *
 * `weekdayOffset` is passed in rather than worked out here, because it depends on
 * which day the week starts on in the current locale, and resolving that belongs to
 * `utils/date`, not to a keyboard table.
 */
export function dayStep(
  key: string,
  shiftKey: boolean,
  weekdayOffset: number,
): DayStep | undefined {
  switch (key) {
    case 'ArrowRight':
      return { days: 1 }
    case 'ArrowLeft':
      return { days: -1 }
    case 'ArrowDown':
      return { days: DAYS_PER_WEEK }
    case 'ArrowUp':
      return { days: -DAYS_PER_WEEK }
    case 'Home':
      // Negating an offset of zero yields `-0`, and the `|| 0` normalizes it back.
      // `addDays` would not care either way, but a pure function should not hand out
      // a value that `Object.is` reports as different from the zero every caller
      // means.
      return { days: -weekdayOffset || 0 }
    case 'End':
      return { days: DAYS_PER_WEEK - 1 - weekdayOffset }
    case 'PageUp':
      return { months: shiftKey ? -12 : -1 }
    case 'PageDown':
      return { months: shiftKey ? 12 : 1 }
    default:
      return undefined
  }
}

/**
 * The step a key produces in the months and years views, expressed as a movement of
 * a flat index over a grid `PICKER_COLUMNS` wide. `undefined` again means the key is
 * not this table's business.
 *
 * Home and End are deliberately absent: both views are bounded — twelve months, a
 * year range fixed by `min` and `max` — and the component clamps whatever comes out,
 * so there is no wrapping behaviour left to define.
 */
export function gridDelta(key: string): number | undefined {
  switch (key) {
    case 'ArrowRight':
      return 1
    case 'ArrowLeft':
      return -1
    case 'ArrowDown':
      return PICKER_COLUMNS
    case 'ArrowUp':
      return -PICKER_COLUMNS
    default:
      return undefined
  }
}
