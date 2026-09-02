<script setup lang="ts">
import api from '~/content/api/calendar'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('calendar.title') })
</script>

<template>
  <h1>{{ t('calendar.title') }}</h1>
  <DocsProse class="vd-lead" keypath="calendar.lead" />

  <DocsApi page="calendar" :api="api" />
</template>
