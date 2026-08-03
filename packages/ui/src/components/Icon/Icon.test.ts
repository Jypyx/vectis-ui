import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import Icon from './Icon.vue'
import { builtinIcons } from './icons'

describe('Icon', () => {
  it('est décorative par défaut (aria-hidden, sans role)', () => {
    const { container } = render(Icon, { props: { name: 'favorite' } })
    const icon = container.querySelector('.v-icon') as HTMLElement
    expect(icon.getAttribute('aria-hidden')).toBe('true')
    expect(icon.getAttribute('role')).toBeNull()
  })

  it('avec label : role img + aria-label, sans aria-hidden', () => {
    const { getByRole } = render(Icon, { props: { name: 'warning', label: 'Attention' } })
    const icon = getByRole('img', { name: 'Attention' })
    expect(icon.getAttribute('aria-hidden')).toBeNull()
  })

  it('icône du registre intégré : SVG inline, sans dépendre d’une police', () => {
    const { container } = render(Icon, { props: { name: 'close' } })
    const path = container.querySelector('.v-icon-svg path') as SVGPathElement
    expect(path.getAttribute('d')).toBe(builtinIcons.close[0])
    expect(container.querySelector('.v-icon-symbol')).toBeNull()
  })

  it('nom hors registre : repli sur la ligature de la police du consommateur', () => {
    const { container } = render(Icon, { props: { name: 'favorite' } })
    const symbol = container.querySelector('.v-icon-symbol') as HTMLElement
    expect(symbol.textContent).toBe('favorite')
    expect(container.querySelector('svg')).toBeNull()
  })

  it('data-icon : posé quelle que soit la source effective', () => {
    const integree = render(Icon, { props: { name: 'close' } })
    expect(integree.container.querySelector('.v-icon')?.getAttribute('data-icon')).toBe('close')

    const ligature = render(Icon, { props: { name: 'favorite' } })
    expect(ligature.container.querySelector('.v-icon')?.getAttribute('data-icon')).toBe('favorite')

    const image = render(Icon, { props: { src: '/logo.png' } })
    expect(image.container.querySelector('.v-icon')?.hasAttribute('data-icon')).toBe(false)
  })

  it('filled : path plein quand la géométrie diffère, contour sinon', () => {
    const plein = render(Icon, { props: { name: 'check_circle', filled: true } })
    expect(plein.container.querySelector('.v-icon-svg path')?.getAttribute('d')).toBe(
      builtinIcons.check_circle[1],
    )

    // `close` n'a pas de variante FILL distincte : le contour sert aux deux.
    const trait = render(Icon, { props: { name: 'close', filled: true } })
    expect(trait.container.querySelector('.v-icon-svg path')?.getAttribute('d')).toBe(
      builtinIcons.close[0],
    )
  })

  it('src prime sur name et rend une image neutre (alt vide)', () => {
    const { container } = render(Icon, { props: { name: 'close', src: '/logo.png' } })
    const img = container.querySelector('img') as HTMLImageElement
    expect(img.getAttribute('src')).toBe('/logo.png')
    expect(img.getAttribute('alt')).toBe('')
    expect(container.querySelector('.v-icon-symbol')).toBeNull()
    expect(container.querySelector('svg')).toBeNull()
  })

  it('un nom contenant « / » ou « : » reste un NOM (plus aucune détection d’URL)', () => {
    // C'est ce qui permet aux conventions type Iconify (`mdi:close`) d'atteindre
    // le résolveur d'icônes au lieu de partir en <img>.
    const { container } = render(Icon, { props: { name: 'mdi:close' } })
    expect(container.querySelector('.v-icon-symbol')?.textContent).toBe('mdi:close')
    expect(container.querySelector('img')).toBeNull()
  })

  it('render : rendu explicite, prioritaire sur name et src', () => {
    const { container } = render(Icon, {
      props: { name: 'close', src: '/logo.png', render: { src: '/explicite.svg' } },
    })
    expect(container.querySelector('.v-icon-img')?.getAttribute('src')).toBe('/explicite.svg')
    expect(container.querySelector('.v-icon-svg')).toBeNull()
  })

  it('rend le slot SVG sans src ni name', () => {
    const { container } = render(Icon, {
      slots: { default: '<svg viewBox="0 0 16 16" data-testid="svg-inline" />' },
    })
    expect(container.querySelector('[data-testid="svg-inline"]')).not.toBeNull()
  })

  it('filled : pose data-filled sur la racine, absent par défaut', () => {
    const plein = render(Icon, { props: { name: 'favorite', filled: true } })
    const iconPlein = plein.container.querySelector('.v-icon') as HTMLElement
    expect(iconPlein.hasAttribute('data-filled')).toBe(true)

    const contour = render(Icon, { props: { name: 'favorite' } })
    const iconContour = contour.container.querySelector('.v-icon') as HTMLElement
    expect(iconContour.hasAttribute('data-filled')).toBe(false)
  })

  it('prop size numérique : pose --vectis-icon-size en style inline, sinon rien', () => {
    const explicite = render(Icon, { props: { name: 'add', size: 32 } })
    const iconExplicite = explicite.container.querySelector('.v-icon') as HTMLElement
    expect(iconExplicite.style.getPropertyValue('--vectis-icon-size')).toBe('32px')

    const contextuelle = render(Icon, { props: { name: 'add' } })
    const iconContextuelle = contextuelle.container.querySelector('.v-icon') as HTMLElement
    expect(iconContextuelle.hasAttribute('style')).toBe(false)
  })
})
