<script setup lang="ts">
import api from '~/content/api/accordion'
import AccordionBasic from '~/examples/accordion/Basic.vue'
import accordionBasicSource from '~/examples/accordion/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('accordion.title') })
</script>

<template>
  <h1>{{ t('accordion.title') }}</h1>
  <DocsProse class="vd-lead" keypath="accordion.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="accordionBasicSource" stack>
    <AccordionBasic />
  </DocsExample>

  <DocsApi page="accordion" :api="api" />
</template>
