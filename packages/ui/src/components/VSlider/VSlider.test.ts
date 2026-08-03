import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VSlider from './VSlider.vue'

describe('VSlider', () => {
  it('single mode: a single range input, a numeric v-model', async () => {
    const { getAllByRole, emitted } = render(VSlider, {
      props: { modelValue: 40, label: 'Volume' },
    })
    const sliders = getAllByRole('slider')
    expect(sliders).toHaveLength(1)
    await fireEvent.update(sliders[0]!, '55')
    expect(emitted('update:modelValue')).toEqual([[55]])
  })

  it('range mode: two inputs named start/end', () => {
    const { getByRole } = render(VSlider, {
      props: { modelValue: [20, 60], range: true, label: 'Budget' },
    })
    expect(getByRole('slider', { name: 'Budget (start)' })).toBeTruthy()
    expect(getByRole('slider', { name: 'Budget (end)' })).toBeTruthy()
  })

  it('prevents the two thumbs from crossing', async () => {
    const { getByRole, emitted } = render(VSlider, {
      props: { modelValue: [20, 60], range: true, label: 'Budget' },
    })
    // the start thumb tries to go past the end → pulled back to 60
    await fireEvent.update(getByRole('slider', { name: 'Budget (start)' }), '80')
    expect(emitted('update:modelValue')).toEqual([[[60, 60]]])
  })

  it('the fill follows the values (unitless fractions)', () => {
    const { container } = render(VSlider, {
      props: { modelValue: [25, 75], range: true, label: 'x' },
    })
    const style = container.querySelector('.v-slider')?.getAttribute('style') ?? ''
    expect(style).toContain('--start-fraction: 0.25')
    expect(style).toContain('--end-fraction: 0.75')
  })

  it('orientation: data-orientation set only when vertical', async () => {
    const { container, rerender } = render(VSlider, {
      props: { modelValue: 40, label: 'x' },
    })
    const root = () => container.querySelector('.v-slider')!
    expect(root().hasAttribute('data-orientation')).toBe(false)
    await rerender({ orientation: 'vertical' })
    expect(root().getAttribute('data-orientation')).toBe('vertical')
  })

  it('ticks: one dot per step, data-filled below the value', () => {
    const { container } = render(VSlider, {
      props: { modelValue: 50, ticks: true, step: 25, label: 'x' },
    })
    const ticks = container.querySelectorAll('.v-slider-tick')
    expect(ticks).toHaveLength(5)
    const filled = container.querySelectorAll('.v-slider-tick[data-filled]')
    // 0, 25, 50 are filled (≤ the value)
    expect(filled).toHaveLength(3)
  })

  it('ticks in range mode: filled between the start and the end', () => {
    const { container } = render(VSlider, {
      props: { modelValue: [25, 75], range: true, ticks: true, step: 25, label: 'x' },
    })
    const filled = container.querySelectorAll('.v-slider-tick[data-filled]')
    expect(filled).toHaveLength(3)
  })

  it('ticks: a guard past 50 steps (nothing rendered)', () => {
    const { container } = render(VSlider, {
      props: { modelValue: 50, ticks: true, step: 1, label: 'x' },
    })
    expect(container.querySelectorAll('.v-slider-tick')).toHaveLength(0)
  })

  it('text labels: rendered per step and announced through aria-valuetext', async () => {
    const { container, getByRole } = render(VSlider, {
      props: {
        modelValue: 2,
        min: 0,
        max: 4,
        step: 1,
        labels: ['XS', 'S', 'M', 'L', 'XL'],
        label: 'Size',
      },
    })
    const rendered = [...container.querySelectorAll('.v-slider-label')].map((el) => el.textContent)
    expect(rendered).toEqual(['XS', 'S', 'M', 'L', 'XL'])
    // labels implies ticks
    expect(container.querySelectorAll('.v-slider-tick')).toHaveLength(5)
    const slider = getByRole('slider', { name: 'Size' })
    expect(slider.getAttribute('aria-valuetext')).toBe('M')
    await fireEvent.update(slider, '3')
    expect(slider.getAttribute('aria-valuetext')).toBe('L')
  })

  it('icon labels: a VIcon with an accessible label', () => {
    const { getByLabelText } = render(VSlider, {
      props: {
        modelValue: 0,
        min: 0,
        max: 1,
        step: 1,
        labels: [
          { icon: 'volume_mute', label: 'Muted' },
          { icon: 'volume_up', label: 'Loud' },
        ],
        label: 'x',
      },
    })
    expect(getByLabelText('Muted')).toBeTruthy()
    expect(getByLabelText('Loud')).toBeTruthy()
  })

  it('inputs: one numeric field in single mode, committing on change with clamp and snap', async () => {
    const { getAllByRole, getByRole, emitted } = render(VSlider, {
      props: { modelValue: 40, inputs: true, step: 10, label: 'Volume' },
    })
    const fields = getAllByRole('spinbutton')
    expect(fields).toHaveLength(1)
    const field = getByRole('spinbutton', { name: 'Volume' }) as HTMLInputElement
    // out of bounds → clamped to max
    await fireEvent.update(field, '150')
    await fireEvent.change(field)
    expect(emitted('update:modelValue').at(-1)).toEqual([100])
    // a value off the step → snapped (42 → 40)
    await fireEvent.update(field, '42')
    await fireEvent.change(field)
    expect(emitted('update:modelValue').at(-1)).toEqual([40])
  })

  it('inputs: an empty field → a silent revert, nothing emitted', async () => {
    const { getByRole, emitted } = render(VSlider, {
      props: { modelValue: 40, inputs: true, label: 'Volume' },
    })
    const field = getByRole('spinbutton', { name: 'Volume' }) as HTMLInputElement
    await fireEvent.update(field, '')
    await fireEvent.change(field)
    expect(emitted('update:modelValue')).toBeUndefined()
    expect(field.value).toBe('40')
  })

  it('inputs in range mode: two fields, anti-crossing at commit time', async () => {
    const { getAllByRole, getByRole, emitted } = render(VSlider, {
      props: { modelValue: [20, 60], range: true, inputs: true, label: 'Budget' },
    })
    expect(getAllByRole('spinbutton')).toHaveLength(2)
    const start = getByRole('spinbutton', { name: 'Budget (start)' })
    await fireEvent.update(start, '80')
    await fireEvent.change(start)
    expect(emitted('update:modelValue').at(-1)).toEqual([[60, 60]])
  })

  it('tooltip: the bubbles are present (1 in single, 2 in range), hidden by default', () => {
    const simple = render(VSlider, {
      props: { modelValue: 40, tooltip: true, label: 'x' },
    })
    expect(simple.container.querySelectorAll('.v-slider-tooltip')).toHaveLength(1)
    expect(simple.container.querySelector('.v-slider-tooltip')?.textContent).toBe('40')

    const range = render(VSlider, {
      props: { modelValue: [20, 60], range: true, tooltip: true, label: 'x' },
    })
    expect(range.container.querySelectorAll('.v-slider-tooltip')).toHaveLength(2)
  })

  it("tooltip: it displays the step's label when labels is supplied", () => {
    const { container } = render(VSlider, {
      props: {
        modelValue: 1,
        min: 0,
        max: 2,
        step: 1,
        tooltip: true,
        labels: ['Low', 'Middle', 'High'],
        label: 'x',
      },
    })
    expect(container.querySelector('.v-slider-tooltip')?.textContent).toBe('Middle')
  })

  it('disabled: data-disabled on the root, the controls disabled', () => {
    const { container, getByRole } = render(VSlider, {
      props: { modelValue: 40, disabled: true, inputs: true, label: 'Volume' },
    })
    expect(container.querySelector('.v-slider[data-disabled]')).toBeTruthy()
    expect((getByRole('slider', { name: 'Volume' }) as HTMLInputElement).disabled).toBe(true)
    expect((getByRole('spinbutton', { name: 'Volume' }) as HTMLInputElement).disabled).toBe(true)
  })

  /* The four labels are computeds shared between the numeric field and the range
     input: the complete matrix is what locks that sharing down. */
  describe('accessible names of the thumbs', () => {
    it('without a label: "Start"/"End" in range, "Value" on the single field', () => {
      const range = render(VSlider, {
        props: { modelValue: [20, 60], range: true, inputs: true },
      })
      expect(range.getByRole('slider', { name: 'Start' })).toBeTruthy()
      expect(range.getByRole('slider', { name: 'End' })).toBeTruthy()
      expect(range.getByRole('spinbutton', { name: 'Start' })).toBeTruthy()
      expect(range.getByRole('spinbutton', { name: 'End' })).toBeTruthy()

      const single = render(VSlider, { props: { modelValue: 40, inputs: true } })
      // Outside range mode, the thumb IS the value: with no consumer label it stays
      // nameless, and only the numeric field needs a fallback.
      expect(single.getByRole('spinbutton', { name: 'Value' })).toBeTruthy()
    })

    it('with a label: suffixed "(start)"/"(end)" in range, as-is in single', () => {
      const range = render(VSlider, {
        props: { modelValue: [20, 60], range: true, inputs: true, label: 'Budget' },
      })
      expect(range.getByRole('slider', { name: 'Budget (start)' })).toBeTruthy()
      expect(range.getByRole('slider', { name: 'Budget (end)' })).toBeTruthy()
      expect(range.getByRole('spinbutton', { name: 'Budget (start)' })).toBeTruthy()
      expect(range.getByRole('spinbutton', { name: 'Budget (end)' })).toBeTruthy()

      const single = render(VSlider, {
        props: { modelValue: 40, inputs: true, label: 'Volume' },
      })
      expect(single.getByRole('slider', { name: 'Volume' })).toBeTruthy()
      expect(single.getByRole('spinbutton', { name: 'Volume' })).toBeTruthy()
    })
  })
})
