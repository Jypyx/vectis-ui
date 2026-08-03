import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VSkeletonLoader from './VSkeletonLoader.vue'

/** Root of the component (it carries the variant table and the dimensions). */
const rootOf = (container: Element) => container.querySelector('.v-skeleton') as HTMLElement

/** Inline style of the root (the custom properties are set there). */
const styleOf = (container: Element) => rootOf(container).getAttribute('style') ?? ''

const itemsOf = (container: Element) => container.querySelectorAll('.v-skeleton-item')

describe('VSkeletonLoader', () => {
  it('defaults: text shape, md size, wave animation, a single silhouette', () => {
    const { container } = render(VSkeletonLoader)
    const root = rootOf(container)

    expect(root.getAttribute('data-shape')).toBe('text')
    expect(root.getAttribute('data-size')).toBe('md')
    expect(root.getAttribute('data-animation')).toBe('wave')
    expect(itemsOf(container)).toHaveLength(1)
  })

  it('carries the v-control class: without it --control-height is undefined and the height collapses', () => {
    const { container } = render(VSkeletonLoader)
    expect(rootOf(container).classList.contains('v-control')).toBe(true)
  })

  it('lines: one silhouette per line', async () => {
    const { container, rerender } = render(VSkeletonLoader, { props: { lines: 4 } })
    expect(itemsOf(container)).toHaveLength(4)

    await rerender({ lines: 2 })
    expect(itemsOf(container)).toHaveLength(2)
  })

  it('lines is floored at one whole line: 0, negative and decimal', async () => {
    const { container, rerender } = render(VSkeletonLoader, { props: { lines: 0 } })
    // `v-for="n in 0"` would render nothing: an invisible skeleton, hence a silent bug
    expect(itemsOf(container)).toHaveLength(1)

    await rerender({ lines: -3 })
    expect(itemsOf(container)).toHaveLength(1)

    await rerender({ lines: 3.7 })
    expect(itemsOf(container)).toHaveLength(3)
  })

  it('shape and animation are reflected as data-*', async () => {
    const { container, rerender } = render(VSkeletonLoader, { props: { shape: 'circle' } })
    expect(rootOf(container).getAttribute('data-shape')).toBe('circle')

    await rerender({ shape: 'surface', animation: 'none' })
    expect(rootOf(container).getAttribute('data-shape')).toBe('surface')
    // the attribute stays set: the consumer can target [data-animation='none']
    expect(rootOf(container).getAttribute('data-animation')).toBe('none')
  })

  it('compact sets data-compact, otherwise the attribute is absent', async () => {
    const { container, rerender } = render(VSkeletonLoader)
    expect(rootOf(container).hasAttribute('data-compact')).toBe(false)

    await rerender({ compact: true })
    expect(rootOf(container).hasAttribute('data-compact')).toBe(true)
  })

  it('width/height: a number → px, a CSS string as-is, absent → no custom property', async () => {
    const { container, rerender } = render(VSkeletonLoader)
    expect(styleOf(container)).not.toContain('--skeleton-w')
    expect(styleOf(container)).not.toContain('--skeleton-h')

    await rerender({ width: 200, height: 48 })
    expect(styleOf(container)).toContain('--skeleton-w: 200px')
    expect(styleOf(container)).toContain('--skeleton-h: 48px')

    // a free unit, unlike `px()`: the string is not interpreted
    await rerender({ width: '100%', height: '12ch' })
    expect(styleOf(container)).toContain('--skeleton-w: 100%')
    expect(styleOf(container)).toContain('--skeleton-h: 12ch')
    expect(styleOf(container)).not.toContain('NaN')
  })

  it('color sets data-custom and --custom-color; otherwise neither', async () => {
    const { container, rerender } = render(VSkeletonLoader)
    expect(rootOf(container).hasAttribute('data-custom')).toBe(false)
    expect(styleOf(container)).not.toContain('--custom-color')

    await rerender({ color: 'oklch(60% 0.2 250)' })
    expect(rootOf(container).hasAttribute('data-custom')).toBe(true)
    expect(rootOf(container).style.getPropertyValue('--custom-color')).toBe('oklch(60% 0.2 250)')
  })

  it('decorative by default: aria-hidden, no role, no text', () => {
    const { container, queryByRole } = render(VSkeletonLoader)

    expect(rootOf(container).getAttribute('aria-hidden')).toBe('true')
    expect(queryByRole('status')).toBeNull()
    expect(rootOf(container).textContent).toBe('')
  })

  it('announce: role="status", the dictionary label and aria-hidden removed', () => {
    const { container, getByRole } = render(VSkeletonLoader, { props: { announce: true } })

    expect(getByRole('status').textContent).toContain('Loading…')
    expect(rootOf(container).hasAttribute('aria-hidden')).toBe(false)
  })

  it('label implies announce and wins over the dictionary', () => {
    const { getByRole } = render(VSkeletonLoader, { props: { label: 'Loading the results…' } })
    // `announce` is not supplied: without the implication, the prop would be inert
    expect(getByRole('status').textContent).toContain('Loading the results…')
  })

  it('the hidden label is rendered BEFORE the silhouettes', () => {
    // The `.v-skeleton-item + .v-skeleton-item:last-child` selector depends on it: a
    // label rendered last would stop the last line being shortened without any other
    // test going red.
    const { container } = render(VSkeletonLoader, { props: { announce: true, lines: 3 } })
    const first = rootOf(container).firstElementChild as HTMLElement

    expect(first.classList.contains('v-visually-hidden')).toBe(true)
    expect(rootOf(container).lastElementChild?.classList.contains('v-skeleton-item')).toBe(true)
  })

  it('fallthrough: the consumer class, id and style coexist with the custom properties', () => {
    const { container } = render(VSkeletonLoader, {
      props: { width: 120 },
      attrs: { class: 'my-class', id: 'loading', style: 'margin-block: 8px' },
    })
    const root = rootOf(container)

    expect(root.classList.contains('my-class')).toBe(true)
    expect(root.classList.contains('v-skeleton')).toBe(true)
    expect(root.getAttribute('id')).toBe('loading')
    expect(styleOf(container)).toContain('margin-block: 8px')
    expect(styleOf(container)).toContain('--skeleton-w: 120px')
  })
})
