import { describe, expect, it } from 'vitest'

import { calendarIntent } from './keyboard'

const SLOT = 15

describe('moving about the grid', () => {
  it('travels a day sideways and an hour vertically', () => {
    expect(calendarIntent({ key: 'ArrowRight' }, 'cell', SLOT, false)).toEqual({
      kind: 'moveFocus',
      days: 1,
      minutes: 0,
    })
    expect(calendarIntent({ key: 'ArrowDown' }, 'cell', SLOT, false)).toEqual({
      kind: 'moveFocus',
      days: 0,
      minutes: 60,
    })
  })

  /*
   * The inline arrows follow the reading direction; the block ones never do, because down
   * is later in the day in every script.
   */
  it('swaps the sideways arrows in a right-to-left page, and only those', () => {
    expect(calendarIntent({ key: 'ArrowRight' }, 'cell', SLOT, true)).toMatchObject({ days: -1 })
    expect(calendarIntent({ key: 'ArrowLeft' }, 'cell', SLOT, true)).toMatchObject({ days: 1 })
    expect(calendarIntent({ key: 'ArrowDown' }, 'cell', SLOT, true)).toMatchObject({ minutes: 60 })
  })

  it('jumps to the ends of the row', () => {
    expect(calendarIntent({ key: 'Home' }, 'cell', SLOT, false)).toEqual({
      kind: 'rowEdge',
      edge: 'start',
    })
    expect(calendarIntent({ key: 'End' }, 'cell', SLOT, false)).toEqual({
      kind: 'rowEdge',
      edge: 'end',
    })
  })

  it('turns the page to the previous and next period', () => {
    expect(calendarIntent({ key: 'PageUp' }, 'cell', SLOT, false)).toEqual({
      kind: 'period',
      delta: -1,
    })
    expect(calendarIntent({ key: 'PageDown' }, 'cell', SLOT, false)).toEqual({
      kind: 'period',
      delta: 1,
    })
  })

  it('takes up what is under the focus', () => {
    expect(calendarIntent({ key: 'Enter' }, 'cell', SLOT, false)).toEqual({ kind: 'activate' })
    expect(calendarIntent({ key: ' ' }, 'cell', SLOT, false)).toEqual({ kind: 'activate' })
  })
})

describe('a card at rest', () => {
  it('is taken hold of by Space, and leaves Escape to the browser', () => {
    expect(calendarIntent({ key: ' ' }, 'event', SLOT, false)).toEqual({ kind: 'grab' })
    expect(calendarIntent({ key: 'Escape' }, 'event', SLOT, false)).toBeUndefined()
  })

  /*
   * Enter is left to the card, a button, which it presses: that is how the event is opened,
   * and a card taken hold of by Enter could not be opened from the keyboard at all.
   */
  it('leaves Enter to the button, so the event opens', () => {
    expect(calendarIntent({ key: 'Enter' }, 'event', SLOT, false)).toBeUndefined()
  })

  /*
   * The arrows are deliberately none of its business: a card is REACHED with the arrows,
   * so answering them here would make arriving at an event and dragging it the same
   * keystroke, and there would be no way to pass over one without moving it.
   */
  it('leaves the arrows alone, so they can still travel the grid', () => {
    expect(calendarIntent({ key: 'ArrowDown' }, 'event', SLOT, false)).toBeUndefined()
    expect(calendarIntent({ key: 'ArrowRight' }, 'event', SLOT, false)).toBeUndefined()
  })
})

