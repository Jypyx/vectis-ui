<script setup lang="ts">
import api from '~/content/api/chip'
import ChipBasic from '~/examples/chip/Basic.vue'
import chipBasicSource from '~/examples/chip/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('chip.title') })
</script>

<template>
  <h1>{{ t('chip.title') }}</h1>
  <DocsProse class="vd-lead" keypath="chip.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="chipBasicSource">
    <ChipBasic />
  </DocsExample>

  <DocsApi page="chip" :api="api" />
</template>
