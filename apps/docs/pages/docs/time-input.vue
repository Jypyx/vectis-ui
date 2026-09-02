<script setup lang="ts">
import api from '~/content/api/time-input'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('timeInput.title') })
</script>

<template>
  <h1>{{ t('timeInput.title') }}</h1>
  <DocsProse class="vd-lead" keypath="timeInput.lead" />

  <DocsApi page="timeInput" :api="api" />
</template>
