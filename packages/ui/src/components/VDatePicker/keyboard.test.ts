import { describe, expect, it } from 'vitest'

import { PICKER_COLUMNS, dayStep, gridDelta } from './keyboard'

describe('dayStep', () => {
  it('moves by one day on the inline arrows and by a week on the block arrows', () => {
    expect(dayStep('ArrowRight', false, 0)).toEqual({ days: 1 })
    expect(dayStep('ArrowLeft', false, 0)).toEqual({ days: -1 })
    expect(dayStep('ArrowDown', false, 0)).toEqual({ days: 7 })
    expect(dayStep('ArrowUp', false, 0)).toEqual({ days: -7 })
  })

  it('lands Home and End on the ends of the CURRENT week, whatever the offset', () => {
    expect(dayStep('Home', false, 2)).toEqual({ days: -2 })
    expect(dayStep('End', false, 2)).toEqual({ days: 4 })
    // Already on the first day: Home does not move, End spans the whole week.
    expect(dayStep('Home', false, 0)).toEqual({ days: 0 })
    expect(dayStep('End', false, 0)).toEqual({ days: 6 })
    expect(dayStep('Home', false, 6)).toEqual({ days: -6 })
    expect(dayStep('End', false, 6)).toEqual({ days: 0 })
  })

  it('pages by month, and by year when Shift is held', () => {
    expect(dayStep('PageUp', false, 0)).toEqual({ months: -1 })
    expect(dayStep('PageDown', false, 0)).toEqual({ months: 1 })
    expect(dayStep('PageUp', true, 0)).toEqual({ months: -12 })
    expect(dayStep('PageDown', true, 0)).toEqual({ months: 12 })
  })

  it('returns undefined for a key it does not own, so the event goes through', () => {
    expect(dayStep('Enter', false, 0)).toBeUndefined()
    expect(dayStep('a', false, 0)).toBeUndefined()
    expect(dayStep('Tab', true, 3)).toBeUndefined()
  })

  it('ignores Shift outside the paging keys', () => {
    expect(dayStep('ArrowRight', true, 0)).toEqual({ days: 1 })
    expect(dayStep('Home', true, 2)).toEqual({ days: -2 })
  })
})

describe('gridDelta', () => {
  it('moves by one cell inline and by a full row on the block axis', () => {
    expect(gridDelta('ArrowRight')).toBe(1)
    expect(gridDelta('ArrowLeft')).toBe(-1)
    expect(gridDelta('ArrowDown')).toBe(PICKER_COLUMNS)
    expect(gridDelta('ArrowUp')).toBe(-PICKER_COLUMNS)
  })

  /* Assert the TIE, never the value. */
  it('derives the vertical step from PICKER_COLUMNS, never from a literal', () => {
    expect(gridDelta('ArrowDown')).toBe(PICKER_COLUMNS)
    expect(gridDelta('ArrowUp')).toBe(-gridDelta('ArrowDown')!)
  })

  it('returns undefined for a key it does not own — Home/End included', () => {
    expect(gridDelta('Home')).toBeUndefined()
    expect(gridDelta('End')).toBeUndefined()
    expect(gridDelta('Enter')).toBeUndefined()
  })
})

describe('right to left', () => {
  it('mirrors the inline arrows of the days view, not the block ones', () => {
    expect(dayStep('ArrowRight', false, 0, true)).toEqual({ days: -1 })
    expect(dayStep('ArrowLeft', false, 0, true)).toEqual({ days: 1 })
    expect(dayStep('ArrowDown', false, 0, true)).toEqual({ days: 7 })
    expect(dayStep('Home', false, 2, true)).toEqual({ days: -2 })
  })

  it('mirrors the inline arrows of the months and years views', () => {
    expect(gridDelta('ArrowRight', true)).toBe(-1)
    expect(gridDelta('ArrowLeft', true)).toBe(1)
    expect(gridDelta('ArrowDown', true)).toBe(PICKER_COLUMNS)
  })
})
