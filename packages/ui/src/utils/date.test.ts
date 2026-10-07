import { describe, expect, it } from 'vitest'

import {
  addDays,
  addMonths,
  buildMonthGrid,
  clampISO,
  compareISO,
  formatDisplayRange,
  isDateAllowed,
  isValidISO,
  isWithin,
  isoOf,
  parseISO,
  weekdayNames,
} from './date'
import {
  caretAfterDigits,
  dateMaskFor,
  formatDateMask,
  isoToMask,
  maskPlaceholder,
  parseDateMask,
} from '../components/VDateInput/mask'
import { monthName, monthNames, monthNamesCompact } from '../components/VDatePicker/names'

describe('utils/date', () => {
  it('validates and parses an ISO in local time (no UTC drift)', () => {
    expect(isValidISO('2026-06-10')).toBe(true)
    expect(isValidISO('2026-13-01')).toBe(false)
    expect(isValidISO('2026-02-30')).toBe(false)
    expect(isValidISO('boom')).toBe(false)
    const d = parseISO('2026-06-10')!
    expect(d.getDate()).toBe(10)
    expect(d.getMonth()).toBe(5)
  })

  it('adds days and months with carry and end-of-month clamping', () => {
    expect(addDays('2026-06-30', 1)).toBe('2026-07-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28')
  })

  it('compares, clamps and tests membership of an interval', () => {
    expect(compareISO('2026-06-10', '2026-06-11')).toBe(-1)
    expect(clampISO('2026-06-01', '2026-06-05', '2026-06-20')).toBe('2026-06-05')
    expect(clampISO('2026-06-25', '2026-06-05', '2026-06-20')).toBe('2026-06-20')
    expect(isWithin('2026-06-10', '2026-06-05', '2026-06-20')).toBe(true)
    expect(isWithin('2026-06-30', '2026-06-05', '2026-06-20')).toBe(false)
  })

  it('builds a 42-cell grid for a month', () => {
    const grid = buildMonthGrid(2026, 5, 1)
    expect(grid).toHaveLength(42)
    const inMonth = grid.filter((c) => c.adjacent === null)
    expect(inMonth).toHaveLength(30)
  })

  it('produces localized names that are independent of the time zone', () => {
    expect(monthNames('fr-FR')[5]).toBe('juin')
    expect(weekdayNames('fr-FR', 1, 'long')[0]?.toLowerCase()).toContain('lundi')
  })

  it('abbreviates the months: whole if ≤4 characters, otherwise 3 + a dot', () => {
    const m = monthNamesCompact('fr-FR')
    expect(m[4]).toBe('mai')
    expect(m[5]).toBe('juin')
    expect(m[7]).toBe('août')
    expect(m[0]).toBe('jan.')
    expect(m[1]).toBe('fév.')
  })

  it('formats a range through Intl.formatRange', () => {
    const out = formatDisplayRange('2026-06-19', '2026-06-26', 'fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    expect(out).toContain('19')
    expect(out).toContain('26')
  })
})

describe('utils/date — input mask', () => {
  const FR = dateMaskFor('fr-FR')

  it('derives the field order and the separator from the locale', () => {
    expect(FR.order).toEqual(['day', 'month', 'year'])
    expect(FR.separator).toBe('/')
    expect(dateMaskFor('en-US').order).toEqual(['month', 'day', 'year'])
    expect(dateMaskFor('ja-JP').order).toEqual(['year', 'month', 'day'])
    expect(dateMaskFor('de-DE').separator).toBe('.')
    expect(dateMaskFor('sv-SE').separator).toBe('-')
  })

  it('cleans exotic separators and forces the Gregorian calendar', () => {
    expect(dateMaskFor('hu-HU').separator).toBe('.')
    expect(dateMaskFor('ar-EG').separator).toBe('/')
    // Fa-IR would return a Persian year (1400) without `calendar: 'gregory'`.
    expect(isoToMask('2026-06-10', dateMaskFor('fa-IR'))).toBe('2026/06/10')
    // Invalid locale (RangeError) → day/month/year "/" fallback
    expect(dateMaskFor('fr_FR')).toEqual(FR)
  })

  it('places the separator as soon as the previous field is full', () => {
    expect(formatDateMask('', FR)).toBe('')
    expect(formatDateMask('1', FR)).toBe('1')
    expect(formatDateMask('22', FR)).toBe('22/')
    expect(formatDateMask('221', FR)).toBe('22/1')
    expect(formatDateMask('2211', FR)).toBe('22/11/')
    expect(formatDateMask('22112021', FR)).toBe('22/11/2021')
    expect(formatDateMask('221120215', FR)).toBe('22/11/2021')
  })

  it('formats an ISO following the locale order', () => {
    expect(isoToMask('2026-06-10', FR)).toBe('10/06/2026')
    expect(isoToMask('2026-06-10', dateMaskFor('en-US'))).toBe('06/10/2026')
    expect(isoToMask('2026-06-10', dateMaskFor('ja-JP'))).toBe('2026/06/10')
    expect(isoToMask('boom', FR)).toBe('')
  })

  it('parses masked input and rejects the impossible', () => {
    expect(parseDateMask('10/06/2026', FR)).toBe('2026-06-10')
    expect(parseDateMask('06/10/2026', dateMaskFor('en-US'))).toBe('2026-06-10')
    expect(parseDateMask('31/02/2026', FR)).toBeNull()
    expect(parseDateMask('29/02/2026', FR)).toBeNull()
    expect(parseDateMask('29/02/2024', FR)).toBe('2024-02-29')
    expect(parseDateMask('10/06/202', FR)).toBeNull()
    expect(parseDateMask('10/06/20261', FR)).toBeNull()
    expect(parseDateMask('', FR)).toBeNull()
  })

  it('expands a 2-digit year only when a pivot is provided', () => {
    expect(parseDateMask('10/06/26', FR)).toBeNull()
    expect(parseDateMask('10/06/26', FR, { yearPivot: 2000 })).toBe('2026-06-10')
    expect(parseDateMask('10/06/00', FR, { yearPivot: 2000 })).toBe('2000-06-10')
    expect(parseDateMask('26/06/10', dateMaskFor('ja-JP'), { yearPivot: 2000 })).toBeNull()
  })

  it('puts the caret back on the nth digit, stepping over the separator while typing', () => {
    expect(caretAfterDigits('22/11/2021', 0)).toBe(0)
    expect(caretAfterDigits('22/11/2021', 2)).toBe(2)
    expect(caretAfterDigits('22/11/2021', 2, '/')).toBe(3)
    expect(caretAfterDigits('22/', 2, '/')).toBe(3)
    expect(caretAfterDigits('22/11/2021', 99)).toBe(10)
  })

  it('derives a placeholder template from the localized field names', () => {
    expect(maskPlaceholder('fr-FR', FR)).toBe('jj/mm/aaaa')
    expect(maskPlaceholder('en-US', dateMaskFor('en-US'))).toBe('mm/dd/yyyy')
    expect(maskPlaceholder('de-DE', dateMaskFor('de-DE'))).toBe('tt.mm.jjjj')
    // Ideographic script ("日日/月月/年年年年" would be unreadable) → Latin fallback
    expect(maskPlaceholder('ja-JP', dateMaskFor('ja-JP'))).toBe('yyyy/mm/dd')
  })
})

describe('parseISO', () => {
  /*
   * A date that does not exist must read as no date at all, or a picker handed `2026-02-31`
   * displays a day nobody gave it.
   */
  it('refuses a day the month does not have instead of rolling it over', () => {
    expect(parseISO('2026-02-31')).toBeNull()
    expect(parseISO('2026-13-01')).toBeNull()
    expect(parseISO('2026-06-00')).toBeNull()
  })

  it('still reads a real date, a leap day included', () => {
    expect(parseISO('2028-02-29')?.getDate()).toBe(29)
    expect(parseISO('2027-02-29')).toBeNull()
  })

  it('moves nothing through addDays when the date is impossible', () => {
    expect(addDays('2026-02-31', 0)).toBe('2026-02-31')
  })
})

describe('isDateAllowed', () => {
  it('asks the bounds and the exclusion together', () => {
    const excluded = (iso: string) => iso === '2026-06-12'
    expect(isDateAllowed('2026-06-10', '2026-06-01', '2026-06-30', excluded)).toBe(true)
    expect(isDateAllowed('2026-05-31', '2026-06-01', '2026-06-30', excluded)).toBe(false)
    expect(isDateAllowed('2026-07-01', '2026-06-01', '2026-06-30', excluded)).toBe(false)
    expect(isDateAllowed('2026-06-12', undefined, undefined, excluded)).toBe(false)
  })
})

describe('buildMonthGrid', () => {
  it('carries the day of the month on every square, across both neighbouring months', () => {
    const cells = buildMonthGrid(2026, 5, 1)
    for (const cell of cells) expect(cell.day).toBe(parseISO(cell.iso)!.getDate())
    expect(cells[0]).toEqual({ iso: '2026-06-01', day: 1, adjacent: null })
    expect(cells.at(-1)).toEqual({ iso: '2026-07-12', day: 12, adjacent: 'next' })
  })
})

describe('utils/date — names and far years', () => {
  it('the compact month names never repeat, and stay as they were where they did not', () => {
    for (const locale of ['vi-VN', 'et-EE', 'cs-CZ', 'lt-LT', 'el-GR', 'hy-AM', 'mn-MN']) {
      expect([locale, new Set(monthNamesCompact(locale)).size]).toEqual([locale, 12])
    }
    expect(monthNamesCompact('en-US').slice(0, 6)).toEqual([
      'Jan.',
      'Feb.',
      'Mar.',
      'Apr.',
      'May',
      'June',
    ])
  })

  it('names the months of the Gregorian calendar whatever the locale calendar is', () => {
    const gregorian = new Intl.DateTimeFormat('fa-IR', {
      month: 'long',
      calendar: 'gregory',
      timeZone: 'UTC',
    }).format(Date.UTC(2021, 0, 1))
    expect(monthNames('fa-IR')[0]).toBe(gregorian)
    expect(monthName('fa-IR', 0)).toBe(gregorian)
    expect(monthName('en-US-u-ca-islamic', 0)).toBe('January')
  })

  it('reads and writes a year below 1000 as it is', () => {
    expect(parseISO('0050-01-01')?.getFullYear()).toBe(50)
    expect(isoOf(999, 0, 10)).toBe('0999-01-10')
    expect(isValidISO('0050-01-01')).toBe(true)
  })
})

describe('formatDisplayRange and the ICU in use', () => {
  it('writes the spaces around the dash as plain spaces, whatever the engine', () => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' } as const
    const out = formatDisplayRange('2026-01-05', '2026-01-11', 'en-GB', options)
    expect(out).not.toMatch(/[\u2009\u200A]/)
    expect(out).toContain('5')
    expect(out).toContain('11')
  })
})

describe('formatDisplayRange given its ends the wrong way round', () => {
  it('writes the range in order rather than a nonsense span', () => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' } as const
    expect(formatDisplayRange('2026-06-26', '2026-06-19', 'en-US', options)).toBe(
      formatDisplayRange('2026-06-19', '2026-06-26', 'en-US', options),
    )
  })
})
