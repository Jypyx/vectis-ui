// @keyboard @a11y
/**
 * The pure half of VCalendar's keyboard: it answers the single question "what does this
 * key mean here?", and does nothing else. Moving the focus, writing to the model, calling
 * `preventDefault` and announcing the result all stay in the component, where the reactive
 * state lives.
 *
 * It sits in VCalendar's own folder rather than in `utils/` because it has exactly one
 * consumer, which fails the admission rule for shared code (the same reasoning as
 * `VDatePicker/keyboard.ts` and `VHotkeys/platform.ts`). Being pure is also what makes the
 * whole keyboard testable without mounting anything, since the environment the tests run
 * in lays nothing out and the handlers in the component only ever move DOM focus.
 *
 * `utils/arrowNav` is deliberately not used. It navigates a flat DOM list of controls; this
 * navigates a two-dimensional space of DATES AND TIMES whose edges are a domain clamp, not
 * a list end — the same reason VDatePicker, VCombobox and VTimePicker stay out of it.
 *
 * WHY A GRAB MODE, and not arrows that move an event outright. Every gesture the pointer
 * offers has to have a keyboard equivalent (WCAG 2.1.1), and a card is reached by the
 * arrows in the first place — so if the arrows also moved it, arriving at an event and
 * nudging it would be the same keystroke, and there would be no way to pass over one
 * without dragging it. Entering a mode separates the two, and Escape gives back the one
 * thing a pointer drag has that a keypress does not: the chance to change your mind.
 */

/** What one key means, given where the focus is. */
export type CalendarIntent =
  /** Move the focused cell by whole days and whole hours. */
  | { kind: 'moveFocus'; days: number; minutes: number }
  /** Jump to the first or last day of the row. */
  | { kind: 'rowEdge'; edge: 'start' | 'end' }
  /** Show the previous or next period, as the toolbar's buttons do. */
  | { kind: 'period'; delta: -1 | 1 }
  /** Take up what is focused: create here, open a card, or commit a move under way. */
  | { kind: 'activate' }
  /** Back out: leave a card for its cell, or abandon a move and put the event back. */
  | { kind: 'cancel' }
  /** Move the grabbed event. */
  | { kind: 'grabMove'; days: number; minutes: number }
  /** Change how long the grabbed event lasts. */
  | { kind: 'grabResize'; minutes: number }

/**
 * Where the focus is when the key arrives, which is what decides the answer:
 *
 * - `cell` — an empty part of the grid. The arrows travel, Enter creates.
 * - `event` — a card, at rest. Enter takes hold of it, Escape goes back to the grid.
 * - `grabbed` — a card being moved. The arrows now move the EVENT, Enter commits, Escape
 *   puts it back where it was.
 */
export type CalendarFocus = 'cell' | 'event' | 'grabbed'

/** How far one press of an arrow travels vertically in the grid: one hour. */
const MINUTES_PER_ROW = 60

/**
 * What a key means. Returning nothing says the key is none of this table's business and
 * the event must be left entirely alone — which is what keeps Tab, the browser's own
 * shortcuts and anything a consumer has bound working.
 *
 * `rtl` is passed in rather than read here: which way is "forward" is a property of the
 * document, and a pure table has no business consulting one.
 */
export function calendarIntent(
  key: string,
  shiftKey: boolean,
  focus: CalendarFocus,
  slotMinutes: number,
  rtl: boolean,
): CalendarIntent | undefined {
  const step = slotMinutes > 0 ? slotMinutes : 1
  // The inline arrows follow the reading direction; the block ones never do, because down
  // is later in the day in every script.
  const inline = rtl ? -1 : 1

  if (focus === 'grabbed') {
    switch (key) {
      case 'ArrowLeft':
        return { kind: 'grabMove', days: -inline, minutes: 0 }
      case 'ArrowRight':
        return { kind: 'grabMove', days: inline, minutes: 0 }
      case 'ArrowUp':
        return shiftKey
          ? { kind: 'grabResize', minutes: -step }
          : { kind: 'grabMove', days: 0, minutes: -step }
      case 'ArrowDown':
        return shiftKey
          ? { kind: 'grabResize', minutes: step }
          : { kind: 'grabMove', days: 0, minutes: step }
      case 'Enter':
      case ' ':
        return { kind: 'activate' }
      case 'Escape':
        return { kind: 'cancel' }
      default:
        return undefined
    }
  }

  if (focus === 'event') {
    switch (key) {
      case 'Enter':
      case ' ':
        return { kind: 'activate' }
      case 'Escape':
        return { kind: 'cancel' }
      default:
        return undefined
    }
  }

  switch (key) {
    case 'ArrowLeft':
      return { kind: 'moveFocus', days: -inline, minutes: 0 }
    case 'ArrowRight':
      return { kind: 'moveFocus', days: inline, minutes: 0 }
    case 'ArrowUp':
      return { kind: 'moveFocus', days: 0, minutes: -MINUTES_PER_ROW }
    case 'ArrowDown':
      return { kind: 'moveFocus', days: 0, minutes: MINUTES_PER_ROW }
    case 'Home':
      return { kind: 'rowEdge', edge: 'start' }
    case 'End':
      return { kind: 'rowEdge', edge: 'end' }
    case 'PageUp':
      return { kind: 'period', delta: -1 }
    case 'PageDown':
      return { kind: 'period', delta: 1 }
    case 'Enter':
    case ' ':
      return { kind: 'activate' }
    default:
      return undefined
  }
}
