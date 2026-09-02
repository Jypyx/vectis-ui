<script setup lang="ts">
import api from '~/content/api/date-picker'
import DatePickerBasic from '~/examples/date-picker/Basic.vue'
import datePickerBasicSource from '~/examples/date-picker/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('datePicker.title') })
</script>

<template>
  <h1>{{ t('datePicker.title') }}</h1>
  <DocsProse class="vd-lead" keypath="datePicker.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="datePickerBasicSource">
    <DatePickerBasic />
  </DocsExample>

  <DocsApi page="datePicker" :api="api" />
</template>
