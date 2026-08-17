import { describe, expect, it } from 'vitest'

import { hueOf } from './color'

describe('hueOf', () => {
  it('gives a hue on the wheel', () => {
    for (const id of ['a', 'meeting-1', 42, '', 'Ünïcødé']) {
      const hue = hueOf(id)
      expect(Number.isInteger(hue)).toBe(true)
      expect(hue).toBeGreaterThanOrEqual(0)
      expect(hue).toBeLessThan(360)
    }
  })

  it('gives the same event the same colour every time', () => {
    expect(hueOf('standup')).toBe(hueOf('standup'))
  })

  /*
   * An id makes the round trip through a consumer's JSON and may well come back as the
   * other type. If the two disagreed, an event would change colour on a page reload.
   */
  it('reads a number and the digits of that number as the same event', () => {
    expect(hueOf(42)).toBe(hueOf('42'))
  })

  /*
   * The whole reason the hash is multiplied before being taken modulo 360. A plain string
   * hash of "1", "2", "3" produces three CONSECUTIVE numbers, so a calendar whose events
   * are numbered in order would come out entirely one colour — with nothing in the console
   * to say so. This test fails if the golden constant is ever removed.
   */
  it('scatters consecutive ids across the wheel instead of bunching them', () => {
    const hues = Array.from({ length: 12 }, (_, i) => hueOf(String(i + 1)))
    for (let i = 1; i < hues.length; i++) {
      const gap = Math.abs(hues[i]! - hues[i - 1]!)
      // A neighbouring pair must be separated by more than a rounding error's worth of
      // colour. Consecutive hashes taken modulo directly would give a gap of exactly 1.
      expect(Math.min(gap, 360 - gap)).toBeGreaterThan(10)
    }
  })

  it('spreads a realistic set of ids over most of the wheel', () => {
    const ids = Array.from({ length: 40 }, (_, i) => `event-${i}`)
    const sixths = new Set(ids.map((id) => Math.floor(hueOf(id) / 60)))
    // Forty events should reach every sixth of the wheel; anything less is a hash that
    // clusters, which is what makes a calendar look monochrome.
    expect(sixths.size).toBe(6)
  })

  it('does not overflow into a negative hue on a long id', () => {
    expect(hueOf('a'.repeat(500))).toBeGreaterThanOrEqual(0)
  })
})
