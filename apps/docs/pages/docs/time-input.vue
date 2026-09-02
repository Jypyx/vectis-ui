<script setup lang="ts">
import api from '~/content/api/time-input'
import TimeInputBasic from '~/examples/time-input/Basic.vue'
import timeInputBasicSource from '~/examples/time-input/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('timeInput.title') })
</script>

<template>
  <h1>{{ t('timeInput.title') }}</h1>
  <DocsProse class="vd-lead" keypath="timeInput.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="timeInputBasicSource" stack>
    <TimeInputBasic />
  </DocsExample>

  <DocsApi page="timeInput" :api="api" />
</template>
