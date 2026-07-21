import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import Slider from './Slider.vue'

describe('Slider', () => {
  it('mode simple : un seul input range, v-model numérique', async () => {
    const { getAllByRole, emitted } = render(Slider, {
      props: { modelValue: 40, label: 'Volume' },
    })
    const sliders = getAllByRole('slider')
    expect(sliders).toHaveLength(1)
    await fireEvent.update(sliders[0]!, '55')
    expect(emitted('update:modelValue')).toEqual([[55]])
  })

  it('mode range : deux inputs nommés début/fin', () => {
    const { getByRole } = render(Slider, {
      props: { modelValue: [20, 60], range: true, label: 'Budget' },
    })
    expect(getByRole('slider', { name: 'Budget (début)' })).toBeTruthy()
    expect(getByRole('slider', { name: 'Budget (fin)' })).toBeTruthy()
  })

  it('empêche le croisement des deux curseurs', async () => {
    const { getByRole, emitted } = render(Slider, {
      props: { modelValue: [20, 60], range: true, label: 'Budget' },
    })
    // le curseur de début tente de dépasser la fin → recalé sur 60
    await fireEvent.update(getByRole('slider', { name: 'Budget (début)' }), '80')
    expect(emitted('update:modelValue')).toEqual([[[60, 60]]])
  })

  it('la piste de remplissage suit les valeurs (custom properties %)', () => {
    const { container } = render(Slider, {
      props: { modelValue: [25, 75], range: true, label: 'x' },
    })
    const style = container.querySelector('.ds-slider')?.getAttribute('style') ?? ''
    expect(style).toContain('--_start: 25%')
    expect(style).toContain('--_end: 75%')
  })
})
