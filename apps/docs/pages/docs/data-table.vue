<script setup lang="ts">
import api from '~/content/api/data-table'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('dataTable.title') })
</script>

<template>
  <h1>{{ t('dataTable.title') }}</h1>
  <DocsProse class="vd-lead" keypath="dataTable.lead" />

  <DocsApi page="dataTable" :api="api" />
</template>
