<script setup lang="ts">
import api from '~/content/api/spinner'
import SpinnerBasic from '~/examples/spinner/Basic.vue'
import spinnerBasicSource from '~/examples/spinner/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('spinner.title') })
</script>

<template>
  <h1>{{ t('spinner.title') }}</h1>
  <DocsProse class="vd-lead" keypath="spinner.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="spinnerBasicSource">
    <SpinnerBasic />
  </DocsExample>

  <DocsApi page="spinner" :api="api" />
</template>
