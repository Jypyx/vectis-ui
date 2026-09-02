<script setup lang="ts">
import api from '~/content/api/button-group'
import ButtonGroupBasic from '~/examples/button-group/Basic.vue'
import buttonGroupBasicSource from '~/examples/button-group/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('buttonGroup.title') })
</script>

<template>
  <h1>{{ t('buttonGroup.title') }}</h1>
  <DocsProse class="vd-lead" keypath="buttonGroup.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="buttonGroupBasicSource">
    <ButtonGroupBasic />
  </DocsExample>

  <DocsApi page="buttonGroup" :api="api" />
</template>
