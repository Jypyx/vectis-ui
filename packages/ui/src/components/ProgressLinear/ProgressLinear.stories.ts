import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ProgressLinear from './ProgressLinear.vue'

const meta = {
  title: 'Composants/ProgressLinear',
  component: ProgressLinear,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: { value: 40, max: 100, size: 'md' },
  render: (args) => ({
    components: { ProgressLinear },
    setup: () => ({ args }),
    template:
      '<div style="width: 320px"><ProgressLinear v-bind="args" aria-label="Progression" /></div>',
  }),
} satisfies Meta<typeof ProgressLinear>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Indetermine: Story = {
  args: { value: undefined },
}

export const Tailles: Story = {
  render: () => ({
    components: { ProgressLinear },
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <ProgressLinear size="sm" :value="30" aria-label="Petite" />
        <ProgressLinear size="md" :value="55" aria-label="Moyenne" />
        <ProgressLinear size="lg" :value="80" aria-label="Grande" />
      </div>
    `,
  }),
}
