import { describe, expect, it } from 'vitest'

import {
  addDays,
  addMonths,
  buildMonthGrid,
  caretAfterDigits,
  clampISO,
  compareISO,
  dateMaskFor,
  formatDateMask,
  formatDisplayRange,
  isoToMask,
  isValidISO,
  isWithin,
  maskPlaceholder,
  monthNames,
  monthNamesCompact,
  parseDateMask,
  parseISO,
  weekdayNames,
} from './date'

describe('utils/date', () => {
  it('validates and parses an ISO in local time (no UTC drift)', () => {
    expect(isValidISO('2026-06-10')).toBe(true)
    expect(isValidISO('2026-13-01')).toBe(false)
    expect(isValidISO('2026-02-30')).toBe(false)
    expect(isValidISO('boom')).toBe(false)
    const d = parseISO('2026-06-10')!
    // the local day really is the 10th (not shifted by the time zone)
    expect(d.getDate()).toBe(10)
    expect(d.getMonth()).toBe(5)
  })

  it('adds days and months with carry and end-of-month clamping', () => {
    expect(addDays('2026-06-30', 1)).toBe('2026-07-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
    // 31 January + 1 month → 28 February (clamped), not March
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
    const grid = buildMonthGrid(2026, 5, 1) // June 2026, week starting on Monday
    expect(grid).toHaveLength(42)
    // contains both 1 and 30 June, marked as in-month
    const inMonth = grid.filter((c) => c.adjacent === null)
    expect(inMonth).toHaveLength(30)
  })

  it('produces localized names that are independent of the time zone', () => {
    expect(monthNames('fr-FR', 'long')[5]).toBe('juin')
    // first day of week Monday → Monday first
    expect(weekdayNames('fr-FR', 1, 'long')[0]?.toLowerCase()).toContain('lundi')
  })

  it('abbreviates the months: whole if ≤4 characters, otherwise 3 + a dot', () => {
    const m = monthNamesCompact('fr-FR')
    expect(m[4]).toBe('mai') // 3 chars → kept whole
    expect(m[5]).toBe('juin') // 4 chars → kept whole
    expect(m[7]).toBe('août') // 4 chars (the accent counts as 1) → kept whole
    expect(m[0]).toBe('jan.') // "janvier" → 3 + a dot
    expect(m[1]).toBe('fév.') // "février" → 3 + a dot
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
    // hu-HU formats "2021. 11. 22.": a literal with a space, plus a trailing one.
    expect(dateMaskFor('hu-HU').separator).toBe('.')
    // ar-EG prefixes its "/" with a U+200F bidi mark.
    expect(dateMaskFor('ar-EG').separator).toBe('/')
    // fa-IR would return a Persian year (1400) without `calendar: 'gregory'`.
    expect(isoToMask('2026-06-10', dateMaskFor('fa-IR'))).toBe('2026/06/10')
    // invalid locale (RangeError) → day/month/year "/" fallback
    expect(dateMaskFor('fr_FR')).toEqual(FR)
  })

  it('places the separator as soon as the previous field is full', () => {
    expect(formatDateMask('', FR)).toBe('')
    expect(formatDateMask('1', FR)).toBe('1')
    expect(formatDateMask('22', FR)).toBe('22/')
    expect(formatDateMask('221', FR)).toBe('22/1')
    expect(formatDateMask('2211', FR)).toBe('22/11/')
    expect(formatDateMask('22112021', FR)).toBe('22/11/2021')
    // beyond the template, extra digits are ignored
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
    expect(parseDateMask('29/02/2026', FR)).toBeNull() // non bissextile
    expect(parseDateMask('29/02/2024', FR)).toBe('2024-02-29')
    expect(parseDateMask('10/06/202', FR)).toBeNull() // incomplet
    expect(parseDateMask('10/06/20261', FR)).toBeNull() // chiffres en trop
    expect(parseDateMask('', FR)).toBeNull()
  })

  it('expands a 2-digit year only when a pivot is provided', () => {
    expect(parseDateMask('10/06/26', FR)).toBeNull()
    expect(parseDateMask('10/06/26', FR, { yearPivot: 2000 })).toBe('2026-06-10')
    expect(parseDateMask('10/06/00', FR, { yearPivot: 2000 })).toBe('2000-06-10')
    // year first (ja-JP): no shortcut possible, it stays at 4 digits
    expect(parseDateMask('26/06/10', dateMaskFor('ja-JP'), { yearPivot: 2000 })).toBeNull()
  })

  it('puts the caret back on the nth digit, stepping over the separator while typing', () => {
    expect(caretAfterDigits('22/11/2021', 0)).toBe(0)
    expect(caretAfterDigits('22/11/2021', 2)).toBe(2)
    expect(caretAfterDigits('22/11/2021', 2, '/')).toBe(3) // insertion: enters the next field
    expect(caretAfterDigits('22/', 2, '/')).toBe(3)
    expect(caretAfterDigits('22/11/2021', 99)).toBe(10) // beyond → end of the text
  })

  it('derives a placeholder template from the localized field names', () => {
    expect(maskPlaceholder('fr-FR', FR)).toBe('jj/mm/aaaa')
    expect(maskPlaceholder('en-US', dateMaskFor('en-US'))).toBe('mm/dd/yyyy')
    expect(maskPlaceholder('de-DE', dateMaskFor('de-DE'))).toBe('tt.mm.jjjj')
    // ideographic script ("日日/月月/年年年年" would be unreadable) → Latin fallback
    expect(maskPlaceholder('ja-JP', dateMaskFor('ja-JP'))).toBe('yyyy/mm/dd')
  })
})
