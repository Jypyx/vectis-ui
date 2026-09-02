<script setup lang="ts">
import api from '~/content/api/file-input'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('fileInput.title') })
</script>

<template>
  <h1>{{ t('fileInput.title') }}</h1>
  <DocsProse class="vd-lead" keypath="fileInput.lead" />

  <DocsApi page="fileInput" :api="api" />
</template>
