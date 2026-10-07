import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test'
import { computed, ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VSlider from './VSlider.vue'

const t = storyText({
  en: {
    volume: 'Volume',
    budget: 'Budget',
    price: 'Price',
    stepsOfTen: 'In steps of 10',
    stepsOfTenNoTicks: 'In steps of 10, without ticks',
    range: 'Range',
    size: 'Size',
    muted: 'Muted',
    low: 'Low',
    loud: 'Loud',
    maximum: 'Maximum',
    small: 'Small fields',
    medium: 'Medium fields (default)',
    large: 'Large fields',
    quota: 'Quota',
    quotaHint: 'Between 0 and 100 GB, in steps of 5.',
  },
  fr: {
    volume: 'Volume',
    budget: 'Budget',
    price: 'Prix',
    stepsOfTen: 'Par pas de 10',
    stepsOfTenNoTicks: 'Par pas de 10, sans ticks',
    range: 'Plage',
    size: 'Taille',
    muted: 'Muet',
    low: 'Faible',
    loud: 'Fort',
    maximum: 'Maximum',
    small: 'Petits champs',
    medium: 'Champs moyens (défaut)',
    large: 'Grands champs',
    quota: 'Quota',
    quotaHint: 'Entre 0 et 100 Go, par pas de 5.',
  },
})

const meta = {
  title: 'Components/Slider',
  component: VSlider,
  args: { min: 0, max: 100, step: 1 },
} satisfies Meta<typeof VSlider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({ args, t, value: ref(40) }),
    template: `
      <div style="display: grid; gap: 8px; width: 320px">
        <VSlider v-bind="args" v-model="value" :label="t.volume" />
        <output>{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const slider = canvas.getByRole('slider', { name: 'Volume' }) as HTMLInputElement
    // The keyboard is 100% native, but a synthetic (untrusted) keydown does not trigger the
    // default behaviour of an <input type=range>: the effect of a right arrow is simulated (a
    // value + an input event) and the v-model bridge is checked.
    slider.focus()
    slider.value = '41'
    await fireEvent.input(slider)
    await waitFor(() => expect(canvas.getByText('41')).toBeVisible())
  },
}

export const Range: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({ args, t, value: ref<[number, number]>([20, 60]) }),
    template: `
      <div style="display: grid; gap: 8px; width: 320px">
        <VSlider v-bind="args" range v-model="value" :label="t.budget" />
        <output>{{ value[0] }} – {{ value[1] }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('slider', { name: 'Budget (start)' })).toBeVisible()
    await expect(canvas.getByRole('slider', { name: 'Budget (end)' })).toBeVisible()
  },
}

// Clicking the track moves the value (single mode only; natively, through pointer-events; check
// it by hand: coordinate hit-testing is too fragile for a play function).
export const Steps: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({ args, t, value: ref(50), valueWithoutTicks: ref(50) }),
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <VSlider v-bind="args" v-model="value" :step="10" ticks :label="t.stepsOfTen" />
        <VSlider v-bind="args" v-model="valueWithoutTicks" :step="10" :label="t.stepsOfTenNoTicks" />
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({ args, t, value: ref(30), rangeValue: ref<[number, number]>([20, 60]) }),
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <VSlider v-bind="args" v-model="value" disabled :label="t.volume" />
        <VSlider v-bind="args" range v-model="rangeValue" :step="10" ticks disabled :label="t.range" />
      </div>
    `,
  }),
}

export const Vertical: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({ args, t, value: ref(40), rangeValue: ref<[number, number]>([20, 60]) }),
    template: `
      <div style="display: flex; gap: 48px; align-items: start">
        <VSlider v-bind="args" orientation="vertical" v-model="value" :label="t.volume" />
        <VSlider v-bind="args" orientation="vertical" range v-model="rangeValue" :label="t.budget" />
        <!-- the length is overridden through the token, with no inline style in the component -->
        <VSlider
          v-bind="args"
          orientation="vertical"
          v-model="value"
          :label="t.volume"
          style="--vectis-control-size-slider-length: 16rem"
        />
      </div>
    `,
  }),
}

/**
 * `hint` draws a line of help under the track and ties it to the thumb through
 * `aria-describedby`, appended to whatever the consumer already pointed at.
 */
export const WithHint: Story = {
  render: () => ({
    components: { VSlider },
    setup: () => ({ t, value: ref(40) }),
    template: `
      <div style="width: 320px">
        <VSlider v-model="value" :label="t.quota" :hint="t.quotaHint" :step="5" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const slider = within(canvasElement).getByRole('slider', { name: 'Quota' })
    await expect(slider).toHaveAccessibleDescription('Between 0 and 100 GB, in steps of 5.')
  },
}

