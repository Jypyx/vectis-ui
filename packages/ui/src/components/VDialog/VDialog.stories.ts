import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import Button from '../VButton/VButton.vue'
import Typography from '../VTypography/VTypography.vue'
import Dialog from './VDialog.vue'

const meta = {
  title: 'Composants/Dialog',
  component: Dialog,
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    width: { control: 'text' },
    closable: { control: 'boolean' },
    closeOnBackdrop: { control: 'boolean' },
    closeOnEscape: { control: 'boolean' },
    closeLabel: { control: 'text' },
  },
  args: {
    title: 'Partager le document',
    subtitle: 'Choisissez qui peut accéder à ce fichier.',
    width: '400px',
    closable: true,
    closeOnBackdrop: true,
    closeOnEscape: true,
  },
  render: (args) => ({
    components: { Dialog, Button, Typography },
    setup() {
      const open = ref(false)
      return { args, open }
    },
    template: `
      <Dialog v-bind="args" v-model:open="open">
        <template #trigger="{ triggerProps }">
          <Button v-bind="triggerProps">Ouvrir la modale</Button>
        </template>
        <Typography>
          Toute personne disposant du lien pourra consulter le document. Vous pouvez
          révoquer l'accès à tout moment depuis les paramètres de partage.
        </Typography>
        <template #footer>
          <Button variant="ghost" tone="neutral" @click="open = false">Annuler</Button>
          <Button @click="open = false">Partager</Button>
        </template>
      </Dialog>
    `,
  }),
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // ouverture via le déclencheur (slot #trigger) : la modale passe en top layer.
    // Montage paresseux : le <dialog> n'existe dans le DOM qu'une fois ouvert,
    // il ne peut être requêté qu'après le clic.
    await userEvent.click(canvas.getByRole('button', { name: 'Ouvrir la modale' }))
    const dialog = await waitFor(() => {
      const el = canvasElement.querySelector('.v-dialog') as HTMLDialogElement | null
      expect(el?.open).toBe(true)
      return el!
    })

    // fermeture par la croix : le <dialog> est entièrement démonté
    await userEvent.click(within(dialog).getByRole('button', { name: 'Fermer' }))
    await waitFor(() => expect(canvasElement.querySelector('.v-dialog')).toBeNull())
  },
}

/**
 * La prop `width` accepte n'importe quelle unité CSS et reste bornée à 100 % du
 * viewport (en réduisant la fenêtre, la modale se rétracte).
 */
