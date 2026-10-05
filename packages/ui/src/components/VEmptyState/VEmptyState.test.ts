import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import type { Component } from 'vue'

import { inbox } from '../VIcon/icons/inbox'
import VDataTableSfc from '../VDataTable/VDataTable.vue'
import VEmptyState from './VEmptyState.vue'

// A generic SFC: its row-typed signature does not fit a `components` map.
const VDataTable = VDataTableSfc as unknown as Component

function renderHarness(template: string, bindings: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: { VEmptyState, VDataTable },
    setup: () => bindings,
    template,
  })
  return render(Harness)
}

describe('VEmptyState', () => {
  it('renders the title, the description and the actions', () => {
    const { container, getByText, getByRole } = renderHarness(`
      <VEmptyState title="No invoices yet" description="Create one to get started.">
        <template #actions><button>Create an invoice</button></template>
      </VEmptyState>
    `)
    expect(getByText('No invoices yet').tagName).toBe('P')
    expect(getByText('Create one to get started.')).toBeTruthy()
    expect(getByRole('button', { name: 'Create an invoice' })).toBeTruthy()
    expect(container.querySelector('.v-empty-state')?.getAttribute('data-size')).toBe('md')
  })

  it('leaves out the parts it is not given', () => {
    const { container } = renderHarness('<VEmptyState title="Nothing" />')
    expect(container.querySelector('.v-empty-state-icon')).toBeNull()
    expect(container.querySelector('.v-empty-state-description')).toBeNull()
    expect(container.querySelector('.v-empty-state-actions')).toBeNull()
  })

  it('headingLevel renders the title as a heading', () => {
    const { getByRole } = renderHarness('<VEmptyState title="No projects" :heading-level="2" />')
    expect(getByRole('heading', { level: 2, name: 'No projects' })).toBeTruthy()
  })

  it('draws the icon in a badge, hidden from assistive technology', () => {
    const { container } = renderHarness('<VEmptyState title="Empty" :icon="inbox" />', { inbox })
    const badge = container.querySelector('.v-empty-state-icon')
    expect(badge?.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('the #media slot replaces the icon, the default slot the description', () => {
    const { container, getByText } = renderHarness(
      `
      <VEmptyState title="Empty" :icon="inbox" description="Plain">
        <template #media><img alt="" src="data:," /></template>
        Rich <a href="#help">help</a>
      </VEmptyState>
    `,
      { inbox },
    )
    expect(container.querySelector('.v-empty-state-icon')).toBeNull()
    expect(container.querySelector('.v-empty-state-media img')).toBeTruthy()
    expect(getByText('help').tagName).toBe('A')
    expect(container.textContent).not.toContain('Plain')
  })

  it('size is exposed as data-size, and attributes fall through to the root', () => {
    const { container } = renderHarness('<VEmptyState title="Empty" size="lg" data-qa="empty" />')
    const root = container.querySelector('.v-empty-state')
    expect(root?.getAttribute('data-size')).toBe('lg')
    expect(root?.getAttribute('data-qa')).toBe('empty')
  })
})

describe('VEmptyState as the default empty state', () => {
  it('VDataTable shows it with emptyText as its title', () => {
    const { container } = renderHarness(
      `<VDataTable :columns="[{ key: 'name', label: 'Name' }]" :rows="[]" empty-text="No orders" />`,
    )
    const empty = container.querySelector('.v-data-table-state .v-empty-state')
    expect(empty?.getAttribute('data-size')).toBe('sm')
    expect(empty?.querySelector('.v-empty-state-title')?.textContent).toBe('No orders')
    expect(empty?.querySelector('.v-empty-state-icon')).toBeTruthy()
  })

  it('the #empty slot still replaces it', () => {
    const { container } = renderHarness(`
      <VDataTable :columns="[{ key: 'name', label: 'Name' }]" :rows="[]">
        <template #empty>Mine</template>
      </VDataTable>
    `)
    expect(container.querySelector('.v-empty-state')).toBeNull()
    expect(container.querySelector('.v-data-table-state')?.textContent?.trim()).toBe('Mine')
  })
})
