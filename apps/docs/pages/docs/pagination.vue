<script setup lang="ts">
import api from '~/content/api/pagination'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('pagination.title') })
</script>

<template>
  <h1>{{ t('pagination.title') }}</h1>
  <DocsProse class="vd-lead" keypath="pagination.lead" />

  <DocsApi page="pagination" :api="api" />
</template>
