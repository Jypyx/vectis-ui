<script setup lang="ts">
import api from '~/content/api/separator'
import SeparatorBasic from '~/examples/separator/Basic.vue'
import separatorBasicSource from '~/examples/separator/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('separator.title') })
</script>

<template>
  <h1>{{ t('separator.title') }}</h1>
  <DocsProse class="vd-lead" keypath="separator.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="separatorBasicSource" stack>
    <SeparatorBasic />
  </DocsExample>

  <DocsApi page="separator" :api="api" />
</template>
