<script setup lang="ts">
import api from '~/content/api/file-picker'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('filePicker.title') })
</script>

<template>
  <h1>{{ t('filePicker.title') }}</h1>
  <DocsProse class="vd-lead" keypath="filePicker.lead" />

  <DocsApi page="filePicker" :api="api" />
</template>
