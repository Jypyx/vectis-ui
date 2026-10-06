import { fireEvent, render, waitFor } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import VColorInput from './VColorInput.vue'

function renderHarness(template: string, bindings: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: { VColorInput },
    setup: () => bindings,
    template,
  })
  return render(Harness)
}

function renderInput(attrs = '', initial: string | null = '#3b82f6') {
  const value = ref<string | null>(initial)
  const utils = renderHarness(`<VColorInput v-model="value" label="Brand colour" ${attrs} />`, {
    value,
  })
  const field = () => utils.getByRole<HTMLInputElement>('combobox', { name: 'Brand colour' })
  const panel = () => utils.container.querySelector('.v-color-input-panel')!
  const isOpen = () => panel().hasAttribute('data-popover-open')
  return { value, field, panel, isOpen, ...utils }
}

describe('VColorInput', () => {
  it('is a combobox field showing the value, wired to a dialog panel', () => {
    const { field, panel } = renderInput()
    expect(field().value).toBe('#3b82f6')
    expect(field().getAttribute('aria-haspopup')).toBe('dialog')
    expect(field().getAttribute('aria-expanded')).toBe('false')
    expect(field().getAttribute('aria-controls')).toBe(panel().id)
    expect(panel().getAttribute('role')).toBe('dialog')
    expect(panel().getAttribute('aria-label')).toBe('Brand colour')
  })

  describe('typing', () => {
    it('takes any format and rewrites it in its own when the reader leaves', async () => {
      const { value, field } = renderInput()
      await fireEvent.update(field(), 'rgb(255, 0, 0)')
      expect(value.value).toBe('#3b82f6')
      await fireEvent.change(field())
      expect(value.value).toBe('#ff0000')
      expect(field().value).toBe('#ff0000')
    })

    it('rewrites a value that is already the model', async () => {
      const { value, field } = renderInput('', '#ff0000')
      await fireEvent.update(field(), 'FF0000')
      await fireEvent.change(field())
      expect(value.value).toBe('#ff0000')
      expect(field().value).toBe('#ff0000')
    })

    it('Enter takes the value without opening the picker', async () => {
      const { value, field, isOpen } = renderInput()
      await fireEvent.update(field(), 'oklch(62.8% 0.2577 29.23)')
      await fireEvent.keyDown(field(), { key: 'Enter' })
      expect(value.value).toBe('#ff0000')
      expect(isOpen()).toBe(false)
    })

    it('puts back what is not a colour, and empties the value when emptied', async () => {
      const { value, field } = renderInput()
      await fireEvent.update(field(), 'nope')
      await fireEvent.change(field())
      expect(field().value).toBe('#3b82f6')
      await fireEvent.update(field(), '')
      await fireEvent.change(field())
      expect(value.value).toBeNull()
    })

    it('follows the model when it changes from outside', async () => {
      const { value, field } = renderInput()
      value.value = 'hsl(0 100% 50%)'
      await nextTick()
      expect(field().value).toBe('hsl(0 100% 50%)')
    })

    it('format and alpha decide how the value is written', async () => {
      const { value, field } = renderInput('format="rgb" alpha')
      await fireEvent.update(field(), '#ff000080')
      await fireEvent.change(field())
      expect(value.value).toBe('rgb(255 0 0 / 0.5)')
    })
  })

  describe('panel', () => {
    it('the swatch button opens and closes the picker', async () => {
      const { getByRole, field, isOpen } = renderInput()
      const swatch = getByRole('button', { name: 'Open colour picker' })
      await fireEvent.click(swatch)
      expect(isOpen()).toBe(true)
      expect(field().getAttribute('aria-expanded')).toBe('true')
      await waitFor(() =>
        expect(document.activeElement).toBe(getByRole('slider', { name: 'Saturation' })),
      )
      await fireEvent.click(swatch)
      expect(isOpen()).toBe(false)
    })

    it('ArrowDown opens it from the field, and Escape closes it back to the field', async () => {
      const { getByRole, field, isOpen } = renderInput()
      field().focus()
      await fireEvent.keyDown(field(), { key: 'ArrowDown' })
      expect(isOpen()).toBe(true)
      const saturation = getByRole('slider', { name: 'Saturation' })
      await waitFor(() => expect(document.activeElement).toBe(saturation))
      await fireEvent.keyDown(saturation, { key: 'Escape' })
      expect(isOpen()).toBe(false)
      expect(document.activeElement).toBe(field())
    })

    it('the picker writes the value, and Enter on a track closes the panel', async () => {
      const { value, getByRole, field, isOpen } = renderInput('', '#ff0000')
      await fireEvent.click(getByRole('button', { name: 'Open colour picker' }))
      const hue = getByRole('slider', { name: 'Hue' })
      await fireEvent.update(hue, '120')
      expect(value.value).toBe('#00ff00')
      expect(field().value).toBe('#00ff00')
      await fireEvent.keyDown(hue, { key: 'Enter' })
      expect(isOpen()).toBe(false)
      expect(document.activeElement).toBe(field())
    })

    it('holds the picker without its own text field', async () => {
      const { getByRole, queryAllByRole } = renderInput()
      await fireEvent.click(getByRole('button', { name: 'Open colour picker' }))
      expect(queryAllByRole('textbox')).toHaveLength(0)
      expect(queryAllByRole('combobox')).toHaveLength(1)
    })

    it('passes swatches and alpha down', async () => {
      const { getByRole } = renderInput('alpha :swatches="[\'#ff0000\']"')
      await fireEvent.click(getByRole('button', { name: 'Open colour picker' }))
      expect(getByRole('slider', { name: 'Opacity' })).toBeTruthy()
      expect(getByRole('radio', { name: '#ff0000' })).toBeTruthy()
    })
  })

  it('clears through the cross', async () => {
    const value = ref<string | null>('#3b82f6')
    const cleared: unknown[] = []
    const { getByRole } = renderHarness(
      '<VColorInput v-model="value" label="Brand colour" clearable @clear="cleared.push(1)" />',
      { value, cleared },
    )
    await fireEvent.click(getByRole('button', { name: 'Clear colour' }))
    expect(value.value).toBeNull()
    expect(cleared).toHaveLength(1)
    expect(getByRole<HTMLInputElement>('combobox').value).toBe('')
  })

  it('readonly: no picker, no popup wiring, a swatch that is no button', () => {
    const { getByRole, queryByRole, container } = renderInput('readonly')
    const field = getByRole<HTMLInputElement>('textbox', { name: 'Brand colour' })
    expect(field.readOnly).toBe(true)
    expect(field.getAttribute('aria-expanded')).toBeNull()
    expect(queryByRole('button')).toBeNull()
    expect(container.querySelector('.v-color-input-panel')).toBeNull()
    expect(container.querySelector('.v-color-input-chip')).toBeTruthy()
  })

  it('disabled: the field and the swatch button are disabled', () => {
    const { getByRole, field } = renderInput('disabled')
    expect(field().disabled).toBe(true)
    expect(getByRole<HTMLButtonElement>('button', { name: 'Open colour picker' }).disabled).toBe(
      true,
    )
  })

  it('shows the colour in the swatch', () => {
    const { container } = renderInput('alpha', '#ff000080')
    const chip = container.querySelector<HTMLElement>('.v-color-input-chip')!
    expect(chip.style.getPropertyValue('--color-input-chip')).toBe('rgb(255 0 0 / 0.5)')
  })

  it('follows the field model: the error replaces the hint', () => {
    const { field, getByText } = renderInput('hint="Used for buttons" error="Pick a colour"')
    expect(getByText('Pick a colour')).toBeTruthy()
    const describedBy = field().getAttribute('aria-describedby')!
    expect(document.getElementById(describedBy)!.textContent).toBe('Pick a colour')
  })

  it('class and style stay on the wrapper, other attributes go to the field', () => {
    const { container, field } = renderInput('class="mine" name="brand" required')
    expect(container.querySelector('.v-color-input')!.classList.contains('mine')).toBe(true)
    expect(field().name).toBe('brand')
    expect(field().required).toBe(true)
  })

  it('labels come from props before the dictionary', () => {
    const { getByRole } = renderInput('clearable picker-button-label="Pick" clear-label="Reset"')
    expect(getByRole('button', { name: 'Pick' })).toBeTruthy()
    expect(getByRole('button', { name: 'Reset' })).toBeTruthy()
  })
})
