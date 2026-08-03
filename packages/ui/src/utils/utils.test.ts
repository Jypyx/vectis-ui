import { describe, expect, it } from 'vitest'

import { toggleValue } from './array'
import { px } from './css'
import { resolveMatcher } from './matcher'
import { clamp } from './number'
import { digitsOf, normalizeText, pad2 } from './text'

describe('clamp', () => {
  it('clamps at both ends and lets the interval through', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
    expect(clamp(42, 0, 10)).toBe(10)
    expect(clamp(3, 0, 10)).toBe(3)
  })

  it('min wins on an empty interval (max derived from an empty list)', () => {
    expect(clamp(5, 0, -1)).toBe(0)
  })
})

describe('px', () => {
  it('accepts a number and a numeric string', () => {
    expect(px(12)).toBe('12px')
    expect(px('12')).toBe('12px')
    expect(px('12.5')).toBe('12.5px')
  })

  it('returns undefined rather than an invalid custom property', () => {
    expect(px(undefined)).toBeUndefined()
    expect(px('auto')).toBeUndefined()
  })
})

describe('normalizeText', () => {
  it('ignores case and accents', () => {
    expect(normalizeText('Éléphant')).toBe('elephant')
    expect(normalizeText('ÀÇÜñ')).toBe('acun')
  })
})

describe('pad2', () => {
  it('pads to two digits without truncating beyond', () => {
    expect(pad2(0)).toBe('00')
    expect(pad2(7)).toBe('07')
    expect(pad2(23)).toBe('23')
    expect(pad2(120)).toBe('120')
  })
})

describe('digitsOf', () => {
  it('keeps only the digits (the masks place their own separators)', () => {
    expect(digitsOf('10/06/2026')).toBe('10062026')
    expect(digitsOf('09:30')).toBe('0930')
    expect(digitsOf('')).toBe('')
    expect(digitsOf('abc')).toBe('')
  })
})

describe('toggleValue', () => {
  it('appends then removes', () => {
    expect(toggleValue(['a'], 'b')).toEqual(['a', 'b'])
    expect(toggleValue(['a', 'b'], 'a')).toEqual(['b'])
  })

  it('never mutates the source list', () => {
    const source = ['a']
    const next = toggleValue(source, 'b')
    expect(source).toEqual(['a'])
    expect(next).not.toBe(source)
  })
})

describe('resolveMatcher', () => {
  it('undefined disables nothing', () => {
    expect(resolveMatcher(undefined)('x')).toBe(false)
  })

  it('resolves an array through membership', () => {
    const match = resolveMatcher([1, 3])
    expect(match(1)).toBe(true)
    expect(match(2)).toBe(false)
  })

  it('returns the predicate as-is', () => {
    const predicate = (n: number) => n % 2 === 0
    expect(resolveMatcher(predicate)).toBe(predicate)
  })
})
