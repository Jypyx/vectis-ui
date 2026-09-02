<script setup lang="ts">
import api from '~/content/api/tooltip'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('tooltip.title') })
</script>

<template>
  <h1>{{ t('tooltip.title') }}</h1>
  <DocsProse class="vd-lead" keypath="tooltip.lead" />

  <DocsApi page="tooltip" :api="api" />
</template>
