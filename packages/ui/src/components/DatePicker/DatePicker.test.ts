import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import DatePicker from './DatePicker.vue'

describe('DatePicker', () => {
  it('input natif type=date, v-model ISO', async () => {
    const { container, emitted } = render(DatePicker, {
      props: { modelValue: '2026-07-21' },
      attrs: { 'aria-label': 'Date' },
    })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.type).toBe('date')
    expect(input.value).toBe('2026-07-21')
    await fireEvent.update(input, '2026-08-01')
    expect(emitted('update:modelValue')).toEqual([['2026-08-01']])
  })

  it('min/max natifs passent par fallthrough', () => {
    const { container } = render(DatePicker, {
      props: { modelValue: '' },
      attrs: { min: '2026-07-01', max: '2026-07-31', 'aria-label': 'Date' },
    })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.getAttribute('min')).toBe('2026-07-01')
    expect(input.getAttribute('max')).toBe('2026-07-31')
  })

  it('les autres granularités natives sont supportées', () => {
    const { container } = render(DatePicker, {
      props: { modelValue: '14:30', type: 'time' },
      attrs: { 'aria-label': 'Heure' },
    })
    expect((container.querySelector('input') as HTMLInputElement).type).toBe('time')
  })
})
