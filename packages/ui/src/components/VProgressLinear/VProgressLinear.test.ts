import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VProgressLinear from './VProgressLinear.vue'

/** Inline style of the root (the custom properties are set there). */
const styleOf = (container: Element) =>
  container.querySelector('.v-progress-linear')?.getAttribute('style') ?? ''

describe('VProgressLinear', () => {
  it('ARIA contract: the role, faithful bounds and a unitless fraction', () => {
    const { getByRole, container } = render(VProgressLinear, {
      props: { value: 30, max: 60 },
      attrs: { 'aria-label': 'Progress' },
    })
    const bar = getByRole('progressbar')
    expect(bar.getAttribute('aria-valuenow')).toBe('30')
    expect(bar.getAttribute('aria-valuemin')).toBe('0')
    // a faithful upper bound ("30 of 60"), with no normalization to 100
    expect(bar.getAttribute('aria-valuemax')).toBe('60')
    expect(styleOf(container)).toContain('--fill-fraction: 0.5')
  })

  it('clamps above the max', () => {
    const { getByRole, container } = render(VProgressLinear, {
      props: { value: 250, max: 100 },
      attrs: { 'aria-label': 'x' },
    })
    expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100')
    expect(styleOf(container)).toContain('--fill-fraction: 1')
  })

  it('clamps below zero', () => {
    const { getByRole, container } = render(VProgressLinear, {
      props: { value: -10 },
      attrs: { 'aria-label': 'x' },
    })
    expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0')
    expect(styleOf(container)).toContain('--fill-fraction: 0')
  })

  it('max: 0 produces neither NaN nor Infinity', () => {
    const { container } = render(VProgressLinear, {
      props: { value: 10, max: 0 },
      attrs: { 'aria-label': 'x' },
    })
    const style = styleOf(container)
    expect(style).toContain('--fill-fraction: 0')
    expect(style).not.toContain('NaN')
    expect(style).not.toContain('Infinity')
  })

  it('indeterminate: no aria-valuenow, data-indeterminate, --fill-fraction always set', () => {
    const { getByRole, container } = render(VProgressLinear, {
      props: { indeterminate: true },
      attrs: { 'aria-label': 'Loading' },
    })
    const bar = getByRole('progressbar')
    expect(bar.hasAttribute('aria-valuenow')).toBe(false)
    expect(bar.hasAttribute('data-indeterminate')).toBe(true)
    // always set, or calc(100% * var(--fill-fraction)) would be invalid
    expect(styleOf(container)).toContain('--fill-fraction: 0')
  })

  it('indeterminate: showValue is ignored (no text rendered)', () => {
    const { container } = render(VProgressLinear, {
      props: { indeterminate: true, showValue: true },
      attrs: { 'aria-label': 'x' },
    })
    expect(container.querySelectorAll('.v-progress-linear-text')).toHaveLength(0)
  })

  it('tone: accent by default, an explicit value carried over', async () => {
    const { getByRole, rerender } = render(VProgressLinear, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(getByRole('progressbar').getAttribute('data-tone')).toBe('accent')
    await rerender({ tone: 'warning' })
    expect(getByRole('progressbar').getAttribute('data-tone')).toBe('warning')
  })

  it('custom colour: data-custom + --custom-color (both absent otherwise)', async () => {
    const { getByRole, container, rerender } = render(VProgressLinear, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(getByRole('progressbar').hasAttribute('data-custom')).toBe(false)
    expect(styleOf(container)).not.toContain('--custom-color')
    await rerender({ color: 'hotpink' })
    expect(getByRole('progressbar').hasAttribute('data-custom')).toBe(true)
    expect(styleOf(container)).toContain('--custom-color: hotpink')
  })

  it('thickness: a number → px, a string as-is, absent when not supplied', async () => {
    const { container, rerender } = render(VProgressLinear, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(styleOf(container)).not.toContain('--progress-thickness')
    await rerender({ thickness: 12 })
    expect(styleOf(container)).toContain('--progress-thickness: 12px')
    // a numeric string: the same result, still pixels
    await rerender({ thickness: '12' })
    expect(styleOf(container)).toContain('--progress-thickness: 12px')
    // a non-numeric value: ignored rather than an invalid custom property
    await rerender({ thickness: 'auto' })
    expect(styleOf(container)).not.toContain('--progress-thickness')
  })

  it('shape: rounded by default, square carried over', async () => {
    const { getByRole, rerender } = render(VProgressLinear, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(getByRole('progressbar').getAttribute('data-shape')).toBe('rounded')
    await rerender({ shape: 'square' })
    expect(getByRole('progressbar').getAttribute('data-shape')).toBe('square')
  })

  it('orientation: data-orientation set only when vertical', async () => {
    const { getByRole, rerender } = render(VProgressLinear, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(getByRole('progressbar').hasAttribute('data-orientation')).toBe(false)
    await rerender({ orientation: 'vertical' })
    expect(getByRole('progressbar').getAttribute('data-orientation')).toBe('vertical')
  })

  it('showValue: two copies of the text, only the clipped one is aria-hidden', () => {
    const { container } = render(VProgressLinear, {
      props: { value: 50, showValue: true },
      attrs: { 'aria-label': 'x' },
    })
    const copies = [...container.querySelectorAll('.v-progress-linear-text')]
    expect(copies).toHaveLength(2)
    for (const copy of copies) expect(copy.textContent?.trim()).toBe('50%')
    // the base copy: announced by no one (children presentational) but not hidden
    expect(copies[0]!.hasAttribute('data-on-fill')).toBe(false)
    expect(copies[0]!.hasAttribute('aria-hidden')).toBe(false)
    // the contrasted copy: it duplicates visible text → hidden
    expect(copies[1]!.hasAttribute('data-on-fill')).toBe(true)
    expect(copies[1]!.getAttribute('aria-hidden')).toBe('true')
  })

  it('minimal DOM: the root IS the track, the fill its only child', () => {
    const { getByRole, container } = render(VProgressLinear, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    const root = getByRole('progressbar')
    expect(root.classList.contains('v-progress-linear')).toBe(true)
    // no intermediate track element
    expect(container.querySelector('.v-progress-linear-track')).toBeNull()
    expect(root.children).toHaveLength(1)
    expect(root.firstElementChild!.classList.contains('v-progress-linear-fill')).toBe(true)
  })

  it('showValue: the percentage is rounded and derived from max', () => {
    const { container } = render(VProgressLinear, {
      props: { value: 1, max: 3, showValue: true },
      attrs: { 'aria-label': 'x' },
    })
    expect(container.querySelector('.v-progress-linear-text')?.textContent?.trim()).toBe('33%')
  })

  it('the scoped slot: it receives value/max/percent and wins over showValue', () => {
    const { container } = render(VProgressLinear, {
      props: { value: 30, max: 60, showValue: true },
      attrs: { 'aria-label': 'x' },
      slots: {
        default: '<template #default="s">{{ s.value }}/{{ s.max }} — {{ s.percent }}</template>',
      },
    })
    const copies = [...container.querySelectorAll('.v-progress-linear-text')]
    expect(copies).toHaveLength(2)
    for (const copy of copies) expect(copy.textContent?.trim()).toBe('30/60 — 50')
  })

  it('the slot alone is enough to render the text (without showValue)', () => {
    const { container } = render(VProgressLinear, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
      slots: { default: 'Uploading…' },
    })
    const copies = [...container.querySelectorAll('.v-progress-linear-text')]
    expect(copies).toHaveLength(2)
    for (const copy of copies) expect(copy.textContent?.trim()).toBe('Uploading…')
  })

  it('with neither showValue nor a slot: no text rendered', () => {
    const { container } = render(VProgressLinear, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(container.querySelectorAll('.v-progress-linear-text')).toHaveLength(0)
  })

  it('vertical: the text is rendered as in horizontal', () => {
    const { container } = render(VProgressLinear, {
      props: { value: 40, orientation: 'vertical', showValue: true },
      attrs: { 'aria-label': 'x' },
    })
    expect(container.querySelectorAll('.v-progress-linear-text')).toHaveLength(2)
  })

  it('valuePosition: center by default, an explicit value carried over', async () => {
    const { getByRole, rerender } = render(VProgressLinear, {
      props: { value: 40, showValue: true },
      attrs: { 'aria-label': 'x' },
    })
    expect(getByRole('progressbar').getAttribute('data-value-position')).toBe('center')
    await rerender({ valuePosition: 'end' })
    expect(getByRole('progressbar').getAttribute('data-value-position')).toBe('end')
  })

  it('fallthrough: the consumer class, id and style coexist with the custom properties', () => {
    const { getByRole } = render(VProgressLinear, {
      props: { value: 40 },
      attrs: { 'aria-label': 'Upload', class: 'my-upload', id: 'up', style: 'margin-top: 4px' },
    })
    const bar = getByRole('progressbar', { name: 'Upload' })
    expect(bar.classList.contains('v-progress-linear')).toBe(true)
    expect(bar.classList.contains('my-upload')).toBe(true)
    expect(bar.id).toBe('up')
    const style = bar.getAttribute('style') ?? ''
    expect(style).toContain('margin-top: 4px')
    expect(style).toContain('--fill-fraction: 0.4')
  })
})
