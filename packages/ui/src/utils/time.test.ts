import { describe, expect, it } from 'vitest'

import {
  DIAL_INNER_THRESHOLD,
  angleToIndex,
  dialIndexToHour24,
  distanceFraction,
  formatDisplay,
  formatTime,
  formatTimeMask,
  hour24ToDial,
  hourCycleFor,
  isValidTime,
  minutesOf,
  parseTime,
  parseTimeMask,
  snapMinute,
  timeCaret,
  timeList,
  timeToMask,
  to12h,
  to24h,
} from './time'

describe('isValidTime / parseTime / formatTime', () => {
  it('accepts the 00:00 and 23:59 bounds', () => {
    expect(isValidTime('00:00')).toBe(true)
    expect(isValidTime('23:59')).toBe(true)
    expect(parseTime('09:15')).toEqual({ hour: 9, minute: 15 })
  })

  it('rejects invalid formats', () => {
    expect(isValidTime('24:00')).toBe(false)
    expect(isValidTime('12:60')).toBe(false)
    expect(isValidTime('7:5')).toBe(false)
    expect(isValidTime('07:05:00')).toBe(false)
    expect(isValidTime(null)).toBe(false)
    expect(isValidTime(715)).toBe(false)
    expect(parseTime('24:00')).toBeNull()
    expect(parseTime(undefined)).toBeNull()
  })

  it('formats with leading zeroes', () => {
    expect(formatTime(7, 5)).toBe('07:05')
    expect(formatTime(0, 0)).toBe('00:00')
    expect(formatTime(23, 59)).toBe('23:59')
  })
})

describe('to12h / to24h', () => {
  it('handles the midnight and noon trap cases', () => {
    expect(to12h(0)).toEqual({ hour: 12, meridiem: 'AM' })
    expect(to12h(12)).toEqual({ hour: 12, meridiem: 'PM' })
    expect(to12h(23)).toEqual({ hour: 11, meridiem: 'PM' })
    expect(to24h(12, 'AM')).toBe(0)
    expect(to24h(12, 'PM')).toBe(12)
  })

  it('does an exact round trip over the 24 hours', () => {
    for (let h = 0; h < 24; h++) {
      const { hour, meridiem } = to12h(h)
      expect(to24h(hour, meridiem)).toBe(h)
    }
  })
})

describe('hourCycleFor', () => {
  it('derives the cycle from the locale', () => {
    expect(hourCycleFor('fr-FR')).toBe('24h')
    expect(hourCycleFor('en-US')).toBe('12h')
  })

  it('falls back to 24h for an invalid locale', () => {
    expect(hourCycleFor('not a locale !!')).toBe('24h')
  })
})

describe('formatDisplay', () => {
  it('displays in 24 h for fr-FR', () => {
    expect(formatDisplay('19:05', 'fr-FR', '24h')).toBe('19:05')
  })

  it('displays in 12 h with a meridiem for en-US', () => {
    const text = formatDisplay('19:05', 'en-US', '12h')
    expect(text).toContain('7:05')
    expect(text).toMatch(/PM/)
  })

  it('forces the cycle independently of the locale', () => {
    expect(formatDisplay('19:05', 'en-US', '24h')).toBe('19:05')
  })

  it('returns an empty string on invalid input', () => {
    expect(formatDisplay('25:00', 'fr-FR', '24h')).toBe('')
  })
})

describe('snapMinute', () => {
  it('snaps to the nearest multiple, modulo 60', () => {
    expect(snapMinute(32, 5)).toBe(30)
    expect(snapMinute(58, 5)).toBe(0)
    expect(snapMinute(13, 15)).toBe(15)
    expect(snapMinute(44, 1)).toBe(44)
  })
})

describe('angleToIndex', () => {
  it('resolves the four cardinal points (sector 0 at twelve, clockwise)', () => {
    expect(angleToIndex(0, -1, 12)).toBe(0) // haut
    expect(angleToIndex(1, 0, 12)).toBe(3) // droite
    expect(angleToIndex(0, 1, 12)).toBe(6) // bas
    expect(angleToIndex(-1, 0, 12)).toBe(9) // gauche
  })

  it("rounds to the nearest sector and wraps around twelve o'clock", () => {
    // Just before twelve on the left (~ -1°): comes back to sector 0, not 12.
    expect(angleToIndex(-0.01, -1, 12)).toBe(0)
    // Halfway between 1 and 2 o'clock (45°): tips to the upper sector (round).
    expect(angleToIndex(1, -1, 12)).toBe(2)
  })

  it('works with 60 segments (minutes)', () => {
    expect(angleToIndex(1, 0, 60)).toBe(15)
    expect(angleToIndex(0, 1, 60)).toBe(30)
  })
})

describe('distanceFraction', () => {
  it('normalizes the distance by the radius', () => {
    expect(distanceFraction(0, 0, 128)).toBe(0)
    expect(distanceFraction(128, 0, 128)).toBe(1)
    expect(distanceFraction(0, 64, 128)).toBe(0.5)
    expect(distanceFraction(10, 10, 0)).toBe(0)
  })

  it('has an inner threshold coherent with the dial tokens', () => {
    expect(DIAL_INNER_THRESHOLD).toBeGreaterThan(0)
    expect(DIAL_INNER_THRESHOLD).toBeLessThan(1)
  })
})

