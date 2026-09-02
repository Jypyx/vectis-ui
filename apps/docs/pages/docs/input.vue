<script setup lang="ts">
import api from '~/content/api/input'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('input.title') })
</script>

<template>
  <h1>{{ t('input.title') }}</h1>
  <DocsProse class="vd-lead" keypath="input.lead" />

  <DocsApi page="input" :api="api" />
</template>
