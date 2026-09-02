<script setup lang="ts">
import api from '~/content/api/date-input'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('dateInput.title') })
</script>

<template>
  <h1>{{ t('dateInput.title') }}</h1>
  <DocsProse class="vd-lead" keypath="dateInput.lead" />

  <DocsApi page="dateInput" :api="api" />
</template>
