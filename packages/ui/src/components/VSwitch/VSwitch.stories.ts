import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import VSwitch from './VSwitch.vue'

const meta = {
  title: 'Composants/Switch',
  component: VSwitch,
  argTypes: {
    labelPosition: { control: 'select', options: ['start', 'end'] },
  },
  args: {
    labelPosition: 'end',
    spread: false,
    disabled: false,
  },
  render: (args) => ({
    components: { VSwitch },
    setup: () => ({ args, on: ref(false) }),
    template: '<VSwitch v-bind="args" v-model="on">Notifications</VSwitch>',
  }),
} satisfies Meta<typeof VSwitch>

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
    components: { VSwitch },
    setup: () => ({ a: ref(false), b: ref(true) }),
    template: `
      <div style="display: grid; gap: 8px; justify-items: start">
        <VSwitch v-model="a" label-position="end">Libellé après (défaut)</VSwitch>
        <VSwitch v-model="b" label-position="start">Libellé avant</VSwitch>
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
    components: { VSwitch },
    setup: () => ({ a: ref(true), b: ref(false) }),
    template: `
      <div style="display: grid; gap: 8px; max-width: 320px">
        <VSwitch v-model="a" spread>VSwitch à droite</VSwitch>
        <VSwitch v-model="b" spread label-position="start">VSwitch à gauche</VSwitch>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { VSwitch },
    setup: () => ({ on: ref(true), off: ref(false) }),
    template: `
      <div style="display: grid; gap: 8px">
        <VSwitch v-model="off" disabled>Désactivé</VSwitch>
        <VSwitch v-model="on" disabled>Désactivé actif</VSwitch>
      </div>
    `,
  }),
}

export const SansLibelle: Story = {
  render: () => ({
    components: { VSwitch },
    setup: () => ({ on: ref(false) }),
    template: '<VSwitch v-model="on" aria-label="Activer les notifications" />',
  }),
}
