<script setup lang="ts">
import api from '~/content/api/file-input'
import FileInputBasic from '~/examples/file-input/Basic.vue'
import fileInputBasicSource from '~/examples/file-input/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('fileInput.title') })
</script>

<template>
  <h1>{{ t('fileInput.title') }}</h1>
  <DocsProse class="vd-lead" keypath="fileInput.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="fileInputBasicSource" stack>
    <FileInputBasic />
  </DocsExample>

  <DocsApi page="fileInput" :api="api" />
</template>
