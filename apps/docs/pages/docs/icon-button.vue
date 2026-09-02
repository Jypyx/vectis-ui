<script setup lang="ts">
import api from '~/content/api/icon-button'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('iconButton.title') })
</script>

<template>
  <h1>{{ t('iconButton.title') }}</h1>
  <DocsProse class="vd-lead" keypath="iconButton.lead" />

  <DocsApi page="iconButton" :api="api" />
</template>
