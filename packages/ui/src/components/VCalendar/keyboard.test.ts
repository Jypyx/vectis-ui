import { describe, expect, it } from 'vitest'

import { calendarIntent } from './keyboard'

const SLOT = 15

describe('moving about the grid', () => {
  it('travels a day sideways and an hour vertically', () => {
    expect(calendarIntent('ArrowRight', false, 'cell', SLOT, false)).toEqual({
      kind: 'moveFocus',
      days: 1,
      minutes: 0,
    })
    expect(calendarIntent('ArrowDown', false, 'cell', SLOT, false)).toEqual({
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
    expect(calendarIntent('ArrowRight', false, 'cell', SLOT, true)).toMatchObject({ days: -1 })
    expect(calendarIntent('ArrowLeft', false, 'cell', SLOT, true)).toMatchObject({ days: 1 })
    expect(calendarIntent('ArrowDown', false, 'cell', SLOT, true)).toMatchObject({ minutes: 60 })
  })

  it('jumps to the ends of the row', () => {
    expect(calendarIntent('Home', false, 'cell', SLOT, false)).toEqual({
      kind: 'rowEdge',
      edge: 'start',
    })
    expect(calendarIntent('End', false, 'cell', SLOT, false)).toEqual({
      kind: 'rowEdge',
      edge: 'end',
    })
  })

  it('turns the page to the previous and next period', () => {
    expect(calendarIntent('PageUp', false, 'cell', SLOT, false)).toEqual({
      kind: 'period',
      delta: -1,
    })
    expect(calendarIntent('PageDown', false, 'cell', SLOT, false)).toEqual({
      kind: 'period',
      delta: 1,
    })
  })

  it('takes up what is under the focus', () => {
    expect(calendarIntent('Enter', false, 'cell', SLOT, false)).toEqual({ kind: 'activate' })
    expect(calendarIntent(' ', false, 'cell', SLOT, false)).toEqual({ kind: 'activate' })
  })
})

describe('a card at rest', () => {
  it('is taken hold of by Enter and left by Escape', () => {
    expect(calendarIntent('Enter', false, 'event', SLOT, false)).toEqual({ kind: 'activate' })
    expect(calendarIntent('Escape', false, 'event', SLOT, false)).toEqual({ kind: 'cancel' })
  })

  /*
   * The arrows are deliberately none of its business: a card is REACHED with the arrows,
   * so answering them here would make arriving at an event and dragging it the same
   * keystroke, and there would be no way to pass over one without moving it.
   */
  it('leaves the arrows alone, so they can still travel the grid', () => {
    expect(calendarIntent('ArrowDown', false, 'event', SLOT, false)).toBeUndefined()
    expect(calendarIntent('ArrowRight', false, 'event', SLOT, false)).toBeUndefined()
  })
})

describe('a card being moved', () => {
  it('moves by a day sideways and by one step vertically', () => {
    expect(calendarIntent('ArrowRight', false, 'grabbed', SLOT, false)).toEqual({
      kind: 'grabMove',
      days: 1,
      minutes: 0,
    })
    expect(calendarIntent('ArrowDown', false, 'grabbed', SLOT, false)).toEqual({
      kind: 'grabMove',
      days: 0,
      minutes: 15,
    })
  })

  it('changes how long it lasts when Shift is held', () => {
    expect(calendarIntent('ArrowDown', true, 'grabbed', SLOT, false)).toEqual({
      kind: 'grabResize',
      minutes: 15,
    })
    expect(calendarIntent('ArrowUp', true, 'grabbed', SLOT, false)).toEqual({
      kind: 'grabResize',
      minutes: -15,
    })
  })

  it('follows the step it was given rather than a fixed quarter hour', () => {
    expect(calendarIntent('ArrowDown', false, 'grabbed', 30, false)).toMatchObject({
      minutes: 30,
    })
  })

  it('never divides by a step of nothing', () => {
    expect(calendarIntent('ArrowDown', false, 'grabbed', 0, false)).toMatchObject({ minutes: 1 })
  })

  it('swaps the sideways arrows in a right-to-left page', () => {
    expect(calendarIntent('ArrowRight', false, 'grabbed', SLOT, true)).toMatchObject({ days: -1 })
  })

  /*
   * The one thing a keypress has that a pointer drag does not: the chance to change your
   * mind. Escape must put the event back, so it can never be silently dropped.
   */
  it('is committed by Enter and abandoned by Escape', () => {
    expect(calendarIntent('Enter', false, 'grabbed', SLOT, false)).toEqual({ kind: 'activate' })
    expect(calendarIntent('Escape', false, 'grabbed', SLOT, false)).toEqual({ kind: 'cancel' })
  })

  it('does not resize sideways, where there is nothing to resize', () => {
    expect(calendarIntent('ArrowRight', true, 'grabbed', SLOT, false)).toMatchObject({
      kind: 'grabMove',
    })
  })
})

describe('keys the table has no business with', () => {
  // Returning nothing is what keeps Tab, the browser shortcuts and anything a consumer has
  // bound working: the component leaves such an event entirely alone.
  it.each(['Tab', 'a', 'F5', 'Backspace', 'Shift'])('%s is left alone everywhere', (key) => {
    expect(calendarIntent(key, false, 'cell', 15, false)).toBeUndefined()
    expect(calendarIntent(key, false, 'event', 15, false)).toBeUndefined()
    expect(calendarIntent(key, false, 'grabbed', 15, false)).toBeUndefined()
  })

  it('leaves Home, End and the page keys alone once a card is taken hold of', () => {
    expect(calendarIntent('Home', false, 'grabbed', 15, false)).toBeUndefined()
    expect(calendarIntent('PageDown', false, 'grabbed', 15, false)).toBeUndefined()
  })
})
