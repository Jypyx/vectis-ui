import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import Button from '../VButton/VButton.vue'
import Typography from '../VTypography/VTypography.vue'
import DialogAlert from './VDialogAlert.vue'

const meta = {
  title: 'Composants/DialogAlert',
  component: DialogAlert,
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    width: { control: 'text' },
  },
  args: {
    title: 'Supprimer le projet ?',
    subtitle: 'Cette action est définitive.',
    width: '400px',
  },
  render: (args) => ({
    components: { DialogAlert, Button, Typography },
    setup() {
      const open = ref(false)
      return { args, open }
    },
    template: `
      <DialogAlert v-bind="args" v-model:open="open">
        <template #trigger="{ triggerProps }">
          <Button tone="danger" v-bind="triggerProps">Supprimer</Button>
        </template>
        <Typography>
          Le projet et toutes ses données seront supprimés. Cette action ne peut pas être
          annulée.
        </Typography>
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

    // montage paresseux : le <dialog> n'est requêtable qu'une fois ouvert
    await userEvent.click(canvas.getByRole('button', { name: 'Supprimer' }))
    const dialog = await waitFor(() => {
      const el = canvasElement.querySelector('.v-dialog') as HTMLDialogElement | null
      expect(el?.open).toBe(true)
      return el!
    })
    expect(dialog.getAttribute('role')).toBe('alertdialog')

    // Échap ne ferme pas une alerte (closedby="none")
    await userEvent.keyboard('{Escape}')
    await new Promise((r) => setTimeout(r, 100))
    expect(dialog.open).toBe(true)

    // seule une action explicite ferme (le <dialog> est alors démonté)
    await userEvent.click(within(dialog).getByRole('button', { name: 'Annuler' }))
    await waitFor(() => expect(canvasElement.querySelector('.v-dialog')).toBeNull())
  },
}

/** Une alerte de confirmation neutre (ton non destructif). */
export const Confirmation: Story = {
  args: {
    title: 'Quitter sans enregistrer ?',
    subtitle: 'Vos modifications seront perdues.',
  },
  render: (args) => ({
    components: { DialogAlert, Button, Typography },
    setup() {
      const open = ref(false)
      return { args, open }
    },
    template: `
      <DialogAlert v-bind="args" v-model:open="open">
        <template #trigger="{ triggerProps }">
          <Button variant="outline" tone="neutral" v-bind="triggerProps">Quitter</Button>
        </template>
        <Typography>Un brouillon non enregistré sera définitivement perdu.</Typography>
        <template #footer>
          <Button variant="ghost" tone="neutral" @click="open = false">Continuer l'édition</Button>
          <Button @click="open = false">Quitter</Button>
        </template>
      </DialogAlert>
    `,
  }),
}
