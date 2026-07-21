import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import Button from '../Button/Button.vue'
import Popover from './Popover.vue'

const meta = {
  title: 'Composants/Popover',
  component: Popover,
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'top',
        'top-start',
        'top-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'left',
        'right',
      ],
    },
  },
  args: { placement: 'bottom' },
  render: (args) => ({
    components: { Popover, Button },
    setup: () => ({ args }),
    template: `
      <Popover v-bind="args">
        <template #trigger="{ triggerProps }">
          <Button variant="outline" tone="neutral" v-bind="triggerProps">Infos livraison</Button>
        </template>
        Livraison sous 3 à 5 jours ouvrés. Retours gratuits pendant 30 jours.
      </Popover>
    `,
  }),
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const panel = canvasElement.querySelector('[popover]') as HTMLElement

    // ouverture 100 % déclarative via popovertarget — aucun handler JS
    await userEvent.click(canvas.getByRole('button', { name: 'Infos livraison' }))
    await waitFor(() => expect(panel.matches(':popover-open')).toBe(true))

    // light dismiss natif : Échap ferme
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(panel.matches(':popover-open')).toBe(false))
  },
}

export const Placements: Story = {
  render: () => ({
    components: { Popover, Button },
    setup: () => ({
      placements: ['top', 'bottom', 'left', 'right', 'bottom-start', 'bottom-end'],
    }),
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; padding: 120px 60px">
        <Popover v-for="p in placements" :key="p" :placement="p">
          <template #trigger="{ triggerProps }">
            <Button variant="outline" tone="neutral" v-bind="triggerProps">{{ p }}</Button>
          </template>
          Panneau positionné « {{ p }} » — pur CSS (position-area).
        </Popover>
      </div>
    `,
  }),
}

export const ControleParVModel: Story = {
  render: () => ({
    components: { Popover, Button },
    data: () => ({ open: false }),
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <Popover v-model:open="open">
          <template #trigger="{ triggerProps }">
            <Button variant="outline" tone="neutral" v-bind="triggerProps">Déclencheur</Button>
          </template>
          Ce popover est aussi pilotable par v-model.
        </Popover>
        <Button tone="neutral" variant="ghost" @click="open = !open">Basculer depuis l'extérieur</Button>
        <output data-testid="state">{{ open ? 'ouvert' : 'fermé' }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: "Basculer depuis l'extérieur" }))
    await waitFor(() => expect(canvas.getByTestId('state')).toHaveTextContent('ouvert'))
    await userEvent.keyboard('{Escape}')
    // le light dismiss natif resynchronise le v-model via l'événement toggle
    await waitFor(() => expect(canvas.getByTestId('state')).toHaveTextContent('fermé'))
  },
}

export const ContenuLong: Story = {
  render: () => ({
    components: { Popover, Button },
    template: `
      <Popover placement="bottom-start">
        <template #trigger="{ triggerProps }">
          <Button variant="outline" tone="neutral" v-bind="triggerProps">Détails</Button>
        </template>
        Un contenu volontairement long pour vérifier que la largeur est bornée par
        max-width et que le texte passe correctement à la ligne sans casser le
        positionnement ancré du panneau, même près d'un bord du viewport.
      </Popover>
    `,
  }),
}
