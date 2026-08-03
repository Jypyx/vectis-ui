import { render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'

import VIcon from './VIcon.vue'
import { builtinIcons } from './icons'
import {
  classIconResolver,
  componentIconResolver,
  ligatureIconResolver,
  setIconResolver,
} from './resolver'

// The state is module-level (like VToast/state.ts): it survives from one test to the next.
afterEach(() => setIconResolver(undefined))

/** Fake component icon set (Lucide-style) — functional, so a single component
    declaration in the file as far as eslint-plugin-vue is concerned. With no
    declared `props`, a functional component receives EVERYTHING in its argument:
    the spread is what lands them on the SVG. */
const Lucide = (props: Record<string, unknown>) => h('svg', { 'data-testid': 'lucide', ...props })

const iconOf = (props: Record<string, unknown>) => render(VIcon, { props }).container

describe('setIconResolver', () => {
  it('comes BEFORE the built-in registry', () => {
    setIconResolver(() => ({ text: 'xmark' }))
    const container = iconOf({ name: 'close' })
    expect(container.querySelector('.v-icon-symbol')?.textContent).toBe('xmark')
    expect(container.querySelector('.v-icon-svg')).toBeNull()
  })

  it('undefined = "I do not know" → falls back to the registry, then the ligature', () => {
    setIconResolver(() => undefined)
    expect(iconOf({ name: 'close' }).querySelector('.v-icon-svg path')?.getAttribute('d')).toBe(
      builtinIcons.close[0],
    )
    expect(iconOf({ name: 'favorite' }).querySelector('.v-icon-symbol')?.textContent).toBe(
      'favorite',
    )
  })

  it('receives the raw name and the filled context', () => {
    const resolver = vi.fn(() => undefined)
    setIconResolver(resolver)
    iconOf({ name: 'mdi:close', filled: true })
    expect(resolver).toHaveBeenCalledWith('mdi:close', { filled: true })
  })

  it('setIconResolver(undefined) restores the default behaviour', () => {
    setIconResolver(() => ({ text: 'xmark' }))
    setIconResolver(undefined)
    expect(iconOf({ name: 'close' }).querySelector('.v-icon-svg')).not.toBeNull()
  })

  it('data-icon stays the REQUESTED name, whatever the source', () => {
    setIconResolver(() => ({ class: 'fa-solid fa-xmark' }))
    expect(iconOf({ name: 'close' }).querySelector('.v-icon')?.getAttribute('data-icon')).toBe(
      'close',
    )
  })

  describe('the five rendering shapes', () => {
    it('path: inline SVG, overridable viewBox', () => {
      setIconResolver(() => ({ path: 'M0 0h24v24H0z', viewBox: '0 0 24 24' }))
      const svg = iconOf({ name: 'close' }).querySelector('.v-icon-svg')
      expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24')
      expect(svg?.querySelector('path')?.getAttribute('d')).toBe('M0 0h24v24H0z')
    })

    it('component: rendered as-is, with its props', () => {
      setIconResolver(() => ({ component: Lucide, props: { 'stroke-width': 1.75 } }))
      const svg = iconOf({ name: 'close' }).querySelector('[data-testid="lucide"]')
      expect(svg?.getAttribute('stroke-width')).toBe('1.75')
    })

    it('src: a neutral image (empty alt)', () => {
      setIconResolver(() => ({ src: '/sprite.svg#close' }))
      const img = iconOf({ name: 'close' }).querySelector('.v-icon-img')
      expect(img?.getAttribute('src')).toBe('/sprite.svg#close')
      expect(img?.getAttribute('alt')).toBe('')
    })

    it('text: ligature or codepoint, optional class', () => {
      setIconResolver(() => ({ text: '', class: 'icomoon' }))
      const symbol = iconOf({ name: 'close' }).querySelector('.v-icon-symbol')
      expect(symbol?.textContent).toBe('')
      expect(symbol?.classList.contains('icomoon')).toBe(true)
    })

    it('class: a pseudo-element glyph, with no text', () => {
      setIconResolver(() => ({ class: 'ph ph-x' }))
      const glyph = iconOf({ name: 'close' }).querySelector('.v-icon-glyph')
      expect(glyph?.classList.contains('ph-x')).toBe(true)
      expect(glyph?.textContent).toBe('')
    })
  })
})

describe('ligatureIconResolver', () => {
  it('puts ALL the icons back on the ligature — including the registry ones', () => {
    setIconResolver(ligatureIconResolver())
    const container = iconOf({ name: 'close' })
    expect(container.querySelector('.v-icon-symbol')?.textContent).toBe('close')
    expect(container.querySelector('.v-icon-svg')).toBeNull()
  })

  it('applies the alias table', () => {
    setIconResolver(ligatureIconResolver({ aliases: { close: 'cancel' } }))
    expect(iconOf({ name: 'close' }).querySelector('.v-icon-symbol')?.textContent).toBe('cancel')
    expect(iconOf({ name: 'favorite' }).querySelector('.v-icon-symbol')?.textContent).toBe(
      'favorite',
    )
  })
})

describe('classIconResolver', () => {
  const resolver = (strict?: boolean) =>
    classIconResolver({
      aliases: { close: 'xmark' },
      className: (name, filled) => `${filled ? 'fa-solid' : 'fa-regular'} fa-${name}`,
      strict,
    })

  it('alias + filled variant', () => {
    setIconResolver(resolver())
    expect(iconOf({ name: 'close' }).querySelector('.v-icon-glyph')?.className).toBe(
      'v-icon-glyph fa-regular fa-xmark',
    )
    expect(
      iconOf({ name: 'close', filled: true }).querySelector('.v-icon-glyph')?.className,
    ).toContain('fa-solid')
  })

  it('the consumer names always pass, even outside the table', () => {
    setIconResolver(resolver())
    expect(iconOf({ name: 'house' }).querySelector('.v-icon-glyph')?.className).toContain(
      'fa-house',
    )
  })

  it('strict (the default): an un-aliased DS icon falls back to the embedded SVG', () => {
    // Without that guard, `swap_vert` would produce `fa-swap_vert` — an empty square.
    setIconResolver(resolver())
    expect(iconOf({ name: 'swap_vert' }).querySelector('.v-icon-svg')).not.toBeNull()

    setIconResolver(resolver(false))
    expect(iconOf({ name: 'swap_vert' }).querySelector('.v-icon-glyph')?.className).toContain(
      'fa-swap_vert',
    )
  })
})

describe('componentIconResolver', () => {
  it('renders the mapped component, with the props derived from the name', () => {
    setIconResolver(
      componentIconResolver({
        components: { close: Lucide },
        props: (name, filled) => ({ 'data-nom': name, 'data-filled': String(filled) }),
      }),
    )
    const svg = iconOf({ name: 'close', filled: true }).querySelector('[data-testid="lucide"]')
    expect(svg?.getAttribute('data-nom')).toBe('close')
    expect(svg?.getAttribute('data-filled')).toBe('true')
  })

  it('strict by construction: an unmapped name falls back to the registry', () => {
    setIconResolver(componentIconResolver({ components: { close: Lucide } }))
    expect(iconOf({ name: 'check' }).querySelector('.v-icon-svg')).not.toBeNull()
    expect(iconOf({ name: 'favorite' }).querySelector('.v-icon-symbol')?.textContent).toBe(
      'favorite',
    )
  })
})
