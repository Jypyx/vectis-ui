<script setup lang="ts">
import api from '~/content/api/date-input'
import DateInputBasic from '~/examples/date-input/Basic.vue'
import dateInputBasicSource from '~/examples/date-input/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('dateInput.title') })
</script>

<template>
  <h1>{{ t('dateInput.title') }}</h1>
  <DocsProse class="vd-lead" keypath="dateInput.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="dateInputBasicSource" stack>
    <DateInputBasic />
  </DocsExample>

  <DocsApi page="dateInput" :api="api" />
</template>
