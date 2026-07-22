import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import Icon from './Icon.vue'

describe('Icon', () => {
  it('est décorative par défaut (aria-hidden, sans role)', () => {
    const { container } = render(Icon, { props: { name: 'favorite' } })
    const icon = container.querySelector('.ds-icon') as HTMLElement
    expect(icon.getAttribute('aria-hidden')).toBe('true')
    expect(icon.getAttribute('role')).toBeNull()
  })

  it('avec label : role img + aria-label, sans aria-hidden', () => {
    const { getByRole } = render(Icon, { props: { name: 'warning', label: 'Attention' } })
    const icon = getByRole('img', { name: 'Attention' })
    expect(icon.getAttribute('aria-hidden')).toBeNull()
  })

  it('rend la ligature Material Symbols', () => {
    const { container } = render(Icon, { props: { name: 'close' } })
    const symbol = container.querySelector('.ds-icon-symbol') as HTMLElement
    expect(symbol.textContent).toBe('close')
  })

  it('src prime sur name et rend une image neutre (alt vide)', () => {
    const { container } = render(Icon, { props: { name: 'close', src: '/logo.png' } })
    const img = container.querySelector('img') as HTMLImageElement
    expect(img.getAttribute('src')).toBe('/logo.png')
    expect(img.getAttribute('alt')).toBe('')
    expect(container.querySelector('.ds-icon-symbol')).toBeNull()
  })

  it('rend le slot SVG sans src ni name', () => {
    const { container } = render(Icon, {
      slots: { default: '<svg viewBox="0 0 16 16" data-testid="svg-inline" />' },
    })
    expect(container.querySelector('[data-testid="svg-inline"]')).not.toBeNull()
  })

  it('prop size numérique : pose --ds-icon-size en style inline, sinon rien', () => {
    const explicite = render(Icon, { props: { name: 'add', size: 32 } })
    const iconExplicite = explicite.container.querySelector('.ds-icon') as HTMLElement
    expect(iconExplicite.style.getPropertyValue('--ds-icon-size')).toBe('32px')

    const contextuelle = render(Icon, { props: { name: 'add' } })
    const iconContextuelle = contextuelle.container.querySelector('.ds-icon') as HTMLElement
    expect(iconContextuelle.hasAttribute('style')).toBe(false)
  })
})
