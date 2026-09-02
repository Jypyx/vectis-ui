<script setup lang="ts">
import api from '~/content/api/breadcrumb'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('breadcrumb.title') })
</script>

<template>
  <h1>{{ t('breadcrumb.title') }}</h1>
  <DocsProse class="vd-lead" keypath="breadcrumb.lead" />

  <DocsApi page="breadcrumb" :api="api" />
</template>
