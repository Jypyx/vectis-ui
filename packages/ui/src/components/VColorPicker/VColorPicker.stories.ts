import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VTypography from '../VTypography/VTypography.vue'
import VColorPicker from './VColorPicker.vue'

const t = storyText({
  en: { value: 'Value', brand: 'Brand colours', ocean: 'Ocean', forest: 'Forest', sun: 'Sun' },
  fr: {
    value: 'Valeur',
    brand: 'Couleurs de la marque',
    ocean: 'Océan',
    forest: 'Forêt',
    sun: 'Soleil',
  },
})

const meta = {
  title: 'Components/ColorPicker',
  component: VColorPicker,
  argTypes: {
    format: { control: 'inline-radio', options: ['hex', 'rgb', 'hsl', 'oklch'] },
    alpha: { control: 'boolean' },
    hideInput: { control: 'boolean' },
    hideEyeDropper: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
  },
  args: {
    format: 'hex',
    alpha: false,
    hideInput: false,
    hideEyeDropper: false,
    disabled: false,
  },
  render: (args) => ({
    components: { VColorPicker, VTypography },
    setup: () => ({ args, t, value: ref<string | null>('#3b82f6') }),
    template: `
      <div style="display: grid; gap: 8px; justify-items: start">
        <VColorPicker v-bind="args" v-model="value" />
        <VTypography variant="body-sm" tone="muted">{{ t.value }}: <code>{{ value }}</code></VTypography>
      </div>
    `,
  }),
} satisfies Meta<typeof VColorPicker>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A pointer or the arrows move the area, the native ranges the hue, and the field takes a colour
 * in any format.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByRole('group', { name: 'Colour picker' })).toBeInTheDocument()
    const saturation = canvas.getByRole('slider', { name: 'Saturation' })
    const area = canvasElement.querySelector<HTMLElement>('.v-color-picker-area')!
    const rect = area.getBoundingClientRect()
    const centre = {
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
      pointerId: 1,
      button: 0,
    }
    await fireEvent.pointerDown(area, centre)
    await fireEvent.pointerUp(area, centre)
    await waitFor(() => expect(saturation).toHaveFocus())
    // The click lands in the middle of the area: half saturation, half brightness.
    expect(saturation).toHaveAttribute('aria-valuetext', 'Saturation 50%, brightness 50%')
    await userEvent.keyboard('{ArrowUp}{ArrowRight}')
    expect(saturation).toHaveAttribute('aria-valuetext', 'Saturation 51%, brightness 51%')

    const field = canvas.getByRole('textbox', { name: 'Colour value' })
    await userEvent.clear(field)
    await userEvent.type(field, 'rgb(255 0 0){Enter}')
    await waitFor(() => expect(canvas.getByText('#ff0000')).toBeInTheDocument())
    expect(canvas.getByRole('slider', { name: 'Hue' })).toHaveValue('0')
  },
}

/** `alpha` adds an opacity track over a checkerboard, and writes the alpha below 1. */
export const Alpha: Story = {
  args: { alpha: true, format: 'rgb' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // A native range moved as a drag or assistive technology would: user-event leaves its
    // arrow keys to the browser, which does not act on synthetic events.
    await fireEvent.input(canvas.getByRole('slider', { name: 'Opacity' }), {
      target: { value: '50' },
    })
    await waitFor(() => expect(canvas.getByText('rgb(59 130 246 / 0.5)')).toBeInTheDocument())
  },
}

/** The format menu changes what the field shows; `format` decides how the value is written. */
export const Formats: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('combobox', { name: 'Colour format' }))
    await userEvent.click(await canvas.findByRole('option', { name: 'OKLCH' }))
    expect(canvas.getByRole('textbox', { name: 'Colour value' })).toHaveValue(
      'oklch(62.3% 0.188 259.8)',
    )
    expect(canvas.getByText('#3b82f6')).toBeInTheDocument()
  },
}

/** `swatches` offers preset colours, as native radios that the arrow keys move between. */
export const Swatches: Story = {
  render: (args) => ({
    components: { VColorPicker },
    setup: () => ({
      args,
      t,
      value: ref<string | null>('#0ea5e9'),
      swatches: [
        { color: '#0ea5e9', label: t.value.ocean },
        { color: '#16a34a', label: t.value.forest },
        { color: '#f59e0b', label: t.value.sun },
        '#e11d48',
        '#7c3aed',
        '#0f172a',
      ],
    }),
    template: `<VColorPicker v-bind="args" v-model="value" :swatches="swatches" :label="t.brand" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByRole('radio', { name: 'Ocean' })).toBeChecked()
    await userEvent.click(canvasElement.querySelectorAll('.v-color-picker-chip')[1]!)
    await waitFor(() => expect(canvas.getByRole('radio', { name: 'Forest' })).toBeChecked())
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(canvas.getByRole('radio', { name: 'Sun' })).toBeChecked())
    expect(canvas.getByRole('textbox', { name: 'Colour value' })).toHaveValue('#f59e0b')
  },
}

/** Dragging the area moves both axes at once, the pointer captured outside it. */
export const Drag: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const area = canvasElement.querySelector<HTMLElement>('.v-color-picker-area')!
    const rect = area.getBoundingClientRect()
    const at = (x: number, y: number) => ({
      clientX: rect.left + rect.width * x,
      clientY: rect.top + rect.height * y,
      pointerId: 1,
      button: 0,
    })
    await fireEvent.pointerDown(area, at(0.1, 0.1))
    await fireEvent.pointerMove(area, at(2, -1))
    await fireEvent.pointerUp(area, at(2, -1))
    await waitFor(() =>
      expect(canvas.getByRole('slider', { name: 'Saturation' })).toHaveAttribute(
        'aria-valuetext',
        'Saturation 100%, brightness 100%',
      ),
    )
  },
}

/** `readonly` shows the colour without letting it change: the controls stay focusable. */
export const Readonly: Story = {
  args: { readonly: true, modelValue: '#3b82f6' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const hue = canvas.getByRole('slider', { name: 'Hue' }) as HTMLInputElement
    await expect(hue).toBeEnabled()
    await expect(hue).toHaveAttribute('aria-readonly', 'true')
    const before = hue.value
    hue.focus()
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    await expect(hue.value).toBe(before)
    await expect(canvas.getByRole('textbox', { name: 'Colour value' })).toHaveAttribute('readonly')
  },
}

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    for (const slider of canvas.getAllByRole('slider')) expect(slider).toBeDisabled()
    expect(canvas.getByRole('textbox', { name: 'Colour value' })).toBeDisabled()
  },
}
