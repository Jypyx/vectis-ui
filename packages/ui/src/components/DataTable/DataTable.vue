<script setup lang="ts" generic="Row extends Record<string, unknown>">
import { computed, onBeforeUnmount, ref, useAttrs, watch } from 'vue'
import type { StyleValue } from 'vue'

import Button from '../Button/Button.vue'
import Checkbox from '../Checkbox/Checkbox.vue'
import Dropdown from '../Dropdown/Dropdown.vue'
import DropdownItem from '../Dropdown/DropdownItem.vue'
import Icon from '../Icon/Icon.vue'
import Input from '../Input/Input.vue'
import Pagination from '../Pagination/Pagination.vue'
import Spinner from '../Spinner/Spinner.vue'
import Typography from '../Typography/Typography.vue'

/**
 * Tableau de données : <table> sémantique (caption, scope, aria-sort), composé
 * des briques du DS — Input (recherche), Checkbox (sélection), Dropdown+Button
 * (lignes par page), Pagination. Le JS se limite à des dérivations pures
 * (filtrage → tri → pagination, états de sélection) et à deux effets justifiés
 * en place : reset de page et debounce de la recherche serveur.
 *
 * Responsive 100 % CSS via container queries : en mode `stack`, sous 640px de
 * conteneur, chaque ligne devient une carte et chaque cellule affiche son
 * en-tête via ::before + data-label — aucun JS de mesure. (640px en dur : les
 * conditions @container n'acceptent pas var().)
 */
export interface DataTableColumn {
  key: string
  label: string
  sortable?: boolean
  align?: 'start' | 'center' | 'end'
}

/** Tri actif (`v-model:sort`). */
export interface DataTableSort {
  key: string
  direction: 'asc' | 'desc'
}

/** Identité d'une ligne : valeur de `rowKey` (String()) ou index de secours. */
export type DataTableRowId = string | number

/** État courant émis par `update:params` (mode `serverSide`). */
export interface DataTableParams {
  page: number
  perPage: number | null
  sortKey: string | null
  sortDirection: 'asc' | 'desc' | null
  search: string
}

// Exportée (et non locale) : le SFC générique inline la signature des props
// dans ses déclarations émises — un nom privé ferait échouer le build des
// d.ts (TS4025). Générique elle-même : hissée hors de la portée du SFC, elle
// ne peut pas référencer son paramètre `Row` directement.
export interface DataTableProps<Row extends Record<string, unknown>> {
  columns: DataTableColumn[]
  rows: Row[]
  /** Clé d'identité des lignes (sinon l'index). Requis en pratique dès que `selectable`. */
  rowKey?: string
  /** Résumé du tableau (accessibilité). */
  caption?: string
  /** `stack` : lignes en cartes sous 640px de conteneur ; `scroll` : défilement horizontal. */
  responsive?: 'scroll' | 'stack'
  loading?: boolean
  emptyText?: string
  /**
   * Titre de la zone gauche du header (le slot #header prime). NB : masque
   * l'attribut HTML global homonyme sur le composant (compromis assumé).
   */
  title?: string
  /** Champ de recherche à droite du header. */
  searchable?: boolean
  searchPlaceholder?: string
  /** Nom accessible du champ de recherche (aria-label). */
  searchLabel?: string
  /** serverSide : délai (ms) avant émission après saisie. `0` = synchrone. */
  searchDebounce?: number
  /** Alterne le fond des lignes paires. */
  striped?: boolean
  /** Fige l'en-tête au défilement vertical (nécessite `height` en mode scroll). */
  stickyHeader?: boolean
  /** Paddings de cellules réduits d'un cran, propagé aux composés. */
  compact?: boolean
  /** Hauteur max de la zone défilante (nombre → px, chaîne CSS libre sinon). */
  height?: number | string
  /** Choix « lignes par page » (affiché si fourni et pagination active). */
  perPageOptions?: number[]
  perPageLabel?: string
  /** serverSide : nombre total de lignes côté serveur (pages + range). */
  total?: number
  /** Affiche « X–Y sur Z » dans le footer. */
  showRange?: boolean
  rangeLabel?: (range: { start: number; end: number; total: number }) => string
  /** Colonne de sélection par checkbox + case « tout sélectionner ». */
  selectable?: boolean
  selectAllLabel?: string
  /** Nom accessible de la case d'une ligne (défaut : « Sélectionner la ligne N »). */
  selectRowLabel?: (row: Row, index: number) => string
  /**
   * Aucun filtrage/tri/pagination local : les lignes sont affichées telles
   * quelles et chaque changement de paramètre émet `update:params`.
   */
  serverSide?: boolean
}

