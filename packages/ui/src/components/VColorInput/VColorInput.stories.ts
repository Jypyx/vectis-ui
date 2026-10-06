import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VColorInput from './VColorInput.vue'

const t = storyText({
  en: {
    label: 'Brand colour',
    hint: 'Hex, rgb(), hsl() or oklch().',
    background: 'Background',
    required: 'Choose a colour for the theme.',
    theme: 'Theme colour',
    locked: 'Locked colour',
  },
  fr: {
    label: 'Couleur de la marque',
    hint: 'Hex, rgb(), hsl() ou oklch().',
    background: 'Arrière-plan',
    required: 'Choisissez une couleur pour le thème.',
    theme: 'Couleur du thème',
    locked: 'Couleur verrouillée',
  },
})

const meta = {
  title: 'Components/ColorInput',
  component: VColorInput,
  argTypes: {
    format: { control: 'inline-radio', options: ['hex', 'rgb', 'hsl', 'oklch'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    placement: {
      control: 'select',
      options: ['bottom', 'bottom-start', 'bottom-end', 'top', 'top-start', 'top-end'],
    },
    alpha: { control: 'boolean' },
    clearable: { control: 'boolean' },
    compact: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    hideEyeDropper: { control: 'boolean' },
    hint: { control: 'text' },
    error: { control: 'text' },
    placeholder: { control: 'text' },
  },
  args: {
    format: 'hex',
    size: 'md',
    placement: 'bottom-start',
    alpha: false,
    clearable: false,
    compact: false,
    disabled: false,
    readonly: false,
    hideEyeDropper: false,
  },
  render: (args) => ({
    components: { VColorInput },
    setup: () => ({ args, t, value: ref<string | null>('#3b82f6') }),
    template: `
      <div style="max-inline-size: 20rem; min-block-size: 22rem">
        <VColorInput v-bind="args" v-model="value" :label="t.label" :hint="args.hint ?? t.hint" />
      </div>
    `,
  }),
} satisfies Meta<typeof VColorInput>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The colour is typed in any format and rewritten in `format`; the swatch opens the picker.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('combobox', { name: 'Brand colour' })
    await userEvent.clear(field)
    await userEvent.type(field, 'hsl(0 100% 50%){Enter}')
    await waitFor(() => expect(field).toHaveValue('#ff0000'))
    expect(field).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(canvas.getByRole('button', { name: 'Open colour picker' }))
    await waitFor(() => expect(field).toHaveAttribute('aria-expanded', 'true'))
    const saturation = within(document.body).getByRole('slider', { name: 'Saturation' })
    await waitFor(() => expect(saturation).toHaveFocus())
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(field).toHaveValue('#fc0000'))
  },
}

/** Escape closes the picker and hands the focus back to the field, as Enter in the picker does. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('combobox', { name: 'Brand colour' })
    field.focus()
    await userEvent.keyboard('{ArrowDown}')
    const page = within(document.body)
    await waitFor(() => expect(page.getByRole('slider', { name: 'Saturation' })).toHaveFocus())
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(field).toHaveAttribute('aria-expanded', 'false'))
    expect(field).toHaveFocus()

    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(page.getByRole('slider', { name: 'Saturation' })).toHaveFocus())
    await userEvent.keyboard('{ArrowLeft}')
    await waitFor(() => expect(field).toHaveValue('#3e84f6'))
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(field).toHaveFocus())
    expect(field).toHaveAttribute('aria-expanded', 'false')
  },
}

/**
 * `alpha` and `swatches` are handed to the picker; the swatch in the field shows the opacity. A
 * preset is a whole colour, so an opaque one replaces the opacity too.
 */
export const AlphaAndSwatches: Story = {
  args: { alpha: true, format: 'rgb' },
  render: (args) => ({
    components: { VColorInput },
    setup: () => ({
      args,
      t,
      value: ref<string | null>('rgb(14 165 233 / 0.6)'),
      swatches: ['#0ea5e9', '#16a34a', '#f59e0b', '#e11d48', '#7c3aed', '#0f172a'],
    }),
    template: `
      <div style="max-inline-size: 20rem; min-block-size: 24rem">
        <VColorInput v-bind="args" v-model="value" :swatches="swatches" :label="t.background" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Open colour picker' }))
    const page = within(document.body)
    await waitFor(() => expect(page.getByRole('slider', { name: 'Opacity' })).toHaveValue('60'))
    await userEvent.click(document.querySelectorAll('.v-color-picker-chip')[3]!)
    await waitFor(() =>
      expect(canvas.getByRole('combobox', { name: 'Background' })).toHaveValue('rgb(225 29 72)'),
    )
  },
}

/** `clearable` adds a cross that empties the value; the swatch then shows the checkerboard. */
export const Clearable: Story = {
  args: { clearable: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Clear colour' }))
    await waitFor(() =>
      expect(canvas.getByRole('combobox', { name: 'Brand colour' })).toHaveValue(''),
    )
  },
}

/** The error replaces the hint and is announced. */
export const WithError: Story = {
  render: () => ({
    components: { VColorInput },
    setup: () => ({ t, value: ref<string | null>(null) }),
    template: `
      <div style="max-inline-size: 20rem">
        <VColorInput v-model="value" :label="t.theme" :error="value ? undefined : t.required" required />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('combobox', { name: /Theme colour/ })
    expect(field).toHaveAccessibleDescription('Choose a colour for the theme.')
    expect(field).toHaveAttribute('aria-invalid', 'true')
  },
}

/** `size` sets the height of the field: 32, 40 or 48 pixels. */
export const Sizes: Story = {
  render: () => ({
    components: { VColorInput },
    setup: () => ({ t, sizes: ['sm', 'md', 'lg'] as const }),
    template: `
      <div style="display: grid; gap: 16px; max-inline-size: 20rem">
        <VColorInput v-for="size in sizes" :key="size" :size="size" model-value="#16a34a" :label="size" />
      </div>
    `,
  }),
}

/** Read-only, the field shows the colour with no picker; disabled, nothing responds. */
export const ReadonlyAndDisabled: Story = {
  render: () => ({
    components: { VColorInput },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 16px; max-inline-size: 20rem">
        <VColorInput model-value="#7c3aed" readonly :label="t.locked" />
        <VColorInput model-value="#7c3aed" disabled :label="t.theme" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByRole('textbox', { name: 'Locked colour' })).toHaveAttribute('readonly')
    expect(canvas.getByRole('button', { name: 'Open colour picker' })).toBeDisabled()
  },
}
