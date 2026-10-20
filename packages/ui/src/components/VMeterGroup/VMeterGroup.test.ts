import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vite-plus/test'

import VMeterGroup, { type MeterGroupItem } from './VMeterGroup.vue'

const ITEMS: MeterGroupItem[] = [
  { label: 'Documents', value: 30 },
  { label: 'Photos', value: 20, tone: 'success' },
  { label: 'Apps', value: 10, color: 'rebeccapurple' },
]

const parts = (container: Element) => [
  ...container.querySelectorAll<HTMLElement>('.v-meter-group-part'),
]
const shares = (container: Element) => [
  ...parts(container).map((part) => part.style.getPropertyValue('--meter-group-share')),
  container
    .querySelector<HTMLElement>('.v-meter-group-rest')
    ?.style.getPropertyValue('--meter-group-share'),
]
const values = (container: Element) =>
  [...container.querySelectorAll('.v-meter-group-item-value')].map((v) => v.textContent?.trim())

describe('VMeterGroup', () => {
  it('a group named by its label, with a silent bar and a legend list', () => {
    const { getByRole, getAllByRole, container } = render(VMeterGroup, {
      props: { items: ITEMS, label: 'Storage' },
    })
    const group = getByRole('group', { name: 'Storage' })
    expect(group.getAttribute('aria-labelledby')).toBe(
      container.querySelector('.v-meter-group-label')!.id,
    )
    expect(container.querySelector('.v-meter-group-track')!.getAttribute('aria-hidden')).toBe(
      'true',
    )
    const rows = getAllByRole('listitem')
    expect(rows.map((row) => row.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      'Documents 30%',
      'Photos 20%',
      'Apps 10%',
    ])
  })

  it('falls back to the dictionary name, and gives way to the consumer', () => {
    expect(
      render(VMeterGroup, { props: { items: ITEMS } }).getByRole('group', { name: 'Breakdown' }),
    ).toBeTruthy()
    const { getByRole } = render(VMeterGroup, {
      props: { items: ITEMS, label: 'Storage' },
      attrs: { 'aria-label': 'Quota' },
    })
    expect(getByRole('group', { name: 'Quota' }).hasAttribute('aria-labelledby')).toBe(false)
  })

  it('shares the bar in proportion, the rest staying empty', () => {
    const { container } = render(VMeterGroup, { props: { items: ITEMS } })
    expect(shares(container)).toEqual(['0.3', '0.2', '0.1', '0.4'])
  })

  it('shares the whole bar in proportion when the sum exceeds max', () => {
    const { container } = render(VMeterGroup, {
      props: {
        items: [
          { label: 'a', value: 150 },
          { label: 'b', value: 50 },
        ],
      },
    })
    expect(shares(container)).toEqual(['0.75', '0.25', undefined])
    // The legend keeps the real amounts.
    expect(values(container)).toEqual(['150%', '50%'])
  })

  it('counts a negative or non-numeric amount as zero, drawing no part for it', () => {
    const { container } = render(VMeterGroup, {
      props: {
        items: [
          { label: 'a', value: -5 },
          { label: 'b', value: Number.NaN },
          { label: 'c', value: 40 },
        ],
      },
    })
    expect(parts(container)).toHaveLength(1)
    expect(values(container)).toEqual(['0%', '0%', '40%'])
    expect(container.innerHTML).not.toContain('NaN')
  })

  it('max: 0 produces neither NaN nor Infinity', () => {
    const { container } = render(VMeterGroup, { props: { items: ITEMS, max: 0, showValue: true } })
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/)
  })

  it('colours: the tone, a colour of your own, or a hue derived from the position', () => {
    const { container } = render(VMeterGroup, {
      props: { items: [...ITEMS, { label: 'Other', value: 5 }] },
    })
    const [documents, photos, apps, other] = parts(container)
    expect(documents!.getAttribute('data-tone')).toBe('accent')
    expect(documents!.hasAttribute('data-derived')).toBe(true)
    expect(photos!.getAttribute('data-tone')).toBe('success')
    expect(photos!.hasAttribute('data-derived')).toBe(false)
    expect(apps!.hasAttribute('data-custom')).toBe(true)
    expect(apps!.style.getPropertyValue('--custom-color')).toBe('rebeccapurple')
    expect(other!.style.getPropertyValue('--meter-group-index')).toBe('3')
    // The legend swatch carries the same colour as its part.
    const swatches = container.querySelectorAll('.v-meter-group-leading')
    expect(swatches[2]!.getAttribute('style')).toContain('--custom-color: rebeccapurple')
    expect(swatches[3]!.hasAttribute('data-derived')).toBe(true)
  })

  it('an icon replaces the swatch', () => {
    const { container } = render(VMeterGroup, {
      props: { items: [{ label: 'Mail', value: 10, icon: 'check' }] },
    })
    expect(container.querySelector('.v-meter-group-swatch')).toBeNull()
    expect(
      container.querySelector('.v-meter-group-leading svg, .v-meter-group-leading .v-icon'),
    ).toBeTruthy()
  })

  it('showValue writes the sum after the label, readable', () => {
    const { container } = render(VMeterGroup, {
      props: { items: ITEMS, label: 'Storage', showValue: true },
    })
    const value = container.querySelector('.v-meter-group-value')!
    expect(value.textContent?.trim()).toBe('60%')
    expect(value.hasAttribute('aria-hidden')).toBe(false)
  })

  it('the sum as a percentage stops at 100%', () => {
    const { container } = render(VMeterGroup, {
      props: {
        items: [
          { label: 'a', value: 80 },
          { label: 'b', value: 70 },
        ],
        showValue: true,
      },
    })
    expect(container.querySelector('.v-meter-group-value')?.textContent?.trim()).toBe('100%')
  })

  it('formatOptions formats the sum and every amount; valueText replaces the sum', async () => {
    const { container, rerender } = render(VMeterGroup, {
      props: {
        items: ITEMS,
        max: 128,
        showValue: true,
        formatOptions: { style: 'unit', unit: 'gigabyte' },
      },
    })
    expect(container.querySelector('.v-meter-group-value')?.textContent?.trim()).toBe('60 GB')
    expect(values(container)).toEqual(['30 GB', '20 GB', '10 GB'])
    await rerender({ valueText: '60 GB of 128 GB' })
    expect(container.querySelector('.v-meter-group-value')?.textContent?.trim()).toBe(
      '60 GB of 128 GB',
    )
  })

  it('without label or value, no header; hideLabel keeps the name', () => {
    const { container, getByRole } = render(VMeterGroup, {
      props: { items: ITEMS, label: 'Storage', hideLabel: true },
    })
    expect(container.querySelector('.v-meter-group-header')).toBeNull()
    expect(getByRole('group', { name: 'Storage' })).toBeTruthy()
  })

  it('hideLegend hides the legend visually only', () => {
    const { container, getAllByRole } = render(VMeterGroup, {
      props: { items: ITEMS, hideLegend: true },
    })
    expect(container.querySelector('.v-meter-group-legend')!.classList).toContain(
      'v-visually-hidden',
    )
    expect(getAllByRole('listitem')).toHaveLength(3)
  })

  it('the slots receive the item, its index and its percentage', () => {
    const { container } = render(VMeterGroup, {
      props: { items: ITEMS, max: 200, showValue: true },
      slots: {
        value: '<template #value="s">{{ s.value }}/{{ s.max }} {{ s.percent }}</template>',
        'item-leading': '<template #item-leading="s">#{{ s.index }}</template>',
        'item-label': '<template #item-label="s">{{ s.item.label.toUpperCase() }}</template>',
        'item-value': '<template #item-value="s">{{ s.percent }}</template>',
      },
    })
    expect(container.querySelector('.v-meter-group-value')?.textContent?.trim()).toBe('60/200 30')
    const first = container.querySelector('.v-meter-group-item')!
    expect(first.querySelector('.v-meter-group-leading')?.textContent).toBe('#0')
    expect(first.querySelector('.v-meter-group-item-label')?.textContent).toBe('DOCUMENTS')
    expect(first.querySelector('.v-meter-group-item-value')?.textContent).toBe('15')
  })

  it('size and orientation are carried on the root', () => {
    const { getByRole } = render(VMeterGroup, {
      props: { items: ITEMS, size: 'lg', orientation: 'vertical' },
    })
    const group = getByRole('group')
    expect(group.getAttribute('data-size')).toBe('lg')
    expect(group.getAttribute('data-orientation')).toBe('vertical')
  })

  it('fallthrough attributes land on the group', () => {
    const { getByRole } = render(VMeterGroup, {
      props: { items: ITEMS },
      attrs: { class: 'mine', id: 'g', 'data-test': 'y' },
    })
    const group = getByRole('group')
    expect(group.classList).toContain('mine')
    expect(group.id).toBe('g')
    expect(group.getAttribute('data-test')).toBe('y')
  })
})
