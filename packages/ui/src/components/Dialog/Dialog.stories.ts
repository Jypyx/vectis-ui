import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import Button from '../Button/Button.vue'
import Dialog from './Dialog.vue'

const meta = {
  title: 'Composants/Dialog',
  component: Dialog,
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { Dialog, Button },
    setup: () => ({ open: ref(false) }),
    template: `
      <Button @click="open = true">Supprimer le projet</Button>
      <Dialog v-model:open="open" title="Confirmer la suppression">
        Cette action est définitive : le projet et toutes ses données seront supprimés.
        <template #footer>
          <Button tone="neutral" variant="outline" @click="open = false">Annuler</Button>
          <Button tone="danger" @click="open = false">Supprimer</Button>
        </template>
      </Dialog>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const dialog = canvasElement.querySelector('dialog')

    // ouverture au clic sur le déclencheur
    await userEvent.click(canvas.getByRole('button', { name: 'Supprimer le projet' }))
    await waitFor(() => expect(dialog?.open).toBe(true))

    // fermeture par une action du footer
    await userEvent.click(canvas.getByRole('button', { name: 'Annuler' }))
    await waitFor(() => expect(dialog?.open).toBe(false))
  },
}

export const FermetureEscape: Story = {
  render: () => ({
    components: { Dialog, Button },
    setup: () => ({ open: ref(false) }),
    template: `
      <Button @click="open = true">Ouvrir</Button>
      <Dialog v-model:open="open" title="Fermeture clavier">
        Appuyez sur Échap : la fermeture est gérée nativement par le dialog.
      </Dialog>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const dialog = canvasElement.querySelector('dialog')

    await userEvent.click(canvas.getByRole('button', { name: 'Ouvrir' }))
    await waitFor(() => expect(dialog?.open).toBe(true))

    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(dialog?.open).toBe(false))
  },
}

export const SansFermeture: Story = {
  render: () => ({
    components: { Dialog, Button },
    setup: () => ({ open: ref(false) }),
    template: `
      <Button @click="open = true">Ouvrir</Button>
      <Dialog v-model:open="open" title="Choix obligatoire" :dismissible="false" :close-on-backdrop="false">
        Pas de croix, pas de clic backdrop : la fermeture passe par une action explicite.
        <template #footer>
          <Button @click="open = false">J'ai compris</Button>
        </template>
      </Dialog>
    `,
  }),
}

export const TitreRiche: Story = {
  render: () => ({
    components: { Dialog, Button },
    setup: () => ({ open: ref(false) }),
    template: `
      <Button @click="open = true">Ouvrir</Button>
      <Dialog v-model:open="open">
        <template #title>Publier <em>« Ma super page »</em> ?</template>
        La page sera visible publiquement dès validation.
        <template #footer>
          <Button tone="neutral" variant="ghost" @click="open = false">Plus tard</Button>
          <Button @click="open = false">Publier</Button>
        </template>
      </Dialog>
    `,
  }),
}

export const ContenuLong: Story = {
  render: () => ({
    components: { Dialog, Button },
    setup: () => ({ open: ref(false) }),
    template: `
      <Button @click="open = true">Conditions d'utilisation</Button>
      <Dialog v-model:open="open" title="Conditions d'utilisation">
        <p v-for="i in 20" :key="i" style="margin-bottom: 8px">
          Paragraphe {{ i }} — le dialog scrolle nativement au-delà de la hauteur du viewport,
          sans qu'aucun JS de gestion de scroll ne soit nécessaire.
        </p>
        <template #footer>
          <Button @click="open = false">Accepter</Button>
        </template>
      </Dialog>
    `,
  }),
}
