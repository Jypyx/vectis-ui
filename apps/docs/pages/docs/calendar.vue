<script setup lang="ts">
import api from '~/content/api/calendar'
import CalendarBasic from '~/examples/calendar/Basic.vue'
import calendarBasicSource from '~/examples/calendar/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('calendar.title') })
</script>

<template>
  <h1>{{ t('calendar.title') }}</h1>
  <DocsProse class="vd-lead" keypath="calendar.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="calendarBasicSource" stack>
    <CalendarBasic />
  </DocsExample>

  <DocsApi page="calendar" :api="api" />
</template>
