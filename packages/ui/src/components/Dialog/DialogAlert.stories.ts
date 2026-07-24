import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import Button from '../Button/Button.vue'
import DialogAlert from './DialogAlert.vue'

const meta = {
  title: 'Composants/DialogAlert',
  component: DialogAlert,
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  args: {
    title: 'Supprimer le projet ?',
    subtitle: 'Cette action est définitive.',
    size: 'sm',
  },
  render: (args) => ({
    components: { DialogAlert, Button },
    setup() {
      const open = ref(false)
      return { args, open }
    },
    template: `
      <DialogAlert v-bind="args" v-model:open="open">
        <template #trigger="{ triggerProps }">
          <Button tone="danger" v-bind="triggerProps">Supprimer</Button>
        </template>
        <p style="margin: 0">
          Le projet et toutes ses données seront supprimés. Cette action ne peut pas être
          annulée.
        </p>
        <template #footer>
          <Button variant="ghost" tone="neutral" @click="open = false">Annuler</Button>
          <Button tone="danger" @click="open = false">Supprimer définitivement</Button>
        </template>
      </DialogAlert>
    `,
  }),
} satisfies Meta<typeof DialogAlert>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Une alerte exige une action explicite : pas de croix, le clic sur le backdrop
 * ET la touche Échap sont neutralisés. Seuls les boutons du footer ferment.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const dialog = canvasElement.querySelector('.ds-dialog') as HTMLDialogElement

    await userEvent.click(canvas.getByRole('button', { name: 'Supprimer' }))
    await waitFor(() => expect(dialog.open).toBe(true))
    expect(dialog.getAttribute('role')).toBe('alertdialog')

    // Échap ne ferme pas une alerte (closedby="none")
    await userEvent.keyboard('{Escape}')
    await new Promise((r) => setTimeout(r, 100))
    expect(dialog.open).toBe(true)

    // seule une action explicite ferme
    await userEvent.click(within(dialog).getByRole('button', { name: 'Annuler' }))
    await waitFor(() => expect(dialog.open).toBe(false))
  },
}

/** Une alerte de confirmation neutre (ton non destructif). */
export const Confirmation: Story = {
  args: {
    title: 'Quitter sans enregistrer ?',
    subtitle: 'Vos modifications seront perdues.',
  },
  render: (args) => ({
    components: { DialogAlert, Button },
    setup() {
      const open = ref(false)
      return { args, open }
    },
    template: `
      <DialogAlert v-bind="args" v-model:open="open">
        <template #trigger="{ triggerProps }">
          <Button variant="outline" tone="neutral" v-bind="triggerProps">Quitter</Button>
        </template>
        <p style="margin: 0">Un brouillon non enregistré sera définitivement perdu.</p>
        <template #footer>
          <Button variant="ghost" tone="neutral" @click="open = false">Continuer l'édition</Button>
          <Button @click="open = false">Quitter</Button>
        </template>
      </DialogAlert>
    `,
  }),
}
