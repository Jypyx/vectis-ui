<script setup lang="ts">
import api from '~/content/api/time-picker'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('timePicker.title') })
</script>

<template>
  <h1>{{ t('timePicker.title') }}</h1>
  <DocsProse class="vd-lead" keypath="timePicker.lead" />

  <DocsApi page="timePicker" :api="api" />
</template>
