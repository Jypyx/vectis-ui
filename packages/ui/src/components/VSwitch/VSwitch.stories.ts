import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import Switch from './VSwitch.vue'

const meta = {
  title: 'Composants/Switch',
  component: Switch,
  argTypes: {
    labelPosition: { control: 'select', options: ['start', 'end'] },
  },
  args: {
    labelPosition: 'end',
    spread: false,
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
    // l'input masqué est en pointer-events: none : on clique le <label> englobant
    await userEvent.click(sw.closest('label')!)
    await waitFor(() => expect(sw).toBeChecked())
  },
}

export const PositionDuLibelle: Story = {
  render: () => ({
    components: { Switch },
    setup: () => ({ a: ref(false), b: ref(true) }),
    template: `
      <div style="display: grid; gap: 8px; justify-items: start">
        <Switch v-model="a" label-position="end">Libellé après (défaut)</Switch>
        <Switch v-model="b" label-position="start">Libellé avant</Switch>
      </div>
    `,
  }),
}

/**
 * `spread` : la racine passe en flex pleine largeur, libellé et switch sont
 * repoussés aux extrémités du conteneur.
 */
export const Spread: Story = {
  render: () => ({
    components: { Switch },
    setup: () => ({ a: ref(true), b: ref(false) }),
    template: `
      <div style="display: grid; gap: 8px; max-width: 320px">
        <Switch v-model="a" spread>Switch à droite</Switch>
        <Switch v-model="b" spread label-position="start">Switch à gauche</Switch>
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
