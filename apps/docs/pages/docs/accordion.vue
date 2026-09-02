<script setup lang="ts">
import api from '~/content/api/accordion'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('accordion.title') })
</script>

<template>
  <h1>{{ t('accordion.title') }}</h1>
  <DocsProse class="vd-lead" keypath="accordion.lead" />

  <DocsApi page="accordion" :api="api" />
</template>
