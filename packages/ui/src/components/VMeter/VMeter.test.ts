import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VMeter from './VMeter.vue'

const fills = (container: Element) =>
  [...container.querySelectorAll<HTMLElement>('.v-meter-segment')].map((segment) =>
    segment.style.getPropertyValue('--meter-segment-fill'),
  )

describe('VMeter', () => {
  it('ARIA contract: the role, the bounds and the value as text', () => {
    const { getByRole } = render(VMeter, { props: { value: 30, min: 10, max: 60, label: 'Disk' } })
    const meter = getByRole('meter', { name: 'Disk' })
    expect(meter.getAttribute('aria-valuenow')).toBe('30')
    expect(meter.getAttribute('aria-valuemin')).toBe('10')
    expect(meter.getAttribute('aria-valuemax')).toBe('60')
    expect(meter.getAttribute('aria-valuetext')).toBe('40%')
  })

  it('brings the value and a bound below the minimum into the range', async () => {
    const { getByRole, rerender } = render(VMeter, { props: { value: 250, label: 'x' } })
    expect(getByRole('meter').getAttribute('aria-valuenow')).toBe('100')

    await rerender({ value: 5, min: 10, max: 0, label: 'x' })
    const meter = getByRole('meter')
    expect(meter.getAttribute('aria-valuemax')).toBe('10')
    expect(meter.getAttribute('aria-valuenow')).toBe('10')
    expect(meter.getAttribute('aria-valuetext')).toBe('0%')
  })

  it('reads a value that is not a number as the minimum', () => {
    const { getByRole } = render(VMeter, { props: { value: Number.NaN, min: 2, label: 'x' } })
    expect(getByRole('meter').getAttribute('aria-valuenow')).toBe('2')
  })

  it('is accent without low, high or optimum', () => {
    const { container } = render(VMeter, { props: { value: 95, label: 'x' } })
    const root = container.querySelector('.v-meter')!
    expect(root.getAttribute('data-tone')).toBe('accent')
    expect(root.getAttribute('data-level')).toBe('optimum')
  })

  // The regions of the HTML <meter>, boundaries included.
  it.each([
    // The optimum between low and high: the middle is good, both ends average.
    [{ low: 30, high: 70 }, 50, 'optimum', 'success'],
    [{ low: 30, high: 70 }, 30, 'optimum', 'success'],
    [{ low: 30, high: 70 }, 20, 'suboptimal', 'warning'],
    [{ low: 30, high: 70 }, 80, 'suboptimal', 'warning'],
    // The optimum in the low part: low values are good, high ones poor.
    [{ low: 30, high: 70, optimum: 0 }, 29, 'optimum', 'success'],
    [{ low: 30, high: 70, optimum: 0 }, 30, 'suboptimal', 'warning'],
    [{ low: 30, high: 70, optimum: 0 }, 70, 'suboptimal', 'warning'],
    [{ low: 30, high: 70, optimum: 0 }, 71, 'poor', 'danger'],
    // The optimum in the high part: the mirror image.
    [{ low: 30, high: 70, optimum: 100 }, 71, 'optimum', 'success'],
    [{ low: 30, high: 70, optimum: 100 }, 70, 'suboptimal', 'warning'],
    [{ low: 30, high: 70, optimum: 100 }, 30, 'suboptimal', 'warning'],
    [{ low: 30, high: 70, optimum: 100 }, 29, 'poor', 'danger'],
  ])('with %o, %d is %s', (points, value, level, tone) => {
    const { container } = render(VMeter, { props: { ...points, value, label: 'x' } })
    const root = container.querySelector('.v-meter')!
    expect(root.getAttribute('data-level')).toBe(level)
    expect(root.getAttribute('data-tone')).toBe(tone)
  })

  it('keeps high from falling below low', () => {
    // high is raised to 60, so 55 sits below the optimum part rather than above it.
    const { container } = render(VMeter, {
      props: { low: 60, high: 20, optimum: 100, value: 55, label: 'x' },
    })
    expect(container.querySelector('.v-meter')!.getAttribute('data-level')).toBe('poor')
  })

  it('an explicit tone or colour wins over the region', async () => {
    const { container, rerender } = render(VMeter, {
      props: { low: 30, value: 10, optimum: 100, tone: 'neutral', label: 'x' },
    })
    const root = container.querySelector<HTMLElement>('.v-meter')!
    expect(root.getAttribute('data-tone')).toBe('neutral')

    await rerender({ value: 10, color: 'rebeccapurple', label: 'x' })
    expect(root.hasAttribute('data-custom')).toBe(true)
    expect(root.style.getPropertyValue('--custom-color')).toBe('rebeccapurple')
  })

  it('shows the label and names the bar by reference', () => {
    const { getByRole, getByText } = render(VMeter, { props: { value: 20, label: 'Storage' } })
    const label = getByText('Storage')
    expect(getByRole('meter').getAttribute('aria-labelledby')).toBe(label.id)
    expect(label.classList.contains('v-visually-hidden')).toBe(false)
  })

  it('hideLabel keeps the name for screen readers', () => {
    const { getByRole, getByText } = render(VMeter, {
      props: { value: 20, label: 'Storage', hideLabel: true },
    })
    expect(getByText('Storage').classList.contains('v-visually-hidden')).toBe(true)
    expect(getByRole('meter', { name: 'Storage' })).toBeTruthy()
  })

  it('falls back to the dictionary name without a label', () => {
    const { getByRole } = render(VMeter, { props: { value: 20 } })
    expect(getByRole('meter', { name: 'Meter' })).toBeTruthy()
  })

  it("the consumer's name wins over the label", () => {
    const { getByRole } = render(VMeter, {
      props: { value: 20, label: 'Storage' },
      attrs: { 'aria-label': 'Quota' },
    })
    const meter = getByRole('meter', { name: 'Quota' })
    expect(meter.hasAttribute('aria-labelledby')).toBe(false)
  })

  it("the consumer's aria-labelledby wins over the label and the fallback", () => {
    const { getByRole } = render(VMeter, {
      props: { value: 20, label: 'Storage' },
      attrs: { 'aria-labelledby': 'elsewhere' },
    })
    const meter = getByRole('meter')
    expect(meter.getAttribute('aria-labelledby')).toBe('elsewhere')
    expect(meter.hasAttribute('aria-label')).toBe(false)
  })

  it('writes the value once on screen, hidden from screen readers', () => {
    const { getByText } = render(VMeter, { props: { value: 72.4, label: 'x' } })
    expect(getByText('72%').getAttribute('aria-hidden')).toBe('true')
  })

  it('formatOptions formats the value itself for the locale', () => {
    const { getByRole, getByText } = render(VMeter, {
      props: {
        value: 21.5,
        min: -10,
        max: 40,
        formatOptions: { style: 'unit', unit: 'celsius' },
        label: 'x',
      },
    })
    expect(getByRole('meter').getAttribute('aria-valuetext')).toBe('21.5°C')
    expect(getByText('21.5°C')).toBeTruthy()
  })

  it('valueText replaces the text on screen and for screen readers', () => {
    const { getByRole, getByText } = render(VMeter, {
      props: {
        value: 3,
        max: 4,
        valueText: 'Strong',
        formatOptions: { style: 'unit', unit: 'byte' },
        label: 'x',
      },
    })
    expect(getByRole('meter').getAttribute('aria-valuetext')).toBe('Strong')
    expect(getByText('Strong')).toBeTruthy()
  })

  it('hideValue removes the text but keeps aria-valuetext', () => {
    const { container, getByRole } = render(VMeter, {
      props: { value: 50, hideValue: true, label: 'x' },
    })
    expect(container.querySelector('.v-meter-value')).toBeNull()
    expect(getByRole('meter').getAttribute('aria-valuetext')).toBe('50%')
  })

  it('renders no header when neither label nor value is shown', () => {
    const { container } = render(VMeter, {
      props: { value: 50, label: 'x', hideLabel: true, hideValue: true },
    })
    expect(container.querySelector('.v-meter-header')).toBeNull()
  })

  it('a single segment holds the whole fraction', () => {
    const { container } = render(VMeter, { props: { value: 25, label: 'x' } })
    expect(fills(container)).toEqual(['0.25'])
  })

  it('splits the fill across segments in order', () => {
    const { container } = render(VMeter, { props: { value: 50, segments: 5, label: 'x' } })
    expect(fills(container)).toEqual(['1', '1', '0.5', '0', '0'])
  })

  it('reads an invalid segment count as one, and a fractional one rounded down', async () => {
    const { container, rerender } = render(VMeter, { props: { segments: 0, label: 'x' } })
    expect(fills(container)).toHaveLength(1)
    await rerender({ segments: 3.8, label: 'x' })
    expect(fills(container)).toHaveLength(3)
  })

  it('class and style go to the root, other attributes to the bar', () => {
    const { container, getByRole } = render(VMeter, {
      props: { value: 50, label: 'x' },
      attrs: {
        class: 'mine',
        style: 'margin: 4px',
        id: 'm',
        'data-test': 'y',
        'aria-describedby': 'd',
      },
    })
    const root = container.querySelector<HTMLElement>('.v-meter')!
    const meter = getByRole('meter')
    expect(root.classList.contains('mine')).toBe(true)
    expect(root.style.margin).toBe('4px')
    expect(root.hasAttribute('id')).toBe(false)
    expect(meter.id).toBe('m')
    expect(meter.getAttribute('data-test')).toBe('y')
    expect(meter.getAttribute('aria-describedby')).toBe('d')
    expect(meter.classList.contains('mine')).toBe(false)
  })

  it('sets the size on the root', () => {
    const { container } = render(VMeter, { props: { size: 'lg', label: 'x' } })
    expect(container.querySelector('.v-meter')!.getAttribute('data-size')).toBe('lg')
  })
})
