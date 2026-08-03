import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VProgressCircular from './VProgressCircular.vue'

/** Inline style of the root (the custom properties are set there). */
const styleOf = (container: Element) =>
  container.querySelector('.v-progress-circular')?.getAttribute('style') ?? ''

describe('VProgressCircular', () => {
  it('ARIA contract: the role, faithful bounds and a unitless fraction', () => {
    const { getByRole, container } = render(VProgressCircular, {
      props: { value: 30, max: 60 },
      attrs: { 'aria-label': 'Envoi' },
    })
    const bar = getByRole('progressbar', { name: 'Envoi' })
    expect(bar.getAttribute('aria-valuenow')).toBe('30')
    expect(bar.getAttribute('aria-valuemin')).toBe('0')
    // a faithful upper bound, with no normalization to 100
    expect(bar.getAttribute('aria-valuemax')).toBe('60')
    expect(styleOf(container)).toContain('--fill-fraction: 0.5')
  })

  it('clamps above the max and below zero', async () => {
    const { getByRole, container, rerender } = render(VProgressCircular, {
      props: { value: 250, max: 100 },
      attrs: { 'aria-label': 'x' },
    })
    expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100')
    expect(styleOf(container)).toContain('--fill-fraction: 1')
    await rerender({ value: -10 })
    expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0')
    expect(styleOf(container)).toContain('--fill-fraction: 0')
  })

  it('max: 0 ne produit ni NaN ni Infinity', () => {
    const { container } = render(VProgressCircular, {
      props: { value: 10, max: 0 },
      attrs: { 'aria-label': 'x' },
    })
    const style = styleOf(container)
    expect(style).toContain('--fill-fraction: 0')
    expect(style).not.toContain('NaN')
    expect(style).not.toContain('Infinity')
  })

  it('indeterminate: no aria-valuenow, data-indeterminate, no label', () => {
    const { getByRole, container } = render(VProgressCircular, {
      props: { indeterminate: true, showValue: true },
      attrs: { 'aria-label': 'Chargement' },
    })
    const bar = getByRole('progressbar')
    expect(bar.hasAttribute('aria-valuenow')).toBe(false)
    expect(bar.hasAttribute('data-indeterminate')).toBe(true)
    expect(container.querySelector('.v-progress-circular-label')).toBeNull()
    // always set, or the dashoffset's calc() would be invalid
    expect(styleOf(container)).toContain('--fill-fraction: 0')
  })

  it('size and thickness: a number → px, a string as-is, absent when not supplied', async () => {
    const { container, rerender } = render(VProgressCircular, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(styleOf(container)).not.toContain('--progress-diameter')
    expect(styleOf(container)).not.toContain('--progress-thickness')
    await rerender({ size: 96, thickness: 8 })
    expect(styleOf(container)).toContain('--progress-diameter: 96px')
    expect(styleOf(container)).toContain('--progress-thickness: 8px')
    // numeric strings: the same result, still pixels
    await rerender({ size: '96', thickness: '8' })
    expect(styleOf(container)).toContain('--progress-diameter: 96px')
    expect(styleOf(container)).toContain('--progress-thickness: 8px')
    // non-numeric values: ignored rather than invalid custom properties
    await rerender({ size: 'auto', thickness: 'auto' })
    expect(styleOf(container)).not.toContain('--progress-diameter')
    expect(styleOf(container)).not.toContain('--progress-thickness')
  })

  it('shape: rounded by default, square carried over', async () => {
    const { getByRole, rerender } = render(VProgressCircular, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(getByRole('progressbar').getAttribute('data-shape')).toBe('rounded')
    await rerender({ shape: 'square' })
    expect(getByRole('progressbar').getAttribute('data-shape')).toBe('square')
  })

  it('a decorative SVG: aria-hidden, and pathLength normalized on both circles', () => {
    const { container } = render(VProgressCircular, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(container.querySelector('.v-progress-circular-svg')!.getAttribute('aria-hidden')).toBe(
      'true',
    )
    const circles = [...container.querySelectorAll('circle')]
    expect(circles).toHaveLength(2)
    for (const circle of circles) expect(circle.getAttribute('pathLength')).toBe('100')
  })

  it('tone and custom colour', async () => {
    const { getByRole, container, rerender } = render(VProgressCircular, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(getByRole('progressbar').getAttribute('data-tone')).toBe('accent')
    expect(getByRole('progressbar').hasAttribute('data-custom')).toBe(false)
    await rerender({ tone: 'success', color: 'hotpink' })
    expect(getByRole('progressbar').getAttribute('data-tone')).toBe('success')
    expect(getByRole('progressbar').hasAttribute('data-custom')).toBe(true)
    expect(styleOf(container)).toContain('--custom-color: hotpink')
  })

  it('showValue: a single centred label, not hidden', () => {
    const { container } = render(VProgressCircular, {
      props: { value: 65, showValue: true },
      attrs: { 'aria-label': 'x' },
    })
    const labels = [...container.querySelectorAll('.v-progress-circular-label')]
    expect(labels).toHaveLength(1)
    expect(labels[0]!.textContent?.trim()).toBe('65%')
    expect(labels[0]!.hasAttribute('aria-hidden')).toBe(false)
  })

  it('the scoped slot: it receives value/max/percent and wins over showValue', () => {
    const { container } = render(VProgressCircular, {
      props: { value: 3, max: 8, showValue: true },
      attrs: { 'aria-label': 'x' },
      slots: {
        default:
          '<template #default="s">{{ s.value }}/{{ s.max }} — {{ Math.round(s.percent) }}</template>',
      },
    })
    const labels = [...container.querySelectorAll('.v-progress-circular-label')]
    expect(labels).toHaveLength(1)
    expect(labels[0]!.textContent?.trim()).toBe('3/8 — 38')
  })

  it('the accessible name comes from fallthrough, and the fraction stays private', () => {
    const { getByRole, container } = render(VProgressCircular, {
      props: { value: 40 },
      attrs: { 'aria-label': 'Name through fallthrough' },
    })
    // the name comes from aria-label through fallthrough, not from a dedicated `label` prop
    expect(getByRole('progressbar', { name: 'Name through fallthrough' })).toBeTruthy()
    // the fraction is a PRIVATE custom property: nothing public is exposed
    expect(styleOf(container)).not.toContain('--vectis-progress-value')
  })

  it('fallthrough: the consumer class, id and style coexist with the custom properties', () => {
    const { getByRole } = render(VProgressCircular, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x', class: 'my-donut', id: 'donut', style: 'margin: 4px' },
    })
    const bar = getByRole('progressbar')
    expect(bar.classList.contains('v-progress-circular')).toBe(true)
    expect(bar.classList.contains('my-donut')).toBe(true)
    expect(bar.id).toBe('donut')
    const style = bar.getAttribute('style') ?? ''
    expect(style).toContain('margin: 4px')
    expect(style).toContain('--fill-fraction: 0.4')
  })
})