describe('dialIndexToHour24 / hour24ToDial', () => {
  it('maps the M3 layout: outer 12,1..11 — inner 00,13..23', () => {
    expect(dialIndexToHour24(0, 'outer')).toBe(12)
    expect(dialIndexToHour24(1, 'outer')).toBe(1)
    expect(dialIndexToHour24(11, 'outer')).toBe(11)
    expect(dialIndexToHour24(0, 'inner')).toBe(0)
    expect(dialIndexToHour24(1, 'inner')).toBe(13)
    expect(dialIndexToHour24(11, 'inner')).toBe(23)
  })

  it('does an exact round trip over the 24 hours', () => {
    for (let h = 0; h < 24; h++) {
      const { index, ring } = hour24ToDial(h)
      expect(dialIndexToHour24(index, ring)).toBe(h)
    }
  })
})

describe('minutesOf', () => {
  it('converts a valid time to minutes since midnight', () => {
    expect(minutesOf('00:00')).toBe(0)
    expect(minutesOf('09:15')).toBe(555)
    expect(minutesOf('23:59')).toBe(1439)
  })

  it('returns null on an absent or invalid time', () => {
    expect(minutesOf(null)).toBeNull()
    expect(minutesOf('25:00')).toBeNull()
  })
})

describe('timeList', () => {
  it('covers the whole day at the requested step', () => {
    const half = timeList(30, 'fr-FR', '24h')
    expect(half).toHaveLength(48)
    expect(half[0]?.value).toBe('00:00')
    expect(half.at(-1)?.value).toBe('23:30')
    expect(timeList(15, 'fr-FR', '24h')).toHaveLength(96)
  })

  it('localizes the labels according to the format', () => {
    // The same formatting as the field (`formatDisplay`): what you pick in the
    // list is exactly what will be shown — hence "0:30" and not "00:30".
    expect(timeList(30, 'fr-FR', '24h')[1]?.label).toBe('0:30')
    expect(timeList(30, 'fr-FR', '24h')[28]?.label).toBe('14:00')
    expect(timeList(60, 'en-US', '12h')[9]?.label).toMatch(/AM/)
  })

  it('falls back to a step of 60 on an invalid one (the list must stay finite)', () => {
    expect(timeList(0, 'fr-FR', '24h')).toHaveLength(24)
    expect(timeList(7.5, 'fr-FR', '24h')).toHaveLength(24)
    expect(timeList(90, 'fr-FR', '24h')).toHaveLength(24)
  })
})

describe('HH:MM mask', () => {
  it('places the colon as soon as the hour is complete', () => {
    expect(formatTimeMask('')).toBe('')
    expect(formatTimeMask('0')).toBe('0')
    expect(formatTimeMask('09')).toBe('09:')
    expect(formatTimeMask('093')).toBe('09:3')
    expect(formatTimeMask('0930')).toBe('09:30')
    expect(formatTimeMask('093012')).toBe('09:30') // extra digits are ignored
  })

  it('places the caret in closed form, stepping over the separator while typing', () => {
    expect(timeCaret(0)).toBe(0)
    expect(timeCaret(1)).toBe(1)
    expect(timeCaret(2)).toBe(2) // deletion: stays before the ":"
    expect(timeCaret(2, true)).toBe(3) // insertion: enters the minutes
    expect(timeCaret(3)).toBe(4)
    expect(timeCaret(4)).toBe(5)
  })

  it('formats a canonical value according to the displayed format', () => {
    expect(timeToMask('19:05', '24h')).toBe('19:05')
    expect(timeToMask('19:05', '12h')).toBe('07:05') // the meridiem lives outside the mask
    expect(timeToMask('00:30', '12h')).toBe('12:30')
    expect(timeToMask(null, '24h')).toBe('')
  })

  it('parses in 24 h and rejects the impossible', () => {
    expect(parseTimeMask('09:30', '24h')).toBe('09:30')
    expect(parseTimeMask('0930', '24h')).toBe('09:30')
    expect(parseTimeMask('24:00', '24h')).toBeNull()
    expect(parseTimeMask('09:60', '24h')).toBeNull()
    expect(parseTimeMask('09:3', '24h')).toBeNull() // incomplete
    expect(parseTimeMask('', '24h')).toBeNull()
  })

  it('parses in 12 h with the meridiem from the VToggle', () => {
    expect(parseTimeMask('07:00', '12h', 'PM')).toBe('19:00')
    expect(parseTimeMask('12:00', '12h', 'AM')).toBe('00:00')
    expect(parseTimeMask('12:00', '12h', 'PM')).toBe('12:00')
    expect(parseTimeMask('00:30', '12h', 'AM')).toBeNull() // 0 is outside 1–12
    expect(parseTimeMask('13:00', '12h', 'PM')).toBeNull()
  })
})
