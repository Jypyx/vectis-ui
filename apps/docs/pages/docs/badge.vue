<script setup lang="ts">
import api from '~/content/api/badge'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('badge.title') })
</script>

<template>
  <h1>{{ t('badge.title') }}</h1>
  <DocsProse class="vd-lead" keypath="badge.lead" />

  <DocsApi page="badge" :api="api" />
</template>
