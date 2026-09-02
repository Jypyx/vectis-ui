<script setup lang="ts">
import api from '~/content/api/progress-linear'
import ProgressLinearBasic from '~/examples/progress-linear/Basic.vue'
import progressLinearBasicSource from '~/examples/progress-linear/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('progressLinear.title') })
</script>

<template>
  <h1>{{ t('progressLinear.title') }}</h1>
  <DocsProse class="vd-lead" keypath="progressLinear.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="progressLinearBasicSource" stack>
    <ProgressLinearBasic />
  </DocsExample>

  <DocsApi page="progressLinear" :api="api" />
</template>
