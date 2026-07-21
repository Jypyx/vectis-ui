import type { Meta, StoryObj } from '@storybook/vue3-vite'

import Badge from './Badge.vue'

const meta = {
  title: 'Composants/Badge',
  component: Badge,
  argTypes: {
    tone: { control: 'select', options: ['neutral', 'accent', 'danger', 'success', 'warning'] },
    variant: { control: 'select', options: ['soft', 'solid', 'outline'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
  args: { tone: 'neutral', variant: 'soft', size: 'md' },
  render: (args) => ({
    components: { Badge },
    setup: () => ({ args }),
    template: '<Badge v-bind="args">Nouveau</Badge>',
  }),
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variantes: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div style="display: grid; gap: 12px">
        <div v-for="variant in ['soft', 'solid', 'outline']" :key="variant" style="display: flex; gap: 8px">
          <Badge v-for="tone in ['neutral', 'accent', 'success', 'warning', 'danger']" :key="tone" :tone="tone" :variant="variant">
            {{ tone }}
          </Badge>
        </div>
      </div>
    `,
  }),
}

export const AvecPastille: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <Badge tone="success">
        <svg viewBox="0 0 8 8" width="8" height="8" aria-hidden="true"><circle cx="4" cy="4" r="3" fill="currentcolor" /></svg>
        En ligne
      </Badge>
    `,
  }),
}
