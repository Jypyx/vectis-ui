<script setup lang="ts">
import api from '~/content/api/time-picker'
import TimePickerBasic from '~/examples/time-picker/Basic.vue'
import timePickerBasicSource from '~/examples/time-picker/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('timePicker.title') })
</script>

<template>
  <h1>{{ t('timePicker.title') }}</h1>
  <DocsProse class="vd-lead" keypath="timePicker.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="timePickerBasicSource">
    <TimePickerBasic />
  </DocsExample>

  <DocsApi page="timePicker" :api="api" />
</template>
