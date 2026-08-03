import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import VButton from '../VButton/VButton.vue'
import VTypography from '../VTypography/VTypography.vue'
import VDialog from './VDialog.vue'

const meta = {
  title: 'Composants/Dialog',
  component: VDialog,
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
    components: { VDialog, VButton, VTypography },
    setup() {
      const open = ref(false)
      return { args, open }
    },
    template: `
      <VDialog v-bind="args" v-model:open="open">
        <template #trigger="{ triggerProps }">
          <VButton v-bind="triggerProps">Ouvrir la modale</VButton>
        </template>
        <VTypography>
          Toute personne disposant du lien pourra consulter le document. Vous pouvez
          révoquer l'accès à tout moment depuis les paramètres de partage.
        </VTypography>
        <template #footer>
          <VButton variant="ghost" tone="neutral" @click="open = false">Annuler</VButton>
          <VButton @click="open = false">Partager</VButton>
        </template>
      </VDialog>
    `,
  }),
} satisfies Meta<typeof VDialog>

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
    components: { VDialog, VButton, VTypography },
    setup() {
      const opened = ref<string | null>(null)
      const widths = ['320px', '480px', '640px'] as const
      return { args, opened, widths }
    },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <VButton v-for="w in widths" :key="w" variant="outline" tone="neutral" @click="opened = w">
          {{ w }}
        </VButton>
      </div>
      <VDialog
        v-for="w in widths"
        :key="w"
        :width="w"
        :title="'Modale ' + w"
        subtitle="Largeur pilotée par la prop width."
        :open="opened === w"
        @update:open="(v) => { if (!v) opened = null }"
      >
        <VTypography>Contenu de la modale en largeur {{ w }}.</VTypography>
        <template #footer>
          <VButton @click="opened = null">Fermer</VButton>
        </template>
      </VDialog>
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
    components: { VDialog, VButton, VTypography },
    setup() {
      const open = ref(false)
      const paragraphs = Array.from({ length: 12 }, (_, i) => i + 1)
      return { args, open, paragraphs }
    },
    template: `
      <VDialog
        title="Conditions d'utilisation"
        subtitle="Faites défiler pour tout lire."
        v-model:open="open"
      >
        <template #trigger="{ triggerProps }">
          <VButton v-bind="triggerProps">Lire les conditions</VButton>
        </template>
        <p v-for="n in paragraphs" :key="n" style="margin: 0 0 12px">
          {{ n }}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
          nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <template #footer>
          <VButton variant="ghost" tone="neutral" @click="open = false">Refuser</VButton>
          <VButton @click="open = false">Accepter</VButton>
        </template>
      </VDialog>
    `,
  }),
}

/** Le slot `#header` remplace entièrement le bloc titre/sous-titre. */
export const HeaderPersonnalise: Story = {
  render: (args) => ({
    components: { VDialog, VButton, VTypography },
    setup() {
      const open = ref(false)
      return { args, open }
    },
    template: `
      <VDialog v-model:open="open" aria-label="Nouvelle version disponible">
        <template #trigger="{ triggerProps }">
          <VButton v-bind="triggerProps">Header personnalisé</VButton>
        </template>
        <template #header>
          <div style="display: flex; align-items: center; gap: 12px">
            <span
              style="display: grid; place-items: center; width: 40px; height: 40px; border-radius: 999px; background: var(--vectis-color-accent-surface); color: var(--vectis-color-accent-text)"
            >
              ✦
            </span>
            <VTypography variant="heading-3" as="strong">Nouvelle version</VTypography>
          </div>
        </template>
        <VTypography>La version 2.0 est prête à être installée.</VTypography>
        <template #footer>
          <VButton @click="open = false">Plus tard</VButton>
        </template>
      </VDialog>
    `,
  }),
}

/** Le slot `#headerActions` ajoute des contrôles juste à gauche de la croix. */
export const ActionsHeader: Story = {
  render: (args) => ({
    components: { VDialog, VButton, VTypography },
    setup() {
      const open = ref(false)
      return { args, open }
    },
    template: `
      <VDialog title="Aperçu" subtitle="document.pdf" v-model:open="open">
        <template #trigger="{ triggerProps }">
          <VButton v-bind="triggerProps">Ouvrir l'aperçu</VButton>
        </template>
        <template #headerActions>
          <VButton variant="ghost" tone="neutral" size="sm" iconStart="download" aria-label="Télécharger" />
          <VButton variant="ghost" tone="neutral" size="sm" iconStart="open_in_full" aria-label="Plein écran" />
        </template>
        <VTypography>Zone d'aperçu du document.</VTypography>
      </VDialog>
    `,
  }),
}

/** `closable=false` retire la croix : la fermeture passe alors par le footer ou Échap. */
export const SansCroix: Story = {
  args: { closable: false },
  render: (args) => ({
    components: { VDialog, VButton, VTypography },
    setup() {
      const open = ref(false)
      return { args, open }
    },
    template: `
      <VDialog v-bind="args" v-model:open="open">
        <template #trigger="{ triggerProps }">
          <VButton v-bind="triggerProps">Ouvrir sans croix</VButton>
        </template>
        <VTypography>Pas de croix : utilisez les actions ci-dessous.</VTypography>
        <template #footer>
          <VButton variant="ghost" tone="neutral" @click="open = false">Annuler</VButton>
          <VButton @click="open = false">Valider</VButton>
        </template>
      </VDialog>
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
