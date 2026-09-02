<script setup lang="ts">
import api from '~/content/api/progress-circular'
import ProgressCircularBasic from '~/examples/progress-circular/Basic.vue'
import progressCircularBasicSource from '~/examples/progress-circular/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('progressCircular.title') })
</script>

<template>
  <h1>{{ t('progressCircular.title') }}</h1>
  <DocsProse class="vd-lead" keypath="progressCircular.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="progressCircularBasicSource">
    <ProgressCircularBasic />
  </DocsExample>

  <DocsApi page="progressCircular" :api="api" />
</template>
