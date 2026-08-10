// @keyboard @core
/**
 * The PURE half of VCalendar's keyboard: a key becomes a STEP, and nothing else.
 * Moving the focus, calling `preventDefault` and clamping to `min`/`max` stay in
 * the SFC, which is where the reactive state lives.
 *
 * It sits in VCalendar's folder rather than in `utils/`: one consumer, so it fails
 * the ≥2-consumers admission rule, and VCalendar owns the contract (the
 * `VHotkeys/platform.ts` and `VCombobox/infiniteScroll.ts` precedent). It is also
 * the only way to cover this logic in vitest without mounting anything — the
 * handlers themselves only ever move DOM focus, which jsdom does not lay out.
 *
 * The extraction closed a real trap: the vertical arrow step used to be a literal
 * `3` written twice, in two byte-identical tables allocated on every keystroke,
 * while `PICKER_COLUMNS` — the number that actually chunks the grid — lived a
 * hundred lines away. Nothing tied them together, so widening the picker to four
 * columns would have left the arrows stepping three cells with no console error.
 * They are now the same constant.
 */

/**
 * Columns of the months and years pickers. Drives BOTH the row chunking and the
 * vertical arrow step: they are the same number, and must stay so.
 */
export const PICKER_COLUMNS = 3

const DAYS_PER_WEEK = 7

/**
 * How far a key moves in the days view. Two units, because a month is not a fixed
 * number of days — `utils/date` has a helper for each.
 */
export type DayStep = { days: number } | { months: number }

/**
 * Days view: the key, whether Shift is held, and the focused date's offset from the
 * start of its week (which is what Home and End need). `undefined` = not ours, let
 * the event through.
 *
 * `weekdayOffset` is passed in rather than derived here: it depends on the locale's
 * first day of the week, and resolving that is `utils/date`'s job, not a keyboard
 * table's.
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
      // `|| 0` normalizes the `-0` that negating a zero offset produces: harmless
      // for `addDays`, but a pure API should not hand out a value `Object.is`
      // tells apart from the zero every caller means.
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
 * Months and years views: a flat index moved over a `PICKER_COLUMNS`-wide grid.
 * `undefined` = not ours. Home/End are deliberately absent — both views are bounded
 * (12 months, a `min`/`max` year range) and the SFC clamps the result, so there is
 * no wrap to define.
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
