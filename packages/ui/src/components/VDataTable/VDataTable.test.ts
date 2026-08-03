import { fireEvent, render, waitFor } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

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

// Jeu étendu pour la pagination/sélection (5 lignes, un nom accentué).
const ROWS_MANY = [
  { name: 'Brume', count: 12 },
  { name: 'Atlas', count: 3 },
  { name: 'Socle', count: 47 },
  { name: 'Éclair', count: 8 },
  { name: 'Granit', count: 21 },
]

function firstColumnCells(container: Element) {
  return [...container.querySelectorAll('tbody tr td:first-child')].map((td) =>
    td.textContent?.trim(),
  )
}

function bodyRowCount(container: Element) {
  return container.querySelectorAll('tbody tr').length
}

// Fabrique de harness (un seul defineComponent dans le fichier) : signature
// générique du SFC incompatible avec le type Component attendu ici.
function harness(setup: () => Record<string, unknown>, template: string) {
  return defineComponent({
    components: { DataTable: DataTable as object },
    setup,
    template,
  })
}

describe('DataTable', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('rend caption, th scope=col et cellules avec data-label (mode stack)', () => {
    const { container, getByText } = render(DataTable, {
      props: { columns: COLUMNS, rows: ROWS, caption: 'Projets', responsive: 'stack' },
    })
    expect(getByText('Projets').tagName).toBe('CAPTION')
    expect(container.querySelector('th')?.getAttribute('scope')).toBe('col')
    expect(container.querySelector('td')?.getAttribute('data-label')).toBe('Nom')
  })

  it('variant : data-variant posé sur la racine, flat par défaut', () => {
    const variantOf = (variant?: 'flat' | 'outlined') =>
      render(DataTable, { props: { columns: COLUMNS, rows: ROWS, variant } })
        .container.querySelector('.v-table-wrapper')
        ?.getAttribute('data-variant')
    expect(variantOf()).toBe('flat')
    expect(variantOf('outlined')).toBe('outlined')
  })

  it('tri : asc → desc → aucun, avec aria-sort', async () => {
    const { container, getByRole } = render(DataTable, {
      props: { columns: COLUMNS, rows: ROWS },
    })
    const sortButton = getByRole('button', { name: 'Total' })
    const th = sortButton.closest('th') as HTMLElement
    // `data-icon` nomme l'icône quelle que soit sa source (SVG intégré, ligature…)
    const glyph = () => sortButton.querySelector<HTMLElement>('.v-table-sort-icon')?.dataset.icon

    // le nom accessible ne retient que le libellé : l'icône est décorative
    expect(glyph()).toBe('swap_vert')

    await fireEvent.click(sortButton)
    expect(firstColumnCells(container)).toEqual(['Atlas', 'Brume', 'Socle'])
    expect(th.getAttribute('aria-sort')).toBe('ascending')
    expect(glyph()).toBe('arrow_downward')

    await fireEvent.click(sortButton)
    expect(firstColumnCells(container)).toEqual(['Socle', 'Brume', 'Atlas'])
    expect(th.getAttribute('aria-sort')).toBe('descending')
    expect(glyph()).toBe('arrow_upward')

    await fireEvent.click(sortButton)
    expect(firstColumnCells(container)).toEqual(['Brume', 'Atlas', 'Socle'])
    expect(th.hasAttribute('aria-sort')).toBe(false)
    expect(glyph()).toBe('swap_vert')
  })

  it('sortIcon/sortAscIcon/sortDescIcon : les trois états se surchargent', async () => {
    const { getByRole } = render(DataTable, {
      props: {
        columns: COLUMNS,
        rows: ROWS,
        sortIcon: 'unfold_more',
        sortAscIcon: 'north',
        sortDescIcon: 'south',
      },
    })
    const sortButton = getByRole('button', { name: 'Total' })
    const glyph = () => sortButton.querySelector<HTMLElement>('.v-table-sort-icon')?.dataset.icon

    expect(glyph()).toBe('unfold_more')
    await fireEvent.click(sortButton)
    expect(glyph()).toBe('north')
    await fireEvent.click(sortButton)
    expect(glyph()).toBe('south')
    await fireEvent.click(sortButton)
    expect(glyph()).toBe('unfold_more')
  })

  it('états vide et chargement', async () => {
    const { getByText, rerender, getByRole } = render(DataTable, {
      props: { columns: COLUMNS, rows: [], emptyText: 'Rien à afficher' },
    })
    expect(getByText('Rien à afficher')).toBeTruthy()
    await rerender({ loading: true })
    expect(getByRole('status')).toBeTruthy()
  })

  it('slots de cellule (scope column) et d’en-tête personnalisés', () => {
    const Harness = harness(
      () => ({ columns: COLUMNS, rows: [ROWS[0]] }),
      `
        <DataTable :columns="columns" :rows="rows">
          <template #head-name="{ column }"><span>{{ column.label }} (col)</span></template>
          <template #cell-count="{ value, column }"><em>{{ column.label }} : {{ value }}</em></template>
        </DataTable>
      `,
    )
    const { getByText, getByRole } = render(Harness)
    // head-<key> est rendu dans le bouton de tri (colonne sortable)
    expect(getByRole('button', { name: 'Nom (col)' })).toBeTruthy()
    expect(getByText('Total : 12').tagName).toBe('EM')
  })

  it('recherche locale : filtre insensible aux accents, colonnes déclarées seulement', async () => {
    const rows = ROWS_MANY.map((row) => ({ ...row, secret: 'zzz' }))
    const { container, getByRole, getByText } = render(DataTable, {
      props: { columns: COLUMNS, rows, searchable: true },
    })
    const field = getByRole('searchbox', { name: 'Rechercher dans le tableau' })

    // « eclair » (sans accent) matche « Éclair »
    await fireEvent.update(field, 'eclair')
    expect(firstColumnCells(container)).toEqual(['Éclair'])

    // le champ `secret` n'est pas une colonne déclarée : aucun résultat
    await fireEvent.update(field, 'zzz')
    expect(bodyRowCount(container)).toBe(1)
    expect(getByText('Aucune donnée')).toBeTruthy()
  })

  it('pagination locale : découpage, page contrôlée et clamp par dérivation', async () => {
    const { container, getByRole } = render(DataTable, {
      props: { columns: COLUMNS, rows: ROWS_MANY, perPage: 2, page: 3, searchable: true },
    })
    // page 3 de 3 (5 lignes / 2) → dernière ligne seule
    expect(firstColumnCells(container)).toEqual(['Granit'])

    // le filtre réduit à 1 page : l'affichage retombe page 1 sans muter le model
    const field = getByRole('searchbox', { name: 'Rechercher dans le tableau' })
    await fireEvent.update(field, 'atlas')
    expect(firstColumnCells(container)).toEqual(['Atlas'])
  })

  it('sélecteur « lignes par page » : redécoupe et revient page 1', async () => {
    const Harness = harness(
      () => ({ columns: COLUMNS, rows: ROWS_MANY, page: ref(2), perPage: ref(2) }),
      `
        <DataTable :columns="columns" :rows="rows" row-key="name"
          v-model:page="page" v-model:per-page="perPage" :per-page-options="[2, 4]" />
      `,
    )
    const { container, getByRole } = render(Harness)
    expect(firstColumnCells(container)).toEqual(['Socle', 'Éclair'])
    expect(getByRole('button', { name: 'Lignes par page : 2' })).toBeTruthy()

    // ouverture via le stub popover jsdom
    const menu = container.querySelector('[role="menu"]') as HTMLElement
    menu.showPopover()
    await nextTick()
    await fireEvent.click(getByRole('menuitem', { name: '4' }))
    // 4 lignes par page ET retour page 1
    expect(firstColumnCells(container)).toEqual(['Brume', 'Atlas', 'Socle', 'Éclair'])
  })

  /* Le nom du bouton est COMPOSITE : la prop `perPageLabel` (ou son défaut de
     dictionnaire) est passée à `dataTable.perPageValue`, qui pose le séparateur —
     lequel varie selon la langue (« : » en français, « : » sans espace en
     anglais). Une prop personnalisée doit donc traverser la fonction, pas la
     court-circuiter. */
  it('sélecteur « lignes par page » : une prop personnalisée traverse le format', () => {
    const { getByRole } = render(DataTable, {
      props: {
        columns: COLUMNS,
        rows: ROWS_MANY,
        rowKey: 'name',
        perPage: 2,
        perPageOptions: [2, 4],
        perPageLabel: 'Par page',
      },
    })
    expect(getByRole('button', { name: 'Par page : 2' })).toBeTruthy()
  })

  it('sélection : identités rowKey, master limité à la page visible, indeterminate', async () => {
    const selected = ref<(string | number)[]>([])
    const Harness = harness(
      () => ({ columns: COLUMNS, rows: ROWS_MANY, selected, page: ref(2) }),
      `
        <DataTable :columns="columns" :rows="rows" row-key="name" selectable
          v-model:selected="selected" v-model:page="page" :per-page="2" />
      `,
    )
    const { container, getByRole } = render(Harness)

    // page 2 → Socle / Éclair visibles ; une ligne cochée → identité rowKey
    await fireEvent.click(getByRole('checkbox', { name: 'Sélectionner la ligne 1' }))
    expect(selected.value).toEqual(['Socle'])
    expect(container.querySelector('tbody tr')?.hasAttribute('data-selected')).toBe(true)

    // master à moitié coché → propriété DOM indeterminate (watchEffect flush post)
    const master = getByRole('checkbox', { name: 'Tout sélectionner' }) as HTMLInputElement
    await waitFor(() => expect(master.indeterminate).toBe(true))

    // master : complète la page visible sans toucher au reste
    await fireEvent.click(master)
    expect(selected.value).toEqual(['Socle', 'Éclair'])
    await waitFor(() => expect(master.indeterminate).toBe(false))

    // re-clic : vide la page visible seulement (ici tout, rien hors page)
    await fireEvent.click(master)
    expect(selected.value).toEqual([])
  })

  it('footer : décompte de sélection à gauche, lignes par page → plage → pagination à droite', async () => {
    const selected = ref<(string | number)[]>([])
    const Harness = harness(
      () => ({ columns: COLUMNS, rows: ROWS_MANY, selected }),
      `
        <DataTable :columns="columns" :rows="rows" row-key="name" selectable show-range
          v-model:selected="selected" :per-page="2" :per-page-options="[2, 4]" />
      `,
    )
    const { container, getByRole } = render(Harness)
    const footer = container.querySelector('.v-table-footer') as HTMLElement
    const selection = footer.querySelector('.v-table-selection') as HTMLElement

    // région live posée dès `selectable` (vide à zéro sélection)
    expect([...footer.children].indexOf(selection)).toBe(0)
    expect(selection.textContent).toBe('')

    await fireEvent.click(getByRole('checkbox', { name: 'Sélectionner la ligne 1' }))
    expect(selection.textContent).toBe('1 élément sélectionné')
    await fireEvent.click(getByRole('checkbox', { name: 'Sélectionner la ligne 2' }))
    expect(selection.textContent).toBe('2 éléments sélectionnés')

    const end = footer.querySelector('.v-table-footer-end') as HTMLElement
    expect([...end.children].map((el) => el.classList[0])).toEqual([
      'v-table-per-page',
      'v-table-range',
      'v-pagination',
    ])
  })

  it('avertit en DEV si selectable sans rowKey', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(DataTable, { props: { columns: COLUMNS, rows: ROWS, selectable: true } })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[DataTable]'))
  })

  it('serverSide : aucun tri local, émission update:params au tri et à la page', async () => {
    const { container, getByRole, emitted } = render(DataTable, {
      props: {
        columns: COLUMNS,
        rows: ROWS,
        serverSide: true,
        sort: { key: 'name', direction: 'asc' as const },
        perPage: 3,
        total: 9,
      },
    })
    // tri contrôlé posé mais AUCUN réordonnancement local
    expect(firstColumnCells(container)).toEqual(['Brume', 'Atlas', 'Socle'])

    // page suivante (Pagination composée) → état complet émis
    await fireEvent.click(getByRole('button', { name: 'Page suivante' }))
    const payloads = emitted('update:params') as [unknown][]
    expect(payloads.at(-1)).toEqual([
      { page: 2, perPage: 3, sortKey: 'name', sortDirection: 'asc', search: '' },
    ])
  })

  it('serverSide : recherche débouncée, une seule émission avec retour page 1', async () => {
    vi.useFakeTimers()
    const { getByRole, emitted } = render(DataTable, {
      props: {
        columns: COLUMNS,
        rows: ROWS,
        serverSide: true,
        searchable: true,
        searchDebounce: 200,
        perPage: 3,
        total: 9,
        page: 2,
      },
    })
    const field = getByRole('searchbox', { name: 'Rechercher dans le tableau' })
    await fireEvent.update(field, 'so')
    expect(emitted('update:params')).toBeUndefined()

    // le commit (terme + retour page 1) coalesce en UNE émission
    vi.advanceTimersByTime(200)
    await nextTick()
    const payloads = emitted('update:params') as [unknown][]
    expect(payloads).toHaveLength(1)
    expect(payloads[0]).toEqual([
      { page: 1, perPage: 3, sortKey: null, sortDirection: null, search: 'so' },
    ])
  })

  it('serverSide : searchDebounce 0 émet de façon synchrone', async () => {
    const { getByRole, emitted } = render(DataTable, {
      props: {
        columns: COLUMNS,
        rows: ROWS,
        serverSide: true,
        searchable: true,
        searchDebounce: 0,
        perPage: 3,
      },
    })
    await fireEvent.update(getByRole('searchbox'), 'atlas')
    await nextTick()
    expect(emitted('update:params')).toHaveLength(1)
  })

  it('fallthrough : class sur le wrapper, le reste sur la table', () => {
    const { container } = render(DataTable, {
      props: { columns: COLUMNS, rows: ROWS },
      attrs: { class: 'ma-classe', 'aria-describedby': 'legende' },
    })
    const wrapper = container.querySelector('.v-table-wrapper') as HTMLElement
    expect(wrapper.classList.contains('ma-classe')).toBe(true)
    expect(wrapper.hasAttribute('aria-describedby')).toBe(false)
    expect(container.querySelector('table')?.getAttribute('aria-describedby')).toBe('legende')
  })

  // Le remplissage lui-même (colonne flex, zone défilante extensible) relève du
  // navigateur : il est couvert par la play function `PleineHauteur`. Ici on
  // verrouille seulement le câblage du style.
  it('height : block-size sur la racine, jamais sur le scroller', () => {
    const heights: Array<number | string> = [320, '60vh']
    for (const height of heights) {
      const { container } = render(DataTable, {
        props: { columns: COLUMNS, rows: ROWS, height },
        attrs: { style: 'width: 640px' },
      })
      const wrapper = container.querySelector('.v-table-wrapper') as HTMLElement
      expect(wrapper.style.blockSize).toBe(typeof height === 'number' ? '320px' : '60vh')
      // le style du consommateur passe après celui de la prop : il survit
      expect(wrapper.style.width).toBe('640px')
      expect(container.querySelector('.v-table-scroller')?.hasAttribute('style')).toBe(false)
    }
  })

  it('sans height : aucune hauteur inline, le parent décide', () => {
    const { container } = render(DataTable, { props: { columns: COLUMNS, rows: ROWS } })
    const wrapper = container.querySelector('.v-table-wrapper') as HTMLElement
    expect(wrapper.style.blockSize).toBe('')
    expect(container.querySelector('.v-table-scroller')?.hasAttribute('style')).toBe(false)
  })
})
