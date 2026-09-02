<script setup lang="ts">
import api from '~/content/api/progress-linear'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('progressLinear.title') })
</script>

<template>
  <h1>{{ t('progressLinear.title') }}</h1>
  <DocsProse class="vd-lead" keypath="progressLinear.lead" />

  <DocsApi page="progressLinear" :api="api" />
</template>
