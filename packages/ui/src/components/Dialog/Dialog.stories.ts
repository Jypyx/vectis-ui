import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import Button from '../Button/Button.vue'
import Dialog from './Dialog.vue'

const meta = {
  title: 'Composants/Dialog',
  component: Dialog,
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    closable: { control: 'boolean' },
    closeOnBackdrop: { control: 'boolean' },
    closeOnEscape: { control: 'boolean' },
    closeLabel: { control: 'text' },
  },
  args: {
    title: 'Partager le document',
    subtitle: 'Choisissez qui peut accéder à ce fichier.',
    size: 'md',
    closable: true,
    closeOnBackdrop: true,
    closeOnEscape: true,
  },
  render: (args) => ({
    components: { Dialog, Button },
    setup() {
      const open = ref(false)
      return { args, open }
    },
    template: `
      <Dialog v-bind="args" v-model:open="open">
        <template #trigger="{ triggerProps }">
          <Button v-bind="triggerProps">Ouvrir la modale</Button>
        </template>
        <p style="margin: 0">
          Toute personne disposant du lien pourra consulter le document. Vous pouvez
          révoquer l'accès à tout moment depuis les paramètres de partage.
        </p>
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
    const dialog = canvasElement.querySelector('.ds-dialog') as HTMLDialogElement

    // ouverture via le déclencheur (slot #trigger) : la modale passe en top layer
    await userEvent.click(canvas.getByRole('button', { name: 'Ouvrir la modale' }))
    await waitFor(() => expect(dialog.open).toBe(true))

    // fermeture par la croix
    await userEvent.click(within(dialog).getByRole('button', { name: 'Fermer' }))
    await waitFor(() => expect(dialog.open).toBe(false))
  },
}

/** Trois largeurs bornées au viewport : sm (20rem), md (32rem), lg (48rem). */
export const Tailles: Story = {
  render: (args) => ({
    components: { Dialog, Button },
    setup() {
      const opened = ref<'sm' | 'md' | 'lg' | null>(null)
      const sizes = ['sm', 'md', 'lg'] as const
      return { args, opened, sizes }
    },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <Button v-for="s in sizes" :key="s" variant="outline" tone="neutral" @click="opened = s">
          {{ s }}
        </Button>
      </div>
      <Dialog
        v-for="s in sizes"
        :key="s"
        :size="s"
        :title="'Modale ' + s"
        subtitle="Largeur adaptée à la taille."
        :open="opened === s"
        @update:open="(v) => { if (!v) opened = null }"
      >
        <p style="margin: 0">Contenu de la modale en taille {{ s }}.</p>
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
    components: { Dialog, Button },
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
    components: { Dialog, Button },
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
              style="display: grid; place-items: center; width: 40px; height: 40px; border-radius: 999px; background: var(--ds-color-accent-surface); color: var(--ds-color-accent-text)"
            >
              ✦
            </span>
            <strong style="font-size: var(--ds-font-size-lg)">Nouvelle version</strong>
          </div>
        </template>
        <p style="margin: 0">La version 2.0 est prête à être installée.</p>
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
    components: { Dialog, Button },
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
        <p style="margin: 0">Zone d'aperçu du document.</p>
      </Dialog>
    `,
  }),
}

/** `closable=false` retire la croix : la fermeture passe alors par le footer ou Échap. */
export const SansCroix: Story = {
  args: { closable: false },
  render: (args) => ({
    components: { Dialog, Button },
    setup() {
      const open = ref(false)
      return { args, open }
    },
    template: `
      <Dialog v-bind="args" v-model:open="open">
        <template #trigger="{ triggerProps }">
          <Button v-bind="triggerProps">Ouvrir sans croix</Button>
        </template>
        <p style="margin: 0">Pas de croix : utilisez les actions ci-dessous.</p>
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
    const dialog = canvasElement.querySelector('.ds-dialog') as HTMLDialogElement

    await userEvent.click(canvas.getByRole('button', { name: 'Ouvrir la modale' }))
    await waitFor(() => expect(dialog.open).toBe(true))

    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(dialog.open).toBe(false))
  },
}
