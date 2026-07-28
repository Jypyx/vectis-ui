import { describe, expect, it } from 'vitest'

import { toggleValue } from './array'
import { px } from './css'
import { resolveMatcher } from './matcher'
import { clamp } from './number'
import { normalizeText, pad2 } from './text'

describe('clamp', () => {
  it('borne aux deux extrémités et laisse passer l’intervalle', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
    expect(clamp(42, 0, 10)).toBe(10)
    expect(clamp(3, 0, 10)).toBe(3)
  })

  it('min gagne sur un intervalle vide (max dérivé d’une liste vide)', () => {
    expect(clamp(5, 0, -1)).toBe(0)
  })
})

describe('px', () => {
  it('accepte nombre et chaîne numérique', () => {
    expect(px(12)).toBe('12px')
    expect(px('12')).toBe('12px')
    expect(px('12.5')).toBe('12.5px')
  })

  it('rend undefined plutôt qu’une custom property invalide', () => {
    expect(px(undefined)).toBeUndefined()
    expect(px('auto')).toBeUndefined()
  })
})

describe('normalizeText', () => {
  it('ignore casse et accents', () => {
    expect(normalizeText('Éléphant')).toBe('elephant')
    expect(normalizeText('ÀÇÜñ')).toBe('acun')
  })
})

describe('pad2', () => {
  it('complète à deux chiffres sans tronquer au-delà', () => {
    expect(pad2(0)).toBe('00')
    expect(pad2(7)).toBe('07')
    expect(pad2(23)).toBe('23')
    expect(pad2(120)).toBe('120')
  })
})

describe('toggleValue', () => {
  it('ajoute en fin puis retire', () => {
    expect(toggleValue(['a'], 'b')).toEqual(['a', 'b'])
    expect(toggleValue(['a', 'b'], 'a')).toEqual(['b'])
  })

  it('ne mute jamais la liste source', () => {
    const source = ['a']
    const next = toggleValue(source, 'b')
    expect(source).toEqual(['a'])
    expect(next).not.toBe(source)
  })
})

describe('resolveMatcher', () => {
  it('undefined ne désactive rien', () => {
    expect(resolveMatcher(undefined)('x')).toBe(false)
  })

  it('résout un tableau par appartenance', () => {
    const match = resolveMatcher([1, 3])
    expect(match(1)).toBe(true)
    expect(match(2)).toBe(false)
  })

  it('rend le prédicat tel quel', () => {
    const predicate = (n: number) => n % 2 === 0
    expect(resolveMatcher(predicate)).toBe(predicate)
  })
})
