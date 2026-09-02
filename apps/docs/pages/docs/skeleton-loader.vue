<script setup lang="ts">
import api from '~/content/api/skeleton-loader'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('skeletonLoader.title') })
</script>

<template>
  <h1>{{ t('skeletonLoader.title') }}</h1>
  <DocsProse class="vd-lead" keypath="skeletonLoader.lead" />

  <DocsApi page="skeletonLoader" :api="api" />
</template>
