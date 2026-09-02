<script setup lang="ts">
import api from '~/content/api/button'
import ButtonBasic from '~/examples/button/Basic.vue'
import buttonBasicSource from '~/examples/button/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('button.title') })
</script>

<template>
  <h1>{{ t('button.title') }}</h1>
  <DocsProse class="vd-lead" keypath="button.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="buttonBasicSource">
    <ButtonBasic />
  </DocsExample>

  <DocsApi page="button" :api="api" />
</template>
