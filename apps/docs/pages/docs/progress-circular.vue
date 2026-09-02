<script setup lang="ts">
import api from '~/content/api/progress-circular'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('progressCircular.title') })
</script>

<template>
  <h1>{{ t('progressCircular.title') }}</h1>
  <DocsProse class="vd-lead" keypath="progressCircular.lead" />

  <DocsApi page="progressCircular" :api="api" />
</template>
