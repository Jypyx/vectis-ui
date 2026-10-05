import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'
import type { Component } from 'vue'

import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import VCombobox from '../VCombobox/VCombobox.vue'
import VDataTableSfc from '../VDataTable/VDataTable.vue'
import { description } from '../VIcon/icons/description'
import { inbox } from '../VIcon/icons/inbox'
import VEmptyState from './VEmptyState.vue'
import type { EmptyStateSize } from './VEmptyState.vue'

// A generic SFC: its row-typed signature does not fit a `components` map.
const VDataTable = VDataTableSfc as unknown as Component

const t = storyText({
  en: {
    title: 'No invoices yet',
    description: 'Invoices you create or import appear here.',
    create: 'Create an invoice',
    import: 'Import',
    small: 'Nothing in this folder',
    medium: 'No messages',
    large: 'Your workspace is empty',
    sizeDescription: 'The scale follows the space it fills.',
    name: 'Name',
    status: 'Status',
    searchOrders: 'Search orders',
    country: 'Country',
    noCountry: 'No country found',
    france: 'France',
    germany: 'Germany',
  },
  fr: {
    title: 'Aucune facture pour l’instant',
    description: 'Les factures créées ou importées apparaissent ici.',
    create: 'Créer une facture',
    import: 'Importer',
    small: 'Rien dans ce dossier',
    medium: 'Aucun message',
    large: 'Votre espace de travail est vide',
    sizeDescription: "L'échelle suit l'espace occupé.",
    name: 'Nom',
    status: 'Statut',
    searchOrders: 'Rechercher des commandes',
    country: 'Pays',
    noCountry: 'Aucun pays trouvé',
    france: 'France',
    germany: 'Allemagne',
  },
})

const SIZES: EmptyStateSize[] = ['sm', 'md', 'lg']

const meta = {
  title: 'Components/EmptyState',
  component: VEmptyState,
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    size: { control: 'inline-radio', options: SIZES },
    headingLevel: { control: 'select', options: [undefined, 1, 2, 3, 4, 5, 6] },
  },
  args: { size: 'md' },
  render: (args) => ({
    components: { VEmptyState, VButton },
    setup: () => ({ args, t, icon: description }),
    template: `
      <VEmptyState
        v-bind="args"
        :icon="icon"
        :title="args.title ?? t.title"
        :description="args.description ?? t.description"
      >
        <template #actions>
          <VButton>{{ t.create }}</VButton>
          <VButton variant="outline" tone="neutral">{{ t.import }}</VButton>
        </template>
      </VEmptyState>
    `,
  }),
} satisfies Meta<typeof VEmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByText('No invoices yet').tagName).toBe('P')
    expect(canvas.getByRole('button', { name: 'Create an invoice' })).toBeVisible()
  },
}

/** `headingLevel` puts the title in the document outline without changing how it looks. */
export const HeadingLevel: Story = {
  args: { headingLevel: 2 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByRole('heading', { level: 2, name: 'No invoices yet' })).toBeVisible()
  },
}

/** `sm` for a panel or a list, `md` for a section, `lg` for a whole page. */
export const Sizes: Story = {
  render: () => ({
    components: { VEmptyState },
    setup: () => ({ t, icon: inbox, sizes: SIZES }),
    template: `
      <div style="display: grid; gap: 24px">
        <VEmptyState
          v-for="size in sizes"
          :key="size"
          :size="size"
          :icon="icon"
          :title="size === 'sm' ? t.small : size === 'md' ? t.medium : t.large"
          :description="t.sizeDescription"
          style="border: 1px dashed var(--vectis-color-border)"
        />
      </div>
    `,
  }),
}

/**
 * VDataTable shows a small empty state of its own: an inbox when there is no row, a crossed-out
 * magnifier when a search found none. `emptyText` is its title, and `#empty` still replaces it.
 */
export const InDataTable: Story = {
  render: () => ({
    components: { VDataTable },
    setup() {
      const columns = [
        { key: 'name', label: t.value.name },
        { key: 'status', label: t.value.status },
      ]
      const rows = [
        { id: 1, name: 'Order 1042', status: 'Shipped' },
        { id: 2, name: 'Order 1043', status: 'Pending' },
      ]
      return { t, columns, rows }
    },
    template: `
      <div style="max-width: 560px">
        <VDataTable :columns="columns" :rows="rows" searchable :search-label="t.searchOrders" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByRole('searchbox', { name: 'Search orders' }), 'zzz')
    await waitFor(() =>
      expect(canvasElement.querySelector('.v-data-table-state .v-empty-state')).not.toBeNull(),
    )
    expect(canvas.getByText('No results')).toBeVisible()
  },
}

/** VCombobox shows the same small empty state in its panel. */
export const InCombobox: Story = {
  render: () => ({
    components: { VCombobox },
    setup() {
      const value = ref('')
      const options = [
        { value: 'fr', label: t.value.france },
        { value: 'de', label: t.value.germany },
      ]
      return { t, value, options }
    },
    template: `
      <div style="width: 300px; min-height: 220px">
        <VCombobox v-model="value" :options="options" :aria-label="t.country" :empty-text="t.noCountry" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('combobox'))
    await userEvent.keyboard('zzz')
    await waitFor(() =>
      expect(canvasElement.querySelector('.v-combobox-state .v-empty-state')).toBeVisible(),
    )
  },
}
