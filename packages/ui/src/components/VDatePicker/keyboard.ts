// @keyboard @core
/**
 * Decode date-navigation keys without side effects; the picker applies bounds, focus and model
 * updates.
 */

/** How many columns the months and years pickers are laid out in. */
export const PICKER_COLUMNS = 3

const DAYS_PER_WEEK = 7

/** How far a key moves in the days view. */
export type DayStep = { days: number } | { months: number }

/**
 * The step a key produces in the days view, given the key itself, whether Shift is held, and
 * how far the focused date sits from the start of its week: the last being what Home and End
 * need to land on the right day.
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
 * The step a key produces in the months and years views, expressed as a movement of a flat
 * index over a grid `PICKER_COLUMNS` wide. `undefined` again means the key is not this table's
 * business.
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
