<script setup lang="ts">
import api from '~/content/api/combobox'
import ComboboxBasic from '~/examples/combobox/Basic.vue'
import comboboxBasicSource from '~/examples/combobox/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('combobox.title') })
</script>

<template>
  <h1>{{ t('combobox.title') }}</h1>
  <DocsProse class="vd-lead" keypath="combobox.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="comboboxBasicSource" stack>
    <ComboboxBasic />
  </DocsExample>

  <DocsApi page="combobox" :api="api" />
</template>
