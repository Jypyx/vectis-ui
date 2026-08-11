import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test'
import { computed, ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VSlider from './VSlider.vue'

const t = storyText({
  en: {
    volume: 'Volume',
    budget: 'Budget',
    stepsOfTen: 'In steps of 10',
    stepsOfTenNoTicks: 'In steps of 10, without ticks',
    range: 'Range',
    size: 'Size',
    muted: 'Muted',
    low: 'Low',
    loud: 'Loud',
    maximum: 'Maximum',
  },
  fr: {
    volume: 'Volume',
    budget: 'Budget',
    stepsOfTen: 'Par pas de 10',
    stepsOfTenNoTicks: 'Par pas de 10, sans ticks',
    range: 'Plage',
    size: 'Taille',
    muted: 'Muet',
    low: 'Faible',
    loud: 'Fort',
    maximum: 'Maximum',
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
    // The keyboard is 100% native, but a synthetic (untrusted) keydown does NOT trigger
    // the default behaviour of an <input type=range>: the effect of a right arrow is
    // simulated (a value + an input event) and the v-model bridge is checked.
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

// Clicking the track moves the value (single mode only — natively, through
// pointer-events; check it by hand: coordinate hit-testing is too fragile for a play
// function).
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

export const WithInputs: Story = {
  render: (args) => ({
    components: { VSlider },
    setup: () => ({ args, t, value: ref(40), rangeValue: ref<[number, number]>([20, 60]) }),
    template: `
      <div style="display: grid; gap: 24px; width: 420px">
        <VSlider v-bind="args" inputs v-model="value" :label="t.volume" />
        <output>{{ value }}</output>
        <VSlider v-bind="args" inputs range v-model="rangeValue" :label="t.budget" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // an out-of-bounds entry → committed on change → clamped to max. A synthetic
    // {Enter} does not trigger the native change: the field is left (blur) as a real
    // user would.
    const field = canvas.getByRole('spinbutton', { name: 'Volume' })
    await userEvent.clear(field)
    await userEvent.type(field, '150')
    await userEvent.tab()
    await waitFor(() => expect(canvas.getByText('100')).toBeVisible())
    await waitFor(() => expect(field).toHaveValue(100))
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
    // non-numeric values are announced through aria-valuetext
    const slider = canvas.getByRole('slider', { name: 'Size' }) as HTMLInputElement
    await expect(slider).toHaveAttribute('aria-valuetext', 'M')
    // the same limit as Default: the effect of ArrowRight is simulated (a value + input)
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
    // keyboard focus (focus-visible) shows the bubble of the thumb being manipulated
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
        <VSlider v-bind="args" orientation="vertical" inputs range tooltip v-model="rangeValue" :label="t.budget" />
      </div>
    `,
  }),
}
