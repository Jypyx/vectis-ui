import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import Alert from './Alert.vue'

const meta = {
  title: 'Composants/Alert',
  component: Alert,
  argTypes: {
    tone: { control: 'select', options: ['info', 'success', 'warning', 'danger'] },
  },
  args: { tone: 'info', dismissible: false },
  render: (args) => ({
    components: { Alert },
    setup: () => ({ args }),
    template: `
      <Alert v-bind="args" title="Mise à jour disponible" style="width: 420px">
        Une nouvelle version du tableau de bord est prête. Rechargez la page pour en profiter.
      </Alert>
    `,
  }),
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Tones: Story = {
  render: () => ({
    components: { Alert },
    template: `
      <div style="display: grid; gap: 12px; width: 420px">
        <Alert tone="info" title="Information">Le déploiement démarre dans 5 minutes.</Alert>
        <Alert tone="success" title="Enregistré">Vos modifications ont bien été prises en compte.</Alert>
        <Alert tone="warning" title="Attention">Votre abonnement expire dans 3 jours.</Alert>
        <Alert tone="danger" title="Erreur">Impossible de contacter le serveur.</Alert>
      </div>
    `,
  }),
}

export const Dismissible: Story = {
  args: { dismissible: true },
  render: (args) => ({
    components: { Alert },
    setup: () => ({ args, onDismiss: fn() }),
    template: `
      <Alert v-bind="args" title="Fermable" style="width: 420px" @dismiss="onDismiss">
        La visibilité reste pilotée par le consommateur (v-if) : pas d'état interne.
      </Alert>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Fermer' }))
    // le composant émet dismiss ; il ne se cache pas lui-même
    await expect(canvas.getByText('Fermable')).toBeVisible()
  },
}

export const SansTitre: Story = {
  render: () => ({
    components: { Alert },
    template: `
      <Alert tone="success" style="width: 420px">
        Copié dans le presse-papiers.
      </Alert>
    `,
  }),
}
