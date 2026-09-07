import { describe, expect, it } from 'vitest'

import {
  allowedMinutesFor,
  firstAllowed,
  isHourAllowed,
  isTimeAllowed,
  limitsProblem,
  nearestAllowedMinute,
  nearestAllowedTime,
  resolveLimits,
} from './limits'
import type { TimeLimits } from './limits'

/** The restrictions as a component resolves them, with everything left open by default. */
const limitsOf = (props: Partial<Parameters<typeof resolveLimits>[0]> = {}): TimeLimits =>
  resolveLimits({ minuteStep: 1, ...props })

describe('time limits', () => {
  it('allows everything when nothing is restricted', () => {
    const limits = limitsOf()
    expect(isTimeAllowed(0, 0, limits)).toBe(true)
    expect(isTimeAllowed(23, 59, limits)).toBe(true)
    expect(limitsProblem(limits)).toBeNull()
  })

  it('takes a list as readily as a rule', () => {
    // The two forms are the design system's convention for this kind of prop, and a
    // component must not care which of them it was handed.
    const list = limitsOf({ allowedHours: [9, 10, 11] })
    const rule = limitsOf({ allowedHours: (hour) => hour >= 9 && hour <= 11 })
    for (const hour of [8, 9, 11, 12])
      expect(isTimeAllowed(hour, 0, list)).toBe(isTimeAllowed(hour, 0, rule))
    expect(isTimeAllowed(8, 0, list)).toBe(false)
    expect(isTimeAllowed(9, 0, list)).toBe(true)
  })

  it('compares the bounds as the clock reads them', () => {
    // A canonical time is zero-padded and fixed-width, which is the whole reason a string
    // comparison is exact here: '09:30' has to fall before '17:00'.
    const limits = limitsOf({ min: '09:30', max: '17:00' })
    expect(isTimeAllowed(9, 29, limits)).toBe(false)
    expect(isTimeAllowed(9, 30, limits)).toBe(true)
    expect(isTimeAllowed(17, 0, limits)).toBe(true)
    expect(isTimeAllowed(17, 1, limits)).toBe(false)
  })

  it('closes an hour only when nothing is left in it', () => {
    // The point of the whole exercise: a bound cuts an hour in half rather than removing
    // it, so nine o'clock stays reachable and it is its first minutes that go.
    const limits = limitsOf({ min: '09:30' })
    expect(isHourAllowed(9, limits)).toBe(true)
    expect(isHourAllowed(8, limits)).toBe(false)
    expect(allowedMinutesFor(9, limits)).toHaveLength(30)
    expect(allowedMinutesFor(9, limits)[0]).toBe(30)
  })

  it('reads an hour against the interval the minutes are reachable on', () => {
    // Only the minutes a step can land on count as somewhere to go: at a quarter of an
    // hour, a bound at 09:50 leaves nine o'clock with nothing.
    expect(isHourAllowed(9, limitsOf({ min: '09:50', minuteStep: 15 }))).toBe(false)
    expect(isHourAllowed(9, limitsOf({ min: '09:50', minuteStep: 5 }))).toBe(true)
  })

  it('finds the nearest minute an hour allows, the earlier one on a tie', () => {
    const limits = limitsOf({ allowedMinutes: [0, 30] })
    expect(nearestAllowedMinute(9, 20, limits)).toBe(30)
    expect(nearestAllowedMinute(9, 10, limits)).toBe(0)
    // 15 is as far from one as from the other, and walking the clock forward past a time
    // the reader could have meant is the worse of the two answers.
    expect(nearestAllowedMinute(9, 15, limits)).toBe(0)
    expect(nearestAllowedMinute(9, 0, limitsOf({ allowedHours: [10] }))).toBeNull()
  })

  it('finds the nearest time of the day, crossing the hour to do it', () => {
    expect(nearestAllowedTime(7, 30, limitsOf({ min: '09:00' }))).toBe('09:00')
    expect(nearestAllowedTime(23, 0, limitsOf({ max: '17:00' }))).toBe('17:00')
    expect(nearestAllowedTime(12, 0, limitsOf())).toBe('12:00')
    expect(nearestAllowedTime(12, 0, limitsOf({ allowedHours: [] }))).toBeNull()
  })

  it('walks a cycle until something is allowed, and gives up after a full turn', () => {
    // What makes a key skip a hole rather than die in it — and what keeps it from looping
    // for ever when there is no hole to come out of.
    const hours = [9, 10, 11, 14]
    const allowed = (hour: number) => hours.includes(hour)
    expect(firstAllowed(23, (i) => (11 + i) % 24, allowed)).toBe(14)
    expect(firstAllowed(23, (i) => (11 - i + 24) % 24, allowed)).toBe(10)
    expect(
      firstAllowed(
        23,
        (i) => (11 + i) % 24,
        () => false,
      ),
    ).toBeNull()
  })

  it('names what is wrong with a set of restrictions, and nothing when it is sound', () => {
    expect(limitsProblem(limitsOf({ min: '09:00', max: '17:00' }))).toBeNull()
    expect(limitsProblem(limitsOf({ min: '17:00', max: '09:00' }))).toContain('falls after max')
    expect(limitsProblem(limitsOf({ allowedMinutes: [7], minuteStep: 15 }))).toContain(
      'no time that can be chosen',
    )
  })
})
