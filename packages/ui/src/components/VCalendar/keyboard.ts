// @keyboard @a11y
/**
 * Decode calendar keys without side effects; focus, model updates and announcements remain with
 * the view.
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
 * Where the focus is when the key arrives, which decides the answer: - `cell`: an empty part of
 * the grid.
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

/** What a key means. */
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
