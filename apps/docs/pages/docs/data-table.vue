<script setup lang="ts">
import api from '~/content/api/data-table'
import DataTableBasic from '~/examples/data-table/Basic.vue'
import dataTableBasicSource from '~/examples/data-table/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('dataTable.title') })
</script>

<template>
  <h1>{{ t('dataTable.title') }}</h1>
  <DocsProse class="vd-lead" keypath="dataTable.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="dataTableBasicSource" stack>
    <DataTableBasic />
  </DocsExample>

  <DocsApi page="dataTable" :api="api" />
</template>
