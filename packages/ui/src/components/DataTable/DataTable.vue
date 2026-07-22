<script setup lang="ts" generic="Row extends Record<string, unknown>">
import { computed } from 'vue'

import Spinner from '../Spinner/Spinner.vue'

/**
 * Tableau de données : <table> sémantique (caption, scope, aria-sort). Le JS
 * se limite au tri (dérivation d'état pure) et au rendu générique.
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

interface DataTableProps {
  columns: DataTableColumn[]
  rows: Row[]
  /** Clé d'identité des lignes (sinon l'index). */
  rowKey?: string
  /** Résumé du tableau (accessibilité). */
  caption?: string
  /** `stack` : lignes en cartes sous 640px de conteneur ; `scroll` : défilement horizontal. */
  responsive?: 'scroll' | 'stack'
  loading?: boolean
  emptyText?: string
}

const props = withDefaults(defineProps<DataTableProps>(), {
  rowKey: undefined,
  caption: undefined,
  responsive: 'scroll',
  loading: false,
  emptyText: 'Aucune donnée',
})

/** Tri contrôlable de l'extérieur (v-model:sort) ou interne. */
const sort = defineModel<{ key: string; direction: 'asc' | 'desc' } | null>('sort', {
  default: null,
})

defineSlots<{
  /** Rendu custom d'une cellule : slot nommé `cell-<key>` */
  [name: `cell-${string}`]: (scope: { row: Row; value: unknown }) => unknown
}>()

const sortedRows = computed(() => {
  const current = sort.value
  if (!current) return props.rows
  const factor = current.direction === 'asc' ? 1 : -1
  return [...props.rows].sort((a, b) => {
    const av = a[current.key]
    const bv = b[current.key]
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor
    return String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true }) * factor
  })
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

function rowIdentity(row: Row, index: number): string | number {
  return props.rowKey ? String(row[props.rowKey]) : index
}
</script>

<template>
  <div class="ds-table-wrapper" :data-responsive="responsive">
    <table class="ds-table">
      <caption v-if="caption" class="ds-table-caption">
        {{
          caption
        }}
      </caption>
      <thead class="ds-table-head">
        <tr>
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
              {{ column.label }}
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
            <template v-else>{{ column.label }}</template>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length" class="ds-table-state">
            <Spinner label="Chargement des données…" />
          </td>
        </tr>
        <tr v-else-if="sortedRows.length === 0">
          <td :colspan="columns.length" class="ds-table-state">{{ emptyText }}</td>
        </tr>
        <template v-else>
          <tr v-for="(row, index) in sortedRows" :key="rowIdentity(row, index)">
            <td
              v-for="column in columns"
              :key="column.key"
              :data-label="column.label"
              :data-align="column.align"
            >
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                {{ row[column.key] }}
              </slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style>
@layer ds.components {
  .ds-table-wrapper {
    container-type: inline-size;
    font-family: var(--ds-font-family-sans);
  }

  .ds-table-wrapper[data-responsive='scroll'] {
    overflow-x: auto;
  }

  .ds-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--ds-font-size-sm);
    color: var(--ds-color-text);
  }

  .ds-table-caption {
    padding-block-end: var(--ds-space-3);
    text-align: start;
    font-size: var(--ds-font-size-sm);
    color: var(--ds-color-text-muted);
  }

  .ds-table th {
    padding: var(--ds-space-2) var(--ds-space-3);
    text-align: start;
    font-size: var(--ds-font-size-xs);
    font-weight: var(--ds-font-weight-semibold);
    color: var(--ds-color-text-muted);
    border-block-end: 1px solid var(--ds-color-border);
  }

  .ds-table td {
    padding: var(--ds-space-3);
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

    .ds-table-wrapper[data-responsive='stack'] td::before {
      content: attr(data-label);
      font-size: var(--ds-font-size-xs);
      font-weight: var(--ds-font-weight-medium);
      color: var(--ds-color-text-muted);
    }
  }
}
</style>