const props = withDefaults(defineProps<DataTableProps<Row>>(), {
  rowKey: undefined,
  caption: undefined,
  responsive: 'scroll',
  loading: false,
  emptyText: 'Aucune donnée',
  title: undefined,
  searchable: false,
  searchPlaceholder: 'Rechercher…',
  searchLabel: 'Rechercher dans le tableau',
  searchDebounce: 250,
  striped: false,
  stickyHeader: false,
  compact: false,
  height: undefined,
  perPageOptions: undefined,
  perPageLabel: 'Lignes par page',
  total: undefined,
  showRange: false,
  rangeLabel: undefined,
  selectable: false,
  selectAllLabel: 'Tout sélectionner',
  selectRowLabel: undefined,
  serverSide: false,
})

/** Tri contrôlable de l'extérieur (v-model:sort) ou interne. */
const sort = defineModel<DataTableSort | null>('sort', { default: null })
const page = defineModel<number>('page', { default: 1 })
/** Pagination active ssi > 0 (`:per-page="10"` one-way suffit à l'activer). */
const perPage = defineModel<number | undefined>('perPage', { default: undefined })
const selected = defineModel<DataTableRowId[]>('selected', { default: () => [] })
const search = defineModel<string>('search', { default: '' })

const emit = defineEmits<{
  /**
   * serverSide : émis à chaque changement de page/perPage/tri/recherche
   * (recherche débouncée). Pas d'émission au montage — le fetch initial
   * appartient au consommateur.
   */
  'update:params': [params: DataTableParams]
}>()

defineSlots<{
  /** Rendu custom d'une cellule : slot nommé `cell-<key>` */
  [name: `cell-${string}`]: (scope: {
    row: Row
    value: unknown
    column: DataTableColumn
  }) => unknown
  /** Libellé custom d'un en-tête de colonne : slot nommé `head-<key>` */
  [name: `head-${string}`]: (scope: { column: DataTableColumn }) => unknown
  /** Zone gauche du header global (prime sur la prop `title`). */
  header?: () => unknown
}>()

