import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import { nextTick, ref } from 'vue'

import VInputGroup from '../VInput/VInputGroup.vue'
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

  // The pair stays ordered, but the thumb the reader is holding is the one that decides:
  // taken past its sibling it PUSHES it rather than stopping against it. Stopping was the
  // dead end — two thumbs resting on the same value leave only the top one (the end) under
  // the pointer, and it could then never come back down.
  it('a thumb taken past its sibling pushes it rather than stopping against it', async () => {
    const { getByRole, emitted } = render(VSlider, {
      props: { modelValue: [20, 60], range: true, label: 'Budget' },
    })
    await fireEvent.update(getByRole('slider', { name: 'Budget (start)' }), '80')
    expect(emitted('update:modelValue')).toEqual([[[80, 80]]])
  })

  it('a collapsed range can be taken back down by its end thumb', async () => {
    const { getByRole, emitted } = render(VSlider, {
      props: { modelValue: [100, 100], range: true, label: 'Budget' },
    })
    const end = getByRole('slider', { name: 'Budget (end)' }) as HTMLInputElement
    await fireEvent.update(end, '70')
    expect(emitted('update:modelValue')).toEqual([[[70, 70]]])
    expect(end.value).toBe('70')
  })

  // A range is two native controls: forwarded through $attrs, a consumer's @change only
  // ever reached the END thumb, and moving the start one told nobody.
  it('change: emitted with the whole pair by EITHER thumb of a range', async () => {
    const { getByRole, emitted } = render(VSlider, {
      props: { modelValue: [20, 60], range: true, label: 'Budget' },
    })
    const start = getByRole('slider', { name: 'Budget (start)' }) as HTMLInputElement
    start.value = '30'
    await fireEvent.input(start)
    await fireEvent.change(start)
    expect(emitted('change')).toEqual([[[30, 60]]])

    const end = getByRole('slider', { name: 'Budget (end)' }) as HTMLInputElement
    end.value = '70'
    await fireEvent.input(end)
    await fireEvent.change(end)
    expect(emitted('change')?.at(-1)).toEqual([[30, 70]])
  })

  // A key press fires input and change in the same task: under a parent v-model the
  // model's local copy has not caught up yet, so the payload must not be read from it.
  it('change: carries the settled value under a parent v-model, not the one before', () => {
    const onChange = vi.fn()
    let value: number | [number, number] = 40
    const { getByRole } = render(VSlider, {
      props: {
        modelValue: value,
        label: 'Volume',
        'onUpdate:modelValue': (v: number | [number, number]) => (value = v),
        onChange,
      },
    })
    const slider = getByRole('slider') as HTMLInputElement
    slider.value = '41'
    slider.dispatchEvent(new Event('input', { bubbles: true }))
    slider.dispatchEvent(new Event('change', { bubbles: true }))
    expect(value).toBe(41)
    expect(onChange).toHaveBeenCalledWith(41)
  })

  it('change: a committed number field emits it too, and only when the value moved', async () => {
    const { getByRole, emitted } = render(VSlider, {
      props: { modelValue: 40, inputs: true, label: 'Volume' },
    })
    const field = getByRole('spinbutton', { name: 'Volume' }) as HTMLInputElement
    await fireEvent.update(field, '55')
    await fireEvent.change(field)
    expect(emitted('change')).toEqual([[55]])
    await fireEvent.update(field, '55')
    await fireEvent.change(field)
    expect(emitted('change')).toHaveLength(1)
  })

  it('the fill follows the values (unitless fractions)', () => {
    const { container } = render(VSlider, {
      props: { modelValue: [25, 75], range: true, label: 'x' },
    })
    const style = container.querySelector('.v-slider')?.getAttribute('style') ?? ''
    expect(style).toContain('--slider-start-fraction: 0.25')
    expect(style).toContain('--slider-end-fraction: 0.75')
  })

  it('orientation: data-orientation always mirrors the union, both branches', async () => {
    const { container, rerender } = render(VSlider, {
      props: { modelValue: 40, label: 'x' },
    })
    const root = () => container.querySelector('.v-slider')!
    // The default branch is written out too, so a consumer styling the horizontal case
    // from their own sheet has something to select.
    expect(root().getAttribute('data-orientation')).toBe('horizontal')
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

  // A native range stops on the last step that FITS, so with a max that the step does not
  // reach the committed value has to stop there too. Snapped to `max` instead, the model
  // held a value the thumb could not: the browser sanitized the input back down, and the
  // number, the thumb and the fill then disagreed with nothing in the console.
  it('inputs: a value is snapped to the last step that fits, not to max', async () => {
    const { getByRole, emitted } = render(VSlider, {
      props: { modelValue: 0, inputs: true, min: 0, max: 95, step: 10, label: 'Volume' },
    })
    const field = getByRole('spinbutton', { name: 'Volume' }) as HTMLInputElement
    await fireEvent.update(field, '95')
    await fireEvent.change(field)
    expect(emitted('update:modelValue').at(-1)).toEqual([90])
  })

  // `Math.round((v - min) / 0)` is Infinity and `Infinity * 0` is NaN, which went straight
  // into the v-model and took every fraction down with it.
  it('inputs: a step of 0 commits the clamped value rather than NaN', async () => {
    const { getByRole, emitted } = render(VSlider, {
      props: { modelValue: 40, inputs: true, step: 0, label: 'Volume' },
    })
    const field = getByRole('spinbutton', { name: 'Volume' }) as HTMLInputElement
    await fireEvent.update(field, '55')
    await fireEvent.change(field)
    expect(emitted('update:modelValue').at(-1)).toEqual([55])
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

  it('inputs in range mode: two fields, the committed one pushing its sibling', async () => {
    const { getAllByRole, getByRole, emitted } = render(VSlider, {
      props: { modelValue: [20, 60], range: true, inputs: true, label: 'Budget' },
    })
    expect(getAllByRole('spinbutton')).toHaveLength(2)
    const start = getByRole('spinbutton', { name: 'Budget (start)' })
    await fireEvent.update(start, '80')
    await fireEvent.change(start)
    expect(emitted('update:modelValue').at(-1)).toEqual([[80, 80]])
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

    // The component binds its own `aria-label` after the forwarded attributes, so it
    // wins — which is what gives the two thumbs of a range distinct names. It must
    // therefore RESOLVE the consumer's attribute rather than overwrite it: bound from a
    // value that is `undefined`, `mergeProps` copies the key anyway and the slider ends
    // up with no accessible name at all.
    it('a consumer aria-label names the thumb, and both thumbs of a range', () => {
      const single = render(VSlider, {
        props: { modelValue: 40, inputs: true },
        attrs: { 'aria-label': 'Volume' },
      })
      expect(single.getByRole('slider', { name: 'Volume' })).toBeTruthy()
      expect(single.getByRole('spinbutton', { name: 'Volume' })).toBeTruthy()

      const range = render(VSlider, {
        props: { modelValue: [20, 60], range: true },
        attrs: { 'aria-label': 'Budget' },
      })
      expect(range.getByRole('slider', { name: 'Budget (start)' })).toBeTruthy()
      expect(range.getByRole('slider', { name: 'Budget (end)' })).toBeTruthy()
    })

    // `aria-labelledby` removes the label outright rather than sitting beside it, so the
    // end thumb takes the referenced text and the start thumb keeps its generic word.
    it('a consumer aria-labelledby removes the label prop', () => {
      const { getByRole } = render(VSlider, {
        props: { modelValue: 40, label: 'Volume' },
        attrs: { 'aria-labelledby': 'heading' },
      })
      const thumb = getByRole('slider')
      expect(thumb.getAttribute('aria-labelledby')).toBe('heading')
      expect(thumb.hasAttribute('aria-label')).toBe(false)
    })
  })

  // Same mechanism as the accessible name: the component's own `aria-valuetext` exists
  // only when `labels` is given, and bound after the forwarded attributes it erased a
  // consumer's for every slider without them.
  // The hint is a description, not a name: it is appended to whatever the consumer already
  // pointed at rather than replacing it, and it reaches the thumb they can focus.
  it('hint: drawn under the track and appended to the consumer aria-describedby', () => {
    const { getByRole, getByText } = render(VSlider, {
      props: { modelValue: 40, label: 'Volume', hint: '0 to 100, in steps of 5' },
      attrs: { 'aria-describedby': 'mine' },
    })
    const hint = getByText('0 to 100, in steps of 5')
    const described = getByRole('slider').getAttribute('aria-describedby') ?? ''
    expect(described.split(' ')).toEqual(['mine', hint.id])
  })

  it('a consumer aria-valuetext survives when the component has none', () => {
    const { getByRole } = render(VSlider, {
      props: { modelValue: 40, label: 'Gain' },
      attrs: { 'aria-valuetext': '40 dB' },
    })
    expect(getByRole('slider').getAttribute('aria-valuetext')).toBe('40 dB')
  })

  // The `change` argument, one step of a drag earlier: a range is two native controls,
  // so through the forwarded attributes a consumer's `@input` only ever reached the end
  // thumb, and moving the start one told nobody.
  it('input: emitted with the whole value by EITHER thumb of a range', async () => {
    const { getByRole, emitted } = render(VSlider, {
      props: { modelValue: [20, 60], range: true, label: 'Budget' },
    })
    const start = getByRole('slider', { name: 'Budget (start)' }) as HTMLInputElement
    start.value = '30'
    await fireEvent.input(start)
    expect(emitted('input')).toEqual([[[30, 60]]])

    const end = getByRole('slider', { name: 'Budget (end)' }) as HTMLInputElement
    end.value = '70'
    await fireEvent.input(end)
    expect(emitted('input')?.at(-1)).toEqual([[30, 70]])
  })

  it('input: not emitted while readonly', async () => {
    const { getByRole, emitted } = render(VSlider, {
      props: { modelValue: 40, label: 'Volume', readonly: true },
    })
    const thumb = getByRole('slider') as HTMLInputElement
    thumb.value = '70'
    await fireEvent.input(thumb)
    expect(emitted('input')).toBeUndefined()
  })
})

describe('VSlider — the wrapper-root split', () => {
  it('redirects the form attributes onto the range input, not the wrapper', () => {
    const { container } = render(VSlider, {
      props: { modelValue: 40 },
      attrs: { name: 'volume', id: 'volume', required: true, 'aria-describedby': 'hint' },
    })
    const root = container.querySelector('.v-slider') as HTMLElement
    const input = container.querySelector('.v-slider-input-end') as HTMLInputElement
    expect(root.hasAttribute('name')).toBe(false)
    expect(root.hasAttribute('id')).toBe(false)
    expect(input.name).toBe('volume')
    expect(input.id).toBe('volume')
    expect(input.required).toBe(true)
    expect(input.getAttribute('aria-describedby')).toBe('hint')
  })

  it('keeps class and style on the root, beside the fractions it sets itself', () => {
    const { container } = render(VSlider, {
      props: { modelValue: 50 },
      attrs: { class: 'mine', style: 'margin: 4px' },
    })
    const root = container.querySelector('.v-slider') as HTMLElement
    expect(root.classList.contains('mine')).toBe(true)
    expect(root.style.margin).toBe('4px')
    expect(root.style.getPropertyValue('--slider-end-fraction')).toBe('0.5')
  })

  it('warns about a name on a range, which cannot submit two values under one', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(VSlider, { props: { modelValue: [20, 60], range: true }, attrs: { name: 'span' } })
    expect(warn.mock.calls.map(String).join(' ')).toContain('only the end thumb carries it')
    warn.mockRestore()
  })

  // Read once in the setup body, the guards were blind to everything a parent changed
  // afterwards: a slider re-rendered into 1901 steps drew no tick and said nothing.
  it('warns after a re-render that makes the ticks undrawable, and only once', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { rerender } = render(VSlider, {
      props: { modelValue: 40, step: 10, ticks: true, label: 'Volume' },
    })
    expect(warn).not.toHaveBeenCalled()
    await rerender({ step: 0.5 })
    expect(warn.mock.calls.map(String).join(' ')).toContain('no tick is drawn past 50')
    const first = warn.mock.calls.length
    await rerender({ step: 0.25 })
    expect(warn.mock.calls.length).toBe(first)
    warn.mockRestore()
  })

  it('warns about a step that cannot move the thumb', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(VSlider, { props: { modelValue: 40, step: 0, label: 'Volume' } })
    expect(warn.mock.calls.map(String).join(' ')).toContain('step="0"')
    warn.mockRestore()
  })

  it('exposes focus and the end thumb, the one carrying the consumer id', async () => {
    const slider = ref<InstanceType<typeof VSlider> | null>(null)
    const { container } = render({
      components: { VSlider },
      setup: () => ({ slider }),
      template: '<VSlider ref="slider" :model-value="[20, 60]" range label="Price" id="price" />',
    })
    await nextTick()
    const end = container.querySelector('.v-slider-input-end')
    expect(slider.value?.el).toBe(end)
    expect(slider.value?.el?.id).toBe('price')
    slider.value?.focus()
    expect(document.activeElement).toBe(end)
  })

  // A range input has no native read-only: an input event has already moved the thumb and
  // cannot be cancelled, so the value is put back and the model never hears of it.
  it('readonly: a moved thumb is put back, nothing is emitted, and it says so', async () => {
    const { getAllByRole, emitted } = render(VSlider, {
      props: { modelValue: [20, 60], range: true, readonly: true, label: 'Budget' },
    })
    for (const thumb of getAllByRole('slider') as HTMLInputElement[]) {
      const before = thumb.value
      thumb.value = '40'
      await fireEvent.input(thumb)
      await fireEvent.change(thumb)
      expect(thumb.value).toBe(before)
      expect(thumb.getAttribute('aria-readonly')).toBe('true')
      expect(thumb.disabled).toBe(false)
    }
    expect(emitted('update:modelValue')).toBeUndefined()
    expect(emitted('change')).toBeUndefined()
  })

  it('readonly: the keys that move a thumb are cancelled, Tab is not', () => {
    const { getByRole } = render(VSlider, {
      props: { modelValue: 40, readonly: true, label: 'Volume' },
    })
    const thumb = getByRole('slider')
    for (const key of ['ArrowRight', 'ArrowUp', 'Home', 'End', 'PageUp']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      thumb.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(true)
    }
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    thumb.dispatchEvent(tab)
    expect(tab.defaultPrevented).toBe(false)
  })

  it('readonly: the number fields turn read-only with the thumbs', () => {
    const { getByRole } = render(VSlider, {
      props: { modelValue: 40, readonly: true, inputs: true, label: 'Volume' },
    })
    expect((getByRole('spinbutton') as HTMLInputElement).readOnly).toBe(true)
  })

  it('not readonly: the keys are left to the browser', () => {
    const { getByRole } = render(VSlider, { props: { modelValue: 40, label: 'Volume' } })
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true })
    getByRole('slider').dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
  })

  it('invalid: data-invalid on the root, aria-invalid on every thumb and field', () => {
    const { container, getAllByRole } = render(VSlider, {
      props: { modelValue: [20, 60], range: true, invalid: true, inputs: true, label: 'x' },
    })
    expect(container.querySelector('.v-slider')!.hasAttribute('data-invalid')).toBe(true)
    for (const el of [...getAllByRole('slider'), ...getAllByRole('spinbutton')])
      expect(el.getAttribute('aria-invalid')).toBe('true')
  })

  it('size: md by default on the number fields, an explicit one carried over', async () => {
    const { container, rerender } = render(VSlider, {
      props: { modelValue: 40, inputs: true, label: 'x' },
    })
    const field = () => container.querySelector('.v-slider-field')!
    expect(field().getAttribute('data-size')).toBe('md')
    await rerender({ size: 'lg' })
    expect(field().getAttribute('data-size')).toBe('lg')
  })

  it('size and disabled: a VInputGroup row wins, as it does for every field', () => {
    const { container, getByRole } = render({
      components: { VInputGroup, VSlider },
      template: `
        <VInputGroup size="sm" disabled label="Row">
          <VSlider :model-value="40" inputs size="lg" label="Volume" />
        </VInputGroup>
      `,
    })
    expect(container.querySelector('.v-slider-field')!.getAttribute('data-size')).toBe('sm')
    expect((getByRole('slider') as HTMLInputElement).disabled).toBe(true)
  })

  it('single mode: no start fraction, which only a range reads', () => {
    const { container } = render(VSlider, { props: { modelValue: 40, label: 'x' } })
    const root = container.querySelector('.v-slider') as HTMLElement
    expect(root.style.getPropertyValue('--slider-start-fraction')).toBe('')
    expect(root.style.getPropertyValue('--slider-end-fraction')).toBe('0.4')
  })

  // The places depend on the bounds and the step alone: moving the value must hand the
  // ticks back the SAME style objects, which is what spares Vue re-patching every one.
  it('ticks: moving the value changes which are filled, not where they sit', async () => {
    const { container, rerender } = render(VSlider, {
      props: { modelValue: 20, step: 10, ticks: true, label: 'x' },
    })
    const ticks = () => [...container.querySelectorAll('.v-slider-tick')] as HTMLElement[]
    const before = ticks().map((t) => t.getAttribute('style'))
    expect(ticks().filter((t) => t.hasAttribute('data-filled'))).toHaveLength(3)
    await rerender({ modelValue: 70 })
    expect(ticks().map((t) => t.getAttribute('style'))).toEqual(before)
    expect(ticks().filter((t) => t.hasAttribute('data-filled'))).toHaveLength(8)
  })
})

// A validation library marks the field invalid through the attribute. The component's own
// `invalid` binding comes after the forwarded attributes, so it must hand the consumer's value
// through rather than overwrite it with nothing.
describe('VSlider — a consumer aria-invalid', () => {
  it('reaches the control when `invalid` is not set', () => {
    const { getByRole } = render(VSlider, {
      props: { modelValue: 20, label: 'Volume' },
      attrs: { 'aria-invalid': 'true' },
    })
    expect(getByRole('slider').getAttribute('aria-invalid')).toBe('true')
  })
})
