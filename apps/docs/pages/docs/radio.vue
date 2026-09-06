<script setup lang="ts">
import api from '~/content/api/radio'
import RadioBasic from '~/examples/radio/Basic.vue'
import radioBasicSource from '~/examples/radio/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('radio')
</script>

<template>
  <h1>{{ t('radio.title') }}</h1>
  <DocsProse class="vd-lead" keypath="radio.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="radioBasicSource" stack>
    <RadioBasic />
  </DocsExample>

  <DocsApi page="radio" :api="api" />
</template>
