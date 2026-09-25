import { describe, expect, it } from 'vitest'
import { Fragment, createCommentVNode, createTextVNode, h } from 'vue'

import { toggleValue } from './array'
import { cssSize, px } from './css'
import { joinIds } from './ids'
import { resolveMatcher } from './matcher'
import { clamp } from './number'
import { createNormalizedCache, digitsOf, normalizeText, pad2 } from './text'
import { flattenSlot } from './vnode'

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

  // `parseFloat` reads a numeric PREFIX, so a length in another unit came out in pixels:
  // `12rem` silently became `12px`.
  it('refuses a string that is not wholly a number, and an empty one', () => {
    expect(px('12rem')).toBeUndefined()
    expect(px('12px')).toBeUndefined()
    expect(px('')).toBeUndefined()
    expect(px('  ')).toBeUndefined()
    expect(px(' 8 ')).toBe('8px')
    expect(px(Number.NaN)).toBeUndefined()
  })
})

describe('normalizeText', () => {
  it('ignores case and accents', () => {
    expect(normalizeText('Éléphant')).toBe('elephant')
    expect(normalizeText('ÀÇÜñ')).toBe('acun')
  })
})

describe('createNormalizedCache', () => {
  it('normalizes once per owner and field, and again when the text changes', () => {
    const owner = { label: 'Éclair' }
    const normalizedOf = createNormalizedCache<typeof owner>()
    expect(normalizedOf(owner, owner.label)).toBe('eclair')
    expect(normalizedOf(owner, 'Brûlé', 'other')).toBe('brule')
    // Edited in place: the raw text no longer matches what was remembered.
    owner.label = 'Émile'
    expect(normalizedOf(owner, owner.label)).toBe('emile')
    expect(normalizedOf(owner, 'Brûlé', 'other')).toBe('brule')
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

describe('flattenSlot', () => {
  it('unwraps a Fragment (a v-for) and keeps the elements in order', () => {
    const nodes = flattenSlot([h('i'), h(Fragment, null, [h('b'), h('em')]), h('s')])
    expect(nodes.map((node) => node.type)).toEqual(['i', 'b', 'em', 's'])
  })

  it('drops comments (a false v-if) and whitespace, keeps real text', () => {
    const nodes = flattenSlot([
      createTextVNode('\n  '),
      createCommentVNode('v-if'),
      createTextVNode('x'),
      h('i'),
    ])
    expect(nodes).toHaveLength(2)
  })

  it('an absent slot is an empty list, never a throw', () => {
    expect(flattenSlot(undefined)).toEqual([])
  })
})

describe('joinIds', () => {
  it('joins the references present, dropping every empty one by truthiness', () => {
    expect(joinIds('own', undefined, false, '', null, 'hint')).toBe('own hint')
  })

  it('is undefined rather than an empty string when nothing is left', () => {
    expect(joinIds(undefined, '', false)).toBeUndefined()
  })
})

describe('cssSize on what is not a size', () => {
  // A computed width gone wrong must leave the component's own default in force, as px does.
  it('gives nothing for a number that is not a finite, positive one, or for an empty string', () => {
    expect(cssSize(Number.NaN)).toBeUndefined()
    expect(cssSize(Number.POSITIVE_INFINITY)).toBeUndefined()
    expect(cssSize(-5)).toBeUndefined()
    expect(cssSize('')).toBeUndefined()
    expect(cssSize(0)).toBe('0px')
    expect(cssSize('50%')).toBe('50%')
  })
})
