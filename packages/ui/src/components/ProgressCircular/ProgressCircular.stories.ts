import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'

import ProgressCircular from './ProgressCircular.vue'

const meta = {
  title: 'Composants/ProgressCircular',
  component: ProgressCircular,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: { value: 65, max: 100, size: 'md', label: 'Progression' },
} satisfies Meta<typeof ProgressCircular>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole('progressbar')
    await expect(bar).toHaveAttribute('aria-valuenow', '65')
  },
}

export const Indetermine: Story = {
  args: { value: undefined, label: 'Chargement…' },
}

export const Tailles: Story = {
  render: () => ({
    components: { ProgressCircular },
    template: `
      <div style="display: flex; gap: 16px; align-items: center">
        <ProgressCircular size="sm" :value="25" label="25 %" />
        <ProgressCircular size="md" :value="50" label="50 %" />
        <ProgressCircular size="lg" :value="75" label="75 %" />
      </div>
    `,
  }),
}
