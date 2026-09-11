<script setup lang="ts">
import api from '~/content/api/data-table'
import DataTableBasic from '~/examples/data-table/Basic.vue'
import dataTableBasicSource from '~/examples/data-table/Basic.vue?raw'
import DataTableCompact from '~/examples/data-table/Compact.vue'
import dataTableCompactSource from '~/examples/data-table/Compact.vue?raw'
import DataTableCustomCells from '~/examples/data-table/CustomCells.vue'
import dataTableCustomCellsSource from '~/examples/data-table/CustomCells.vue?raw'
import DataTableCustomHeaders from '~/examples/data-table/CustomHeaders.vue'
import dataTableCustomHeadersSource from '~/examples/data-table/CustomHeaders.vue?raw'
import DataTableFullHeight from '~/examples/data-table/FullHeight.vue'
import dataTableFullHeightSource from '~/examples/data-table/FullHeight.vue?raw'
import DataTableFullTable from '~/examples/data-table/FullTable.vue'
import dataTableFullTableSource from '~/examples/data-table/FullTable.vue?raw'
import DataTablePagination from '~/examples/data-table/Pagination.vue'
import dataTablePaginationSource from '~/examples/data-table/Pagination.vue?raw'
import DataTableResponsive from '~/examples/data-table/Responsive.vue'
import dataTableResponsiveSource from '~/examples/data-table/Responsive.vue?raw'
import DataTableRowsPerPage from '~/examples/data-table/RowsPerPage.vue'
import dataTableRowsPerPageSource from '~/examples/data-table/RowsPerPage.vue?raw'
import DataTableSearch from '~/examples/data-table/Search.vue'
import dataTableSearchSource from '~/examples/data-table/Search.vue?raw'
import DataTableSelection from '~/examples/data-table/Selection.vue'
import dataTableSelectionSource from '~/examples/data-table/Selection.vue?raw'
import DataTableServerSide from '~/examples/data-table/ServerSide.vue'
import dataTableServerSideSource from '~/examples/data-table/ServerSide.vue?raw'
import DataTableSorting from '~/examples/data-table/Sorting.vue'
import dataTableSortingSource from '~/examples/data-table/Sorting.vue?raw'
import DataTableStates from '~/examples/data-table/States.vue'
import dataTableStatesSource from '~/examples/data-table/States.vue?raw'
import DataTableStickyHeader from '~/examples/data-table/StickyHeader.vue'
import dataTableStickyHeaderSource from '~/examples/data-table/StickyHeader.vue?raw'
import DataTableStriped from '~/examples/data-table/Striped.vue'
import dataTableStripedSource from '~/examples/data-table/Striped.vue?raw'
import DataTableToolbar from '~/examples/data-table/Toolbar.vue'
import dataTableToolbarSource from '~/examples/data-table/Toolbar.vue?raw'
import DataTableVariants from '~/examples/data-table/Variants.vue'
import dataTableVariantsSource from '~/examples/data-table/Variants.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('dataTable')
</script>

