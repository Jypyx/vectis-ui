import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import Button from '../Button/Button.vue'
import IconButton from '../IconButton/IconButton.vue'
import Tooltip from './Tooltip.vue'

const meta = {
  title: 'Composants/Tooltip',
  component: Tooltip,
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
  args: {
    text: 'Copier dans le presse-papiers',
    placement: 'top',
    delay: 300,
  },
  render: (args) => ({
    components: { Tooltip, Button },
    setup: () => ({ args }),
    template: `
      <div style="padding: 60px">
        <Tooltip v-bind="args">
          <template #default="{ triggerProps }">
            <Button variant="outline" tone="neutral" v-bind="triggerProps">Copier</Button>
          </template>
        </Tooltip>
      </div>
    `,
  }),
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Le focus clavier ouvre immédiatement (sans délai) — WCAG. */
export const OuvertureAuFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const tooltip = canvasElement.querySelector('[role="tooltip"]') as HTMLElement
    const trigger = canvas.getByRole('button', { name: 'Copier' })

    await userEvent.tab()
    await expect(trigger).toHaveFocus()
    await waitFor(() => expect(tooltip.matches(':popover-open')).toBe(true))
    // le trigger est décrit par le tooltip
    await expect(trigger).toHaveAttribute('aria-describedby', tooltip.id)

    // Échap ferme (WCAG 1.4.13)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(tooltip.matches(':popover-open')).toBe(false))
  },
}

export const SurIconButton: Story = {
  render: (args) => ({
    components: { Tooltip, IconButton },
    setup: () => ({ args }),
    template: `
      <div style="padding: 60px">
        <Tooltip v-bind="args" text="Supprimer l'élément" placement="bottom">
          <template #default="{ triggerProps }">
            <IconButton label="Supprimer l'élément" tone="danger" v-bind="triggerProps">
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </IconButton>
          </template>
        </Tooltip>
      </div>
    `,
  }),
}

export const TexteLong: Story = {
  args: {
    text: 'Une description anormalement longue qui doit passer à la ligne proprement sans dépasser la largeur maximale du panneau.',
  },
}
