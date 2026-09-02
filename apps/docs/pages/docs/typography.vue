<script setup lang="ts">
import api from '~/content/api/typography'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('typography.title') })
</script>

<template>
  <h1>{{ t('typography.title') }}</h1>
  <DocsProse class="vd-lead" keypath="typography.lead" />

  <DocsApi page="typography" :api="api" />
</template>
