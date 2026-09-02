<script setup lang="ts">
import api from '~/content/api/skeleton-loader'
import SkeletonLoaderBasic from '~/examples/skeleton-loader/Basic.vue'
import skeletonLoaderBasicSource from '~/examples/skeleton-loader/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('skeletonLoader.title') })
</script>

<template>
  <h1>{{ t('skeletonLoader.title') }}</h1>
  <DocsProse class="vd-lead" keypath="skeletonLoader.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="skeletonLoaderBasicSource" stack>
    <SkeletonLoaderBasic />
  </DocsExample>

  <DocsApi page="skeletonLoader" :api="api" />
</template>
