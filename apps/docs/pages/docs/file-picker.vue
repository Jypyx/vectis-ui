<script setup lang="ts">
import api from '~/content/api/file-picker'
import FilePickerBasic from '~/examples/file-picker/Basic.vue'
import filePickerBasicSource from '~/examples/file-picker/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('filePicker.title') })
</script>

<template>
  <h1>{{ t('filePicker.title') }}</h1>
  <DocsProse class="vd-lead" keypath="filePicker.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="filePickerBasicSource" stack>
    <FilePickerBasic />
  </DocsExample>

  <DocsApi page="filePicker" :api="api" />
</template>
