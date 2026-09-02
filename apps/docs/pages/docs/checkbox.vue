<script setup lang="ts">
import api from '~/content/api/checkbox'
import CheckboxBasic from '~/examples/checkbox/Basic.vue'
import checkboxBasicSource from '~/examples/checkbox/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('checkbox.title') })
</script>

<template>
  <h1>{{ t('checkbox.title') }}</h1>
  <DocsProse class="vd-lead" keypath="checkbox.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="checkboxBasicSource">
    <CheckboxBasic />
  </DocsExample>

  <DocsApi page="checkbox" :api="api" />
</template>
