<script setup lang="ts">
import api from '~/content/api/spinner'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('spinner.title') })
</script>

<template>
  <h1>{{ t('spinner.title') }}</h1>
  <DocsProse class="vd-lead" keypath="spinner.lead" />

  <DocsApi page="spinner" :api="api" />
</template>
