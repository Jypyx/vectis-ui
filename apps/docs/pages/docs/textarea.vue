<script setup lang="ts">
import api from '~/content/api/textarea'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('textarea.title') })
</script>

<template>
  <h1>{{ t('textarea.title') }}</h1>
  <DocsProse class="vd-lead" keypath="textarea.lead" />

  <DocsApi page="textarea" :api="api" />
</template>
