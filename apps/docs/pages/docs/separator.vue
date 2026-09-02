<script setup lang="ts">
import api from '~/content/api/separator'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('separator.title') })
</script>

<template>
  <h1>{{ t('separator.title') }}</h1>
  <DocsProse class="vd-lead" keypath="separator.lead" />

  <DocsApi page="separator" :api="api" />
</template>