describe('a card being moved', () => {
  it('moves by a day sideways and by one step vertically', () => {
    expect(calendarIntent({ key: 'ArrowRight' }, 'grabbed', SLOT, false)).toEqual({
      kind: 'grabMove',
      days: 1,
      minutes: 0,
    })
    expect(calendarIntent({ key: 'ArrowDown' }, 'grabbed', SLOT, false)).toEqual({
      kind: 'grabMove',
      days: 0,
      minutes: 15,
    })
  })

  it('changes how long it lasts when Shift is held', () => {
    expect(calendarIntent({ key: 'ArrowDown', shiftKey: true }, 'grabbed', SLOT, false)).toEqual({
      kind: 'grabResize',
      minutes: 15,
    })
    expect(calendarIntent({ key: 'ArrowUp', shiftKey: true }, 'grabbed', SLOT, false)).toEqual({
      kind: 'grabResize',
      minutes: -15,
    })
  })

  it('follows the step it was given rather than a fixed quarter hour', () => {
    expect(calendarIntent({ key: 'ArrowDown' }, 'grabbed', 30, false)).toMatchObject({
      minutes: 30,
    })
  })

  it('never divides by a step of nothing', () => {
    expect(calendarIntent({ key: 'ArrowDown' }, 'grabbed', 0, false)).toMatchObject({ minutes: 1 })
  })

  it('swaps the sideways arrows in a right-to-left page', () => {
    expect(calendarIntent({ key: 'ArrowRight' }, 'grabbed', SLOT, true)).toMatchObject({ days: -1 })
  })

  /*
   * The one thing a keypress has that a pointer drag does not: the chance to change your
   * mind. Escape must put the event back, so it can never be silently dropped.
   */
  it('is committed by Enter and abandoned by Escape', () => {
    expect(calendarIntent({ key: 'Enter' }, 'grabbed', SLOT, false)).toEqual({ kind: 'activate' })
    expect(calendarIntent({ key: 'Escape' }, 'grabbed', SLOT, false)).toEqual({ kind: 'cancel' })
  })

  it('does not resize sideways, where there is nothing to resize', () => {
    expect(
      calendarIntent({ key: 'ArrowRight', shiftKey: true }, 'grabbed', SLOT, false),
    ).toMatchObject({
      kind: 'grabMove',
    })
  })
})

describe('keys the table has no business with', () => {
  // Returning nothing is what keeps Tab, the browser shortcuts and anything a consumer has
  // bound working: the component leaves such an event entirely alone.
  it.each(['Tab', 'a', 'F5', 'Backspace', 'Shift'])('%s is left alone everywhere', (key) => {
    expect(calendarIntent({ key }, 'cell', 15, false)).toBeUndefined()
    expect(calendarIntent({ key }, 'event', 15, false)).toBeUndefined()
    expect(calendarIntent({ key }, 'grabbed', 15, false)).toBeUndefined()
  })

  it('leaves Home, End and the page keys alone once a card is taken hold of', () => {
    expect(calendarIntent({ key: 'Home' }, 'grabbed', 15, false)).toBeUndefined()
    expect(calendarIntent({ key: 'PageDown' }, 'grabbed', 15, false)).toBeUndefined()
  })
})

/*
 * A key held with Alt, Ctrl or Meta belongs to the browser or the system: Alt+Left is Back,
 * Ctrl+Home scrolls the page. Answering it here, and cancelling it, took those away.
 */
describe('a key held with a modifier', () => {
  it('means nothing, in every place the focus can be', () => {
    for (const focus of ['cell', 'event', 'grabbed'] as const) {
      expect(calendarIntent({ key: 'ArrowLeft', altKey: true }, focus, SLOT, false)).toBeUndefined()
      expect(calendarIntent({ key: 'Home', ctrlKey: true }, focus, SLOT, false)).toBeUndefined()
      expect(calendarIntent({ key: ' ', metaKey: true }, focus, SLOT, false)).toBeUndefined()
    }
  })

  it('leaves Shift alone, which is part of the table', () => {
    expect(calendarIntent({ key: 'ArrowDown', shiftKey: true }, 'grabbed', SLOT, false)).toEqual({
      kind: 'grabResize',
      minutes: SLOT,
    })
  })
})

describe('Shift and Enter on a cell', () => {
  it('opens the day rather than reporting the cell', () => {
    expect(calendarIntent({ key: 'Enter', shiftKey: true }, 'cell', SLOT, false)).toEqual({
      kind: 'openDay',
    })
    expect(calendarIntent({ key: 'Enter' }, 'cell', SLOT, false)).toEqual({ kind: 'activate' })
  })
})
