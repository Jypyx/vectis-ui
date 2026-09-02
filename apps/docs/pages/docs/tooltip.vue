<script setup lang="ts">
import api from '~/content/api/tooltip'
import TooltipBasic from '~/examples/tooltip/Basic.vue'
import tooltipBasicSource from '~/examples/tooltip/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('tooltip.title') })
</script>

<template>
  <h1>{{ t('tooltip.title') }}</h1>
  <DocsProse class="vd-lead" keypath="tooltip.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="tooltipBasicSource">
    <TooltipBasic />
  </DocsExample>

  <DocsApi page="tooltip" :api="api" />
</template>
