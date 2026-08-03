import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import VButton from '../VButton/VButton.vue'
import VTypography from '../VTypography/VTypography.vue'
import VDialogAlert from './VDialogAlert.vue'

const meta = {
  title: 'Composants/DialogAlert',
  component: VDialogAlert,
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
    components: { VDialogAlert, VButton, VTypography },
    setup() {
      const open = ref(false)
      return { args, open }
    },
    template: `
      <VDialogAlert v-bind="args" v-model:open="open">
        <template #trigger="{ triggerProps }">
          <VButton tone="danger" v-bind="triggerProps">Supprimer</VButton>
        </template>
        <VTypography>
          Le projet et toutes ses données seront supprimés. Cette action ne peut pas être
          annulée.
        </VTypography>
        <template #footer>
          <VButton variant="ghost" tone="neutral" @click="open = false">Annuler</VButton>
          <VButton tone="danger" @click="open = false">Supprimer définitivement</VButton>
        </template>
      </VDialogAlert>
    `,
  }),
} satisfies Meta<typeof VDialogAlert>

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
    components: { VDialogAlert, VButton, VTypography },
    setup() {
      const open = ref(false)
      return { args, open }
    },
    template: `
      <VDialogAlert v-bind="args" v-model:open="open">
        <template #trigger="{ triggerProps }">
          <VButton variant="outline" tone="neutral" v-bind="triggerProps">Quitter</VButton>
        </template>
        <VTypography>Un brouillon non enregistré sera définitivement perdu.</VTypography>
        <template #footer>
          <VButton variant="ghost" tone="neutral" @click="open = false">Continuer l'édition</VButton>
          <VButton @click="open = false">Quitter</VButton>
        </template>
      </VDialogAlert>
    `,
  }),
}
