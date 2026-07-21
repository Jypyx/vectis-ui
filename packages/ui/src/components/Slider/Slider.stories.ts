import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import Slider from './Slider.vue'

const meta = {
  title: 'Composants/Slider',
  component: Slider,
  args: { min: 0, max: 100, step: 1, label: 'Volume' },
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { Slider },
    setup: () => ({ args, value: ref(40) }),
    template: `
      <div style="display: grid; gap: 8px; width: 320px">
        <Slider v-bind="args" v-model="value" />
        <output>{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const slider = canvas.getByRole('slider', { name: 'Volume' })
    // clavier 100 % natif : la flèche incrémente la valeur
    slider.focus()
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(canvas.getByText('41')).toBeVisible())
  },
}

export const Range: Story = {
  render: (args) => ({
    components: { Slider },
    setup: () => ({ args, value: ref<[number, number]>([20, 60]) }),
    template: `
      <div style="display: grid; gap: 8px; width: 320px">
        <Slider v-bind="args" range v-model="value" label="Budget" />
        <output>{{ value[0] }} – {{ value[1] }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('slider', { name: 'Budget (début)' })).toBeVisible()
    await expect(canvas.getByRole('slider', { name: 'Budget (fin)' })).toBeVisible()
  },
}

export const Pas: Story = {
  render: (args) => ({
    components: { Slider },
    setup: () => ({ args, value: ref(50) }),
    template: `
      <div style="width: 320px">
        <Slider v-bind="args" v-model="value" :step="10" label="Par pas de 10" />
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: (args) => ({
    components: { Slider },
    setup: () => ({ args, value: ref(30) }),
    template: `
      <div style="width: 320px">
        <Slider v-bind="args" v-model="value" disabled />
      </div>
    `,
  }),
}
