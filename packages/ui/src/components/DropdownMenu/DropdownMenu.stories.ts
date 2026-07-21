import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import Button from '../Button/Button.vue'
import DropdownMenu from './DropdownMenu.vue'
import DropdownMenuItem from './DropdownMenuItem.vue'

const meta = {
  title: 'Composants/DropdownMenu',
  component: DropdownMenu,
  argTypes: {
    placement: {
      control: 'select',
      options: ['bottom-start', 'bottom-end', 'bottom', 'top-start', 'top-end', 'top'],
    },
  },
  args: { placement: 'bottom-start' },
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { DropdownMenu, DropdownMenuItem, Button },
    setup: () => ({ args, onSelect: fn() }),
    template: `
      <DropdownMenu v-bind="args">
        <template #trigger="{ triggerProps }">
          <Button variant="outline" tone="neutral" v-bind="triggerProps">Actions</Button>
        </template>
        <DropdownMenuItem @select="onSelect">Renommer</DropdownMenuItem>
        <DropdownMenuItem @select="onSelect">Dupliquer</DropdownMenuItem>
        <DropdownMenuItem disabled>Archiver (indisponible)</DropdownMenuItem>
        <DropdownMenuItem danger @select="onSelect">Supprimer</DropdownMenuItem>
      </DropdownMenu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const menu = canvasElement.querySelector('[role="menu"]') as HTMLElement
    const trigger = canvas.getByRole('button', { name: 'Actions' })

    // ouverture déclarative (popovertarget) + focus automatique du 1er item
    await userEvent.click(trigger)
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(true))
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: 'Renommer' })).toHaveFocus())

    // roving focus : flèches avec bouclage, les items désactivés sont sautés
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getByRole('menuitem', { name: 'Dupliquer' })).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getByRole('menuitem', { name: 'Supprimer' })).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getByRole('menuitem', { name: 'Renommer' })).toHaveFocus()

    // la sélection ferme le menu et rend le focus au déclencheur
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(false))
    await waitFor(() => expect(trigger).toHaveFocus())
  },
}

export const FermetureEscape: Story = {
  render: () => ({
    components: { DropdownMenu, DropdownMenuItem, Button },
    template: `
      <DropdownMenu>
        <template #trigger="{ triggerProps }">
          <Button variant="outline" tone="neutral" v-bind="triggerProps">Menu</Button>
        </template>
        <DropdownMenuItem>Premier</DropdownMenuItem>
        <DropdownMenuItem>Second</DropdownMenuItem>
      </DropdownMenu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const menu = canvasElement.querySelector('[role="menu"]') as HTMLElement

    await userEvent.click(canvas.getByRole('button', { name: 'Menu' }))
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(true))

    // Esc : light dismiss natif du popover, aucun handler à écrire
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(false))
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Menu' })).toHaveFocus())
  },
}

export const AvecIcones: Story = {
  render: () => ({
    components: { DropdownMenu, DropdownMenuItem, Button },
    template: `
      <DropdownMenu>
        <template #trigger="{ triggerProps }">
          <Button variant="outline" tone="neutral" v-bind="triggerProps">Fichier</Button>
        </template>
        <DropdownMenuItem>
          <template #icon>
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M8 2v12M2 8h12" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </template>
          Nouveau fichier
        </DropdownMenuItem>
        <DropdownMenuItem danger>
          <template #icon>
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </template>
          Supprimer
        </DropdownMenuItem>
      </DropdownMenu>
    `,
  }),
}

export const LibellesLongs: Story = {
  render: () => ({
    components: { DropdownMenu, DropdownMenuItem, Button },
    template: `
      <DropdownMenu placement="bottom-end">
        <template #trigger="{ triggerProps }">
          <Button variant="outline" tone="neutral" v-bind="triggerProps">Options</Button>
        </template>
        <DropdownMenuItem>Exporter la sélection au format CSV avec les en-têtes</DropdownMenuItem>
        <DropdownMenuItem>Un libellé anormalement long qui doit être borné par la largeur maximale du menu</DropdownMenuItem>
      </DropdownMenu>
    `,
  }),
}