export const Largeur: Story = {
  render: (args) => ({
    components: { Dialog, Button, Typography },
    setup() {
      const opened = ref<string | null>(null)
      const widths = ['320px', '480px', '640px'] as const
      return { args, opened, widths }
    },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <Button v-for="w in widths" :key="w" variant="outline" tone="neutral" @click="opened = w">
          {{ w }}
        </Button>
      </div>
      <Dialog
        v-for="w in widths"
        :key="w"
        :width="w"
        :title="'Modale ' + w"
        subtitle="Largeur pilotée par la prop width."
        :open="opened === w"
        @update:open="(v) => { if (!v) opened = null }"
      >
        <Typography>Contenu de la modale en largeur {{ w }}.</Typography>
        <template #footer>
          <Button @click="opened = null">Fermer</Button>
        </template>
      </Dialog>
    `,
  }),
}

/**
 * Contenu qui déborde : le corps devient scrollable, header et footer restent
 * collés (sticky). Les séparateurs n'apparaissent que quand du contenu passe
 * sous le header ou sous le footer (scroll-state container queries, Chrome 133+).
 */
export const ContenuLong: Story = {
  render: (args) => ({
    components: { Dialog, Button, Typography },
    setup() {
      const open = ref(false)
      const paragraphs = Array.from({ length: 12 }, (_, i) => i + 1)
      return { args, open, paragraphs }
    },
    template: `
      <Dialog
        title="Conditions d'utilisation"
        subtitle="Faites défiler pour tout lire."
        v-model:open="open"
      >
        <template #trigger="{ triggerProps }">
          <Button v-bind="triggerProps">Lire les conditions</Button>
        </template>
        <p v-for="n in paragraphs" :key="n" style="margin: 0 0 12px">
          {{ n }}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
          nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <template #footer>
          <Button variant="ghost" tone="neutral" @click="open = false">Refuser</Button>
          <Button @click="open = false">Accepter</Button>
        </template>
      </Dialog>
    `,
  }),
}

/** Le slot `#header` remplace entièrement le bloc titre/sous-titre. */
export const HeaderPersonnalise: Story = {
  render: (args) => ({
    components: { Dialog, Button, Typography },
    setup() {
      const open = ref(false)
      return { args, open }
    },
    template: `
      <Dialog v-model:open="open" aria-label="Nouvelle version disponible">
        <template #trigger="{ triggerProps }">
          <Button v-bind="triggerProps">Header personnalisé</Button>
        </template>
        <template #header>
          <div style="display: flex; align-items: center; gap: 12px">
            <span
              style="display: grid; place-items: center; width: 40px; height: 40px; border-radius: 999px; background: var(--vectis-color-accent-surface); color: var(--vectis-color-accent-text)"
            >
              ✦
            </span>
            <Typography variant="heading-3" as="strong">Nouvelle version</Typography>
          </div>
        </template>
        <Typography>La version 2.0 est prête à être installée.</Typography>
        <template #footer>
          <Button @click="open = false">Plus tard</Button>
        </template>
      </Dialog>
    `,
  }),
}

/** Le slot `#headerActions` ajoute des contrôles juste à gauche de la croix. */
export const ActionsHeader: Story = {
  render: (args) => ({
    components: { Dialog, Button, Typography },
    setup() {
      const open = ref(false)
      return { args, open }
    },
    template: `
      <Dialog title="Aperçu" subtitle="document.pdf" v-model:open="open">
        <template #trigger="{ triggerProps }">
          <Button v-bind="triggerProps">Ouvrir l'aperçu</Button>
        </template>
        <template #headerActions>
          <Button variant="ghost" tone="neutral" size="sm" iconStart="download" aria-label="Télécharger" />
          <Button variant="ghost" tone="neutral" size="sm" iconStart="open_in_full" aria-label="Plein écran" />
        </template>
        <Typography>Zone d'aperçu du document.</Typography>
      </Dialog>
    `,
  }),
}

/** `closable=false` retire la croix : la fermeture passe alors par le footer ou Échap. */
export const SansCroix: Story = {
  args: { closable: false },
  render: (args) => ({
    components: { Dialog, Button, Typography },
    setup() {
      const open = ref(false)
      return { args, open }
    },
    template: `
      <Dialog v-bind="args" v-model:open="open">
        <template #trigger="{ triggerProps }">
          <Button v-bind="triggerProps">Ouvrir sans croix</Button>
        </template>
        <Typography>Pas de croix : utilisez les actions ci-dessous.</Typography>
        <template #footer>
          <Button variant="ghost" tone="neutral" @click="open = false">Annuler</Button>
          <Button @click="open = false">Valider</Button>
        </template>
      </Dialog>
    `,
  }),
}

/** Échap ferme la modale par défaut (`closeOnEscape`). */
export const FermetureEscape: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // montage paresseux : le <dialog> n'est requêtable qu'une fois ouvert
    await userEvent.click(canvas.getByRole('button', { name: 'Ouvrir la modale' }))
    const dialog = await waitFor(() => {
      const el = canvasElement.querySelector('.v-dialog') as HTMLDialogElement | null
      expect(el?.open).toBe(true)
      return el!
    })

    // Échap passe par le CloseWatcher natif (closedby), qui exige une frappe
    // *trusted* — impossible à synthétiser en play function. On emprunte la même
    // voie native (close() → événement 'close') pour vérifier NOTRE pont :
    // resynchronisation du v-model puis démontage complet.
    dialog.close()
    await waitFor(() => expect(canvasElement.querySelector('.v-dialog')).toBeNull())
  },
}
