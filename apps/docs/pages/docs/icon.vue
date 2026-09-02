<script setup lang="ts">
import api from '~/content/api/icon'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('icon.title') })
</script>

<template>
  <h1>{{ t('icon.title') }}</h1>
  <DocsProse class="vd-lead" keypath="icon.lead" />

  <DocsApi page="icon" :api="api" />
</template>
