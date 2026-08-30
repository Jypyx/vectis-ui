import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VIcon from './VIcon.vue'
import { setIconResolver } from './resolver'
import { check_circle as checkCircleIcon } from './icons/check_circle'
import { close as closeIcon } from './icons/close'

describe('VIcon', () => {
  it('is decorative by default (aria-hidden, no role)', () => {
    const { container } = render(VIcon, { props: { name: 'favorite' } })
    const icon = container.querySelector('.v-icon') as HTMLElement
    expect(icon.getAttribute('aria-hidden')).toBe('true')
    expect(icon.getAttribute('role')).toBeNull()
  })

  it('with a label: role img + aria-label, no aria-hidden', () => {
    const { getByRole } = render(VIcon, { props: { name: 'warning', label: 'Attention' } })
    const icon = getByRole('img', { name: 'Attention' })
    expect(icon.getAttribute('aria-hidden')).toBeNull()
  })

  it("one of the DS's own icons: inline SVG, with no font dependency", () => {
    const { container } = render(VIcon, { props: { name: closeIcon } })
    const path = container.querySelector('.v-icon-svg path') as SVGPathElement
    expect(path.getAttribute('d')).toBe(closeIcon.paths[0])
    expect(container.querySelector('.v-icon-symbol')).toBeNull()
  })

  it('a bare NAME carries no drawing, even one the DS ships', () => {
    // The deliberate half of the split: an icon reaches a bundle because a module
    // imported it, never because a string might one day ask for it. `close` is
    // shipped, and asking for it by name still lands on the ligature.
    const { container } = render(VIcon, { props: { name: 'close' } })
    expect(container.querySelector('.v-icon-symbol')?.textContent).toBe('close')
    expect(container.querySelector('.v-icon-svg')).toBeNull()
  })

  it("a resolver still wins over one of the DS's own icons", () => {
    // THE invariant of the split. The drawing travels with its NAME, so a consumer
    // who wired in their own icon library moves the design system's internals across
    // with one `setIconResolver` call — where a bare `{ path }` default would take
    // the `render` route and never be offered to them.
    setIconResolver(() => ({ text: 'xmark' }))
    const { container } = render(VIcon, { props: { name: closeIcon } })
    expect(container.querySelector('.v-icon-symbol')?.textContent).toBe('xmark')
    expect(container.querySelector('.v-icon-svg')).toBeNull()
    setIconResolver(undefined)
  })

  it("name outside the registry: falls back to the consumer font's ligature", () => {
    const { container } = render(VIcon, { props: { name: 'favorite' } })
    const symbol = container.querySelector('.v-icon-symbol') as HTMLElement
    expect(symbol.textContent).toBe('favorite')
    expect(container.querySelector('svg')).toBeNull()
  })

  it('data-icon: set whatever the effective source is', () => {
    const integree = render(VIcon, { props: { name: closeIcon } })
    expect(integree.container.querySelector('.v-icon')?.getAttribute('data-icon')).toBe('close')

    const ligature = render(VIcon, { props: { name: 'favorite' } })
    expect(ligature.container.querySelector('.v-icon')?.getAttribute('data-icon')).toBe('favorite')

    const image = render(VIcon, { props: { src: '/logo.png' } })
    expect(image.container.querySelector('.v-icon')?.hasAttribute('data-icon')).toBe(false)
  })

  it('filled: the filled path when the geometry differs, the outline otherwise', () => {
    const plein = render(VIcon, { props: { name: checkCircleIcon, filled: true } })
    expect(plein.container.querySelector('.v-icon-svg path')?.getAttribute('d')).toBe(
      checkCircleIcon.paths[1],
    )

    // `close` has no distinct FILL variant: the outline serves both.
    const trait = render(VIcon, { props: { name: closeIcon, filled: true } })
    expect(trait.container.querySelector('.v-icon-svg path')?.getAttribute('d')).toBe(
      closeIcon.paths[0],
    )
  })

  it('src wins over name and renders a neutral image (empty alt)', () => {
    const { container } = render(VIcon, { props: { name: 'close', src: '/logo.png' } })
    const img = container.querySelector('img') as HTMLImageElement
    expect(img.getAttribute('src')).toBe('/logo.png')
    expect(img.getAttribute('alt')).toBe('')
    expect(container.querySelector('.v-icon-symbol')).toBeNull()
    expect(container.querySelector('svg')).toBeNull()
  })

  it('a name containing "/" or ":" stays a NAME (no URL detection)', () => {
    // This is what lets Iconify-style conventions (`mdi:close`) reach the icon
    // resolver instead of going out as an <img>.
    const { container } = render(VIcon, { props: { name: 'mdi:close' } })
    expect(container.querySelector('.v-icon-symbol')?.textContent).toBe('mdi:close')
    expect(container.querySelector('img')).toBeNull()
  })

  it('render: explicit render, taking precedence over name and src', () => {
    const { container } = render(VIcon, {
      props: { name: 'close', src: '/logo.png', render: { src: '/explicite.svg' } },
    })
    expect(container.querySelector('.v-icon-img')?.getAttribute('src')).toBe('/explicite.svg')
    expect(container.querySelector('.v-icon-svg')).toBeNull()
  })

  it('renders the SVG slot when there is neither src nor name', () => {
    const { container } = render(VIcon, {
      slots: { default: '<svg viewBox="0 0 16 16" data-testid="svg-inline" />' },
    })
    expect(container.querySelector('[data-testid="svg-inline"]')).not.toBeNull()
  })

  it('filled: sets data-filled on the root, absent by default', () => {
    const plein = render(VIcon, { props: { name: 'favorite', filled: true } })
    const iconPlein = plein.container.querySelector('.v-icon') as HTMLElement
    expect(iconPlein.hasAttribute('data-filled')).toBe(true)

    const contour = render(VIcon, { props: { name: 'favorite' } })
    const iconContour = contour.container.querySelector('.v-icon') as HTMLElement
    expect(iconContour.hasAttribute('data-filled')).toBe(false)
  })

  it('numeric size prop: sets --vectis-icon-size as an inline style, nothing otherwise', () => {
    const explicite = render(VIcon, { props: { name: 'add', size: 32 } })
    const iconExplicite = explicite.container.querySelector('.v-icon') as HTMLElement
    expect(iconExplicite.style.getPropertyValue('--vectis-icon-size')).toBe('32px')

    const contextuelle = render(VIcon, { props: { name: 'add' } })
    const iconContextuelle = contextuelle.container.querySelector('.v-icon') as HTMLElement
    expect(iconContextuelle.hasAttribute('style')).toBe(false)
  })
})
