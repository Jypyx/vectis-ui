import { fireEvent, render, waitFor } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'

import VColorPicker from './VColorPicker.vue'

function renderHarness(template: string, bindings: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: { VColorPicker },
    setup: () => bindings,
    template,
  })
  return render(Harness)
}

function renderPicker(attrs = '', initial: string | null = '#3b82f6') {
  const value = ref<string | null>(initial)
  const utils = renderHarness(`<VColorPicker v-model="value" ${attrs} />`, { value })
  const slider = (name: string) => utils.getByRole<HTMLInputElement>('slider', { name })
  const field = () => utils.getByRole<HTMLInputElement>('textbox', { name: 'Colour value' })
  return { value, slider, field, ...utils }
}

describe('VColorPicker', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('is a named group of native ranges reflecting the model', () => {
    const { getByRole, slider, queryByRole } = renderPicker()
    expect(getByRole('group', { name: 'Colour picker' })).toBeTruthy()
    expect(slider('Saturation').value).toBe('76')
    expect(slider('Brightness').value).toBe('96')
    expect(slider('Hue').value).toBe('217')
    expect(slider('Saturation').type).toBe('range')
    expect(queryByRole('slider', { name: 'Opacity' })).toBeNull()
  })

  it('reads both axes of the area on either of its inputs, and keeps one tab stop', () => {
    const { slider } = renderPicker()
    for (const name of ['Saturation', 'Brightness'])
      expect(slider(name).getAttribute('aria-valuetext')).toBe('Saturation 76%, brightness 96%')
    expect(slider('Brightness').tabIndex).toBe(-1)
    expect(slider('Hue').getAttribute('aria-valuetext')).toBe('217°')
  })

  it('label and aria-label name the group', () => {
    expect(renderPicker('label="Brand"').getByRole('group', { name: 'Brand' })).toBeTruthy()
    expect(renderPicker('aria-label="Accent"').getByRole('group', { name: 'Accent' })).toBeTruthy()
  })

  describe('area keyboard', () => {
    it('moves the saturation horizontally and the brightness vertically', async () => {
      const { value, slider } = renderPicker('', '#ff0000')
      await fireEvent.keyDown(slider('Saturation'), { key: 'ArrowLeft' })
      expect(slider('Saturation').value).toBe('99')
      await fireEvent.keyDown(slider('Saturation'), { key: 'ArrowDown', shiftKey: true })
      expect(slider('Brightness').value).toBe('90')
      expect(value.value).toBe('#e60202')
    })

    it('PageUp/PageDown step the brightness by 10, Home/End reach the saturation ends', async () => {
      const { slider } = renderPicker('', '#ff0000')
      await fireEvent.keyDown(slider('Brightness'), { key: 'PageDown' })
      expect(slider('Brightness').value).toBe('90')
      await fireEvent.keyDown(slider('Brightness'), { key: 'Home' })
      expect(slider('Saturation').value).toBe('0')
      await fireEvent.keyDown(slider('Saturation'), { key: 'End' })
      expect(slider('Saturation').value).toBe('100')
    })

    it('leaves other keys to the browser', async () => {
      const { slider } = renderPicker()
      const tab = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true })
      slider('Saturation').dispatchEvent(tab)
      expect(tab.defaultPrevented).toBe(false)
    })
  })

  it('writes what the native ranges report', async () => {
    const { value, slider } = renderPicker('', '#ff0000')
    await fireEvent.update(slider('Hue'), '120')
    expect(value.value).toBe('#00ff00')
  })

  it('keeps the hue of a grey, which the model alone would lose', async () => {
    const { value, slider } = renderPicker('', '#ff0000')
    await fireEvent.keyDown(slider('Saturation'), { key: 'Home' })
    expect(value.value).toBe('#ffffff')
    expect(slider('Hue').value).toBe('0')
    await fireEvent.update(slider('Hue'), '200')
    await fireEvent.keyDown(slider('Saturation'), { key: 'End' })
    expect(slider('Hue').value).toBe('200')
    expect(value.value).toBe('#00aaff')
  })

  describe('text field', () => {
    it('takes any format and writes the model in its own', async () => {
      const { value, field } = renderPicker()
      expect(field().value).toBe('#3b82f6')
      await fireEvent.update(field(), 'rgb(255 0 0)')
      await fireEvent.change(field())
      expect(value.value).toBe('#ff0000')
      expect(field().value).toBe('#ff0000')
    })

    it('takes Enter too', async () => {
      const { value, field } = renderPicker()
      await fireEvent.update(field(), 'hsl(120 100% 50%)')
      await fireEvent.keyDown(field(), { key: 'Enter' })
      expect(value.value).toBe('#00ff00')
    })

    it('puts back what is not a colour, and empties the model when emptied', async () => {
      const { value, field } = renderPicker()
      await fireEvent.update(field(), 'blurple')
      await fireEvent.change(field())
      expect(field().value).toBe('#3b82f6')
      expect(value.value).toBe('#3b82f6')
      await fireEvent.update(field(), '')
      await fireEvent.change(field())
      expect(value.value).toBeNull()
    })

    it('the format menu changes what the field shows, not the model', async () => {
      const { value, field, getByRole } = renderPicker()
      const menu = getByRole('combobox', { name: 'Colour format' })
      expect(menu.textContent?.trim()).toBe('HEX')
      await fireEvent.click(menu)
      await fireEvent.click(getByRole('option', { name: 'OKLCH' }))
      expect(menu.textContent?.trim()).toBe('OKLCH')
      expect(field().value).toBe('oklch(62.3% 0.188 259.8)')
      expect(value.value).toBe('#3b82f6')
    })

    it('hideInput removes the field and the menu', () => {
      const { queryByRole } = renderPicker('hide-input')
      expect(queryByRole('textbox')).toBeNull()
      expect(queryByRole('combobox')).toBeNull()
    })

    it('is empty while there is no colour', () => {
      expect(renderPicker('', null).field().value).toBe('')
    })
  })

  it('format sets how the model is written', async () => {
    const { value, slider } = renderPicker('format="hsl"', '#ff0000')
    await fireEvent.update(slider('Hue'), '120')
    expect(value.value).toBe('hsl(120 100% 50%)')
  })

  describe('alpha', () => {
    it('adds an opacity track and writes the alpha below 1', async () => {
      const { value, slider } = renderPicker('alpha', '#ff000080')
      expect(slider('Opacity').value).toBe('50')
      expect(slider('Opacity').getAttribute('aria-valuetext')).toBe('50%')
      await fireEvent.update(slider('Opacity'), '25')
      expect(value.value).toBe('#ff000040')
      await fireEvent.update(slider('Opacity'), '100')
      expect(value.value).toBe('#ff0000')
    })

    it('without it, a translucent value is read opaque', async () => {
      const { value, slider } = renderPicker('', '#ff000080')
      await fireEvent.update(slider('Hue'), '0')
      expect(value.value).toBe('#ff0000')
    })
  })

  describe('swatches', () => {
    const swatches = ['#ff0000', { color: '#00ff00', label: 'Green' }]

    it('are radios named by their label, the matching one checked', async () => {
      const value = ref<string | null>('rgb(255 0 0)')
      const { getByRole } = renderHarness(
        '<form><VColorPicker v-model="value" :swatches="swatches" /></form>',
        { value, swatches },
      )
      const group = getByRole('group', { name: 'Preset colours' })
      expect(group.tagName).toBe('FIELDSET')
      const red = getByRole<HTMLInputElement>('radio', { name: '#ff0000' })
      const green = getByRole<HTMLInputElement>('radio', { name: 'Green' })
      expect(red.checked).toBe(true)
      // Grouped by name, but sent by no form.
      expect(red.form).toBeNull()
      await fireEvent.click(green)
      expect(value.value).toBe('#00ff00')
      await waitFor(() => expect(green.checked).toBe(true))
    })
  })

  it('sends the value under name through a hidden input', () => {
    const { container } = renderPicker('name="brand"')
    const hidden = container.querySelector<HTMLInputElement>('input[type="hidden"]')!
    expect([hidden.name, hidden.value]).toEqual(['brand', '#3b82f6'])
    expect(renderPicker('name="brand"', null).container.querySelector('[type="hidden"]')).toBeNull()
  })

  it('disabled disables every control', () => {
    const { getAllByRole, getByRole, container } = renderPicker('disabled :swatches="[\'#fff\']"')
    for (const slider of getAllByRole<HTMLInputElement>('slider'))
      expect(slider.disabled).toBe(true)
    expect(getByRole<HTMLInputElement>('textbox').disabled).toBe(true)
    expect(getByRole<HTMLSelectElement>('combobox').disabled).toBe(true)
    expect(container.querySelector('fieldset')!.disabled).toBe(true)
  })

  describe('readonly', () => {
    it('keeps every control focusable and says it is read-only', () => {
      const { getAllByRole, getByRole } = renderPicker('readonly alpha')
      for (const slider of getAllByRole<HTMLInputElement>('slider')) {
        expect(slider.disabled).toBe(false)
        expect(slider.getAttribute('aria-readonly')).toBe('true')
      }
      expect(getByRole<HTMLInputElement>('textbox', { name: 'Colour value' }).readOnly).toBe(true)
    })

    it('puts back what a native range reports, and writes nothing', async () => {
      const { value, slider } = renderPicker('readonly')
      const hue = slider('Hue')
      const before = hue.value
      await fireEvent.update(hue, '120')
      expect(hue.value).toBe(before)
      expect(value.value).toBe('#3b82f6')
    })

    it('refuses the swatches and disables the eyedropper', async () => {
      vi.stubGlobal(
        'EyeDropper',
        class {
          open = () => Promise.resolve({ sRGBHex: '#00ff00' })
        },
      )
      const { value, container, findByRole } = renderPicker('readonly :swatches="[\'#ff0000\']"')
      const swatch = container.querySelector<HTMLInputElement>('input[type="radio"]')!
      expect(swatch.getAttribute('aria-disabled')).toBe('true')
      await fireEvent.click(swatch)
      expect(swatch.checked).toBe(false)
      expect(value.value).toBe('#3b82f6')
      const button = await findByRole<HTMLButtonElement>('button', {
        name: 'Pick a colour from the screen',
      })
      expect(button.disabled).toBe(true)
    })

    it('still submits the value', () => {
      const { container } = renderPicker('readonly name="brand"')
      expect(container.querySelector<HTMLInputElement>('input[type="hidden"]')!.value).toBe(
        '#3b82f6',
      )
    })
  })

  describe('eyedropper', () => {
    it('is absent where the browser has no EyeDropper', () => {
      expect(renderPicker().queryByRole('button')).toBeNull()
    })

    it('picks a colour from the screen, keeping the opacity', async () => {
      vi.stubGlobal(
        'EyeDropper',
        class {
          open = () => Promise.resolve({ sRGBHex: '#00ff00' })
        },
      )
      const { value, findByRole } = renderPicker('alpha', '#ff000080')
      await fireEvent.click(await findByRole('button', { name: 'Pick a colour from the screen' }))
      await waitFor(() => expect(value.value).toBe('#00ff0080'))
    })

    it('stays quiet when cancelled, and hideEyeDropper hides it', async () => {
      vi.stubGlobal(
        'EyeDropper',
        class {
          open = () => Promise.reject(new DOMException('cancelled', 'AbortError'))
        },
      )
      const { value, findByRole } = renderPicker()
      await fireEvent.click(await findByRole('button', { name: 'Pick a colour from the screen' }))
      expect(value.value).toBe('#3b82f6')
      const { container } = renderPicker('hide-eye-dropper')
      expect(container.querySelector('.v-color-picker-eye-dropper')).toBeNull()
    })
  })

  it('focus() moves to the area, and attributes fall through to the root', () => {
    const picker = ref<InstanceType<typeof VColorPicker> | null>(null)
    const { getByRole, container } = renderHarness(
      '<VColorPicker ref="picker" class="mine" data-test="x" />',
      { picker },
    )
    picker.value!.focus()
    expect(document.activeElement).toBe(getByRole('slider', { name: 'Saturation' }))
    const root = container.querySelector('.v-color-picker')!
    expect(root.classList.contains('mine')).toBe(true)
    expect(root.getAttribute('data-test')).toBe('x')
  })
})
