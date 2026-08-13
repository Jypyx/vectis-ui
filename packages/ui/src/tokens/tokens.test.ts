/*
 * The token layer's only automated guard.
 *
 * CI already runs `tokens:check`, but that compares the generated artefacts against the
 * source byte for byte: it catches a stale `tokens.css`, never a wrong token. These tests
 * cover the other half — the shape of the palettes, which are transcribed by hand from
 * Tailwind's stylesheet, and the two invariants the generator relies on (an alias points at
 * something that exists; a theme reassigns a role and never invents one).
 */
import { describe, expect, it } from 'vitest'

import { flattenTokens, resolveTokenValue } from './css'
import { tokens } from './index'
import { isToken, type TokenGroup } from './types'

const { primitives, semantic } = tokens
const dark = tokens.themes.dark

/** The 26 families Tailwind CSS 4 ships, in its own order. */
const FAMILIES = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'mauve',
  'olive',
  'mist',
  'taupe',
]

const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']

describe('the colour palettes', () => {
  it('ships the 26 Tailwind families, plus white and black', () => {
    expect(Object.keys(primitives.color)).toEqual(['white', 'black', ...FAMILIES])
  })

  it.each(FAMILIES)('%s carries exactly the 11 canonical steps, all in OKLCH', (family) => {
    const palette = primitives.color[family as keyof typeof primitives.color] as TokenGroup

    expect(Object.keys(palette)).toEqual(STEPS)
    for (const step of STEPS) {
      const token = palette[step]
      expect(token).toBeDefined()
      expect(isToken(token!)).toBe(true)
      expect((token as { $value: string }).$value).toMatch(/^oklch\(/)
    }
  })
})

describe('the duration scale', () => {
  it('names every step after the milliseconds it holds', () => {
    for (const [name, token] of Object.entries(primitives.duration)) {
      expect(token.$value).toBe(`${name}ms`)
    }
  })

  it('gives the three motion roles a step of that scale', () => {
    // These are what a `transition` reaches for; a role pointing at a value of its own
    // would put a fourth duration on the page that no other component could name.
    const steps = new Set(Object.keys(primitives.duration).map((n) => `{duration.${n}}`))

    for (const token of Object.values(semantic.duration)) {
      expect(steps).toContain(token.$value)
    }
  })
})

describe('flattenTokens', () => {
  it('builds a custom property name by joining the path', () => {
    const names = new Set(flattenTokens(primitives).map((f) => f.cssName))

    expect(names).toContain('--vectis-color-gray-500')
    expect(names).toContain('--vectis-font-size-2xl')
    // A key that already holds a dash simply concatenates, which is what makes `in-out`
    // and `heading-1` come out right.
    expect(names).toContain('--vectis-ease-in-out')
    expect(new Set(flattenTokens(semantic).map((f) => f.cssName))).toContain(
      '--vectis-text-heading-1-size',
    )
  })

  it('accepts a prefix so a sub-tree rebuilds its full name (what Tokens.mdx does)', () => {
    const flat = flattenTokens(primitives.color.gray, ['color', 'gray'])

    expect(flat[0]?.cssName).toBe('--vectis-color-gray-50')
  })
})

describe('resolveTokenValue', () => {
  const known = new Set(
    [...flattenTokens(primitives), ...flattenTokens(semantic)].map((f) => f.cssName),
  )

  it('rewrites an alias as a var() reference rather than inlining the value', () => {
    expect(resolveTokenValue('{color.gray.500}', known)).toBe('var(--vectis-color-gray-500)')
  })

  it('throws on an alias that points at nothing', () => {
    // Left to CSS, a dangling reference resolves to nothing at all and the declaration is
    // silently dropped — hence a build error instead.
    expect(() => resolveTokenValue('{color.gray.42}', known)).toThrow(/Unknown token alias/)
  })

  it('resolves every alias the semantic layer and the dark theme write', () => {
    for (const { token } of [...flattenTokens(semantic), ...flattenTokens(dark)]) {
      expect(() => resolveTokenValue(token.$value, known)).not.toThrow()
    }
  })
})

describe('the dark theme', () => {
  it('only reassigns roles that already exist', () => {
    // A token existing in one theme alone would leave a component unstyled in the other.
    const roles = new Set(flattenTokens(semantic).map((f) => f.cssName))

    for (const { cssName } of flattenTokens(dark)) {
      expect(roles).toContain(cssName)
    }
  })
})
