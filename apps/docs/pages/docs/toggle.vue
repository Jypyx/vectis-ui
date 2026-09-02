<script setup lang="ts">
import api from '~/content/api/toggle'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('toggle.title') })
</script>

<template>
  <h1>{{ t('toggle.title') }}</h1>
  <DocsProse class="vd-lead" keypath="toggle.lead" />

  <DocsApi page="toggle" :api="api" />
</template>
