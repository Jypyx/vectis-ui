import { describe, expect, it } from 'vitest'

import { timeMatches } from './search'

/**
 * The rule is pure, so what is worth locking is the handful of entries it must accept and the
 * handful it must refuse.
 */
describe('timeMatches', () => {
  const twelve = (label: string, value: string) => (q: string) => timeMatches(label, value, q)
  const nineThirtyAm = twelve('9:30 AM', '09:30')
  const nineThirtyPm = twelve('9:30 PM', '21:30')
  const twentyFour = (q: string) => timeMatches('09:30', '09:30', q)

  it('an empty search keeps every row', () => {
    expect(nineThirtyAm('')).toBe(true)
    expect(nineThirtyAm('   ')).toBe(true)
  })

  it('matches the label as it is written', () => {
    expect(nineThirtyAm('9:30')).toBe(true)
    expect(nineThirtyAm(':30')).toBe(true)
    expect(nineThirtyAm('am')).toBe(true)
    expect(nineThirtyAm('AM')).toBe(true)
    expect(nineThirtyAm('pm')).toBe(false)
  })

  it('matches the bare digit run, which is how a time is typed', () => {
    expect(nineThirtyAm('930')).toBe(true)
    expect(nineThirtyAm('93')).toBe(true)
    expect(nineThirtyAm('9')).toBe(true)
    expect(nineThirtyAm('0930')).toBe(true)
    expect(twentyFour('930')).toBe(true)
    expect(twentyFour('0930')).toBe(true)
  })

  it('the digit route only ever adds to the substring one', () => {
    // "30" is a substring of the label, so it returns every half past the hour; the ordinary
    // behaviour of a search box, which the digit route does not narrow.
    expect(nineThirtyAm('30')).toBe(true)
    expect(twelve('10:35 AM', '10:35')('35')).toBe(true)
  })

  it('matches a digit run from its START, never from inside it', () => {
    expect(twelve('10:35 AM', '10:35')('035')).toBe(false)
  })

  it('never reads a 24 hour label as a 12 hour one', () => {
    expect(timeMatches('21:30', '21:30', '930')).toBe(false)
    expect(timeMatches('21:30', '21:30', '2130')).toBe(true)
    expect(nineThirtyPm('2130')).toBe(true)
  })

  it('letters typed alongside the digits still have to be in the label', () => {
    expect(nineThirtyPm('930pm')).toBe(true)
    expect(nineThirtyAm('930pm')).toBe(false)
    expect(nineThirtyAm('930')).toBe(true)
    expect(nineThirtyPm('930')).toBe(true)
  })

  it('refuses what matches neither the words nor the digits', () => {
    expect(nineThirtyAm('7')).toBe(false)
    expect(nineThirtyAm('lunch')).toBe(false)
  })

  it('leans on the label, the value being only an extra way in', () => {
    expect(timeMatches('9:30 AM', 'not a time', '930')).toBe(true)
    expect(timeMatches('9:30 AM', 'not a time', '2130')).toBe(false)
  })
})