// Racine wrapper : class/style restent sur la racine, le reste (id, aria-*…)
// est reporté sur la <table> — seul élément qu'ils décrivent valablement.
defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rootClass = computed(() => attrs.class)
const rootStyle = computed(() => attrs.style as StyleValue)
const forwardedAttrs = computed(() =>
  Object.fromEntries(Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style')),
)

// import.meta.env est spécifique à Vite : typage local prudent, garde-fou
// inerte chez un consommateur non-Vite.
if ((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV) {
  if (props.selectable && !props.rowKey)
    console.warn(
      '[DataTable] `selectable` sans `rowKey` — les identités par index se corrompent au tri, au filtrage et à la pagination.',
    )
}

function rowIdentity(row: Row, index: number): DataTableRowId {
  return props.rowKey ? String(row[props.rowKey]) : index
}

// ── Filtrage → tri → pagination (dérivations pures) ─────────────────────────

/** Filtrage insensible à la casse et aux accents (même forme que Combobox). */
const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Périmètre du filtre : les colonnes déclarées (ce que l'utilisateur voit),
// jamais les autres champs des lignes.
const filteredRows = computed(() => {
  if (props.serverSide || !props.searchable) return props.rows
  const needle = normalize(search.value.trim())
  if (!needle) return props.rows
  return props.rows.filter((row) =>
    props.columns.some((column) => normalize(String(row[column.key] ?? '')).includes(needle)),
  )
})

const sortedRows = computed(() => {
  const current = sort.value
  if (!current || props.serverSide) return filteredRows.value
  const factor = current.direction === 'asc' ? 1 : -1
  return [...filteredRows.value].sort((a, b) => {
    const av = a[current.key]
    const bv = b[current.key]
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor
    return String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true }) * factor
  })
})

const paginated = computed(() => (perPage.value ?? 0) > 0)
const totalCount = computed(() =>
  props.serverSide ? (props.total ?? props.rows.length) : filteredRows.value.length,
)
const pageCount = computed(() =>
  paginated.value ? Math.max(1, Math.ceil(totalCount.value / (perPage.value ?? 1))) : 1,
)
// Clamp par dérivation, sans muter le model (précédent Pagination) : si le
// filtre réduit le nombre de pages, l'affichage retombe sur la dernière.
const currentPage = computed(() => Math.min(Math.max(page.value, 1), pageCount.value))

const displayedRows = computed(() => {
  // serverSide : les lignes reçues sont déjà la page courante.
  if (props.serverSide || !paginated.value) return sortedRows.value
  const start = (currentPage.value - 1) * (perPage.value ?? 0)
  return sortedRows.value.slice(start, start + (perPage.value ?? 0))
})

function toggleSort(key: string) {
  const current = sort.value
  if (!current || current.key !== key) sort.value = { key, direction: 'asc' }
  else if (current.direction === 'asc') sort.value = { key, direction: 'desc' }
  else sort.value = null
}

function ariaSort(column: DataTableColumn): 'ascending' | 'descending' | undefined {
  if (sort.value?.key !== column.key) return undefined
  return sort.value.direction === 'asc' ? 'ascending' : 'descending'
}

// ── Recherche : reset de page et debounce serveur ───────────────────────────
// JS justifié : un filtre qui change invalide la position courante (retour
// page 1) ; en mode serveur, aucune primitive native ne débounce une saisie —
// timer maison, terme commité relu à l'échéance, annulé au démontage.
const committedSearch = ref('')
let searchTimer: ReturnType<typeof setTimeout> | undefined

function commitSearch() {
  committedSearch.value = search.value
  page.value = 1
}

watch(search, () => {
  if (!props.serverSide) {
    page.value = 1
    return
  }
  clearTimeout(searchTimer)
  if (props.searchDebounce <= 0) commitSearch()
  else searchTimer = setTimeout(commitSearch, props.searchDebounce)
})

onBeforeUnmount(() => clearTimeout(searchTimer))

// ── Mode serveur : émission de l'état courant ───────────────────────────────
const params = computed<DataTableParams>(() => ({
  page: currentPage.value,
  perPage: perPage.value ?? null,
  sortKey: sort.value?.key ?? null,
  sortDirection: sort.value?.direction ?? null,
  search: committedSearch.value,
}))

// Les mutations synchrones (commit de recherche + retour page 1) coalescent
// en une seule invocation par flush : jamais de double requête.
watch(params, (value) => {
  if (props.serverSide) emit('update:params', value)
})

// ── Sélection (master = page visible, à la Material) ────────────────────────
const selectedSet = computed(() => new Set<DataTableRowId>(selected.value))
const visibleIds = computed(() => displayedRows.value.map((row, index) => rowIdentity(row, index)))
const allVisibleSelected = computed(
  () => visibleIds.value.length > 0 && visibleIds.value.every((id) => selectedSet.value.has(id)),
)
const masterIndeterminate = computed(
  () => !allVisibleSelected.value && visibleIds.value.some((id) => selectedSet.value.has(id)),
)

function isSelected(row: Row, index: number): boolean {
  return selectedSet.value.has(rowIdentity(row, index))
}

function toggleRow(row: Row, index: number) {
  const id = rowIdentity(row, index)
  selected.value = selectedSet.value.has(id)
    ? selected.value.filter((value) => value !== id)
    : [...selected.value, id]
}

// Ne touche que la page visible : les sélections des autres pages sont préservées.
function toggleMaster() {
  const ids = visibleIds.value
  if (allVisibleSelected.value) {
    const visible = new Set(ids)
    selected.value = selected.value.filter((id) => !visible.has(id))
  } else {
    const current = selectedSet.value
    selected.value = [...selected.value, ...ids.filter((id) => !current.has(id))]
  }
}

function rowSelectLabel(row: Row, index: number): string {
  return props.selectRowLabel?.(row, index) ?? `Sélectionner la ligne ${index + 1}`
}

// ── Footer ──────────────────────────────────────────────────────────────────
function setPerPage(option: number) {
  perPage.value = option
  page.value = 1
}

const colCount = computed(() => props.columns.length + (props.selectable ? 1 : 0))

const rangeText = computed(() => {
  const per = perPage.value ?? 0
  const total = totalCount.value
  const start = total === 0 ? 0 : (currentPage.value - 1) * per + 1
  const end = Math.min(currentPage.value * per, total)
  return props.rangeLabel?.({ start, end, total }) ?? `${start}–${end} sur ${total}`
})

const scrollerStyle = computed<StyleValue | undefined>(() =>
  props.height !== undefined
    ? { maxBlockSize: typeof props.height === 'number' ? `${props.height}px` : props.height }
    : undefined,
)
</script>

<template>
  <div
    class="ds-table-wrapper"
    :class="rootClass"
    :style="rootStyle"
    :data-responsive="responsive"
    :data-striped="striped ? '' : undefined"
    :data-compact="compact ? '' : undefined"
    :data-sticky-header="stickyHeader ? '' : undefined"
    :data-selectable="selectable ? '' : undefined"
  >
    <div v-if="title || $slots.header || searchable" class="ds-table-toolbar">
      <Typography as="div" variant="heading-4" class="ds-table-title">
        <slot name="header">{{ title }}</slot>
      </Typography>
      <Input
        v-if="searchable"
        v-model="search"
        class="ds-table-search"
        type="search"
        size="sm"
        :compact="compact"
        icon-start="search"
        clearable
        :placeholder="searchPlaceholder"
        :aria-label="searchLabel"
      />
    </div>

    <!-- Seule la table défile : toolbar et footer restent en place. -->
    <div class="ds-table-scroller" :style="scrollerStyle">
      <table class="ds-table" v-bind="forwardedAttrs">
        <caption v-if="caption" class="ds-table-caption">
          {{
            caption
          }}
        </caption>
        <thead class="ds-table-head">
          <tr>
            <th v-if="selectable" scope="col" class="ds-table-select">
              <Checkbox
                :model-value="allVisibleSelected"
                :indeterminate="masterIndeterminate"
                :aria-label="selectAllLabel"
                @update:model-value="toggleMaster"
              />
            </th>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              :data-align="column.align"
              :aria-sort="ariaSort(column)"
            >
              <button
                v-if="column.sortable"
                type="button"
                class="ds-table-sort"
                :data-direction="sort?.key === column.key ? sort.direction : undefined"
                @click="toggleSort(column.key)"
              >
                <slot :name="`head-${column.key}`" :column="column">{{ column.label }}</slot>
                <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                  <path
                    class="ds-table-sort-up"
                    d="m4 6.5 4-4 4 4"
                    fill="none"
                    stroke="currentcolor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    class="ds-table-sort-down"
                    d="m4 9.5 4 4 4-4"
                    fill="none"
                    stroke="currentcolor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <template v-else>
                <slot :name="`head-${column.key}`" :column="column">{{ column.label }}</slot>
              </template>
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Ordre des états : chargement → vide → contenu. -->
          <tr v-if="loading">
            <td :colspan="colCount" class="ds-table-state">
              <Spinner label="Chargement des données…" />
            </td>
          </tr>
          <tr v-else-if="displayedRows.length === 0">
            <td :colspan="colCount" class="ds-table-state">{{ emptyText }}</td>
          </tr>
          <template v-else>
            <tr
              v-for="(row, index) in displayedRows"
              :key="rowIdentity(row, index)"
              :data-selected="selectable && isSelected(row, index) ? '' : undefined"
            >
              <!-- data-selected et non aria-selected : invalide sur une row de
                   role=table (grid seulement) — l'état accessible est la case cochée. -->
              <td v-if="selectable" class="ds-table-select">
                <Checkbox
                  :model-value="isSelected(row, index)"
                  :aria-label="rowSelectLabel(row, index)"
                  @update:model-value="toggleRow(row, index)"
                />
              </td>
              <td
                v-for="column in columns"
                :key="column.key"
                :data-label="column.label"
                :data-align="column.align"
              >
                <slot
                  :name="`cell-${column.key}`"
                  :row="row"
                  :value="row[column.key]"
                  :column="column"
                >
                  {{ row[column.key] }}
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div v-if="paginated" class="ds-table-footer">
      <span v-if="showRange" class="ds-table-range" aria-live="polite">{{ rangeText }}</span>
      <div v-if="perPageOptions?.length" class="ds-table-per-page">
        <span class="ds-table-per-page-label" aria-hidden="true">{{ perPageLabel }}</span>
        <!-- width="max-content" : le panneau épouse l'option la plus large
             (« 10 », « 25 »…) au lieu de la largeur minimale par défaut. -->
        <Dropdown size="sm" :compact="compact" placement="top-end" width="max-content">
          <template #trigger="{ triggerProps }">
            <Button
              variant="ghost"
              tone="neutral"
              size="sm"
              :compact="compact"
              v-bind="triggerProps"
              :aria-label="`${perPageLabel} : ${perPage}`"
            >
              {{ perPage }}
              <Icon name="arrow_drop_down" />
            </Button>
          </template>
          <DropdownItem
            v-for="option in perPageOptions"
            :key="option"
            :label="String(option)"
            :selected="option === perPage"
            @select="setPerPage(option)"
          />
        </Dropdown>
      </div>
      <Pagination
        v-model="page"
        :length="pageCount"
        size="sm"
        :compact="compact"
        align="end"
        variant="ghost"
        :total-visible="7"
      />
    </div>
  </div>
</template>

<style>
@layer ds.components {
  .ds-table-wrapper {
    /* Densité : paddings de cellules, réduits d'un cran en compact (modèle
       Accordion — pas d'échelle .ds-control : aucune hauteur de contrôle unique). */
    --_table-pad-block: var(--ds-space-3);
    --_table-pad-inline: var(--ds-space-3);
    --_table-head-pad-block: var(--ds-space-2);

    container-type: inline-size;
    font-family: var(--ds-text-family);
  }

  .ds-table-wrapper[data-compact] {
    --_table-pad-block: var(--ds-space-2);
    --_table-pad-inline: var(--ds-space-2);
    --_table-head-pad-block: var(--ds-space-1);
  }

  /* Seule la table défile : toolbar et footer restent en place. */
  .ds-table-wrapper[data-responsive='scroll'] .ds-table-scroller {
    overflow: auto;
  }

  .ds-table-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--ds-space-3);
    padding-block-end: var(--ds-space-3);
  }

  /* Titre : rendu par Typography (heading-4) — la couleur reste explicite,
     la toolbar peut vivre dans un contexte de texte atténué. */
  .ds-table-title {
    color: var(--ds-color-text);
  }

  /* Surcharge qualifiée (0,2,0) du `.ds-input { width: 100% }` (0,1,0)
     d'Input — indépendante de l'ordre du bundle (modèle Tabs). */
  .ds-table-toolbar .ds-input {
    inline-size: var(--ds-control-size-table-search);
    max-inline-size: 100%;
  }

  .ds-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--ds-text-body-md-size);
    color: var(--ds-color-text);
  }

  .ds-table-caption {
    padding-block-end: var(--ds-space-3);
    text-align: start;
    font-size: var(--ds-text-body-md-size);
    color: var(--ds-color-text-muted);
  }

  .ds-table th {
    padding: var(--_table-head-pad-block) var(--_table-pad-inline);
    text-align: start;
    font-size: var(--ds-text-body-md-size);
    /* semibold : emphase d'état (en-tête détaché des cellules), pas un rôle typo */
    font-weight: var(--ds-font-weight-semibold);
    color: var(--ds-color-text-muted);
    border-block-end: 1px solid var(--ds-color-border);
  }

  .ds-table td {
    padding: var(--_table-pad-block) var(--_table-pad-inline);
    border-block-end: 1px solid var(--ds-color-border);
  }

  .ds-table tbody tr:last-child td {
    border-block-end: none;
  }

  .ds-table [data-align='end'] {
    text-align: end;
  }

  .ds-table [data-align='center'] {
    text-align: center;
  }

  /* Colonne de sélection rétrécie au contenu (layout table auto). */
  .ds-table .ds-table-select {
    inline-size: 0;
  }

  .ds-table-wrapper[data-striped] tbody tr:nth-child(even) {
    background-color: var(--ds-color-surface-sunken);
  }

  /* Après le zébrage : à spécificité égale, la sélection gagne à l'ordre. */
  .ds-table-wrapper[data-selectable] tbody tr[data-selected] {
    background-color: var(--ds-color-accent-surface);
  }

  /* Fond opaque obligatoire : le contenu défile sous l'en-tête figé. */
  .ds-table-wrapper[data-sticky-header] th {
    position: sticky;
    inset-block-start: 0;
    z-index: 1;
    background-color: var(--ds-color-surface);
  }

  .ds-table-sort {
    display: inline-flex;
    align-items: center;
    gap: var(--ds-space-1);
    border: none;
    background: transparent;
    padding: 0;
    color: inherit;
    font: inherit;
    cursor: pointer;
    border-radius: var(--ds-radius-xs);
  }

  .ds-table-sort:hover {
    color: var(--ds-color-text);
  }

  .ds-table-sort:focus-visible {
    outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color);
    outline-offset: var(--ds-focus-ring-offset);
  }

  /* flèches : atténuées par défaut, la direction active reprend la couleur */
  .ds-table-sort svg {
    opacity: 0.35;
  }

  .ds-table-sort[data-direction] svg {
    opacity: 1;
  }

  .ds-table-sort[data-direction='asc'] .ds-table-sort-down,
  .ds-table-sort[data-direction='desc'] .ds-table-sort-up {
    opacity: 0.25;
  }

  .ds-table-state {
    padding: var(--ds-space-6);
    text-align: center;
    color: var(--ds-color-text-muted);
  }

  .ds-table-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: var(--ds-space-4);
    padding-block-start: var(--ds-space-3);
  }

  .ds-table-range,
  .ds-table-per-page-label {
    font-size: var(--ds-text-body-md-size);
    color: var(--ds-color-text-muted);
  }

  .ds-table-per-page {
    display: flex;
    align-items: center;
    gap: var(--ds-space-2);
  }

  /* container-type: inline-size rend la largeur de la nav indéfinie en flex
     item : sans flex: 1 elle collapse à zéro. align="end" recolle le contenu. */
  .ds-table-footer .ds-pagination {
    flex: 1 1 auto;
  }

  /* --- Mode stack : cartes sous 640px de conteneur, pur CSS --- */
  @container (max-width: 640px) {
    .ds-table-wrapper[data-responsive='stack'] .ds-table-head {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
    }

    .ds-table-wrapper[data-responsive='stack'] tbody tr {
      display: block;
      padding-block: var(--ds-space-2);
      border-block-end: 1px solid var(--ds-color-border);
    }

    .ds-table-wrapper[data-responsive='stack'] tbody tr:last-child {
      border-block-end: none;
    }

    .ds-table-wrapper[data-responsive='stack'] td {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: var(--ds-space-4);
      padding: var(--ds-space-1) var(--ds-space-2);
      border: none;
      text-align: end;
    }

    /* Pseudo-en-tête de carte : rôle overline (sans capitales forcées) */
    .ds-table-wrapper[data-responsive='stack'] td::before {
      content: attr(data-label);
      font-size: var(--ds-text-overline-size);
      font-weight: var(--ds-text-overline-weight);
      letter-spacing: var(--ds-text-overline-tracking);
      color: var(--ds-color-text-muted);
    }

    /* La case de sélection n'a pas de data-label : pas de pseudo-en-tête,
       elle ouvre la carte. */
    .ds-table-wrapper[data-responsive='stack'] td.ds-table-select {
      justify-content: flex-start;
    }

    .ds-table-wrapper[data-responsive='stack'] td.ds-table-select::before {
      content: none;
    }

    /* Toolbar étroite : le champ de recherche passe sous le titre, pleine
       largeur (vaut pour scroll ET stack — la toolbar ne défile jamais). */
    .ds-table-search {
      flex: 1 1 100%;
    }
  }
}
</style>
