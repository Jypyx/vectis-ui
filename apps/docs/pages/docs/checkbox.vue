<script setup lang="ts">
import api from '~/content/api/checkbox'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('checkbox.title') })
</script>

<template>
  <h1>{{ t('checkbox.title') }}</h1>
  <DocsProse class="vd-lead" keypath="checkbox.lead" />

  <DocsApi page="checkbox" :api="api" />
</template>
