<script setup lang="ts">
import api from '~/content/api/textarea'
import TextareaBasic from '~/examples/textarea/Basic.vue'
import textareaBasicSource from '~/examples/textarea/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('textarea.title') })
</script>

<template>
  <h1>{{ t('textarea.title') }}</h1>
  <DocsProse class="vd-lead" keypath="textarea.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="textareaBasicSource" stack>
    <TextareaBasic />
  </DocsExample>

  <DocsApi page="textarea" :api="api" />
</template>
