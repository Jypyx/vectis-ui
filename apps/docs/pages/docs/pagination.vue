<script setup lang="ts">
import api from '~/content/api/pagination'
import PaginationBasic from '~/examples/pagination/Basic.vue'
import paginationBasicSource from '~/examples/pagination/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('pagination.title') })
</script>

<template>
  <h1>{{ t('pagination.title') }}</h1>
  <DocsProse class="vd-lead" keypath="pagination.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="paginationBasicSource" stack>
    <PaginationBasic />
  </DocsExample>

  <DocsApi page="pagination" :api="api" />
</template>
