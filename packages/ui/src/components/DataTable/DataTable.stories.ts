import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import type { Component } from 'vue'

import Chip from '../Chip/Chip.vue'
import DataTableSfc from './DataTable.vue'

// SFC générique : sa signature de fonction générique n'est pas assignable aux
// types Component de Storybook — on l'efface pour les stories.
const DataTable = DataTableSfc as unknown as Component

const COLUMNS = [
  { key: 'name', label: 'Projet', sortable: true },
  { key: 'owner', label: 'Responsable' },
  { key: 'status', label: 'Statut' },
  { key: 'commits', label: 'Commits', sortable: true, align: 'end' as const },
]

const ROWS = [
  { name: 'Socle', owner: 'Xavier', status: 'actif', commits: 320 },
  { name: 'Atlas', owner: 'Nadia', status: 'actif', commits: 87 },
  { name: 'Brume', owner: 'Louis', status: 'archivé', commits: 1204 },
  { name: 'Granit', owner: 'Emma', status: 'actif', commits: 45 },
]

const meta: Meta = {
  title: 'Composants/DataTable',
  component: DataTable as Meta['component'],
  args: {
    columns: COLUMNS,
    rows: ROWS,
    rowKey: 'name',
    caption: 'Projets de l’organisation',
  },
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => ({
    components: { DataTable },
    setup: () => ({ args }),
    template: '<DataTable v-bind="args" style="width: 640px" />',
  }),
}

export const Tri: Story = {
  render: (args) => ({
    components: { DataTable },
    setup: () => ({ args }),
    template: '<DataTable v-bind="args" style="width: 640px" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const commitsHeader = canvas.getByRole('button', { name: 'Commits' })

    // tri croissant → le plus petit nombre de commits en premier
    await userEvent.click(commitsHeader)
    await waitFor(() => {
      const cells = canvasElement.querySelectorAll('tbody tr:first-child td')
      expect(cells[0]?.textContent).toContain('Granit')
    })
    // deuxième clic → décroissant
    await userEvent.click(commitsHeader)
    await waitFor(() => {
      const cells = canvasElement.querySelectorAll('tbody tr:first-child td')
      expect(cells[0]?.textContent).toContain('Brume')
    })
  },
}

export const CellulesPersonnalisees: Story = {
  render: (args) => ({
    components: { DataTable, Chip },
    setup: () => ({ args }),
    template: `
      <DataTable v-bind="args" style="width: 640px">
        <template #cell-status="{ value }">
          <Chip :tone="value === 'actif' ? 'success' : 'neutral'">{{ value }}</Chip>
        </template>
      </DataTable>
    `,
  }),
}

/** Mode stack : sous 640px de CONTENEUR, les lignes deviennent des cartes — pur CSS. */
export const ResponsiveStack: Story = {
  args: { responsive: 'stack' },
  render: (args) => ({
    components: { DataTable },
    setup: () => ({ args }),
    template: `
      <div style="width: 360px; border: 1px dashed var(--ds-color-border); padding: 8px">
        <DataTable v-bind="args" />
      </div>
    `,
  }),
}

export const Chargement: Story = {
  args: { loading: true },
  render: (args) => ({
    components: { DataTable },
    setup: () => ({ args }),
    template: '<DataTable v-bind="args" style="width: 640px" />',
  }),
}

export const Vide: Story = {
  args: { rows: [], emptyText: 'Aucun projet pour le moment' },
  render: (args) => ({
    components: { DataTable },
    setup: () => ({ args }),
    template: '<DataTable v-bind="args" style="width: 640px" />',
  }),
}
