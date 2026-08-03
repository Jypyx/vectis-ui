import { render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'

import Icon from './Icon.vue'
import { builtinIcons } from './icons'
import {
  classIconResolver,
  componentIconResolver,
  ligatureIconResolver,
  setIconResolver,
} from './resolver'

// L'état est module-level (comme Toast/state.ts) : il survit d'un test à l'autre.
afterEach(() => setIconResolver(undefined))

/** Faux jeu d'icônes en composants (à la Lucide) — fonctionnel, donc une seule
    déclaration de composant dans le fichier au sens d'eslint-plugin-vue. Sans
    `props` déclarées, un composant fonctionnel reçoit TOUT dans son argument :
    le spread est ce qui les fait atterrir sur le SVG. */
const Lucide = (props: Record<string, unknown>) => h('svg', { 'data-testid': 'lucide', ...props })

const iconOf = (props: Record<string, unknown>) => render(Icon, { props }).container

describe('setIconResolver', () => {
  it('passe AVANT le registre intégré', () => {
    setIconResolver(() => ({ text: 'xmark' }))
    const container = iconOf({ name: 'close' })
    expect(container.querySelector('.v-icon-symbol')?.textContent).toBe('xmark')
    expect(container.querySelector('.v-icon-svg')).toBeNull()
  })

  it('undefined = « je ne connais pas » → repli sur le registre, puis la ligature', () => {
    setIconResolver(() => undefined)
    expect(iconOf({ name: 'close' }).querySelector('.v-icon-svg path')?.getAttribute('d')).toBe(
      builtinIcons.close[0],
    )
    expect(iconOf({ name: 'favorite' }).querySelector('.v-icon-symbol')?.textContent).toBe(
      'favorite',
    )
  })

  it('reçoit le nom brut et le contexte filled', () => {
    const resolver = vi.fn(() => undefined)
    setIconResolver(resolver)
    iconOf({ name: 'mdi:close', filled: true })
    expect(resolver).toHaveBeenCalledWith('mdi:close', { filled: true })
  })

  it('setIconResolver(undefined) restaure le comportement par défaut', () => {
    setIconResolver(() => ({ text: 'xmark' }))
    setIconResolver(undefined)
    expect(iconOf({ name: 'close' }).querySelector('.v-icon-svg')).not.toBeNull()
  })

  it('data-icon reste le nom DEMANDÉ, quelle que soit la source', () => {
    setIconResolver(() => ({ class: 'fa-solid fa-xmark' }))
    expect(iconOf({ name: 'close' }).querySelector('.v-icon')?.getAttribute('data-icon')).toBe(
      'close',
    )
  })

  describe('les cinq formes de rendu', () => {
    it('path : SVG inline, viewBox surchargeable', () => {
      setIconResolver(() => ({ path: 'M0 0h24v24H0z', viewBox: '0 0 24 24' }))
      const svg = iconOf({ name: 'close' }).querySelector('.v-icon-svg')
      expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24')
      expect(svg?.querySelector('path')?.getAttribute('d')).toBe('M0 0h24v24H0z')
    })

    it('component : rendu tel quel, avec ses props', () => {
      setIconResolver(() => ({ component: Lucide, props: { 'stroke-width': 1.75 } }))
      const svg = iconOf({ name: 'close' }).querySelector('[data-testid="lucide"]')
      expect(svg?.getAttribute('stroke-width')).toBe('1.75')
    })

    it('src : image neutre (alt vide)', () => {
      setIconResolver(() => ({ src: '/sprite.svg#close' }))
      const img = iconOf({ name: 'close' }).querySelector('.v-icon-img')
      expect(img?.getAttribute('src')).toBe('/sprite.svg#close')
      expect(img?.getAttribute('alt')).toBe('')
    })

    it('text : ligature ou codepoint, classe optionnelle', () => {
      setIconResolver(() => ({ text: '', class: 'icomoon' }))
      const symbol = iconOf({ name: 'close' }).querySelector('.v-icon-symbol')
      expect(symbol?.textContent).toBe('')
      expect(symbol?.classList.contains('icomoon')).toBe(true)
    })

    it('class : glyphe de pseudo-élément, sans texte', () => {
      setIconResolver(() => ({ class: 'ph ph-x' }))
      const glyph = iconOf({ name: 'close' }).querySelector('.v-icon-glyph')
      expect(glyph?.classList.contains('ph-x')).toBe(true)
      expect(glyph?.textContent).toBe('')
    })
  })
})

describe('ligatureIconResolver', () => {
  it('remet TOUTES les icônes en ligature — dont celles du registre', () => {
    setIconResolver(ligatureIconResolver())
    const container = iconOf({ name: 'close' })
    expect(container.querySelector('.v-icon-symbol')?.textContent).toBe('close')
    expect(container.querySelector('.v-icon-svg')).toBeNull()
  })

  it('applique la table d’alias', () => {
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
      className: (nom, filled) => `${filled ? 'fa-solid' : 'fa-regular'} fa-${nom}`,
      strict,
    })

  it('alias + variante filled', () => {
    setIconResolver(resolver())
    expect(iconOf({ name: 'close' }).querySelector('.v-icon-glyph')?.className).toBe(
      'v-icon-glyph fa-regular fa-xmark',
    )
    expect(
      iconOf({ name: 'close', filled: true }).querySelector('.v-icon-glyph')?.className,
    ).toContain('fa-solid')
  })

  it('les noms du consommateur passent toujours, même hors table', () => {
    setIconResolver(resolver())
    expect(iconOf({ name: 'house' }).querySelector('.v-icon-glyph')?.className).toContain(
      'fa-house',
    )
  })

  it('strict (défaut) : une icône du DS non aliasée retombe sur le SVG intégré', () => {
    // Sans ce garde-fou, `swap_vert` produirait `fa-swap_vert` — un carré vide.
    setIconResolver(resolver())
    expect(iconOf({ name: 'swap_vert' }).querySelector('.v-icon-svg')).not.toBeNull()

    setIconResolver(resolver(false))
    expect(iconOf({ name: 'swap_vert' }).querySelector('.v-icon-glyph')?.className).toContain(
      'fa-swap_vert',
    )
  })
})

describe('componentIconResolver', () => {
  it('rend le composant mappé, avec les props dérivées du nom', () => {
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

  it('strict par construction : un nom non mappé retombe sur le registre', () => {
    setIconResolver(componentIconResolver({ components: { close: Lucide } }))
    expect(iconOf({ name: 'check' }).querySelector('.v-icon-svg')).not.toBeNull()
    expect(iconOf({ name: 'favorite' }).querySelector('.v-icon-symbol')?.textContent).toBe(
      'favorite',
    )
  })
})