<template>
  <h1>{{ t('dataTable.title') }}</h1>
  <DocsProse class="vd-lead" keypath="dataTable.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="dataTableBasicSource" stack>
    <DataTableBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="sorting">{{ t('dataTable.examples.sorting.title') }}</h3>
  <DocsProse keypath="dataTable.examples.sorting.text" />
  <DocsExample :source="dataTableSortingSource" stack>
    <DataTableSorting />
  </DocsExample>

  <h3 id="search">{{ t('dataTable.examples.search.title') }}</h3>
  <DocsProse keypath="dataTable.examples.search.text" />
  <DocsExample :source="dataTableSearchSource" stack>
    <DataTableSearch />
  </DocsExample>

  <h3 id="pagination">{{ t('dataTable.examples.pagination.title') }}</h3>
  <DocsProse keypath="dataTable.examples.pagination.text" />
  <DocsExample :source="dataTablePaginationSource" stack>
    <DataTablePagination />
  </DocsExample>

  <h3 id="rows-per-page">{{ t('dataTable.examples.rowsPerPage.title') }}</h3>
  <DocsProse keypath="dataTable.examples.rowsPerPage.text" />
  <DocsExample :source="dataTableRowsPerPageSource" stack>
    <DataTableRowsPerPage />
  </DocsExample>

  <h3 id="selection">{{ t('dataTable.examples.selection.title') }}</h3>
  <DocsProse keypath="dataTable.examples.selection.text" />
  <DocsExample :source="dataTableSelectionSource" stack>
    <DataTableSelection />
  </DocsExample>

  <h3 id="toolbar">{{ t('dataTable.examples.toolbar.title') }}</h3>
  <DocsProse keypath="dataTable.examples.toolbar.text" />
  <DocsExample :source="dataTableToolbarSource" stack>
    <DataTableToolbar />
  </DocsExample>

  <h3 id="custom-cells">{{ t('dataTable.examples.customCells.title') }}</h3>
  <DocsProse keypath="dataTable.examples.customCells.text" />
  <DocsExample :source="dataTableCustomCellsSource" stack>
    <DataTableCustomCells />
  </DocsExample>

  <h3 id="custom-headings">{{ t('dataTable.examples.customHeadings.title') }}</h3>
  <DocsProse keypath="dataTable.examples.customHeadings.text" />
  <DocsExample :source="dataTableCustomHeadersSource" stack>
    <DataTableCustomHeaders />
  </DocsExample>

  <h3 id="variants">{{ t('dataTable.examples.variants.title') }}</h3>
  <DocsProse keypath="dataTable.examples.variants.text" />
  <DocsExample :source="dataTableVariantsSource" stack>
    <DataTableVariants />
  </DocsExample>

  <h3 id="compact">{{ t('dataTable.examples.compact.title') }}</h3>
  <DocsProse keypath="dataTable.examples.compact.text" />
  <DocsExample :source="dataTableCompactSource" stack>
    <DataTableCompact />
  </DocsExample>

  <h3 id="striped">{{ t('dataTable.examples.striped.title') }}</h3>
  <DocsProse keypath="dataTable.examples.striped.text" />
  <DocsExample :source="dataTableStripedSource" stack>
    <DataTableStriped />
  </DocsExample>

  <h3 id="sticky-header">{{ t('dataTable.examples.stickyHeader.title') }}</h3>
  <DocsProse keypath="dataTable.examples.stickyHeader.text" />
  <DocsExample :source="dataTableStickyHeaderSource" stack>
    <DataTableStickyHeader />
  </DocsExample>

  <h3 id="full-height">{{ t('dataTable.examples.fullHeight.title') }}</h3>
  <DocsProse keypath="dataTable.examples.fullHeight.text" />
  <DocsExample :source="dataTableFullHeightSource" stack>
    <DataTableFullHeight />
  </DocsExample>

  <h3 id="responsive">{{ t('dataTable.examples.responsive.title') }}</h3>
  <DocsProse keypath="dataTable.examples.responsive.text" />
  <DocsExample :source="dataTableResponsiveSource" stack>
    <DataTableResponsive />
  </DocsExample>

  <h3 id="server-side">{{ t('dataTable.examples.serverSide.title') }}</h3>
  <DocsProse keypath="dataTable.examples.serverSide.text" />
  <DocsExample :source="dataTableServerSideSource" stack>
    <DataTableServerSide />
  </DocsExample>

  <h3 id="states">{{ t('dataTable.examples.states.title') }}</h3>
  <DocsProse keypath="dataTable.examples.states.text" />
  <DocsExample :source="dataTableStatesSource" stack>
    <DataTableStates />
  </DocsExample>

  <h3 id="full-table">{{ t('dataTable.examples.fullTable.title') }}</h3>
  <DocsProse keypath="dataTable.examples.fullTable.text" />
  <DocsExample :source="dataTableFullTableSource" stack>
    <DataTableFullTable />
  </DocsExample>

  <DocsApi page="dataTable" :api="api" />
</template>
