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

import { MINUTES_PER_HOUR } from './layout'

/** What one key means, given where the focus is. */
export type CalendarIntent =
  /** Move the focused cell by whole days and whole hours. */
  | { kind: 'moveFocus'; days: number; minutes: number }
  /** Jump to the first or last day of the row. */
  | { kind: 'rowEdge'; edge: 'start' | 'end' }
  /** Show the previous or next period, as the toolbar's buttons do. */
  | { kind: 'period'; delta: -1 | 1 }
  /** Take up what is focused: report an empty cell, or commit a move under way. */
  | { kind: 'activate' }
  /** Open the focused day, which only a month square offers. */
  | { kind: 'openDay' }
  /** Take hold of a card, so the arrows move it. */
  | { kind: 'grab' }
  /** Abandon a move under way and put the event back. */
  | { kind: 'cancel' }
  /** Move the grabbed event. */
  | { kind: 'grabMove'; days: number; minutes: number }
  /** Change how long the grabbed event lasts. */
  | { kind: 'grabResize'; minutes: number }

/**
 * Where the focus is when the key arrives, which is what decides the answer:
 *
 * - `cell`: an empty part of the grid. The arrows travel, Enter creates, Shift and Enter
 *   open the day (a month square's number takes no tab stop, so this is its keyboard route).
 * - `event`: a card, at rest. Space takes hold of it; every other key is the browser's,
 *   Enter included, which presses the card as a button and so opens the event. Enter is the
 *   one a reader tries first on a button, and `event-activate` has no other keyboard route.
 * - `grabbed`: a card being moved. The arrows now move the EVENT, Enter commits, Escape
 *   puts it back where it was.
 */
export type CalendarFocus = 'cell' | 'event' | 'grabbed'

/** The part of a keyboard event the table reads; a `KeyboardEvent` is one. */
export interface KeyChord {
  key: string
  shiftKey?: boolean
  altKey?: boolean
  ctrlKey?: boolean
  metaKey?: boolean
}

/**
 * What a key means. Returning nothing says the key is none of this table's business and
 * the event must be left entirely alone. That keeps keeps Tab, the browser's own
 * shortcuts and anything a consumer has bound working.
 *
 * A key held with Alt, Ctrl or Meta is ALWAYS left alone, whatever it is: Alt+Left is the
 * browser's Back and Ctrl+Home scrolls the page, and answering them here also cancelled them.
 * Shift is part of the table.
 *
 * `rtl` is passed in rather than read here: which way is "forward" is a property of the
 * document, and a pure table has no business consulting one.
 */
export function calendarIntent(
  chord: KeyChord,
  focus: CalendarFocus,
  slotMinutes: number,
  rtl: boolean,
): CalendarIntent | undefined {
  if (chord.altKey || chord.ctrlKey || chord.metaKey) return undefined
  const { key } = chord
  const shiftKey = chord.shiftKey === true
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

  if (focus === 'event') return key === ' ' ? { kind: 'grab' } : undefined

  switch (key) {
    case 'ArrowLeft':
      return { kind: 'moveFocus', days: -inline, minutes: 0 }
    case 'ArrowRight':
      return { kind: 'moveFocus', days: inline, minutes: 0 }
    case 'ArrowUp':
      return { kind: 'moveFocus', days: 0, minutes: -MINUTES_PER_HOUR }
    case 'ArrowDown':
      return { kind: 'moveFocus', days: 0, minutes: MINUTES_PER_HOUR }
    case 'Home':
      return { kind: 'rowEdge', edge: 'start' }
    case 'End':
      return { kind: 'rowEdge', edge: 'end' }
    case 'PageUp':
      return { kind: 'period', delta: -1 }
    case 'PageDown':
      return { kind: 'period', delta: 1 }
    case 'Enter':
      return shiftKey ? { kind: 'openDay' } : { kind: 'activate' }
    case ' ':
      return { kind: 'activate' }
    default:
      return undefined
  }
}