export const WithInputs: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({ args, t, value: ref(40), rangeValue: ref<[number, number]>([20, 60]) }),
    template: `
      <div style="display: grid; gap: 24px; width: 420px">
        <VSlider v-bind="args" inputs="ends" v-model="value" :label="t.volume" />
        <output>{{ value }}</output>
        <VSlider v-bind="args" inputs="ends" range v-model="rangeValue" :label="t.budget" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The label sits above everything else, the fields at the ends included.
    for (const slider of canvasElement.querySelectorAll('.v-slider')) {
      const name = slider.querySelector('.v-field-label')!.getBoundingClientRect()
      const field = slider.querySelector('.v-slider-field')!.getBoundingClientRect()
      await expect(name.bottom).toBeLessThanOrEqual(field.top)
      await expect(name.left).toBeCloseTo(slider.getBoundingClientRect().left, 0)
    }
    // An out-of-bounds entry is clamped to max when the field is left. The field is a text box
    // announced as a spinbutton, so its value is text.
    const field = canvas.getByRole('spinbutton', { name: 'Volume' })
    await userEvent.clear(field)
    await userEvent.type(field, '150')
    await userEvent.tab()
    await waitFor(() => expect(canvas.getByText('100')).toBeVisible())
    await waitFor(() => expect(field).toHaveValue('100'))
  },
}

/**
 * `formatOptions` and `locale` write the value in the bubble, the number fields and what the
 * thumbs announce: here a price filter in euros.
 */
export const Price: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({
      args,
      t,
      value: ref<[number, number]>([120, 300]),
      euros: { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 },
    }),
    template: `
      <div style="width: 420px; padding-block-start: 32px">
        <VSlider
          v-bind="args"
          v-model="value"
          range
          :max="500"
          :step="10"
          inputs="ends"
          tooltip
          locale="fr-FR"
          :format-options="euros"
          :label="t.price"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const euros = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    })
    const start = canvas.getByRole('slider', { name: 'Price (start)' }) as HTMLInputElement
    await expect(start).toHaveAttribute('aria-valuetext', euros.format(120))
    await expect(canvas.getByRole('spinbutton', { name: 'Price (end)' })).toHaveValue(
      euros.format(300),
    )
    start.focus()
    start.value = '130'
    await fireEvent.input(start)
    // Compared as text: the matcher would fold the no-break space into a plain one.
    await waitFor(() =>
      expect(canvasElement.querySelector('.v-slider-tooltip-start')?.textContent).toBe(
        euros.format(130),
      ),
    )
  },
}

/**
 * `inputs` takes a placement: `ends` on either side of the track, `top` and `bottom` in a row
 * above or below it, each field at the edge of the value it holds.
 */
export const InputPlacements: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({
      args,
      t,
      a: ref<[number, number]>([20, 60]),
      b: ref(2),
      c: ref<[number, number]>([20, 60]),
      d: ref(40),
    }),
    template: `
      <div style="display: grid; gap: 32px; width: 420px">
        <VSlider v-bind="args" class="h-top" inputs="top" range v-model="a" :label="t.budget" />
        <VSlider
          v-bind="args"
          class="h-bottom"
          inputs="bottom"
          v-model="b"
          :min="0"
          :max="4"
          :labels="['XS', 'S', 'M', 'L', 'XL']"
          :label="t.size"
        />
        <div style="display: flex; gap: 48px">
          <VSlider v-bind="args" class="v-top" orientation="vertical" inputs="top" range v-model="c" :label="t.range" />
          <VSlider v-bind="args" class="v-bottom" orientation="vertical" inputs="bottom" v-model="d" :label="t.volume" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    // Jsdom lays nothing out, so the grid templates are only ever checked here.
    const parts = (cls: string) => {
      const root = canvasElement.querySelector(`.${cls}`)!
      const box = (sel: string) => root.querySelector(sel)?.getBoundingClientRect()
      return {
        rail: box('.v-slider-rail')!,
        labels: box('.v-slider-labels'),
        start: box('.v-slider-field-start'),
        end: box('.v-slider-field-end')!,
      }
    }
    const near = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThan(1)

    const hTop = parts('h-top')
    await expect(hTop.start!.bottom).toBeLessThanOrEqual(hTop.rail.top)
    await expect(hTop.end.bottom).toBeLessThanOrEqual(hTop.rail.top)
    near(hTop.start!.left, hTop.rail.left)
    near(hTop.end.right, hTop.rail.right)

    const hBottom = parts('h-bottom')
    await expect(hBottom.end.top).toBeGreaterThanOrEqual(hBottom.labels!.bottom)
    near(hBottom.end.right, hBottom.rail.right)

    const vTop = parts('v-top')
    await expect(vTop.end.right).toBeLessThanOrEqual(vTop.rail.left)
    near(vTop.end.top, vTop.rail.top)
    near(vTop.start!.bottom, vTop.rail.bottom)

    const vBottom = parts('v-bottom')
    await expect(vBottom.end.left).toBeGreaterThanOrEqual(vBottom.rail.right)
    near(vBottom.end.top, vBottom.rail.top)
  },
}

export const TextLabels: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({ args, t, value: ref(2) }),
    template: `
      <div style="width: 320px; padding-inline: 16px">
        <VSlider
          v-bind="args"
          v-model="value"
          :min="0"
          :max="4"
          :step="1"
          :labels="['XS', 'S', 'M', 'L', 'XL']"
          :label="t.size"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Non-numeric values are announced through aria-valuetext
    const slider = canvas.getByRole('slider', { name: 'Size' }) as HTMLInputElement
    await expect(slider).toHaveAttribute('aria-valuetext', 'M')
    slider.focus()
    slider.value = '3'
    await fireEvent.input(slider)
    await waitFor(() => expect(slider).toHaveAttribute('aria-valuetext', 'L'))
  },
}

