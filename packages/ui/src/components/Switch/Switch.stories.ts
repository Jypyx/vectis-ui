import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ref } from 'vue'

import Switch from './Switch.vue'

const meta = {
  title: 'Composants/Switch',
  component: Switch,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: {
    size: 'md',
    disabled: false,
  },
  render: (args) => ({
    components: { Switch },
    setup: () => ({ args, on: ref(false) }),
    template: '<Switch v-bind="args" v-model="on">Notifications</Switch>',
  }),
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    // role="switch" : sémantique correcte pour les lecteurs d'écran
    const sw = within(canvasElement).getByRole('switch', { name: 'Notifications' })
    await expect(sw).not.toBeChecked()
    await userEvent.click(sw)
    await expect(sw).toBeChecked()
  },
}

export const Tailles: Story = {
  render: () => ({
    components: { Switch },
    setup: () => ({ a: ref(true), b: ref(true), c: ref(true) }),
    template: `
      <div style="display: grid; gap: 8px">
        <Switch v-model="a" size="sm">Small</Switch>
        <Switch v-model="b" size="md">Medium</Switch>
        <Switch v-model="c" size="lg">Large</Switch>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { Switch },
    setup: () => ({ on: ref(true), off: ref(false) }),
    template: `
      <div style="display: grid; gap: 8px">
        <Switch v-model="off" disabled>Désactivé</Switch>
        <Switch v-model="on" disabled>Désactivé actif</Switch>
      </div>
    `,
  }),
}

export const SansLibelle: Story = {
  render: () => ({
    components: { Switch },
    setup: () => ({ on: ref(false) }),
    template: '<Switch v-model="on" aria-label="Activer les notifications" />',
  }),
}
