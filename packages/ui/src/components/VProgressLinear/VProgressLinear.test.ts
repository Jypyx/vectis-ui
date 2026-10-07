import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VProgressLinear from './VProgressLinear.vue'

/** Inline style of the bar, which carries the fill fraction. */
const styleOf = (container: Element) =>
  container.querySelector('.v-progress-linear')?.getAttribute('style') ?? ''

/** The root, which carries the tone and the custom properties the bar inherits. */
const rootOf = (container: Element) => container.querySelector('.v-progress-linear-field')!
const rootStyleOf = (container: Element) => rootOf(container).getAttribute('style') ?? ''

describe('VProgressLinear', () => {
  it('ARIA contract: the role, faithful bounds and a unitless fraction', () => {
    const { getByRole, container } = render(VProgressLinear, {
      props: { value: 30, max: 60 },
      attrs: { 'aria-label': 'Progress' },
    })
    const bar = getByRole('progressbar')
    expect(bar.getAttribute('aria-valuenow')).toBe('30')
    expect(bar.getAttribute('aria-valuemin')).toBe('0')
    expect(bar.getAttribute('aria-valuemax')).toBe('60')
    expect(styleOf(container)).toContain('--fill-fraction: 0.5')
  })

  // The value is clamped against the normalized bound, so announcing the raw one would put
  // `aria-valuenow` above `aria-valuemax`.
  it('announces the normalized bound, never a negative max', () => {
    const { getByRole } = render(VProgressLinear, {
      props: { value: 10, max: -5 },
      attrs: { 'aria-label': 'x' },
    })
    const bar = getByRole('progressbar')
    expect(bar.getAttribute('aria-valuemax')).toBe('0')
    expect(bar.getAttribute('aria-valuenow')).toBe('0')
  })

  it('a thickness in another unit is refused rather than read as pixels', () => {
    const { container } = render(VProgressLinear, {
      props: { value: 10, thickness: '1rem' },
      attrs: { 'aria-label': 'x' },
    })
    expect(styleOf(container)).not.toContain('--progress-thickness')
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
    const { container, rerender } = render(VProgressLinear, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(rootOf(container).getAttribute('data-tone')).toBe('accent')
    await rerender({ tone: 'warning' })
    expect(rootOf(container).getAttribute('data-tone')).toBe('warning')
  })

  it('custom colour: data-custom + --custom-color (both absent otherwise)', async () => {
    const { container, rerender } = render(VProgressLinear, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(rootOf(container).hasAttribute('data-custom')).toBe(false)
    expect(rootStyleOf(container)).not.toContain('--custom-color')
    await rerender({ color: 'hotpink' })
    expect(rootOf(container).hasAttribute('data-custom')).toBe(true)
    expect(rootStyleOf(container)).toContain('--custom-color: hotpink')
  })

  it('thickness: a number → px, a string as-is, absent when not supplied', async () => {
    const { container, rerender } = render(VProgressLinear, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(rootStyleOf(container)).not.toContain('--progress-thickness')
    await rerender({ thickness: 12 })
    expect(rootStyleOf(container)).toContain('--progress-thickness: 12px')
    await rerender({ thickness: '12' })
    expect(rootStyleOf(container)).toContain('--progress-thickness: 12px')
    await rerender({ thickness: 'auto' })
    expect(rootStyleOf(container)).not.toContain('--progress-thickness')
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

  it('orientation: data-orientation always mirrors the union, both branches', async () => {
    const { getByRole, rerender } = render(VProgressLinear, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(getByRole('progressbar').getAttribute('data-orientation')).toBe('horizontal')
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
    expect(copies[0]!.hasAttribute('data-on-fill')).toBe(false)
    expect(copies[0]!.hasAttribute('aria-hidden')).toBe(false)
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
    expect(container.querySelector('.v-progress-linear-track')).toBeNull()
    expect(root.children).toHaveLength(1)
    expect(root.firstElementChild!.classList.contains('v-progress-linear-fill')).toBe(true)
  })

  it('a NaN value is read as zero: no NaN reaches ARIA, the style or the text', () => {
    const { getByRole, container } = render(VProgressLinear, {
      props: { value: Number.NaN, showValue: true },
      attrs: { 'aria-label': 'x' },
    })
    expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0')
    expect(container.innerHTML).not.toContain('NaN')
  })

  it('a max that is not a finite number falls back to 100', () => {
    for (const max of [Number.NaN, Number.POSITIVE_INFINITY]) {
      const { container } = render(VProgressLinear, {
        props: { value: 50, max },
        attrs: { 'aria-label': 'x' },
      })
      const bar = container.querySelector('[role=progressbar]')!
      expect(bar.getAttribute('aria-valuemax')).toBe('100')
      expect(bar.getAttribute('aria-valuenow')).toBe('50')
    }
  })

  it('the written percentage reads 100% only when complete and 0% only when empty', () => {
    const text = (value: number) =>
      render(VProgressLinear, {
        props: { value, showValue: true },
        attrs: { 'aria-label': 'x' },
      })
        .container.querySelector('.v-progress-linear-text')
        ?.textContent?.trim()
    expect(text(99.6)).toBe('99%')
    expect(text(0.4)).toBe('1%')
    expect(text(100)).toBe('100%')
    expect(text(0)).toBe('0%')
    expect(text(42.4)).toBe('42%')
  })

  it('a negative thickness is refused rather than written as an invalid length', () => {
    const { container } = render(VProgressLinear, {
      props: { value: 10, thickness: -3 },
      attrs: { 'aria-label': 'x' },
    })
    expect(styleOf(container)).not.toContain('--progress-thickness')
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

  it('fallthrough: class and style stay on the root, the other attributes reach the bar', () => {
    const { getByRole, container } = render(VProgressLinear, {
      props: { value: 40, thickness: 8 },
      attrs: { 'aria-label': 'Upload', class: 'my-upload', id: 'up', style: 'margin-top: 4px' },
    })
    const bar = getByRole('progressbar', { name: 'Upload' })
    const root = rootOf(container)
    expect(root.classList.contains('my-upload')).toBe(true)
    expect(bar.classList.contains('my-upload')).toBe(false)
    expect(bar.id).toBe('up')
    expect(rootStyleOf(container)).toContain('margin-top: 4px')
    expect(rootStyleOf(container)).toContain('--progress-thickness: 8px')
    expect(styleOf(container)).toContain('--fill-fraction: 0.4')
  })

  it('label: shown above the bar and naming it by reference', () => {
    const { getByRole, container } = render(VProgressLinear, {
      props: { value: 40, label: 'Upload' },
    })
    const label = container.querySelector('.v-progress-linear-label') as HTMLElement
    const bar = getByRole('progressbar', { name: 'Upload' })
    expect(label.classList.contains('v-visually-hidden')).toBe(false)
    expect(bar.getAttribute('aria-labelledby')).toBe(label.id)
    expect(bar.hasAttribute('aria-label')).toBe(false)
  })

  it('hideLabel hides the label visually, the bar keeping its name', () => {
    const { getByRole, container } = render(VProgressLinear, {
      props: { value: 40, label: 'Upload', hideLabel: true },
    })
    const label = container.querySelector('.v-progress-linear-label') as HTMLElement
    expect(label.classList.contains('v-visually-hidden')).toBe(true)
    expect(getByRole('progressbar', { name: 'Upload' })).toBeTruthy()
  })

  it('label: names the indicator, in place of the dictionary default', async () => {
    const { getByRole, rerender } = render(VProgressLinear, { props: { value: 40 } })
    expect(getByRole('progressbar', { name: 'Progress' })).toBeTruthy()
    await rerender({ label: 'Upload' })
    expect(getByRole('progressbar', { name: 'Upload' })).toBeTruthy()
  })

  it('label: a consumer aria-label wins, and aria-labelledby removes it', () => {
    const labelled = render(VProgressLinear, {
      props: { value: 40, label: 'Upload' },
      attrs: { 'aria-label': 'Mine' },
    })
    expect(labelled.getByRole('progressbar').getAttribute('aria-label')).toBe('Mine')
    const byRef = render(VProgressLinear, {
      props: { value: 40, label: 'Upload' },
      attrs: { 'aria-labelledby': 'heading' },
    })
    expect(byRef.container.querySelector('[role="progressbar"]')!.hasAttribute('aria-label')).toBe(
      false,
    )
  })
})
