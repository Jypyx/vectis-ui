<script setup lang="ts">
import api from '~/content/api/date-picker'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('datePicker.title') })
</script>

<template>
  <h1>{{ t('datePicker.title') }}</h1>
  <DocsProse class="vd-lead" keypath="datePicker.lead" />

  <DocsApi page="datePicker" :api="api" />
</template>
