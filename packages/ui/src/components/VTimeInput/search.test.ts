import { describe, expect, it } from 'vitest'

import { timeMatches } from './search'

/**
 * The rule is pure, so what is worth locking is the handful of entries it must accept and
 * the handful it must refuse. The refusals are the half that matters: a search accepting
 * everything is the same as no search at all.
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
    // Padded or not: a 24-hour clock writes "09:30" and a 12-hour one "9:30", and the
    // reader may well type either whichever is on screen.
    expect(nineThirtyAm('0930')).toBe(true)
    expect(twentyFour('930')).toBe(true)
    expect(twentyFour('0930')).toBe(true)
  })

  it('the digit route only ever adds to the substring one', () => {
    // "30" is a substring of the label, so it returns every half past the hour — the
    // ordinary behaviour of a search box, which the digit route does not narrow.
    expect(nineThirtyAm('30')).toBe(true)
    expect(twelve('10:35 AM', '10:35')('35')).toBe(true)
  })

  it('matches a digit run from its START, never from inside it', () => {
    // "035" sits in the middle of 10:35's digits and nowhere in its label, the colon
    // breaking the run. Red with `includes` in place of `startsWith`.
    expect(twelve('10:35 AM', '10:35')('035')).toBe(false)
  })

  /*
   * The runs compared against are only ever ones the reader could have READ. Deriving a
   * 12-hour reading of a 24-hour label would make one search answer twice.
   */
  it('never reads a 24 hour label as a 12 hour one', () => {
    expect(timeMatches('21:30', '21:30', '930')).toBe(false)
    expect(timeMatches('21:30', '21:30', '2130')).toBe(true)
    // The way round that IS offered: canonical digits reach a row written on a 12-hour clock.
    expect(nineThirtyPm('2130')).toBe(true)
  })

  it('letters typed alongside the digits still have to be in the label', () => {
    expect(nineThirtyPm('930pm')).toBe(true)
    expect(nineThirtyAm('930pm')).toBe(false)
    // With no letters typed, both halves of the day answer.
    expect(nineThirtyAm('930')).toBe(true)
    expect(nineThirtyPm('930')).toBe(true)
  })

  it('refuses what matches neither the words nor the digits', () => {
    expect(nineThirtyAm('7')).toBe(false)
    expect(nineThirtyAm('lunch')).toBe(false)
  })

  /*
   * What the reader SEES is what they search: the value only ever adds the canonical form
   * as one more way in, so a row whose value is unreadable still answers to its label.
   */
  it('leans on the label, the value being only an extra way in', () => {
    expect(timeMatches('9:30 AM', 'not a time', '930')).toBe(true)
    expect(timeMatches('9:30 AM', 'not a time', '2130')).toBe(false)
  })
})