export const IconLabels: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({
      args,
      t,
      value: ref(1),
      labels: computed(() => [
        { icon: 'volume_mute', label: t.value.muted },
        { icon: 'volume_down', label: t.value.low },
        { icon: 'volume_up', label: t.value.loud },
        { icon: 'campaign', label: t.value.maximum },
      ]),
    }),
    template: `
      <div style="width: 320px; padding-inline: 16px">
        <VSlider
          v-bind="args"
          v-model="value"
          :min="0"
          :max="3"
          :step="1"
          :labels="labels"
          :label="t.volume"
        />
      </div>
    `,
  }),
}

export const WithTooltip: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({ args, t, value: ref(40), rangeValue: ref<[number, number]>([20, 60]) }),
    template: `
      <div style="display: grid; gap: 32px; width: 320px; padding-top: 32px">
        <VSlider v-bind="args" tooltip v-model="value" :label="t.volume" />
        <VSlider v-bind="args" tooltip range v-model="rangeValue" :label="t.budget" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Keyboard focus (focus-visible) shows the bubble of the thumb being manipulated
    await userEvent.tab()
    await waitFor(() => expect(canvas.getByText('40')).toBeVisible())
  },
}

export const FullVertical: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({ args, t, value: ref(2), rangeValue: ref<[number, number]>([20, 60]) }),
    template: `
      <div style="display: flex; gap: 96px; align-items: start; padding-inline-start: 48px">
        <VSlider
          v-bind="args"
          orientation="vertical"
          v-model="value"
          :min="0"
          :max="4"
          :step="1"
          :labels="['XS', 'S', 'M', 'L', 'XL']"
          tooltip
          :label="t.size"
        />
        <VSlider v-bind="args" orientation="vertical" inputs="ends" range tooltip v-model="rangeValue" :label="t.budget" />
      </div>
    `,
  }),
}

/**
 * `readonly` keeps the thumbs focusable and announced, and refuses every change: the keys that
 * move a thumb are cancelled, and a thumb the pointer has already moved is put back before the
 * browser paints.
 */
export const ReadOnly: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({ args, t, value: ref(40), rangeValue: ref<[number, number]>([20, 60]) }),
    template: `
      <div style="display: grid; gap: 24px; width: 420px">
        <VSlider v-bind="args" v-model="value" readonly inputs="ends" :step="10" ticks :label="t.volume" />
        <output data-testid="mirror">{{ value }}</output>
        <VSlider v-bind="args" v-model="rangeValue" readonly range :label="t.budget" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const slider = canvas.getByRole('slider', { name: 'Volume' }) as HTMLInputElement
    await expect(slider).toHaveAttribute('aria-readonly', 'true')
    await expect(slider).not.toBeDisabled()
    slider.focus()
    const key = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
    slider.dispatchEvent(key)
    await expect(key.defaultPrevented).toBe(true)
    // A pointer: the native thumb has moved when `input` fires, and is put back.
    slider.value = '80'
    await fireEvent.input(slider)
    await expect(slider.value).toBe('40')
    await expect(canvas.getByTestId('mirror')).toHaveTextContent('40')
    await expect(slider).toHaveFocus()
    await expect(canvas.getByRole('spinbutton', { name: 'Volume' })).toHaveAttribute('readonly')
  },
}

/** `invalid` rings the thumbs in the danger colour and sets `aria-invalid` on each. */
export const Invalid: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({ args, t, value: ref<[number, number]>([30, 90]) }),
    template: `
      <div style="width: 420px">
        <VSlider v-bind="args" v-model="value" range inputs="ends" invalid :label="t.quota" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    for (const thumb of canvas.getAllByRole('slider'))
      await expect(thumb).toHaveAttribute('aria-invalid', 'true')
  },
}

/** `size` sets the height of the number fields, md by default, as on every other field. */
export const Sizes: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({ args, t, a: ref(20), b: ref(40), c: ref(60) }),
    template: `
      <div style="display: grid; gap: 24px; width: 420px">
        <VSlider v-bind="args" v-model="a" inputs="ends" size="sm" :label="t.small" />
        <VSlider v-bind="args" v-model="b" inputs="ends" :label="t.medium" />
        <VSlider v-bind="args" v-model="c" inputs="ends" size="lg" :label="t.large" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const heights = [...canvasElement.querySelectorAll('.v-slider-field .v-input-field')].map(
      (el) => Math.round(el.getBoundingClientRect().height),
    )
    await expect(heights).toEqual([32, 40, 48])
  },
}
