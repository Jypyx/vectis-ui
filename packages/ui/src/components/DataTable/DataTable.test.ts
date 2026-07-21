import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'

import DataTable from './DataTable.vue'

const COLUMNS = [
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'count', label: 'Total', sortable: true, align: 'end' as const },
]

const ROWS = [
  { name: 'Brume', count: 12 },
  { name: 'Atlas', count: 3 },
  { name: 'Socle', count: 47 },
]

function firstColumnCells(container: Element) {
  return [...container.querySelectorAll('tbody tr td:first-child')].map((td) =>
    td.textContent?.trim(),
  )
}

describe('DataTable', () => {
  it('rend caption, th scope=col et cellules avec data-label (mode stack)', () => {
    const { container, getByText } = render(DataTable, {
      props: { columns: COLUMNS, rows: ROWS, caption: 'Projets', responsive: 'stack' },
    })
    expect(getByText('Projets').tagName).toBe('CAPTION')
    expect(container.querySelector('th')?.getAttribute('scope')).toBe('col')
    expect(container.querySelector('td')?.getAttribute('data-label')).toBe('Nom')
  })

  it('tri : asc → desc → aucun, avec aria-sort', async () => {
    const { container, getByRole } = render(DataTable, {
      props: { columns: COLUMNS, rows: ROWS },
    })
    const sortButton = getByRole('button', { name: 'Total' })
    const th = sortButton.closest('th') as HTMLElement

    await fireEvent.click(sortButton)
    expect(firstColumnCells(container)).toEqual(['Atlas', 'Brume', 'Socle'])
    expect(th.getAttribute('aria-sort')).toBe('ascending')

    await fireEvent.click(sortButton)
    expect(firstColumnCells(container)).toEqual(['Socle', 'Brume', 'Atlas'])
    expect(th.getAttribute('aria-sort')).toBe('descending')

    await fireEvent.click(sortButton)
    expect(firstColumnCells(container)).toEqual(['Brume', 'Atlas', 'Socle'])
    expect(th.hasAttribute('aria-sort')).toBe(false)
  })

  it('états vide et chargement', async () => {
    const { getByText, rerender, getByRole } = render(DataTable, {
      props: { columns: COLUMNS, rows: [], emptyText: 'Rien à afficher' },
    })
    expect(getByText('Rien à afficher')).toBeTruthy()
    await rerender({ loading: true })
    expect(getByRole('status')).toBeTruthy()
  })

  it('slot de cellule personnalisé', () => {
    const Harness = defineComponent({
      // signature générique du SFC incompatible avec le type Component attendu ici
      components: { DataTable: DataTable as object },
      setup: () => ({ columns: COLUMNS, rows: [ROWS[0]] }),
      template: `
        <DataTable :columns="columns" :rows="rows">
          <template #cell-count="{ value }"><em>{{ value }} commits</em></template>
        </DataTable>
      `,
    })
    const { getByText } = render(Harness)
    expect(getByText('12 commits').tagName).toBe('EM')
  })
})
