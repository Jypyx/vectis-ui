<script setup lang="ts">
import api from '~/content/api/input'
import InputBasic from '~/examples/input/Basic.vue'
import inputBasicSource from '~/examples/input/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('input.title') })
</script>

<template>
  <h1>{{ t('input.title') }}</h1>
  <DocsProse class="vd-lead" keypath="input.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="inputBasicSource" stack>
    <InputBasic />
  </DocsExample>

  <DocsApi page="input" :api="api" />
</template>
